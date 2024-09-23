import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  login,
  register,
  recoverPassword,
  resetPassword,
  validateEmail,
  authorizeProducer,
  blockOrUnblockUser,
  changeUserRole,
} from '../controllers/authController';
import {
  registerSchema,
  loginSchema,
  recoverPasswordSchema,
  resetPasswordSchema,
  validateEmailSchema,
  authorizeProducerSchema,
  blockUserSchema,
  changeRoleSchema,
} from '../services/validationSchemas';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.post('/login', celebrate({ [Segments.BODY]: loginSchema }), login);
router.post('/register', celebrate({ [Segments.BODY]: registerSchema }), register);
router.post(
  '/recover-password',
  celebrate({ [Segments.BODY]: recoverPasswordSchema }),
  recoverPassword
);
router.post('/reset-password', celebrate({ [Segments.BODY]: resetPasswordSchema }), resetPassword);
router.get(
  '/validate-email/:token',
  celebrate({ [Segments.PARAMS]: validateEmailSchema }),
  validateEmail
);

router.post(
  '/authorize-producer',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: authorizeProducerSchema }),
  authorizeProducer
);
router.post(
  '/block-user',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: blockUserSchema }),
  blockOrUnblockUser
);
router.post(
  '/change-role',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: changeRoleSchema }),
  changeUserRole
);

export default router;
