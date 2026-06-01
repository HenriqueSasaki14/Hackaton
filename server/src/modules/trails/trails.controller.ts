import { Request, Response } from 'express'
import * as trailsService from './trails.service'
import { ok, fail } from '../../utils/response'

export async function listTrails(req: Request, res: Response) {
  try { return ok(res, await trailsService.listTrails(req.user?.userId)) }
  catch { return fail(res, 'Erro ao listar trilhas', 500) }
}
export async function getTrailDetail(req: Request, res: Response) {
  try { return ok(res, await trailsService.getTrailDetail(req.params.id, req.user?.userId)) }
  catch (err: any) { return fail(res, err.message, err.status ?? 500) }
}
export async function createTrail(req: Request, res: Response) {
  try { return ok(res, await trailsService.createTrail(req.body), 201) }
  catch (err: any) { return fail(res, err.message, err.status ?? 400) }
}
export async function updateTrail(req: Request, res: Response) {
  try { return ok(res, await trailsService.updateTrail(req.params.id, req.body)) }
  catch (err: any) { return fail(res, err.message, err.status ?? 400) }
}
export async function deleteTrail(req: Request, res: Response) {
  try { await trailsService.deleteTrail(req.params.id); return ok(res, { message: 'Trilha removida' }) }
  catch { return fail(res, 'Erro ao remover trilha', 500) }
}
