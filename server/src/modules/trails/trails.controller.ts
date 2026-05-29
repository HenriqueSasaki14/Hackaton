import { Request, Response } from 'express'
import * as trailsService from './trails.service'
import { ok, fail } from '../../utils/response'

export async function listTrails(req: Request, res: Response) {
  try {
    const userId = req.user?.userId
    const trails = await trailsService.listTrails(userId)
    return ok(res, trails)
  } catch {
    return fail(res, 'Erro ao listar trilhas', 500)
  }
}

export async function getTrailDetail(req: Request, res: Response) {
  try {
    const userId = req.user?.userId
    const trail = await trailsService.getTrailDetail(req.params.id, userId)
    return ok(res, trail)
  } catch (err: any) {
    return fail(res, err.message, err.status ?? 500)
  }
}

export async function createTrail(req: Request, res: Response) {
  try {
    const trail = await trailsService.createTrail(req.body)
    return ok(res, trail, 201)
  } catch (err: any) {
    return fail(res, err.message, err.status ?? 400)
  }
}

export async function updateTrail(req: Request, res: Response) {
  try {
    const trail = await trailsService.updateTrail(req.params.id, req.body)
    return ok(res, trail)
  } catch (err: any) {
    return fail(res, err.message, err.status ?? 400)
  }
}

export async function deleteTrail(req: Request, res: Response) {
  try {
    await trailsService.deleteTrail(req.params.id)
    return ok(res, { message: 'Trilha removida com sucesso' })
  } catch {
    return fail(res, 'Erro ao remover trilha', 500)
  }
}
