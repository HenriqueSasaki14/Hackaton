import request from 'supertest'
import jwt from 'jsonwebtoken'
import '../__tests__/mocks/prisma.mock'
import { prismaMock } from '../__tests__/mocks/prisma.mock'
import { app } from '../app'

const TOKEN = jwt.sign({ userId: 'u1', role: 'USER' }, 'test-secret-poussin', { expiresIn: '1h' })

const mockActivity = {
  id: 'a1', trail_id: 't1', title: 'Atividade 1',
  order: 1, type: 'MULTIPLE_CHOICE', payload: {}, xp_reward: 10,
  created_at: new Date(),
  trail: { id: 't1', is_premium: false },
}

const mockUser = {
  id: 'u1', xp_total: 0, streak_count: 0, streak_freezes: 0,
  last_activity_date: null, is_premium: false,
}

beforeEach(() => {
  jest.clearAllMocks()
  prismaMock.badge.findMany.mockResolvedValue([])
})

describe('POST /api/activities/:id/complete', () => {
  it('retorna 401 sem token', async () => {
    const res = await request(app).post('/api/activities/a1/complete')
    expect(res.status).toBe(401)
  })

  it('completa atividade e retorna XP ganho', async () => {
    prismaMock.activity.findUnique.mockResolvedValue(mockActivity)
    prismaMock.user.findUnique.mockResolvedValue(mockUser)
    prismaMock.userProgress.findUnique.mockResolvedValue(null)
    prismaMock.$transaction.mockResolvedValue([
      {},
      { ...mockUser, xp_total: 10, streak_count: 1 },
    ])

    const res = await request(app).post('/api/activities/a1/complete')
      .set('Authorization', `Bearer ${TOKEN}`)

    expect(res.status).toBe(200)
    expect(res.body.data.xp_earned).toBe(10)
    expect(res.body.data.already_completed).toBe(false)
    expect(res.body.data.streak_count).toBe(1)
  })

  it('retorna already_completed true se já fez', async () => {
    prismaMock.activity.findUnique.mockResolvedValue(mockActivity)
    prismaMock.user.findUnique.mockResolvedValue(mockUser)
    prismaMock.userProgress.findUnique.mockResolvedValue({ status: 'COMPLETED' })

    const res = await request(app).post('/api/activities/a1/complete')
      .set('Authorization', `Bearer ${TOKEN}`)

    expect(res.status).toBe(200)
    expect(res.body.data.already_completed).toBe(true)
    expect(res.body.data.xp_earned).toBe(0)
  })

  it('retorna 403 para conteúdo premium com usuário free', async () => {
    prismaMock.activity.findUnique.mockResolvedValue({
      ...mockActivity,
      trail: { id: 't1', is_premium: true },
    })
    prismaMock.user.findUnique.mockResolvedValue({ ...mockUser, is_premium: false })

    const res = await request(app).post('/api/activities/a1/complete')
      .set('Authorization', `Bearer ${TOKEN}`)

    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/premium/i)
  })

  it('retorna 404 para atividade inexistente', async () => {
    prismaMock.activity.findUnique.mockResolvedValue(null)

    const res = await request(app).post('/api/activities/nao-existe/complete')
      .set('Authorization', `Bearer ${TOKEN}`)

    expect(res.status).toBe(404)
  })
})
