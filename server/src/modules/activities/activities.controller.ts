import { Request, Response } from 'express'
import * as activitiesService from './activities.service'
import { ok, fail } from '../../utils/response'

export async function createActivity(req: Request, res: Response) {
  try { return ok(res, await activitiesService.createActivity(req.params.trailId, req.body), 201) }
  catch (err: any) { return fail(res, err.message, err.status ?? 400) }
}
export async function updateActivity(req: Request, res: Response) {
  try { return ok(res, await activitiesService.updateActivity(req.params.id, req.body)) }
  catch (err: any) { return fail(res, err.message, err.status ?? 400) }
}
export async function deleteActivity(req: Request, res: Response) {
  try { await activitiesService.deleteActivity(req.params.id); return ok(res, { message: 'Atividade removida' }) }
  catch { return fail(res, 'Erro ao remover atividade', 500) }
}
export async function completeActivity(req: Request, res: Response) {
  try { return ok(res, await activitiesService.completeActivity(req.params.id, req.user!.userId)) }
  catch (err: any) { return fail(res, err.message, err.status ?? 500) }
}
