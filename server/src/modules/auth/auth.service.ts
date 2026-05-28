import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../lib/prisma'
import { env } from '../../config/env'

interface RegisterInput {
  name: string
  email: string
  password: string
}

interface LoginInput {
  email: string
  password: string
}

function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: '7d' })
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) throw new Error('E-mail já cadastrado')

  const password_hash = await bcrypt.hash(input.password, 10)

  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, password_hash },
    select: { id: true, name: true, email: true, role: true, is_premium: true,
               xp_total: true, streak_count: true, avatar_url: true },
  })

  const token = generateToken(user.id, user.role)
  return { user, token }
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) throw new Error('Credenciais inválidas')

  const valid = await bcrypt.compare(input.password, user.password_hash)
  if (!valid) throw new Error('Credenciais inválidas')

  const token = generateToken(user.id, user.role)

  const { password_hash, ...safeUser } = user
  return { user: safeUser, token }
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, role: true,
      is_premium: true, xp_total: true, streak_count: true,
      streak_freezes: true, avatar_url: true,
      last_activity_date: true, created_at: true,
      badges: { include: { badge: true } },
    },
  })

  if (!user) throw new Error('Usuário não encontrado')
  return user
}
