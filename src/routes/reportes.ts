import express from 'express';
import {
  getReportes,
  generateISRCReport,
  getReporteById,
  downloadReporte,
} from '../controllers/reportesController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();


router.get('/:id', authenticate, authorizeRoles(['admin', 'user']), getReporteById);
router.get('/descargar', authenticate, authorizeRoles(['admin', 'user']), downloadReporte);
router.post('/isrc', authenticate, authorizeRoles(['admin']), generateISRCReport);
router.get('/', authenticate, authorizeRoles(['admin', 'user']), getReportes);

export default router;
