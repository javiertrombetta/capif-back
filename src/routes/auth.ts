import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  registerPrimary,
  registerSecondary,
  login,
  requestPasswordReset,
  validateEmail,
  resetPassword,
  getUser,
  getCompanies,
  changeCompany,
  blockOrUnblockUser,
  changeUserRole,
  changeUserPassword,
  logout,
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

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Gestión de la autenticación de los usuarios
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Permite a un usuario iniciar sesión y recibir un token.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', celebrate({ [Segments.BODY]: loginSchema }), login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registro de usuario
 *     description: Registra un nuevo usuario en el sistema.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Register'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post('/register', celebrate({ [Segments.BODY]: registerSchema }), register);

/**
 * @swagger
 * /auth/request-password-reset:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecoverPassword'
 *     responses:
 *       200:
 *         description: Solicitud de restablecimiento enviada exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/request-password-reset',
  celebrate({ [Segments.BODY]: recoverPasswordSchema }),
  requestPasswordReset
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post('/reset-password', celebrate({ [Segments.BODY]: resetPasswordSchema }), resetPassword);

/**
 * @swagger
 * /auth/status:
 *   post:
 *     summary: Bloquear o desbloquear usuario
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlockUser'
 *     responses:
 *       200:
 *         description: Estado de usuario actualizado
 */
router.post(
  '/status',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: blockUserSchema }),
  blockOrUnblockUser
);

/**
 * @swagger
 * /auth/change-role:
 *   post:
 *     summary: Cambiar rol de usuario
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeRole'
 *     responses:
 *       200:
 *         description: Rol cambiado exitosamente
 */
router.post(
  '/change-role',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: changeRoleSchema }),
  changeUserRole
);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Cambiar contraseña del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 */
router.post(
  '/change-password',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.BODY]: changePasswordSchema }),
  changeUserPassword
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 */
router.post('/logout', authenticate, logout);

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente
 */
router.get('/user', authenticate, getUser);

/**
 * @swagger
 * /auth/validate-email/{token}:
 *   get:
 *     summary: Validar correo electrónico
 *     tags: [Autenticación]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de validación de correo
 *     responses:
 *       200:
 *         description: Correo validado exitosamente
 */
router.get(
  '/validate-email/:token',
  celebrate({ [Segments.PARAMS]: validateEmailSchema }),
  validateEmail
);

export default router;