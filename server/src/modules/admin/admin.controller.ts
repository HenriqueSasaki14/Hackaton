import { Request, Response } from 'express'
import * as adminService from './admin.service'
import { ok, fail } from '../../utils/response'

export async function listUsers(req: Request, res: Response) {
  try {
    const page  = parseInt(req.query.page  as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const result = await adminService.listUsers(page, limit)
    return ok(res, result)
  } catch {
    return fail(res, 'Erro ao listar usuários', 500)
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const user = await adminService.updateUser(req.params.id, req.body)
    return ok(res, user)
  } catch (err: any) {
    return fail(res, err.message, err.status ?? 400)
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    await adminService.deleteUser(req.params.id, req.user!.userId)
    return ok(res, { message: 'Usuário removido com sucesso' })
  } catch (err: any) {
    return fail(res, err.message, err.status ?? 400)
  }
}
