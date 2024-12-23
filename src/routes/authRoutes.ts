import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  registerPrimary,
  registerSecondary,
  login,
  getRole,
  selectProductora,
  getProductoras,
  requestPasswordReset,
  validateEmail,
  completeProfile,
  resetPassword,
  getUser,
  changeUserPassword,
  logout,  
} from '../controllers/authController';
import {
  registerPrimarySchema,
  registerSecondarySchema,
  loginSchema,
  selectProductoraSchema,
  requestPasswordSchema,
  validateEmailSchema,
  completeProfileSchema,
  resetPasswordSchema,  
  changePasswordSchema,
} from '../services/validationSchemas';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Gestión de la autenticación de los usuarios
 */

// [POST] REGISTRO PRIMARIO
/**
 * @swagger
 * /auth/registro/primario:
 *   post:
 *     summary: Registro de un usuario primario
 *     description: Registra un nuevo usuario primario en el sistema.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterPrimary'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post('/registro/primario', celebrate({ [Segments.BODY]: registerPrimarySchema }), registerPrimary);

// [POST] REGISTRO SECUNDARIO
/**
 * @swagger
 * /auth/registro/secundario:
 *   post:
 *     summary: Registro de usuario secundario
 *     description: Registra un nuevo usuario secundario en el sistema.
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterSecondary'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post(
  '/registro/secundario',
  authenticate,
  authorizeRoles(['admin_principal', 'productor_principal']),
  celebrate({ [Segments.BODY]: registerSecondarySchema }),
  registerSecondary
);

// [POST] LOGIN
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

// [GET] OBTENER ROL DEL USUARIO
/**
 * @swagger
 * /auth/rol:
 *   get:
 *     summary: Obtener rol del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productora_id
 *         schema:
 *           type: string
 *         description: ID de la productora activa (opcional para administradores)
 *     responses:
 *       200:
 *         description: Rol obtenido exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.get('/rol', authenticate, getRole);

// [POST] SELECCIONAR PRODUCTORA ACTIVA
/**
 * @swagger
 * /auth/productora/activa:
 *   post:
 *     summary: Seleccionar productora activa
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SelectProductora'
 *     responses:
 *       200:
 *         description: Productora activa seleccionada exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post(
  '/productora/activa',
  authenticate,
  celebrate({ [Segments.BODY]: selectProductoraSchema }),
  selectProductora
);

// [GET] OBTENER TODAS LAS PRODUCTORAS
/**
 * @swagger
 * /auth/productora:
 *   get:
 *     summary: Obtener todas las productoras asociadas al usuario
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Productoras obtenidas exitosamente
 */
router.get('/productora', authenticate, getProductoras);

// [POST] SOLICITAR RESETEO DE CLAVE
/**
 * @swagger
 * /auth/clave/mail/reseteo:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestPassword'
 *     responses:
 *       200:
 *         description: Solicitud de restablecimiento enviada exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post(
  '/clave/mail/reseteo',
  celebrate({ [Segments.BODY]: requestPasswordSchema }),
  requestPasswordReset
);

// [GET] VERIFICA QUE EL TOKEN SEA VALIDO
/**
 * @swagger
 * /auth/clave/mail/validacion/{token}:
 *   get:
 *     summary: Validar correo electrónico
 *     tags: [Autenticación]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           description: Token de validación de correo     
 *     responses:
 *       200:
 *         description: Correo validado exitosamente
 */
router.put(
  '/clave/mail/validacion/:token',
  celebrate({ [Segments.PARAMS]: validateEmailSchema }),
  validateEmail
);

// [POST] COMPLETAR PERFIL
/**
 * @swagger
 * /auth/registro/completar:
 *   post:
 *     summary: Completar perfil del usuario autenticado
 *     description: Permite a un usuario autenticado completar su perfil con nombre, apellido y teléfono opcional.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompleteProfile'
 *     responses:
 *       200:
 *         description: Perfil completado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Perfil completado exitosamente.
 *       400:
 *         description: Error en los datos proporcionados.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Faltan datos obligatorios.
 *       401:
 *         description: Usuario no autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario no autenticado.
 *       404:
 *         description: Usuario no encontrado o no verificado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error interno del servidor.
 */
router.post(
  '/registro/completar',
  authenticate,
  celebrate({ [Segments.BODY]: completeProfileSchema }),
  completeProfile
);

// [POST] CAMBIAR LA CLAVE A PARTIR DEL TOKEN RECIBIDO
/**
 * @swagger
 * /auth/clave/mail/cambio:
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
router.post('/clave/mail/cambio', celebrate({ [Segments.BODY]: resetPasswordSchema }), resetPassword);

// [GET] OBTENER DATOS DEL USUARIO Y SUS MAESTROS
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente
 */
router.get('/me', authenticate, getUser);

/**
 * @swagger
 * /auth/clave/cambio:
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
  '/clave/cambio',
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

export default router;