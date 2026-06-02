// Mock centralizado do Prisma — cada teste configura os retornos com mockResolvedValue
export const prismaMock = {
  user: {
    findUnique:  jest.fn(),
    findMany:    jest.fn(),
    create:      jest.fn(),
    update:      jest.fn(),
    delete:      jest.fn(),
    deleteMany:  jest.fn(),
    count:       jest.fn(),
    aggregate:   jest.fn(),
  },
  trail: {
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  },
  activity: {
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
    count:      jest.fn(),
    aggregate:  jest.fn(),
  },
  userProgress: {
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    upsert:     jest.fn(),
    count:      jest.fn(),
    deleteMany: jest.fn(),
  },
  badge: {
    findMany: jest.fn(),
  },
  userBadge: {
    findMany:    jest.fn(),
    createMany:  jest.fn(),
    deleteMany:  jest.fn(),
  },
  project: {
    findUnique: jest.fn(),
    findMany:   jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    deleteMany: jest.fn(),
  },
  projectLike: {
    findUnique: jest.fn(),
    create:     jest.fn(),
    delete:     jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn((ops: any[]) => Promise.all(ops)),
}

jest.mock('../../lib/prisma', () => ({ prisma: prismaMock }))
