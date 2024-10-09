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

router.get(
  '/reportes/isrc',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  getISRCReportes
);

router.get(
  '/reportes/isrc/:id',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.PARAMS]: idReportSchema }),
  getISRCReporteById
);

router.post(
  '/reportes/isrc',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.BODY]: createISRCReportSchema }),
  generateISRCReport
);

router.get(
  '/reportes/isrc/:id/descargar',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.PARAMS]: idReportSchema }),
  downloadISRCReporte
);

router.post(
  '/reportes/:tipoReporte',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.BODY]: generateReportByTypeSchema }),
  generateOtherReports
);

export default router;
