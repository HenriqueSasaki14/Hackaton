import { Request, Response } from 'express'
import * as usersService from './users.service'
import { ok, fail } from '../../utils/response'

export async function getProfile(req: Request, res: Response) {
  try { return ok(res, await usersService.getProfile(req.params.id)) }
  catch (err: any) { return fail(res, err.message, 404) }
}

export async function getRanking(req: Request, res: Response) {
  try { return ok(res, await usersService.getRanking()) }
  catch { return fail(res, 'Erro ao buscar ranking', 500) }
}

export async function updateMe(req: Request, res: Response) {
  try {
    const { name, avatar_url } = req.body
    return ok(res, await usersService.updateMe(req.user!.userId, { name, avatar_url }))
  } catch (err: any) { return fail(res, err.message, 400) }
}

export async function upgradePremium(req: Request, res: Response) {
  try { return ok(res, await usersService.upgradePremium(req.user!.userId)) }
  catch { return fail(res, 'Erro ao ativar premium', 500) }
}

export async function deleteMe(req: Request, res: Response) {
  try {
    await usersService.deleteMe(req.user!.userId)
    return ok(res, { message: 'Conta excluída com sucesso' })
  } catch (err: any) { return fail(res, err.message, 500) }
}
