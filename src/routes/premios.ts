import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  getAllPostulaciones,
  getPostulacionById,
  createPostulacion,
  updatePostulacion,
  deletePostulacion,
} from '../controllers/premiosController';
import { createPremioSchema, updatePremioSchema } from '../services/validationSchemas';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.get('/premios', authenticate, authorizeRoles(['admin']), getAllPostulaciones);

router.get(
  '/premios/:id',
  authorizeRoles(['admin', 'productor']),
  authenticate,
  getPostulacionById
);

router.post(
  '/premios',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: createPremioSchema }),
  createPostulacion
);

router.put(
  '/premios/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: updatePremioSchema }),
  updatePostulacion
);

router.delete(
  '/premios/:id',
  authenticate,
  authorizeRoles(['admin']),
  deletePostulacion
);

export default router;
