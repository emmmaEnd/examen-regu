import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/roles.middleware.js';
import {
  getApiRoot,
  getExternalResourceController,
  syncResourceController,
  listResourceFromDbController,
  getResourceItemFromDbController,
} from '../controllers/swapi.controller.js';

const router = Router();
router.get('/', getApiRoot);

router.get('/swapi/:resource', authMiddleware, getExternalResourceController);

router.post(
  '/swapi/:resource/sync',
  authMiddleware,
  requireRole('admin'),
  syncResourceController
);

router.get('/:resource', authMiddleware, listResourceFromDbController);

router.get('/:resource/:id', authMiddleware, getResourceItemFromDbController);

export default router;
