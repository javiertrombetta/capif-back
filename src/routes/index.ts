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
import registrosRoutes from './registros';
import premiosRoutes from './premios';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.use('/archivos', authenticate, authorizeRoles(['admin']), archivoRoutes);
router.use('/auth', authRoutes);
router.use('/conflictos', authenticate, authorizeRoles(['admin', 'user']), conflictoRoutes);
router.use('/consultas', authenticate, authorizeRoles(['admin', 'user']), consultaRoutes);
router.use('/cc', authenticate, authorizeRoles(['admin', 'user']), cuentaCorrienteRoutes);
router.use('/pagos', authenticate, authorizeRoles(['admin']), pagosRoutes);
router.use('/premios', authenticate, authorizeRoles(['user']), premiosRoutes);
router.use('/registros', authenticate, authorizeRoles(['admin']), registrosRoutes);
router.use('/repertorios', authenticate, authorizeRoles(['admin', 'user']), repertorioRoutes);
router.use('/reportes', authenticate, authorizeRoles(['admin', 'user']), reporteRoutes);
router.use('/sesiones', authenticate, authorizeRoles(['admin', 'user']), sesionRoutes);
router.use('/tramites', authenticate, authorizeRoles(['admin']), tramiteRoutes);
router.use('/usuarios', authenticate, authorizeRoles(['admin']), userRoutes);

export default router;