import express from 'express';
import { getCodigoPostulacion } from '../controllers/premiosController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.get('/codigo_postulacion', authenticate, authorizeRoles(['user']), getCodigoPostulacion);

export default router;
