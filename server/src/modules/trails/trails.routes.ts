import { Router } from 'express'
import * as trailsController from './trails.controller'
import { requireAuth, optionalAuth } from '../../middlewares/auth.middleware'
import { requireAdmin } from '../../middlewares/admin.middleware'

const router = Router()

router.get('/',       optionalAuth, trailsController.listTrails)
router.get('/:id',    optionalAuth, trailsController.getTrailDetail)
router.post('/',      requireAuth, requireAdmin, trailsController.createTrail)
router.put('/:id',    requireAuth, requireAdmin, trailsController.updateTrail)
router.delete('/:id', requireAuth, requireAdmin, trailsController.deleteTrail)

export default router
