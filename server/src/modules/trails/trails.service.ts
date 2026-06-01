import { prisma } from '../../lib/prisma'

export async function isTrailCompleted(userId: string, trailId: string): Promise<boolean> {
  const trail = await prisma.trail.findUnique({
    where: { id: trailId },
    include: { activities: { select: { id: true } } },
  })

  if (!trail || trail.activities.length === 0) return false

  const activityIds = trail.activities.map((a) => a.id)

  const completedCount = await prisma.userProgress.count({
    where: {
      user_id: userId,
      activity_id: { in: activityIds },
      status: 'COMPLETED',
    },
  })

  return completedCount === trail.activities.length
}

export async function listTrails(userId?: string) {
  const trails = await prisma.trail.findMany({
    orderBy: { order: 'asc' },
    include: {
      activities: { select: { id: true } },
      _count: { select: { activities: true } },
    },
  })

  const result = await Promise.all(
    trails.map(async (trail) => {
      let progress_percent = 0
      let is_locked = false

      if (userId) {
        const activityIds = trail.activities.map((a) => a.id)

        if (activityIds.length > 0) {
          const completed = await prisma.userProgress.count({
            where: {
              user_id: userId,
              activity_id: { in: activityIds },
              status: 'COMPLETED',
            },
          })
          progress_percent = Math.round((completed / activityIds.length) * 100)
        }

        if (trail.prerequisite_trail_id) {
          const prereqDone = await isTrailCompleted(userId, trail.prerequisite_trail_id)
          is_locked = !prereqDone
        }
      } else {
        if (trail.prerequisite_trail_id) is_locked = true
      }

      const { activities, ...rest } = trail
      return { ...rest, progress_percent, is_locked }
    })
  )

  return result
}

export async function getTrailDetail(trailId: string, userId?: string) {
  const trail = await prisma.trail.findUnique({
    where: { id: trailId },
    include: {
      activities: { orderBy: { order: 'asc' } },
    },
  })

  if (!trail) throw Object.assign(new Error('Trilha não encontrada'), { status: 404 })

  // Verifica acesso premium
  if (trail.is_premium) {
    if (!userId) throw Object.assign(new Error('Conteúdo premium'), { status: 403 })
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { is_premium: true } })
    if (!user?.is_premium) throw Object.assign(new Error('Conteúdo premium'), { status: 403 })
  }

  // Verifica pré-requisito
  if (trail.prerequisite_trail_id) {
    if (!userId) throw Object.assign(new Error('Conclua a trilha anterior primeiro'), { status: 403 })
    const prereqDone = await isTrailCompleted(userId, trail.prerequisite_trail_id)
    if (!prereqDone) throw Object.assign(new Error('Conclua a trilha anterior primeiro'), { status: 403 })
  }

  let activitiesWithStatus = trail.activities.map((a) => ({
    ...a,
    user_status: null as string | null,
  }))

  if (userId) {
    const progresses = await prisma.userProgress.findMany({
      where: {
        user_id: userId,
        activity_id: { in: trail.activities.map((a) => a.id) },
      },
    })

    const progressMap = new Map(progresses.map((p) => [p.activity_id, p.status]))

    activitiesWithStatus = trail.activities.map((a) => ({
      ...a,
      user_status: progressMap.get(a.id) ?? null,
    }))
  }

  return { ...trail, activities: activitiesWithStatus }
}

export async function createTrail(data: {
  title: string
  description: string
  slug: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  is_premium?: boolean
  order: number
  prerequisite_trail_id?: string
  thumbnail_url?: string
}) {
  const existing = await prisma.trail.findUnique({ where: { slug: data.slug } })
  if (existing) throw Object.assign(new Error('Slug já existe'), { status: 409 })

  return prisma.trail.create({ data })
}

export async function updateTrail(trailId: string, data: Partial<{
  title: string
  description: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  is_premium: boolean
  order: number
  prerequisite_trail_id: string
  thumbnail_url: string
}>) {
  return prisma.trail.update({ where: { id: trailId }, data })
}

export async function deleteTrail(trailId: string) {
  return prisma.trail.delete({ where: { id: trailId } })
}
