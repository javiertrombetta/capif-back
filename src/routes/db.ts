import express from 'express';
import { celebrate, Segments } from 'celebrate';
import DBController from '../controllers/dbController';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import { createSchema, updateSchema, idSchema } from '../services/validationSchemas';

const router = express.Router();

// Create a record
router.post(
  '/:tipo',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: createSchema }),
  DBController.create
);

// Get all records
router.get(
  '/:tipo',
  authenticate,
  authorizeRoles(['admin']),
  DBController.getAll
);

// Get a record by ID
router.get(
  '/:tipo/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: idSchema }),
  DBController.getById
);

// Update a record
router.put(
  '/:tipo/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: idSchema, [Segments.BODY]: updateSchema }),
  DBController.update
);

// Delete a record
router.delete(
  '/:tipo/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: idSchema }),
  DBController.delete
);

export default router;
