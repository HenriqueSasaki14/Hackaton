import { Request, Response } from 'express'
import * as authService from './auth.service'
import { ok, fail } from '../../utils/response'

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return fail(res, 'name, email e password são obrigatórios', 400)
    }

    const result = await authService.register({ name, email, password })
    return ok(res, result, 201)
  } catch (err: any) {
    if (err.message === 'E-mail já cadastrado') return fail(res, err.message, 409)
    return fail(res, 'Erro ao cadastrar usuário', 500)
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return fail(res, 'email e password são obrigatórios', 400)
    }

    const result = await authService.login({ email, password })
    return ok(res, result)
  } catch (err: any) {
    if (err.message === 'Credenciais inválidas') return fail(res, err.message, 401)
    return fail(res, 'Erro ao fazer login', 500)
  }
}

export async function me(req: Request, res: Response) {
  try {
    const userId = req.user!.userId
    const user = await authService.me(userId)
    return ok(res, user)
  } catch (err: any) {
    return fail(res, err.message, 404)
  }
}
