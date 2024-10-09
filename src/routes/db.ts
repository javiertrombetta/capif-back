import express from 'express';
import { celebrate, Segments } from 'celebrate';
import DBController from '../controllers/dbController';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import { createSchema, updateSchema, idSchema } from '../services/validationSchemas';

const router = express.Router();

router.post(
  '/:tipo',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: createSchema }),
  DBController.create
);

router.get(
  '/:tipo',
  authenticate,
  authorizeRoles(['admin']),
  DBController.getAll
);

router.get(
  '/:tipo/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: idSchema }),
  DBController.getById
);

router.put(
  '/:tipo/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: idSchema, [Segments.BODY]: updateSchema }),
  DBController.update
);

router.delete(
  '/:tipo/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: idSchema }),
  DBController.delete
);

export default router;
