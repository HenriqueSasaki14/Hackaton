import { Router } from 'express'
import * as projectsController from './projects.controller'
import { requireAuth } from '../../middlewares/auth.middleware'

const router = Router()
router.get('/',             projectsController.getFeed)
router.get('/my',           requireAuth, projectsController.getMyProjects)
router.post('/',            requireAuth, projectsController.createProject)
router.put('/:id',          requireAuth, projectsController.updateProject)
router.post('/:id/publish', requireAuth, projectsController.publishProject)
router.post('/:id/like',    requireAuth, projectsController.toggleLike)
export default router
