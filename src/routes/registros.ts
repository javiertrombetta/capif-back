import express from 'express';
import { getRegistrosPendientes } from '../controllers/registrosController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.get('/pendientes', authenticate, authorizeRoles(['admin']), getRegistrosPendientes);

export default router;
