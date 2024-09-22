import express from 'express';
import {
  getCuentaCorriente,
  getCuentaCorrienteById,
} from '../controllers/cuentasCorrientesController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.get('/:id', authenticate, authorizeRoles(['admin']), getCuentaCorrienteById);
router.get('/', authenticate, authorizeRoles(['user']), getCuentaCorriente);

export default router;
