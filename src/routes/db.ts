import express from 'express';
import { celebrate, Segments } from 'celebrate';
import DBController from '../controllers/dbController';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import { createSchema, updateSchema, idSchema } from '../services/validationSchemas';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: DB
 *   description: Gestión de las tablas de base de datos (ejemplo todas las Tipo...)
 */

/**
 * @swagger
 * /db/{tipo}:
 *   post:
 *     summary: Crear un nuevo registro
 *     description: Permite crear un nuevo registro en la base de datos según el tipo especificado.
 *     tags: [DB]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo del registro a crear (ej. TipoActividad, TipoArchivo).
 *     requestBody:
 *       description: Datos para crear un nuevo registro.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroCreate'
 *     responses:
 *       201:
 *         description: Registro creado exitosamente.
 *       400:
 *         description: Error en la validación de datos.
 *       401:
 *         description: No autorizado.
 */
router.post(
  '/:tipo',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: createSchema }),
  DBController.create
);

/**
 * @swagger
 * /db/{tipo}:
 *   get:
 *     summary: Obtener todos los registros de un tipo
 *     description: Devuelve todos los registros del tipo especificado.
 *     tags: [DB]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo de los registros a obtener.
 *     responses:
 *       200:
 *         description: Lista de registros obtenida correctamente.
 *       401:
 *         description: No autorizado.
 */
router.get('/:tipo', authenticate, authorizeRoles(['admin']), DBController.getAll);

/**
 * @swagger
 * /db/{tipo}/{id}:
 *   get:
 *     summary: Obtener un registro por ID
 *     description: Devuelve un registro específico por su ID.
 *     tags: [DB]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo del registro.
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del registro a obtener.
 *     responses:
 *       200:
 *         description: Registro encontrado.
 *       404:
 *         description: Registro no encontrado.
 */
router.get(
  '/:tipo/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: idSchema }),
  DBController.getById
);

/**
 * @swagger
 * /db/{tipo}/{id}:
 *   put:
 *     summary: Actualizar un registro por ID
 *     description: Permite actualizar un registro por su ID.
 *     tags: [DB]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo del registro.
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del registro a actualizar.
 *     requestBody:
 *       description: Datos para actualizar el registro.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroUpdate'
 *     responses:
 *       200:
 *         description: Registro actualizado exitosamente.
 *       404:
 *         description: Registro no encontrado.
 */
router.put(
  '/:tipo/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: idSchema, [Segments.BODY]: updateSchema }),
  DBController.update
);

/**
 * @swagger
 * /db/{tipo}/{id}:
 *   delete:
 *     summary: Eliminar un registro por ID
 *     description: Elimina un registro específico por su ID.
 *     tags: [DB]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo del registro.
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del registro a eliminar.
 *     responses:
 *       204:
 *         description: Registro eliminado exitosamente.
 *       404:
 *         description: Registro no encontrado.
 */
router.delete(
  '/:tipo/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: idSchema }),
  DBController.delete
);

export default router;
