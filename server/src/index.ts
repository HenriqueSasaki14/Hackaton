import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { env } from './config/env'
import { errorHandler } from './middlewares/error.middleware'

import authRoutes       from './modules/auth/auth.routes'
import usersRoutes      from './modules/users/users.routes'
import trailsRoutes     from './modules/trails/trails.routes'
import activitiesRoutes from './modules/activities/activities.routes'
import projectsRoutes   from './modules/projects/projects.routes'
import adminRoutes      from './modules/admin/admin.routes'
import badgesRoutes     from './modules/badges/badges.routes'

const app = express()

app.use(cors())
app.use(express.json({ limit: '5mb' }))

app.use('/api/auth',       authRoutes)
app.use('/api/users',      usersRoutes)
app.use('/api/trails',     trailsRoutes)
app.use('/api/activities', activitiesRoutes)
app.use('/api/projects',   projectsRoutes)
app.use('/api/admin',      adminRoutes)
app.use('/api/badges',     badgesRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.use(errorHandler)

app.listen(env.PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${env.PORT}`)
})
