import express from 'express';
import { createConsulta, getDatosPersonales } from '../controllers/consultasController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.get('/datos_personales', authenticate, authorizeRoles(['user']), getDatosPersonales);
router.post('/', authenticate, authorizeRoles(['admin', 'user']), createConsulta);

export default router;
