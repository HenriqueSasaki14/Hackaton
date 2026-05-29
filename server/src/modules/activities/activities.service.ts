import { prisma } from '../../lib/prisma'
import { calculateStreak } from '../../utils/streak'
import { checkAndGrantBadges } from '../badges/badges.service'

export async function createActivity(trailId: string, data: {
  title: string
  order: number
  type: 'FILL_BLANK' | 'FIND_ERROR' | 'MULTIPLE_CHOICE'
  payload: object
  xp_reward?: number
}) {
  const trail = await prisma.trail.findUnique({ where: { id: trailId } })
  if (!trail) throw Object.assign(new Error('Trilha não encontrada'), { status: 404 })

  return prisma.activity.create({
    data: { ...data, trail_id: trailId },
  })
}

export async function updateActivity(activityId: string, data: Partial<{
  title: string
  order: number
  type: 'FILL_BLANK' | 'FIND_ERROR' | 'MULTIPLE_CHOICE'
  payload: object
  xp_reward: number
}>) {
  return prisma.activity.update({ where: { id: activityId }, data })
}

export async function deleteActivity(activityId: string) {
  return prisma.activity.delete({ where: { id: activityId } })
}

export async function completeActivity(activityId: string, userId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { trail: true },
  })

  if (!activity) throw Object.assign(new Error('Atividade não encontrada'), { status: 404 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw Object.assign(new Error('Usuário não encontrado'), { status: 404 })

  if (activity.trail.is_premium && !user.is_premium) {
    throw Object.assign(new Error('Conteúdo premium'), { status: 403 })
  }

  const existing = await prisma.userProgress.findUnique({
    where: { user_id_activity_id: { user_id: userId, activity_id: activityId } },
  })

  if (existing?.status === 'COMPLETED') {
    return { already_completed: true, xp_earned: 0 }
  }

  const streakResult = calculateStreak({
    last_activity_date: user.last_activity_date,
    streak_count: user.streak_count,
    streak_freezes: user.streak_freezes,
  })

  const [, updatedUser] = await prisma.$transaction([
    prisma.userProgress.upsert({
      where: { user_id_activity_id: { user_id: userId, activity_id: activityId } },
      update: {
        status: 'COMPLETED',
        xp_earned: activity.xp_reward,
        attempts: { increment: 1 },
        completed_at: new Date(),
      },
      create: {
        user_id: userId,
        activity_id: activityId,
        status: 'COMPLETED',
        xp_earned: activity.xp_reward,
        completed_at: new Date(),
      },
    }),

    prisma.user.update({
      where: { id: userId },
      data: {
        xp_total: { increment: activity.xp_reward },
        streak_count: streakResult.streak_count,
        streak_freezes: streakResult.streak_freezes,
        last_activity_date: streakResult.last_activity_date,
      },
    }),
  ])

  try {
    await checkAndGrantBadges({
      userId,
      xp_total: updatedUser.xp_total,
      streak_count: updatedUser.streak_count,
    })
  } catch (err) {
    console.error('[badges] Erro ao verificar badges:', err)
  }

  return {
    already_completed: false,
    xp_earned: activity.xp_reward,
    new_xp_total: updatedUser.xp_total,
    streak_count: updatedUser.streak_count,
  }
}
