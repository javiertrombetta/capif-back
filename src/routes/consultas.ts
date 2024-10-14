import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  getConsultas,
  getConsultaById,
  createConsulta,
  updateConsulta,
  deleteConsulta,
} from '../controllers/consultasController';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import {
  createConsultaSchema,
  updateConsultaSchema,
  getConsultaSchema,
  deleteConsultaSchema,
} from '../services/validationSchemas';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Consultas
 *   description: Gestión de consultas realizadas por usuarios
 */

/**
 * @swagger
 * /consultas:
 *   get:
 *     summary: Obtener todas las consultas
 *     description: Devuelve una lista de todas las consultas disponibles en el sistema.
 *     tags: [Consultas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de consultas obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consulta'
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido.
 */
router.get('/consultas', authenticate, authorizeRoles(['admin', 'productor']), getConsultas);

/**
 * @swagger
 * /consultas/{id}:
 *   get:
 *     summary: Obtener una consulta por ID
 *     description: Devuelve la información detallada de una consulta específica.
 *     tags: [Consultas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la consulta a obtener.
 *     responses:
 *       200:
 *         description: Consulta obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consulta'
 *       404:
 *         description: Consulta no encontrada.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido.
 */
router.get(
  '/consultas/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: getConsultaSchema }),
  getConsultaById
);

/**
 * @swagger
 * /consultas:
 *   post:
 *     summary: Crear una nueva consulta
 *     description: Permite a los usuarios crear una nueva consulta en el sistema.
 *     tags: [Consultas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Datos de la nueva consulta.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConsultaCreate'
 *     responses:
 *       201:
 *         description: Consulta creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consulta'
 *       400:
 *         description: Error en los datos enviados.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido.
 */
router.post(
  '/consultas',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.BODY]: createConsultaSchema }),
  createConsulta
);

/**
 * @swagger
 * /consultas/{id}:
 *   put:
 *     summary: Actualizar una consulta
 *     description: Permite actualizar la información de una consulta existente.
 *     tags: [Consultas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la consulta a actualizar.
 *     requestBody:
 *       description: Datos de la consulta a actualizar.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConsultaUpdate'
 *     responses:
 *       200:
 *         description: Consulta actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Consulta'
 *       404:
 *         description: Consulta no encontrada.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido.
 */
router.put(
  '/consultas/:id',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.PARAMS]: getConsultaSchema, [Segments.BODY]: updateConsultaSchema }),
  updateConsulta
);

/**
 * @swagger
 * /consultas/{id}:
 *   delete:
 *     summary: Eliminar una consulta
 *     description: Permite eliminar una consulta existente del sistema.
 *     tags: [Consultas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la consulta a eliminar.
 *     responses:
 *       200:
 *         description: Consulta eliminada exitosamente.
 *       404:
 *         description: Consulta no encontrada.
 *       401:
 *         description: No autorizado.
 *       403:
 *         description: Prohibido.
 */
router.delete(
  '/consultas/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: deleteConsultaSchema }),
  deleteConsulta
);

export default router;