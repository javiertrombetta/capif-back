import express from 'express';
import { getSesiones, deleteSesion } from '../controllers/sesionesController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.delete('/:id', authenticate, authorizeRoles(['admin']), deleteSesion);
router.get('/', authenticate, authorizeRoles(['admin']), getSesiones);

export default router;
