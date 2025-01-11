import { Router } from "express";
import {
  availableDisableUser,
  blockOrUnblockUser,
  changeUserRole,
  getUsers,
  createAdminUser,
  getRegistrosPendientes,
  approveApplication,
  rejectApplication,
  sendApplication,
  updateApplication,
  updateUser,
  deleteUser,
  updateUserViews,
  toggleUserViewStatus,
} from "../controllers/usuariosController";
import { authenticate, authorizeRoles } from "../middlewares/auth";
import { celebrate, Segments } from "celebrate";
import {
  availableDisableSchema,
  blockOrUnblockSchema,
  changeRoleSchema,
  createAdminSchema,
  getRegistrosPendientesSchema,
  approveApplicationSchema,
  rejectApplicationSchema,
  sendApplicationSchema,
  updateApplicationSchema,
  updateUserSchema,
  deleteUserSchema,
  updateUserViewsSchema,
  toggleUserViewStatusSchema,
  getUsuariosQuerySchema,
} from "../services/validationSchemas";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios y registros.
 */

// [PUT] Habilitar/Deshabilitar Usuario
/**
 * @swagger
 * /usuarios/estado/habilitacion:
 *   put:
 *     summary: Habilitar o deshabilitar un usuario.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AvailableDisableUser'
 *     responses:
 *       200:
 *         description: Usuario habilitado o deshabilitado exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Usuario no autorizado para realizar esta acción.
 *       404:
 *         description: Usuario no encontrado.
 */
router.put(
  "/estado/habilitacion",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.BODY]: availableDisableSchema }),
  availableDisableUser
);

// [PUT] Bloquear/Desbloquear Usuario
/**
 * @swagger
 * /usuarios/estado/sesion:
 *   put:
 *     summary: PENDIENTE Bloquear o desbloquear un usuario.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlockOrUnblockUser'
 *     responses:
 *       200:
 *         description: Usuario bloqueado o desbloqueado exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Usuario no autorizado para realizar esta acción.
 *       404:
 *         description: Usuario no encontrado.
 */
router.put(
  "/estado/sesion",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.BODY]: blockOrUnblockSchema }),
  blockOrUnblockUser
);

// [PUT] Cambiar Rol de Usuario
/**
 * @swagger
 * /usuarios/rol:
 *   put:
 *     summary: Cambiar el rol de un usuario.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeUserRole'
 *     responses:
 *       200:
 *         description: Rol cambiado exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Usuario no autorizado para realizar esta acción.
 *       404:
 *         description: Usuario no encontrado.
 */
router.put(
  "/rol",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.BODY]: changeRoleSchema }),
  changeUserRole
);

// [GET] Obtener los usuarios según filtros
/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener usuarios filtrados.
 *     description: Permite obtener una lista de usuarios aplicando filtros en los parámetros de consulta.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_usuario
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *           description: ID del usuario.
 *           example: '123e4567-e89b-12d3-a456-426614174000'
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Correo electrónico del usuario.
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Nombre del usuario.
 *       - in: query
 *         name: apellido
 *         schema:
 *           type: string
 *         description: Apellido del usuario.
 *       - in: query
 *         name: tipo_registro
 *         schema:
 *           type: string
 *           enum: [DEPURAR, NUEVO, CONFIRMADO, PENDIENTE, ENVIADO, HABILITADO, DESHABILITADO]
 *         description: Tipo de registro del usuario.
 *       - in: query
 *         name: rolId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del rol asignado al usuario.
 *       - in: query
 *         name: nombre_rol
 *         schema:
 *           type: string
 *         description: Nombre del rol asignado al usuario.
 *       - in: query
 *         name: productoraId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la productora asociada.
 *       - in: query
 *         name: productoraNombre
 *         schema:
 *           type: string
 *         description: Nombre de la productora asociada.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *         description: Número máximo de resultados a devolver.
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           format: int32
 *           minimum: 0
 *         description: Desplazamiento para la paginación.
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente.
 *       400:
 *         description: Parámetros inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Usuario no autorizado para acceder a este recurso.
 *       404:
 *         description: No se encontraron usuarios con los filtros proporcionados.
 *       500:
 *         description: Error interno del servidor.
 */
router.get(
  "/",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.QUERY]: getUsuariosQuerySchema,
  }),
  getUsers
);

// [POST] Crear un usuario manualmente
/**
 * @swagger
 * /usuarios/admin/nuevo:
 *   post:
 *     summary: PENDIENTE Crear un nuevo usuario administrador.
 *     tags: [Usuarios]
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
  "/admin/nuevo",
  authenticate,
  authorizeRoles(["admin_principal", "productor_principal"]),
  celebrate({ [Segments.BODY]: createAdminSchema }),
  createAdminUser
);

/**
 * @swagger
 * /usuarios/aplicaciones/pendientes:
 *   get:
 *     summary: PENDIENTE Obtener registros pendientes de uno o todos los usuarios.
 *     description: PENDIENTE Devuelve la información del registro pendiente para un usuario especificado o todos los usuarios con registro pendiente.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_usuario
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
  "/aplicaciones/pendientes",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.BODY]: getRegistrosPendientesSchema }),
  getRegistrosPendientes
);

/**
 * @swagger
 * /usuarios/aplicaciones/autorizar:
 *   post:
 *     summary: PENDIENTE Aprobar la solicitud de aplicación de un usuario.
 *     description: PENDIENTE Autoriza la solicitud de un usuario, asigna una productora y actualiza los registros asociados.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApproveApplication'
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
  "/aplicaciones/autorizar",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.BODY]: approveApplicationSchema }),
  approveApplication
);

/**
 * @swagger
 * /usuarios/aplicaciones/rechazar:
 *   post:
 *     summary: PENDIENTE Rechazar la solicitud de aplicación de un usuario.
 *     description: PENDIENTE Rechaza la solicitud de un usuario especificando el motivo del rechazo.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
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
  "/aplicaciones/rechazar",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.BODY]: rejectApplicationSchema }),
  rejectApplication
);

/**
 * @swagger
 * /usuarios/aplicaciones/enviar:
 *   post:
 *     summary: PENDIENTE Enviar solicitud de aplicación.
 *     description: PENDIENTE Permite a un usuario enviar una solicitud de aplicación con sus datos y documentos asociados.
 *     tags: [Usuarios]
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
  "/aplicaciones/enviar",
  authenticate,
  authorizeRoles(["productor_principal"]),
  celebrate({ [Segments.BODY]: sendApplicationSchema }),
  sendApplication
);

/**
 * @swagger
 * /usuarios/aplicaciones/actualizar:
 *   put:
 *     summary: PENDIENTE Actualizar solicitud de aplicación.
 *     description: PENDIENTE Permite actualizar los datos de la solicitud de aplicación de un usuario, incluyendo datos físicos, datos jurídicos y documentos asociados.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Datos de la solicitud de aplicación que se desea actualizar.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateApplication'
 *     responses:
 *       200:
 *         description: Solicitud actualizada exitosamente.
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
router.put(
  "/aplicaciones/actualizar",
  authenticate,
  authorizeRoles(["productor_principal"]),
  celebrate({ [Segments.BODY]: updateApplicationSchema }),
  updateApplication
);

/**
 * @swagger
 * /usuarios/cambiar:
 *   put:
 *     summary: Actualizar información del usuario.
 *     description: Permite actualizar los datos personales, rol y estado de un usuario existente.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Datos del usuario que se desea actualizar.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente.
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
router.put(
  "/cambiar",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.BODY]: updateUserSchema }),
  updateUser
);
/**
 * @swagger
 * /usuarios/eliminar:
 *   delete:
 *     summary: Eliminar un usuario.
 *     description: Permite a los administradores eliminar un usuario específico del sistema.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario a eliminar.
 *         example: '123e4567-e89b-12d3-a456-426614174000'
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente.
 *       400:
 *         description: Parámetros inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Usuario no autorizado para realizar esta acción.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete(
  "/eliminar",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.QUERY]: deleteUserSchema }),
  deleteUser
);

// [PUT] Actualizar vistas de un usuario
/**
 * @swagger
 * /usuarios/vistas:
 *   put:
 *     summary: PENDIENTE Actualizar las vistas de un usuario.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserViews'
 *     responses:
 *       200:
 *         description: Vistas actualizadas exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Usuario no autorizado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put(
  "/vistas",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.BODY]: updateUserViewsSchema }),
  updateUserViews
);

// [PUT] Cambiar el estado de las vistas de un usuario
/**
 * @swagger
 * /usuarios/vistas/estado:
 *   put:
 *     summary: PENDIENTE Cambiar el estado de habilitación de las vistas de un usuario.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ToggleUserViewStatus'
 *     responses:
 *       200:
 *         description: Estado de vistas actualizado exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       401:
 *         description: Usuario no autenticado.
 *       403:
 *         description: Usuario no autorizado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put(
  "/vistas/estado",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.BODY]: toggleUserViewStatusSchema }),
  toggleUserViewStatus
);

export default router;
