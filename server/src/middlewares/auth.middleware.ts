import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface AuthPayload { userId: string; role: string }

declare global {
  namespace Express {
    interface Request { user?: AuthPayload }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token não fornecido' })
  try {
    req.user = jwt.verify(header.split(' ')[1], env.JWT_SECRET) as AuthPayload
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try { req.user = jwt.verify(header.split(' ')[1], env.JWT_SECRET) as AuthPayload } catch { /* ignora */ }
  }
  next()
}
