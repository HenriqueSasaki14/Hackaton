import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { env } from './config/env'
import { errorHandler } from './middlewares/error.middleware'

import authRoutes  from './modules/auth/auth.routes'
import usersRoutes from './modules/users/users.routes'

const app = express()

app.use(cors())
app.use(express.json())

// ── Rotas ──────────────────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes)
app.use('/api/users', usersRoutes)

// app.use('/api/trails',     trailsRoutes)
// app.use('/api/activities', activitiesRoutes)
// app.use('/api/projects',   projectsRoutes)
// app.use('/api/admin',      adminRoutes)

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

// ── Handler global de erros (deve ser o último middleware) ─────────────────
app.use(errorHandler)

app.listen(env.PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${env.PORT}`)
})
