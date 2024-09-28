import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  getAllProductores,
  getProductorById,
  createProductor,
  updateProductor,
  deleteProductor,
} from '../controllers/productorasController';
import {
  companiaCreateSchema,
  companiaUpdateSchema,
  companiaIdSchema,
} from '../services/validationSchemas';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();


router.get('/', authenticate, authorizeRoles(['admin', 'user']), getAllProductores);

router.get(
  '/:id',
  authenticate,
  authorizeRoles(['admin', 'user']),
  celebrate({ [Segments.PARAMS]: companiaIdSchema }),
  getProductorById
);

router.post(
  '/',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: companiaCreateSchema }),
  createProductor
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: companiaUpdateSchema, [Segments.PARAMS]: companiaIdSchema }),
  updateProductor
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: companiaIdSchema }),
  deleteProductor
);

export default router;
