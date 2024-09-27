import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  createConflicto,
  getConflictoById,
  getConflictosByEstado,
  getConflictosByUser,
  resolveConflicto,
  addComentarioConflicto,
  addDecisionInvolucrado,
  deleteConflicto
} from '../controllers/conflictosController';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import {
  createConflictoSchema,
  conflictoIdSchema,
  estadoConflictoSchema,
  comentarioSchema,
  decisionSchema,
  involucradoIdSchema,
} from '../services/validationSchemas';

const router = express.Router();

router.post(
  '/involucrados/:id_involucrado/decision',
  authenticate,
  celebrate({ [Segments.PARAMS]: involucradoIdSchema, [Segments.BODY]: decisionSchema }),
  addDecisionInvolucrado
);

router.post(
  '/:id/comentario',
  authenticate,
  celebrate({ [Segments.PARAMS]: conflictoIdSchema, [Segments.BODY]: comentarioSchema }),
  addComentarioConflicto
);

router.post(
  '/',
  authenticate,
  celebrate({ [Segments.BODY]: createConflictoSchema }),
  createConflicto
);

router.get(
  '/estado/:estado',
  authenticate,
  celebrate({ [Segments.PARAMS]: estadoConflictoSchema }),
  getConflictosByEstado
);

router.get(
  '/:id',
  authenticate,
  celebrate({ [Segments.PARAMS]: conflictoIdSchema }),
  getConflictoById
);

router.get('/', authenticate, getConflictosByUser);

router.put(
  '/:id/resolver',
  authenticate,
  celebrate({ [Segments.PARAMS]: conflictoIdSchema, [Segments.BODY]: comentarioSchema }),
  resolveConflicto
);

router.delete(
  '/conflictos/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: conflictoIdSchema }),
  deleteConflicto
);

export default router;
