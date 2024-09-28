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
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.get('/premios', authenticate, getAllPostulaciones);

router.get('/premios/:id', authenticate, getPostulacionById);

router.post(
  '/premios',
  authenticate,
  celebrate({ [Segments.BODY]: createPremioSchema }),
  createPostulacion
);

router.put(
  '/premios/:id',
  authenticate,
  celebrate({ [Segments.BODY]: updatePremioSchema }),
  updatePostulacion
);

router.delete('/premios/:id', authenticate, deletePostulacion);

export default router;
