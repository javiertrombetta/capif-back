import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  getRepertorios,
  getRepertorioById,
  createRepertorio,
  updateRepertorio,
  deleteRepertorio,
  downloadRepertorio,
  getRepertoriosDepuracion,
  updateRepertorioDepuracion,
  generarLoteEnvio,
} from '../controllers/repertoriosController';
import {
  repertorioCreateSchema,
  repertorioUpdateSchema,
  repertorioIdSchema,  
  updateDepuracionSchema,
} from '../services/validationSchemas';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.get('/', authenticate, authorizeRoles(['admin']), getRepertorios);

router.get(
  '/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: repertorioIdSchema }),
  getRepertorioById
);

router.post(
  '/',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: repertorioCreateSchema }),
  createRepertorio
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: repertorioIdSchema, [Segments.BODY]: repertorioUpdateSchema }),
  updateRepertorio
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: repertorioIdSchema }),
  deleteRepertorio
);

router.get(
  '/:id/descargar',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: repertorioIdSchema }),
  downloadRepertorio
);

router.get('/depuracion', authenticate, authorizeRoles(['admin']), getRepertoriosDepuracion);

router.put(
  '/:id/depuracion',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: repertorioIdSchema, [Segments.BODY]: updateDepuracionSchema }),
  updateRepertorioDepuracion
);

router.post('/lote-envio', authenticate, authorizeRoles(['admin']), generarLoteEnvio);

export default router;
