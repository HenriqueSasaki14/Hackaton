import { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[Error]', err.message)
  return res.status(500).json({ error: 'Erro interno do servidor' })
}
