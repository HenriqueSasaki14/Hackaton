import { Router } from 'express'
import * as usersController from './users.controller'
import { requireAuth } from '../../middlewares/auth.middleware'

const router = Router()

router.get('/ranking',          usersController.getRanking)
router.get('/:id/profile',      usersController.getProfile)
router.put('/me',               requireAuth, usersController.updateMe)
router.post('/upgrade-premium', requireAuth, usersController.upgradePremium)

export default router
