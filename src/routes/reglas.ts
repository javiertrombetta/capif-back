import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  getAllReglas,
  getReglaById,
  createRegla,
  updateRegla,
  deleteRegla,
} from '../controllers/reglasController';
import {
  reglaCreateSchema,
  reglaUpdateSchema,
  companiaIdSchema,
} from '../services/validationSchemas';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.get('/reglas', authenticate, authorizeRoles(['admin']), getAllReglas);


router.get(
  '/reglas/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: companiaIdSchema }),
  getReglaById
);

router.post(
  '/reglas',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: reglaCreateSchema }),
  createRegla
);

router.put(
  '/reglas/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({
    [Segments.PARAMS]: companiaIdSchema,
    [Segments.BODY]: reglaUpdateSchema,
  }),
  updateRegla
);

router.delete(
  '/reglas/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: companiaIdSchema }),
  deleteRegla
);

export default router;
