import request from 'supertest'
import jwt from 'jsonwebtoken'
import '../__tests__/mocks/prisma.mock'
import { prismaMock } from '../__tests__/mocks/prisma.mock'
import { app } from '../app'

const TOKEN_USER  = jwt.sign({ userId: 'u1', role: 'USER'  }, 'test-secret-poussin', { expiresIn: '1h' })
const TOKEN_ADMIN = jwt.sign({ userId: 'u2', role: 'ADMIN' }, 'test-secret-poussin', { expiresIn: '1h' })

const freeTrail = {
  id: 't1', title: 'JS Básico', description: 'desc', slug: 'js-basico',
  difficulty: 'BEGINNER', is_premium: false, order: 1,
  prerequisite_trail_id: null, thumbnail_url: null,
  created_at: new Date(), updated_at: new Date(),
  activities: [],
  _count: { activities: 0 },
}

const premiumTrail = { ...freeTrail, id: 't2', slug: 'react', is_premium: true, order: 2 }
const lockedTrail  = { ...freeTrail, id: 't3', slug: 'node', order: 3, prerequisite_trail_id: 't1' }

beforeEach(() => {
  jest.clearAllMocks()
  prismaMock.userProgress.count.mockResolvedValue(0)
  prismaMock.userProgress.findMany.mockResolvedValue([])
})

describe('GET /api/trails', () => {
  it('retorna lista de trilhas sem autenticação', async () => {
    prismaMock.trail.findMany.mockResolvedValue([freeTrail])

    const res = await request(app).get('/api/trails')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('retorna progress_percent e is_locked com autenticação', async () => {
    prismaMock.trail.findMany.mockResolvedValue([lockedTrail])
    prismaMock.trail.findUnique.mockResolvedValue({ ...freeTrail, activities: [] })
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', is_premium: false })

    const res = await request(app).get('/api/trails')
      .set('Authorization', `Bearer ${TOKEN_USER}`)

    expect(res.status).toBe(200)
    expect(res.body.data[0]).toHaveProperty('progress_percent')
    expect(res.body.data[0]).toHaveProperty('is_locked')
  })
})

describe('GET /api/trails/:id', () => {
  it('retorna detalhes de trilha livre', async () => {
    prismaMock.trail.findUnique.mockResolvedValue({ ...freeTrail, activities: [] })

    const res = await request(app).get('/api/trails/t1')
      .set('Authorization', `Bearer ${TOKEN_USER}`)

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('t1')
  })

  it('retorna 403 para trilha premium com usuário free', async () => {
    prismaMock.trail.findUnique.mockResolvedValue({ ...premiumTrail, activities: [] })
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', is_premium: false })

    const res = await request(app).get('/api/trails/t2')
      .set('Authorization', `Bearer ${TOKEN_USER}`)

    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/premium/i)
  })

  it('retorna 403 para trilha com pré-requisito não concluído', async () => {
    prismaMock.trail.findUnique
      .mockResolvedValueOnce({ ...lockedTrail, activities: [] })  // trilha solicitada
      .mockResolvedValueOnce({ ...freeTrail, activities: [{ id: 'a1' }] })  // pré-requisito

    prismaMock.userProgress.count.mockResolvedValue(0) // pré-req não concluído

    const res = await request(app).get('/api/trails/t3')
      .set('Authorization', `Bearer ${TOKEN_USER}`)

    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/trilha anterior/i)
  })

  it('retorna 404 para trilha inexistente', async () => {
    prismaMock.trail.findUnique.mockResolvedValue(null)

    const res = await request(app).get('/api/trails/nao-existe')

    expect(res.status).toBe(404)
  })
})

describe('POST /api/trails (admin)', () => {
  it('retorna 403 para usuário comum', async () => {
    const res = await request(app).post('/api/trails')
      .set('Authorization', `Bearer ${TOKEN_USER}`)
      .send({ title: 'Nova', slug: 'nova', difficulty: 'BEGINNER', order: 99 })

    expect(res.status).toBe(403)
  })

  it('cria trilha com token de admin', async () => {
    prismaMock.trail.findUnique.mockResolvedValue(null)
    prismaMock.trail.create.mockResolvedValue({ ...freeTrail, id: 'new-trail' })

    const res = await request(app).post('/api/trails')
      .set('Authorization', `Bearer ${TOKEN_ADMIN}`)
      .send({ title: 'Nova Trilha', description: 'desc', slug: 'nova', difficulty: 'BEGINNER', is_premium: false, order: 10 })

    expect(res.status).toBe(201)
  })
})
