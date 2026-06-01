import { Request, Response } from 'express'
import * as adminService from './admin.service'
import { ok, fail } from '../../utils/response'

export async function listUsers(req: Request, res: Response) {
  try { return ok(res, await adminService.listUsers(parseInt(req.query.page as string) || 1, parseInt(req.query.limit as string) || 20)) }
  catch { return fail(res, 'Erro ao listar usuários', 500) }
}
export async function updateUser(req: Request, res: Response) {
  try { return ok(res, await adminService.updateUser(req.params.id, req.body)) }
  catch (err: any) { return fail(res, err.message, err.status ?? 400) }
}
export async function deleteUser(req: Request, res: Response) {
  try { await adminService.deleteUser(req.params.id, req.user!.userId); return ok(res, { message: 'Usuário removido com sucesso' }) }
  catch (err: any) { return fail(res, err.message, err.status ?? 400) }
}
