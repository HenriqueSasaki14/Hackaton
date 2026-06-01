import { prisma } from '../../lib/prisma'

export async function listUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        is_premium: true, xp_total: true, streak_count: true,
        created_at: true,
        _count: {
          select: { progress: true, projects: true },
        },
      },
    }),
    prisma.user.count(),
  ])

  return { users, total, page, limit, pages: Math.ceil(total / limit) }
}

export async function updateUser(userId: string, data: {
  name?: string
  role?: 'USER' | 'ADMIN'
  is_premium?: boolean
  streak_freezes?: number
}) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw Object.assign(new Error('Usuário não encontrado'), { status: 404 })

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true, name: true, email: true, role: true,
      is_premium: true, xp_total: true, streak_count: true,
      streak_freezes: true,
    },
  })
}

export async function deleteUser(userId: string, requesterId: string) {
  if (userId === requesterId) {
    throw Object.assign(new Error('Não é possível remover sua própria conta'), { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw Object.assign(new Error('Usuário não encontrado'), { status: 404 })

  return prisma.user.delete({ where: { id: userId } })
}
