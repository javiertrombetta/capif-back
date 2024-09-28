import express from 'express';
import { celebrate, Segments } from 'celebrate';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import {
  getISRCReportes,
  getISRCReporteById,
  generateISRCReport,
  downloadISRCReporte,
  generateOtherReports,
} from '../controllers/reportesController';
import {
  createISRCReportSchema,
  idReportSchema,
  generateReportByTypeSchema,
} from '../services/validationSchemas';

const router = express.Router();

// Rutas para los reportes de ISRC

// Obtener todos los reportes de ISRC (acceso restringido a roles específicos)
router.get(
  '/reportes/isrc',
  authenticate,
  authorizeRoles(['admin', 'usuario_productor']),
  getISRCReportes
);

// Obtener un reporte específico de ISRC por su ID
router.get(
  '/reportes/isrc/:id',
  authenticate,
  authorizeRoles(['admin', 'usuario_productor']),
  celebrate({ [Segments.PARAMS]: idReportSchema }),
  getISRCReporteById
);

// Generar un reporte de ISRC basado en el tipo y rango de fechas
router.post(
  '/reportes/isrc',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: createISRCReportSchema }),
  generateISRCReport
);

// Descargar un reporte de ISRC específico en formato CSV
router.get(
  '/reportes/isrc/:id/descargar',
  authenticate,
  authorizeRoles(['admin', 'usuario_productor']),
  celebrate({ [Segments.PARAMS]: idReportSchema }),
  downloadISRCReporte
);

// Rutas para otros reportes genéricos
router.post(
  '/reportes/:tipoReporte',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: generateReportByTypeSchema }),
  generateOtherReports
);

export default router;
