import { Request, Response } from 'express'
import * as authService from './auth.service'
import { ok, fail } from '../../utils/response'

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return fail(res, 'name, email e password são obrigatórios', 400)
    return ok(res, await authService.register({ name, email, password }), 201)
  } catch (err: any) {
    if (err.message === 'E-mail já cadastrado') return fail(res, err.message, 409)
    return fail(res, 'Erro ao cadastrar usuário', 500)
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body
    if (!email || !password) return fail(res, 'email e password são obrigatórios', 400)
    return ok(res, await authService.login({ email, password }))
  } catch (err: any) {
    if (err.message === 'Credenciais inválidas') return fail(res, err.message, 401)
    return fail(res, 'Erro ao fazer login', 500)
  }
}

export async function me(req: Request, res: Response) {
  try {
    return ok(res, await authService.me(req.user!.userId))
  } catch (err: any) {
    return fail(res, err.message, 404)
  }
}
