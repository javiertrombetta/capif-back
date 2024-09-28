import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  login,
  register,
  requestPasswordReset,
  resetPassword,
  validateEmail,
  authorizeUser,
  blockOrUnblockUser,
  changeUserRole,
  getUser,
  logout,
  changeUserPassword,
  deleteUser,
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
  changePasswordSchema,
  deleteUserSchema,
} from '../services/validationSchemas';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.post('/login', celebrate({ [Segments.BODY]: loginSchema }), login);
router.post('/register', celebrate({ [Segments.BODY]: registerSchema }), register);

router.post(
  '/request-password-reset',
  celebrate({ [Segments.BODY]: recoverPasswordSchema }),
  requestPasswordReset
);

router.post('/reset-password', celebrate({ [Segments.BODY]: resetPasswordSchema }), resetPassword);

router.post(
  '/authorize-user',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: authorizeProducerSchema }),
  authorizeUser
);

router.post(
  '/status',
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

router.post(
  '/change-password',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: changePasswordSchema }),
  changeUserPassword
);

router.post('/logout', authenticate, logout);

router.get('/user', authenticate, getUser);

router.get(
  '/validate-email/:token',
  celebrate({ [Segments.PARAMS]: validateEmailSchema }),
  validateEmail
);

router.delete(
  '/delete-user',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: deleteUserSchema }),
  deleteUser
);

export default router;