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
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.PARAMS]: involucradoIdSchema, [Segments.BODY]: decisionSchema }),
  addDecisionInvolucrado
);


router.post(
  '/:id/comentario',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.PARAMS]: conflictoIdSchema, [Segments.BODY]: comentarioSchema }),
  addComentarioConflicto
);


router.post(
  '/',
  authenticate,
  authorizeRoles(['productor']),
  celebrate({ [Segments.BODY]: createConflictoSchema }),
  createConflicto
);

router.get(
  '/estado/:estado',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: estadoConflictoSchema }),
  getConflictosByEstado
);

router.get(
  '/:id',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.PARAMS]: conflictoIdSchema }),
  getConflictoById
);

router.get(
  '/',
  authenticate,
  authorizeRoles(['productor']),
  getConflictosByUser
);

router.put(
  '/:id/resolver',
  authenticate,
  authorizeRoles(['admin']),
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
