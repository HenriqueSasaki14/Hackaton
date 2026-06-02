import request from 'supertest'
import jwt from 'jsonwebtoken'
import '../__tests__/mocks/prisma.mock'
import { prismaMock } from '../__tests__/mocks/prisma.mock'
import { app } from '../app'

const TOKEN = jwt.sign({ userId: 'u1', role: 'USER' }, 'test-secret-poussin', { expiresIn: '1h' })

const mockUser = {
  id: 'u1', name: 'Teste', email: 'teste@dev.com', avatar_url: null,
  xp_total: 100, streak_count: 3, is_premium: false,
  streak_freezes: 0, created_at: new Date(), role: 'USER',
}

beforeEach(() => jest.clearAllMocks())

describe('GET /api/users/ranking', () => {
  it('retorna lista pública de ranking', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'u1', name: 'Ana', avatar_url: null, xp_total: 500, streak_count: 7 },
      { id: 'u2', name: 'Bob', avatar_url: null, xp_total: 200, streak_count: 2 },
    ])

    const res = await request(app).get('/api/users/ranking')

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBe(2)
    expect(res.body.data[0].xp_total).toBe(500)
  })
})

describe('GET /api/users/:id/profile', () => {
  it('retorna perfil público do usuário', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser, badges: [], projects: [],
    })

    const res = await request(app).get('/api/users/u1/profile')

    expect(res.status).toBe(200)
    expect(res.body.data.name).toBe('Teste')
    expect(res.body.data).not.toHaveProperty('password_hash')
  })

  it('retorna 404 se usuário não existe', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    const res = await request(app).get('/api/users/nao-existe/profile')

    expect(res.status).toBe(404)
  })
})

describe('PUT /api/users/me', () => {
  it('retorna 401 sem token', async () => {
    const res = await request(app).put('/api/users/me').send({ name: 'Novo' })
    expect(res.status).toBe(401)
  })

  it('atualiza nome do usuário autenticado', async () => {
    prismaMock.user.update.mockResolvedValue({ ...mockUser, name: 'Novo Nome' })

    const res = await request(app).put('/api/users/me')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ name: 'Novo Nome' })

    expect(res.status).toBe(200)
    expect(res.body.data.name).toBe('Novo Nome')
  })
})

describe('DELETE /api/users/me', () => {
  it('retorna 401 sem token', async () => {
    const res = await request(app).delete('/api/users/me')
    expect(res.status).toBe(401)
  })

  it('exclui a conta do usuário autenticado', async () => {
    prismaMock.userBadge.deleteMany.mockResolvedValue({ count: 0 })
    prismaMock.userProgress.deleteMany.mockResolvedValue({ count: 0 })
    prismaMock.projectLike.deleteMany.mockResolvedValue({ count: 0 })
    prismaMock.project.findMany.mockResolvedValue([])
    prismaMock.user.delete.mockResolvedValue(mockUser)

    const res = await request(app).delete('/api/users/me')
      .set('Authorization', `Bearer ${TOKEN}`)

    expect(res.status).toBe(200)
    expect(res.body.data.message).toMatch(/excluída/i)
  })
})
