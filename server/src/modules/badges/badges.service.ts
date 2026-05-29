import { prisma } from '../../lib/prisma'
import { BadgeCheckInput } from './badges.types'

async function countCompletedTrails(userId: string): Promise<number> {
  const trails = await prisma.trail.findMany({
    include: {
      activities: { select: { id: true } },
    },
  })

  let completed = 0

  for (const trail of trails) {
    if (trail.activities.length === 0) continue

    const activityIds = trail.activities.map((a) => a.id)

    const progressCount = await prisma.userProgress.count({
      where: {
        user_id: userId,
        activity_id: { in: activityIds },
        status: 'COMPLETED',
      },
    })

    if (progressCount === trail.activities.length) {
      completed++
    }
  }

  return completed
}

export async function checkAndGrantBadges(input: BadgeCheckInput): Promise<void> {
  const { userId, xp_total, streak_count } = input

  const allBadges = await prisma.badge.findMany({
    where: {
      user_badges: { none: { user_id: userId } },
    },
  })

  if (allBadges.length === 0) return

  const completedTrails = await countCompletedTrails(userId)

  const earned: string[] = []

  for (const badge of allBadges) {
    let qualifies = false

    switch (badge.condition_type) {
      case 'STREAK':
        qualifies = streak_count >= badge.condition_value
        break
      case 'XP':
        qualifies = xp_total >= badge.condition_value
        break
      case 'TRAIL_COMPLETED':
        qualifies = completedTrails >= badge.condition_value
        break
    }

    if (qualifies) {
      earned.push(badge.id)
    }
  }

  if (earned.length === 0) return

  await prisma.userBadge.createMany({
    data: earned.map((badge_id) => ({
      user_id: userId,
      badge_id,
      earned_at: new Date(),
    })),
    skipDuplicates: true,
  })
}
