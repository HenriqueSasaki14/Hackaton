import { prisma } from '../../lib/prisma'

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, avatar_url: true,
      xp_total: true, streak_count: true, is_premium: true,
      created_at: true,
      badges: { include: { badge: true } },
      projects: {
        where: { status: 'PUBLISHED' },
        orderBy: { created_at: 'desc' },
        select: { id: true, title: true, description: true,
                  likes_count: true, created_at: true },
      },
    },
  })

  if (!user) throw new Error('Usuário não encontrado')
  return user
}

export async function getRanking() {
  return prisma.user.findMany({
    orderBy: { xp_total: 'desc' },
    take: 20,
    select: {
      id: true, name: true, avatar_url: true,
      xp_total: true, streak_count: true,
    },
  })
}

export async function updateMe(userId: string, data: { name?: string; avatar_url?: string }) {
  if (!data.name && !data.avatar_url) {
    throw new Error('Informe ao menos um campo para atualizar')
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true, name: true, email: true, avatar_url: true,
      xp_total: true, streak_count: true, is_premium: true,
    },
  })
}

export async function upgradePremium(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { is_premium: true },
    select: { id: true, name: true, is_premium: true },
  })
}
