import { Request, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { ok, fail } from '../../utils/response'

export async function listAll(_req: Request, res: Response) {
  try {
    const badges = await prisma.badge.findMany({ orderBy: { condition_value: 'asc' } })
    return ok(res, badges)
  } catch {
    return fail(res, 'Erro ao buscar conquistas', 500)
  }
}
