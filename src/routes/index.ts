import express from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth';

import authRoutes from './authRoutes';
import userRoutes from './usuariosRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/usuarios', authenticate, authorizeRoles(['admin']), userRoutes);

export default router;
