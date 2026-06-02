import request from 'supertest'
import bcrypt from 'bcryptjs'
import '../__tests__/mocks/prisma.mock'
import { prismaMock } from '../__tests__/mocks/prisma.mock'
import { app } from '../app'

const mockUser = {
  id: 'user-1',
  name: 'Teste',
  email: 'teste@poussin.dev',
  password_hash: '',
  role: 'USER' as const,
  is_premium: false,
  xp_total: 0,
  streak_count: 0,
  streak_freezes: 0,
  avatar_url: null,
  last_activity_date: null,
  created_at: new Date(),
  updated_at: new Date(),
}

beforeAll(async () => {
  mockUser.password_hash = await bcrypt.hash('senha123', 10)
})

beforeEach(() => jest.clearAllMocks())

describe('POST /api/auth/register', () => {
  it('cria usuário e retorna token', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    prismaMock.user.create.mockResolvedValue({ ...mockUser, id: 'new-1', email: 'novo@test.com' })

    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Novo', email: 'novo@test.com', password: 'senha123' })

    expect(res.status).toBe(201)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user.email).toBe('novo@test.com')
  })

  it('retorna 409 se email já existe', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser)

    const res = await request(app).post('/api/auth/register')
      .send({ name: 'X', email: 'teste@poussin.dev', password: 'senha123' })

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/já cadastrado/i)
  })

  it('retorna 400 se campos obrigatórios faltam', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('autentica e retorna token', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser)

    const res = await request(app).post('/api/auth/login')
      .send({ email: 'teste@poussin.dev', password: 'senha123' })

    expect(res.status).toBe(200)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user).not.toHaveProperty('password_hash')
  })

  it('retorna 401 com senha errada', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser)

    const res = await request(app).post('/api/auth/login')
      .send({ email: 'teste@poussin.dev', password: 'errada' })

    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/inválidas/i)
  })

  it('retorna 401 com email inexistente', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    const res = await request(app).post('/api/auth/login')
      .send({ email: 'nao@existe.com', password: 'senha123' })

    expect(res.status).toBe(401)
  })

  it('retorna 400 se campos faltam', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'x@x.com' })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/auth/me', () => {
  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/Token/i)
  })

  it('retorna 401 com token inválido', async () => {
    const res = await request(app).get('/api/auth/me')
      .set('Authorization', 'Bearer token-falso')
    expect(res.status).toBe(401)
  })

  it('retorna dados do usuário com token válido', async () => {
    const jwt = require('jsonwebtoken')
    const token = jwt.sign({ userId: 'user-1', role: 'USER' }, 'test-secret-poussin', { expiresIn: '1h' })

    // Mock retorna apenas os campos do select (sem password_hash)
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1', name: 'Teste', email: 'teste@poussin.dev',
      role: 'USER', is_premium: false, xp_total: 0,
      streak_count: 0, streak_freezes: 0, avatar_url: null,
      last_activity_date: null, created_at: new Date(),
      badges: [],
    })

    const res = await request(app).get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('user-1')
    expect(res.body.data).not.toHaveProperty('password_hash')
  })
})
