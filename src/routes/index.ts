import express from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth';

import auditoriasRoutes from './auditoriaRoutes';
import authRoutes from './authRoutes';
import cashflowRoutes from './cashflowRoutes';
import conflictosRoutes from './conflictosRoutes';
import productorasRoutes from './productorasRoutes';
import repertoriosRoutes from './repertoriosRoutes';
import usersRoutes from './usuariosRoutes';

const router = express.Router();

router.use('/auditorias', authenticate, authorizeRoles(['admin_principal','admin_secundario']), auditoriasRoutes);
router.use('/auth', authRoutes);
router.use('/cashflow', authenticate, authorizeRoles(['admin_principal','admin_secundario','productor_principal','productor_secundario']), cashflowRoutes);
router.use('/conflictos', authenticate, authorizeRoles(['admin_principal','admin_secundario','productor_principal','productor_secundario']), conflictosRoutes);
router.use('/productoras', authenticate, authorizeRoles(['admin_principal','admin_secundario','productor_principal','productor_secundario']), productorasRoutes);
router.use('/repertorios', authenticate, authorizeRoles(['admin_principal','admin_secundario','productor_principal','productor_secundario']), repertoriosRoutes);
router.use('/usuarios', authenticate, authorizeRoles(['admin_principal','admin_secundario']), usersRoutes);

export default router;
