import express from 'express';
import { celebrate, Segments } from 'celebrate';
import { login, register, recoverPassword, resetPassword } from '../controllers/authController';
import {
  registerSchema,
  loginSchema,
  recoverPasswordSchema,
  resetPasswordSchema,
} from '../services/validationSchemas';

const router = express.Router();


router.post('/login', celebrate({ [Segments.BODY]: loginSchema }), login);
router.post('/register', celebrate({ [Segments.BODY]: registerSchema }), register);
router.post(
  '/recover-password',
  celebrate({ [Segments.BODY]: recoverPasswordSchema }),
  recoverPassword
);
router.post('/reset-password', celebrate({ [Segments.BODY]: resetPasswordSchema }), resetPassword);

export default router;
