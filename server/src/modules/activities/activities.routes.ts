import { Router } from 'express'
import * as activitiesController from './activities.controller'
import { requireAuth } from '../../middlewares/auth.middleware'
import { requireAdmin } from '../../middlewares/admin.middleware'

const router = Router()

router.post('/trails/:trailId/activities', requireAuth, requireAdmin, activitiesController.createActivity)
router.put('/:id',                         requireAuth, requireAdmin, activitiesController.updateActivity)
router.delete('/:id',                      requireAuth, requireAdmin, activitiesController.deleteActivity)
router.post('/:id/complete',               requireAuth, activitiesController.completeActivity)

export default router
