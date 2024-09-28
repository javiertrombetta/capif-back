import express from 'express';
import { celebrate, Segments } from 'celebrate';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import {
  getEstadoCuentaCorriente,
  getDetallePagos,
  deleteCuentaCorriente,
  updateSaldoCuentaCorriente,
} from '../controllers/cuentasCorrientesController';
import {
  userIdSchema,
  updateSaldoSchema,
} from '../services/validationSchemas';

const router = express.Router();

router.get('/estado', authenticate, getEstadoCuentaCorriente);

router.get(
  '/:id/pagos',
  authenticate,
  celebrate({ [Segments.PARAMS]: userIdSchema }),
  getDetallePagos
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: userIdSchema }),
  deleteCuentaCorriente
);

router.put(
  '/:id/saldo',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({
    [Segments.PARAMS]: userIdSchema,
    [Segments.BODY]: updateSaldoSchema,
  }),
  updateSaldoCuentaCorriente
);

export default router;
