import { Request, Response } from 'express'
import * as projectsService from './projects.service'
import { ok, fail } from '../../utils/response'

export async function getFeed(req: Request, res: Response) {
  try { return ok(res, await projectsService.getFeed()) }
  catch { return fail(res, 'Erro ao buscar feed', 500) }
}
export async function getMyProjects(req: Request, res: Response) {
  try { return ok(res, await projectsService.getMyProjects(req.user!.userId)) }
  catch { return fail(res, 'Erro ao buscar projetos', 500) }
}
export async function createProject(req: Request, res: Response) {
  try {
    const { trail_id, title, description, code_url } = req.body
    if (!trail_id || !title || !description || !code_url) return fail(res, 'trail_id, title, description e code_url são obrigatórios', 400)
    return ok(res, await projectsService.createProject(req.user!.userId, { trail_id, title, description, code_url }), 201)
  } catch (err: any) { return fail(res, err.message, err.status ?? 400) }
}
export async function updateProject(req: Request, res: Response) {
  try { return ok(res, await projectsService.updateProject(req.params.id, req.user!.userId, req.body)) }
  catch (err: any) { return fail(res, err.message, err.status ?? 400) }
}
export async function publishProject(req: Request, res: Response) {
  try { return ok(res, await projectsService.publishProject(req.params.id, req.user!.userId)) }
  catch (err: any) { return fail(res, err.message, err.status ?? 400) }
}
export async function toggleLike(req: Request, res: Response) {
  try { return ok(res, await projectsService.toggleLike(req.params.id, req.user!.userId)) }
  catch (err: any) { return fail(res, err.message, err.status ?? 400) }
}
