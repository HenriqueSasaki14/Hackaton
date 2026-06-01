import { Request, Response, NextFunction } from 'express'

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado' })
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Acesso restrito a administradores' })
  next()
}
