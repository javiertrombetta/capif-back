import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  getArchivosByRole,
  createArchivo,
  updateArchivo,
  deleteArchivo,
} from '../controllers/archivosController';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import {
  archivoCreateSchema,
  archivoUpdateSchema,
  archivoIdSchema,
} from '../services/validationSchemas';

const router = express.Router();

/**
 * @swagger
 * /archivos:
 *   post:
 *     summary: Crear un nuevo archivo
 *     description: Ruta para que los usuarios con los roles de admin o productor puedan cargar un archivo.
 *     tags: [Archivos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Datos del archivo a crear
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArchivoCreate'
 *     responses:
 *       201:
 *         description: Archivo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Archivo'
 *       400:
 *         description: Error en la validación de datos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
router.post(
  '/',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.BODY]: archivoCreateSchema }),
  createArchivo
);

/**
 * @swagger
 * /archivos:
 *   get:
 *     summary: Obtener archivos por rol
 *     description: Obtener los archivos a los que el usuario autenticado tiene acceso según su rol.
 *     tags: [Archivos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de archivos obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Archivo'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
router.get('/', authenticate, getArchivosByRole);

/**
 * @swagger
 * /archivos/{id}:
 *   put:
 *     summary: Actualizar archivo
 *     description: Ruta para actualizar la información de un archivo.
 *     tags: [Archivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del archivo a actualizar
 *     requestBody:
 *       description: Datos del archivo a actualizar
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArchivoUpdate'
 *     responses:
 *       200:
 *         description: Archivo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Archivo'
 *       400:
 *         description: Error en la validación de datos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.PARAMS]: archivoIdSchema, [Segments.BODY]: archivoUpdateSchema }),
  updateArchivo
);

/**
 * @swagger
 * /archivos/{id}:
 *   delete:
 *     summary: Eliminar archivo
 *     description: Ruta para eliminar un archivo por su ID. Solo disponible para administradores.
 *     tags: [Archivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del archivo a eliminar
 *     responses:
 *       200:
 *         description: Archivo eliminado exitosamente
 *       400:
 *         description: Error en la solicitud
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: archivoIdSchema }),
  deleteArchivo
);

export default router;