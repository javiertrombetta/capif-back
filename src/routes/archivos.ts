import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  getArchivosByRole,
  createArchivo,
  updateArchivo,
  deleteArchivo,
} from '../controllers/archivosController';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import {
  archivoCreateSchema,
  archivoUpdateSchema,
  archivoIdSchema,
} from '../services/validationSchemas';

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.BODY]: archivoCreateSchema }),
  createArchivo
);

router.get('/', authenticate, getArchivosByRole);

router.put(
  '/:id',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.PARAMS]: archivoIdSchema, [Segments.BODY]: archivoUpdateSchema }),
  updateArchivo
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: archivoIdSchema }),
  deleteArchivo
);

export default router;
