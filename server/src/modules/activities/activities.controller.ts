import { Request, Response } from 'express'
import * as activitiesService from './activities.service'
import { ok, fail } from '../../utils/response'

export async function createActivity(req: Request, res: Response) {
  try {
    const activity = await activitiesService.createActivity(req.params.trailId, req.body)
    return ok(res, activity, 201)
  } catch (err: any) {
    return fail(res, err.message, err.status ?? 400)
  }
}

export async function updateActivity(req: Request, res: Response) {
  try {
    const activity = await activitiesService.updateActivity(req.params.id, req.body)
    return ok(res, activity)
  } catch (err: any) {
    return fail(res, err.message, err.status ?? 400)
  }
}

export async function deleteActivity(req: Request, res: Response) {
  try {
    await activitiesService.deleteActivity(req.params.id)
    return ok(res, { message: 'Atividade removida com sucesso' })
  } catch {
    return fail(res, 'Erro ao remover atividade', 500)
  }
}

export async function completeActivity(req: Request, res: Response) {
  try {
    const result = await activitiesService.completeActivity(
      req.params.id,
      req.user!.userId
    )
    return ok(res, result)
  } catch (err: any) {
    return fail(res, err.message, err.status ?? 500)
  }
}
