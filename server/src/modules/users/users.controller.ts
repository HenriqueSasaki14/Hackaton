import { Request, Response } from 'express'
import * as usersService from './users.service'
import { ok, fail } from '../../utils/response'

export async function getProfile(req: Request, res: Response) {
  try {
    const user = await usersService.getProfile(req.params.id)
    return ok(res, user)
  } catch (err: any) {
    return fail(res, err.message, 404)
  }
}

export async function getRanking(req: Request, res: Response) {
  try {
    const ranking = await usersService.getRanking()
    return ok(res, ranking)
  } catch {
    return fail(res, 'Erro ao buscar ranking', 500)
  }
}

export async function updateMe(req: Request, res: Response) {
  try {
    const { name, avatar_url } = req.body
    const updated = await usersService.updateMe(req.user!.userId, { name, avatar_url })
    return ok(res, updated)
  } catch (err: any) {
    return fail(res, err.message, 400)
  }
}

export async function upgradePremium(req: Request, res: Response) {
  try {
    const updated = await usersService.upgradePremium(req.user!.userId)
    return ok(res, updated)
  } catch {
    return fail(res, 'Erro ao ativar premium', 500)
  }
}
