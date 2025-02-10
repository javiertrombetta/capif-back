import express from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth';

import auditoriasRoutes from './auditoriaRoutes';
import authRoutes from './authRoutes';
import cashflowRoutes from './cashflowRoutes';
// import conflictosRoutes from './conflictosRoutes';
import miscRouter from './miscRouter';
import productorasRoutes from './productorasRoutes';
import repertoriosRoutes from './repertoriosRoutes';
import usersRoutes from './usuariosRoutes';

const router = express.Router();

router.use('/audits', authenticate, authorizeRoles(['admin_principal','admin_secundario']), auditoriasRoutes);
router.use('/auth', authRoutes);
router.use('/cashflow', authenticate, authorizeRoles(['admin_principal','admin_secundario','productor_principal','productor_secundario']), cashflowRoutes);
// router.use('/conflicts', authenticate, authorizeRoles(['admin_principal','admin_secundario','productor_principal','productor_secundario']), conflictosRoutes);
router.use('/misc', authenticate, miscRouter);
router.use('/producers', authenticate, authorizeRoles(['admin_principal','admin_secundario','productor_principal','productor_secundario']), productorasRoutes);
router.use('/repertoires', authenticate, authorizeRoles(['admin_principal','admin_secundario','productor_principal','productor_secundario']), repertoriosRoutes);
router.use('/users', authenticate, usersRoutes);

export default router;
