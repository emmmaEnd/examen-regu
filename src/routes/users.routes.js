// src/routes/users.routes.js
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/roles.middleware.js';
import {
  getMe,
  changeMyPassword,
  listUsers,
  home,
} from '../controllers/users.controller.js';

const router = Router();

// datos del usuario
router.get('/me', authMiddleware, getMe);

// home
router.get('/home', authMiddleware, home);

// cambiar contra
router.put('/me/password', authMiddleware, changeMyPassword);

// lista de usuarios
router.get('/', authMiddleware, requireRole('admin'), listUsers);

export default router;
