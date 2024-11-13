import { Router } from 'express';
import {
  getUsers,
  getRegistrosPendientes,
  createUser,
  loadUserData,
  rejectUserData,
  authorizeUser,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/usuariosController';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import { celebrate, Segments } from 'celebrate';
import {
  userCreateSchema,
  authorizeProducerSchema,
  userUpdateSchema,
  userIdSchema,
} from '../services/validationSchemas';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios y registros.
 */

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un nuevo usuario.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Datos del usuario a crear.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioCreate'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
 */
router.post(
  '/',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: userCreateSchema }),
  createUser
);

/**
 * @swagger
 * /usuarios/autorizar:
 *   post:
 *     summary: Autorizar un usuario.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthorizeUser'
 *     responses:
 *       200:
 *         description: Usuario autorizado exitosamente.
 */
router.post(
  '/autorizar',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: authorizeProducerSchema }),
  authorizeUser
);

/**
 * @swagger
 * /usuarios/load-data:
 *   post:
 *     summary: Cargar datos personales del usuario.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioData'
 *     responses:
 *       200:
 *         description: Datos cargados exitosamente.
 */
router.post('/load-data', authenticate, authorizeRoles(['admin']), loadUserData);

/**
 * @swagger
 * /usuarios/reject-data:
 *   post:
 *     summary: Rechazar los datos de un usuario.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectData'
 *     responses:
 *       200:
 *         description: Datos rechazados exitosamente.
 */
router.post('/reject-data', authenticate, authorizeRoles(['admin']), rejectUserData);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: '123e4567-e89b-12d3-a456-426614174000'
 *     requestBody:
 *       description: Datos a actualizar.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioUpdate'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente.
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: userIdSchema, [Segments.BODY]: userUpdateSchema }),
  updateUser
);

/**
 * @swagger
 * /usuarios/pending:
 *   get:
 *     summary: Obtener registros pendientes.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de registros pendientes.
 */
router.get('/pending', authenticate, authorizeRoles(['admin']), getRegistrosPendientes);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: '123e4567-e89b-12d3-a456-426614174000'
 *     responses:
 *       200:
 *         description: Datos del usuario.
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.PARAMS]: userIdSchema }),
  getUserById
);

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener todos los usuarios.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios.
 */
router.get('/', authenticate, authorizeRoles(['admin']), getUsers);

/**
 * @swagger
 * /usuarios/eliminar/{id}:
 *   delete:
 *     summary: Eliminar un usuario.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: string
 *           example: '123e4567-e89b-12d3-a456-426614174000'
 *     responses:
 *       204:
 *         description: Usuario eliminado exitosamente.
 */
router.delete(
  '/eliminar/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: userIdSchema }),
  deleteUser
);

export default router;
