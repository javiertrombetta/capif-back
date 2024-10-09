import express from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import repertorioRoutes from './repertorios';
import conflictoRoutes from './conflictos';
import cuentaCorrienteRoutes from './cuentasCorrientes';
import archivoRoutes from './archivos';
import reporteRoutes from './reportes';
import tramiteRoutes from './tramites';
import sesionRoutes from './sesiones';
import consultaRoutes from './consultas';
import pagosRoutes from './pagos';
import productorasRoutes from './productoras'
import reglasRoutes from './reglas';
import dbRoutes from './db';

import premiosRoutes from './premios';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.use('/archivos', authenticate, authorizeRoles(['admin', 'productor']), archivoRoutes);
router.use('/auth', authRoutes);
router.use('/conflictos', authenticate, authorizeRoles(['admin', 'productor']), conflictoRoutes);
router.use('/consultas', authenticate, authorizeRoles(['admin', 'productor']), consultaRoutes);
router.use(
  '/cuentas-corrientes',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  cuentaCorrienteRoutes
);
router.use('/db', authenticate, authorizeRoles(['admin']), dbRoutes);
router.use('/pagos', authenticate, authorizeRoles(['admin', 'productor']), pagosRoutes);
router.use('/premios', authenticate, authorizeRoles(['admin', 'productor']), premiosRoutes);
router.use('/productoras', authenticate, authorizeRoles(['admin', 'productor']), productorasRoutes);
router.use('/reglas', authenticate, authorizeRoles(['admin']), reglasRoutes);
router.use('/repertorios', authenticate, authorizeRoles(['admin', 'productor']), repertorioRoutes);
router.use('/reportes', authenticate, authorizeRoles(['admin', 'productor']), reporteRoutes);
router.use('/sesiones', authenticate, authorizeRoles(['admin']), sesionRoutes);
router.use('/tramites', authenticate, authorizeRoles(['admin', 'productor']), tramiteRoutes);
router.use('/usuarios', authenticate, authorizeRoles(['admin']), userRoutes);

export default router;
