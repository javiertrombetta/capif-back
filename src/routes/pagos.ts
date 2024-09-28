import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  getAllPagos,
  getPagosByUser,
  createPago,
  updatePago,
  deletePago,
} from '../controllers/pagosController';
import { createPagoSchema, updatePagoSchema, userIdSchema } from '../services/validationSchemas';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.get('/pagos', authenticate, getAllPagos);
router.get(
  '/pagos/:id',
  authenticate,
  celebrate({ [Segments.PARAMS]: userIdSchema }),
  getPagosByUser
);
router.post('/pagos', authenticate, celebrate({ [Segments.BODY]: createPagoSchema }), createPago);
router.put(
  '/pagos/:id',
  authenticate,
  celebrate({ [Segments.PARAMS]: userIdSchema, [Segments.BODY]: updatePagoSchema }),
  updatePago
);
router.delete(
  '/pagos/:id',
  authenticate,
  celebrate({ [Segments.PARAMS]: userIdSchema }),
  deletePago
);

export default router;
