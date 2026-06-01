import { Router } from 'express'
import * as adminController from './admin.controller'
import { requireAuth } from '../../middlewares/auth.middleware'
import { requireAdmin } from '../../middlewares/admin.middleware'

const router = Router()
router.use(requireAuth, requireAdmin)
router.get('/users',          adminController.listUsers)
router.put('/users/:id',      adminController.updateUser)
router.delete('/users/:id',   adminController.deleteUser)
export default router
