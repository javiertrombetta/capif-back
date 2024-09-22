import express from 'express';
import { login, register, recoverPassword } from '../controllers/authController';

const router = express.Router();

router.post('/login', login);
router.post('/recuperar', recoverPassword);
router.post('/register', register);

export default router;
