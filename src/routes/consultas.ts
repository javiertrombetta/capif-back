import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  getConsultas,
  getConsultaById,
  createConsulta,
  updateConsulta,
  deleteConsulta,
} from '../controllers/consultasController';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import {
  createConsultaSchema,
  updateConsultaSchema,
  getConsultaSchema,
  deleteConsultaSchema,
} from '../services/validationSchemas';

const router = express.Router();

router.get('/consultas', authenticate, authorizeRoles(['admin', 'usuario']), getConsultas);

router.get(
  '/consultas/:id',
  authenticate,
  authorizeRoles(['admin', 'usuario']),
  celebrate({ [Segments.PARAMS]: getConsultaSchema }),
  getConsultaById
);

router.post(
  '/consultas',
  authenticate,
  authorizeRoles(['usuario']),
  celebrate({ [Segments.BODY]: createConsultaSchema }),
  createConsulta
);

router.put(
  '/consultas/:id',
  authenticate,
  authorizeRoles(['admin', 'usuario']),
  celebrate({ [Segments.PARAMS]: getConsultaSchema, [Segments.BODY]: updateConsultaSchema }),
  updateConsulta
);

router.delete(
  '/consultas/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: deleteConsultaSchema }),
  deleteConsulta
);

export default router;
