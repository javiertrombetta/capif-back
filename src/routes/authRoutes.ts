import express from "express";
import { celebrate, Segments } from "celebrate";
import { authenticate, authorizeRoles } from "../middlewares/auth";

import {
  registerSecondaryProductor,
  sendApplication,
  registerPrimaryProductor,
  rejectApplication,
  approveApplication,
  selectAuthProductora,
  logout,
  login,
  createSecondaryAdminUser,
  getRegistrosPendientes,
  validateEmail,
  resetPassword,
  requestPasswordReset,
  deleteApplication,
} from "../controllers/authController";

import {
  registerSecondarySchema,
  sendApplicationSchema,
  registerPrimarySchema,
  rejectApplicationParamsSchema,
  rejectApplicationBodySchema,
  approveApplicationSchema,
  selectProductoraSchema,
  loginSchema,
  createAdminSchema,
  getRegistrosPendientesSchema,
  validateEmailSchema,
  resetPasswordSchema,
  requestPasswordSchema,
  deleteApplicationSchema,
} from "../utils/validationSchemas";

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Gestión de la autenticación de los usuarios y registros.
 */


// [POST] CREAR PRODUCTOR SECUNDARIO
/**
 * @swagger
 * /auth/prods/secondary:
 *   post:
 *     summary: Registro de usuario secundario
 *     description: Registra un nuevo usuario secundario en el sistema.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
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
  "/prods/secondary",
  authenticate,
  authorizeRoles(["productor_principal"]),
  celebrate({ [Segments.BODY]: registerSecondarySchema }),
  registerSecondaryProductor
);

// [POST] Enviar la aplicación de un usuario
/**
 * @swagger
 * /auth/prods/primary/step-two:
 *   post:
 *     summary: Enviar solicitud de aplicación.
 *     description: Permite a un usuario enviar una solicitud de aplicación con sus datos y documentos asociados.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Datos de la solicitud de aplicación.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendApplication'
 *     responses:
 *       200:
 *         description: Solicitud enviada exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Usuario no autorizado para realizar esta acción.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post(
  "/prods/primary/step-two",
  authenticate,
  authorizeRoles(["productor_principal", "admin_principal", "admin_secundario"]),
  celebrate({ [Segments.BODY]: sendApplicationSchema }),
  sendApplication
);

// [POST] CREAR PRODUCTOR PRINCIPAL
/**
 * @swagger
 * /auth/prods/primary/step-one:
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
router.post(
  "/prods/primary/step-one",
  celebrate({ [Segments.BODY]: registerPrimarySchema }),
  registerPrimaryProductor
);

// [POST] Rechazar la aplicación de un usuario pendiente
/**
 * @swagger
 * /auth/prods/primary/{usuarioId}/reject:
 *   post:
 *     summary: Rechazar la solicitud de aplicación de un usuario.
 *     description: Rechaza la solicitud de un usuario especificando el motivo del rechazo.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: usuarioId
 *         in: path
 *         required: true
 *         description: ID del usuario cuya solicitud de aplicación será rechazada
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectApplication'
 *     responses:
 *       200:
 *         description: Solicitud rechazada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito.
 *                   example: 'Solicitud rechazada exitosamente.'
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Usuario no autorizado para realizar esta acción.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post(
  "/auth/prods/primary/:usuarioId/reject",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: rejectApplicationParamsSchema,
    [Segments.BODY]: rejectApplicationBodySchema,
  }),
  rejectApplication
);

// [POST] Autorizar a un usuario pendiente
/**
 * @swagger
 * /auth/prods/primary/{usuarioId}/authorize:
 *   post:
 *     summary: Aprobar la solicitud de aplicación de un usuario.
 *     description: Autoriza la solicitud de un usuario, asigna una productora y actualiza los registros asociados.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: usuarioId
 *         in: path
 *         required: true
 *         description: ID del usuario cuya aplicación será aprobada
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Aplicación aprobada exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Usuario no autorizado para realizar esta acción.
 *       404:
 *         description: Usuario no encontrado.
 *       409:
 *         description: Productora ya existente para este usuario.
 *       500:
 *         description: Error interno del servidor.
 */
router.post(
  "/auth/prods/primary/:usuarioId/authorize",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.PARAMS]: approveApplicationSchema }),
  approveApplication
);

// [POST] SELECCIONAR PRODUCTORA ACTIVA
/**
 * @swagger
 * /auth/me/{productoraId}:
 *   post:
 *     summary: Seleccionar productora activa
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: productoraId
 *         in: path
 *         required: true
 *         description: ID de la productora activa
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Productora activa seleccionada exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post(
  "/auth/me/:productoraId",
  authenticate,
  celebrate({ [Segments.PARAMS]: selectProductoraSchema }),
  selectAuthProductora
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
router.post("/logout", authenticate, logout);

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
router.post("/login", celebrate({ [Segments.BODY]: loginSchema }), login);

// [POST] CREAR ADMINISTRADOR SECUNDARIO
/**
 * @swagger
 * /auth/admins/secondary:
 *   post:
 *     summary: Crear un nuevo usuario administrador.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Datos del administrador a crear.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdminUser'
 *     responses:
 *       201:
 *         description: Usuario administrador creado exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Usuario no autorizado.
 *       500:
 *         description: Error interno del servidor.
 */
router.post(
  "/admins/secondary",
  authenticate,
  authorizeRoles(["admin_principal"]),
  celebrate({ [Segments.BODY]: createAdminSchema }),
  createSecondaryAdminUser
);

// [GET] Obtener todas las aplicaciones pendientes o de un usuario
/**
 * @swagger
 * /auth/pending:
 *   get:
 *     summary: Obtener registros pendientes de uno o todos los usuarios.
 *     description: Devuelve la información del registro pendiente para un usuario especificado o todos los usuarios con registro pendiente.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: usuarioId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *           description: ID del usuario. Si no se especifica, devuelve todos los usuarios pendientes.
 *           example: '123e4567-e89b-12d3-a456-426614174000'
 *     responses:
 *       200:
 *         description: Registros pendientes obtenidos exitosamente.
 *       400:
 *         description: Parámetros inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Usuario no autorizado para acceder a este recurso.
 *       404:
 *         description: Registro pendiente no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get(
  "/pending",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.QUERY]: getRegistrosPendientesSchema }),
  getRegistrosPendientes
);

// [PUT] VALIDAR EL TOKEN ENVIADO POR MAIL
/**
 * @swagger
 * /auth/validate/{token}:
 *   put:
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
  "/validate/:token",
  celebrate({ [Segments.PARAMS]: validateEmailSchema }),
  validateEmail
);

// [PUT] CAMBIAR LA CLAVE A PARTIR DEL TOKEN RECIBIDO
/**
 * @swagger
 * /auth/password/reset:
 *   put:
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
router.put(
  "/password/reset",
  celebrate({ [Segments.BODY]: resetPasswordSchema }),
  resetPassword
);

// [PUT] GENERAR TOKEN Y ENVIARLO POR EMAIL
/**
 * @swagger
 * /auth/password/request-reset:
 *   put:
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
router.put(
  "/password/request-reset",
  celebrate({ [Segments.BODY]: requestPasswordSchema }),
  requestPasswordReset
);

// [DELETE] ELIMINAR UNA APLICACIÓN QUE NO SEA HABILITADO O DESHABILITADO
/**
 * @swagger
 * /auth/pending/{usuarioId}:
 *   delete:
 *     summary: Eliminar una aplicación pendiente.
 *     description: Elimina una aplicación con tipo_registro distinto a HABILITADO o DESHABILITADO, solo si el usuario es productor_principal. También elimina todas las entidades relacionadas como Productora, ProductoraDocumentos, ProductoraMensaje, UsuarioVistaMaestro, AuditoriaCambio y AuditoriaSesion.
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario cuya aplicación se eliminará.
 *     responses:
 *       200:
 *         description: Aplicación eliminada exitosamente.
 *       400:
 *         description: Parámetros inválidos o condiciones no cumplidas.
 *       401:
 *         description: Usuario no autenticado.
 *       404:
 *         description: Aplicación o datos relacionados no encontrados.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete(
  "/pending/:usuarioId",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: deleteApplicationSchema,
  }),
  deleteApplication
);

export default router;
