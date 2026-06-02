import request from 'supertest'
import jwt from 'jsonwebtoken'
import '../__tests__/mocks/prisma.mock'
import { prismaMock } from '../__tests__/mocks/prisma.mock'
import { app } from '../app'

const TOKEN_ADMIN = jwt.sign({ userId: 'admin-1', role: 'ADMIN' }, 'test-secret-poussin', { expiresIn: '1h' })
const TOKEN_USER  = jwt.sign({ userId: 'user-1',  role: 'USER'  }, 'test-secret-poussin', { expiresIn: '1h' })

beforeEach(() => jest.clearAllMocks())

describe('GET /api/admin/users', () => {
  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/admin/users')
    expect(res.status).toBe(401)
  })

  it('retorna 403 para usuário comum', async () => {
    const res = await request(app).get('/api/admin/users')
      .set('Authorization', `Bearer ${TOKEN_USER}`)
    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/administrador/i)
  })

  it('retorna lista paginada de usuários para admin', async () => {
    prismaMock.$transaction.mockResolvedValue([
      [{ id: 'u1', name: 'Ana', email: 'a@a.com', role: 'USER', is_premium: false, xp_total: 0, streak_count: 0, created_at: new Date(), _count: { progress: 0, projects: 0 } }],
      1,
    ])

    const res = await request(app).get('/api/admin/users')
      .set('Authorization', `Bearer ${TOKEN_ADMIN}`)

    expect(res.status).toBe(200)
    expect(res.body.data.total).toBe(1)
    expect(res.body.data.users.length).toBe(1)
  })
})

describe('PUT /api/admin/users/:id', () => {
  it('retorna 403 para usuário comum', async () => {
    const res = await request(app).put('/api/admin/users/u1')
      .set('Authorization', `Bearer ${TOKEN_USER}`)
      .send({ is_premium: true })
    expect(res.status).toBe(403)
  })

  it('atualiza usuário como admin', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1' })
    prismaMock.user.update.mockResolvedValue({ id: 'u1', name: 'Ana', email: 'a@a.com', role: 'USER', is_premium: true, xp_total: 0, streak_count: 0, streak_freezes: 0 })

    const res = await request(app).put('/api/admin/users/u1')
      .set('Authorization', `Bearer ${TOKEN_ADMIN}`)
      .send({ is_premium: true })

    expect(res.status).toBe(200)
    expect(res.body.data.is_premium).toBe(true)
  })
})

describe('DELETE /api/admin/users/:id', () => {
  it('impede admin de deletar a própria conta', async () => {
    const res = await request(app).delete('/api/admin/users/admin-1')
      .set('Authorization', `Bearer ${TOKEN_ADMIN}`)
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/própria conta/i)
  })

  it('deleta outro usuário como admin', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' })
    prismaMock.user.delete.mockResolvedValue({ id: 'user-1' })

    const res = await request(app).delete('/api/admin/users/user-1')
      .set('Authorization', `Bearer ${TOKEN_ADMIN}`)

    expect(res.status).toBe(200)
    expect(res.body.data.message).toMatch(/removido/i)
  })
})
