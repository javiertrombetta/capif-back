import express from 'express';
import { getSesiones, deleteSesion } from '../controllers/sesionesController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.delete('/:id', authenticate, authorizeRoles(['admin', 'user']), deleteSesion);
router.get('/', authenticate, authorizeRoles(['admin', 'user']), getSesiones);

export default router;
