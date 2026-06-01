import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../lib/prisma'
import { env } from '../../config/env'

function generateToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: '7d' })
}

export async function register(input: { name: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) throw new Error('E-mail já cadastrado')
  const password_hash = await bcrypt.hash(input.password, 10)
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, password_hash },
    select: { id: true, name: true, email: true, role: true, is_premium: true, xp_total: true, streak_count: true, avatar_url: true },
  })
  return { user, token: generateToken(user.id, user.role) }
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) throw new Error('Credenciais inválidas')
  if (!await bcrypt.compare(input.password, user.password_hash)) throw new Error('Credenciais inválidas')
  const { password_hash, ...safeUser } = user
  return { user: safeUser, token: generateToken(user.id, user.role) }
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, role: true, is_premium: true,
      xp_total: true, streak_count: true, streak_freezes: true,
      avatar_url: true, last_activity_date: true, created_at: true,
      badges: { include: { badge: true } },
    },
  })
  if (!user) throw new Error('Usuário não encontrado')
  return user
}
