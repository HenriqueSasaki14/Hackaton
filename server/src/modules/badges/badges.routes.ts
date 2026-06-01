import { Router } from 'express'
import * as badgesController from './badges.controller'

const router = Router()

router.get('/', badgesController.listAll)

export default router
