import { Request, Response } from 'express'
import * as projectsService from './projects.service'
import { ok, fail } from '../../utils/response'

export async function getFeed(req: Request, res: Response) {
  try {
    const projects = await projectsService.getFeed()
    return ok(res, projects)
  } catch {
    return fail(res, 'Erro ao buscar feed', 500)
  }
}

export async function getMyProjects(req: Request, res: Response) {
  try {
    const projects = await projectsService.getMyProjects(req.user!.userId)
    return ok(res, projects)
  } catch {
    return fail(res, 'Erro ao buscar projetos', 500)
  }
}

export async function createProject(req: Request, res: Response) {
  try {
    const { trail_id, title, description, code_url } = req.body

    if (!trail_id || !title || !description || !code_url) {
      return fail(res, 'trail_id, title, description e code_url são obrigatórios', 400)
    }

    const project = await projectsService.createProject(req.user!.userId, {
      trail_id,
      title,
      description,
      code_url,
    })
    return ok(res, project, 201)
  } catch (err: any) {
    return fail(res, err.message, err.status ?? 400)
  }
}

export async function updateProject(req: Request, res: Response) {
  try {
    const project = await projectsService.updateProject(
      req.params.id,
      req.user!.userId,
      req.body
    )
    return ok(res, project)
  } catch (err: any) {
    return fail(res, err.message, err.status ?? 400)
  }
}

export async function publishProject(req: Request, res: Response) {
  try {
    const project = await projectsService.publishProject(
      req.params.id,
      req.user!.userId
    )
    return ok(res, project)
  } catch (err: any) {
    return fail(res, err.message, err.status ?? 400)
  }
}

export async function toggleLike(req: Request, res: Response) {
  try {
    const result = await projectsService.toggleLike(
      req.params.id,
      req.user!.userId
    )
    return ok(res, result)
  } catch (err: any) {
    return fail(res, err.message, err.status ?? 400)
  }
}
