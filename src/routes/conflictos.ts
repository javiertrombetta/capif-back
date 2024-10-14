import express from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  createConflicto,
  getConflictoById,
  getConflictosByEstado,
  getConflictosByUser,
  resolveConflicto,
  addComentarioConflicto,
  addDecisionInvolucrado,
  deleteConflicto,
} from '../controllers/conflictosController';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import {
  createConflictoSchema,
  conflictoIdSchema,
  estadoConflictoSchema,
  comentarioSchema,
  decisionSchema,
  involucradoIdSchema,
} from '../services/validationSchemas';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Conflictos
 *   description: Gestión de los conflictos entre productores y CAPIF
 */

/**
 * @swagger
 * /conflictos:
 *   post:
 *     summary: Crear un nuevo conflicto
 *     description: Permite a los usuarios crear un conflicto asociado a un fonograma.
 *     tags: [Conflictos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Datos necesarios para crear el conflicto
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConflictoCreate'
 *     responses:
 *       201:
 *         description: Conflicto creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
router.post(
  '/',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.BODY]: createConflictoSchema }),
  createConflicto
);

/**
 * @swagger
 * /conflictos/{id}:
 *   get:
 *     summary: Obtener detalles de un conflicto por ID
 *     tags: [Conflictos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del conflicto a obtener
 *     responses:
 *       200:
 *         description: Datos del conflicto obtenidos correctamente
 *       404:
 *         description: Conflicto no encontrado
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: conflictoIdSchema }),
  getConflictoById
);

/**
 * @swagger
 * /conflictos/estado/{estado}:
 *   get:
 *     summary: Obtener conflictos por estado
 *     tags: [Conflictos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estado
 *         required: true
 *         schema:
 *           type: string
 *         description: Estado del conflicto (ej. "pendiente", "resuelto")
 *     responses:
 *       200:
 *         description: Lista de conflictos obtenida correctamente
 *       404:
 *         description: No se encontraron conflictos para el estado dado
 */
router.get(
  '/estado/:estado',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.PARAMS]: estadoConflictoSchema }),
  getConflictosByEstado
);

/**
 * @swagger
 * /conflictos:
 *   get:
 *     summary: Obtener conflictos del usuario autenticado
 *     tags: [Conflictos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conflictos obtenida correctamente
 *       404:
 *         description: No se encontraron conflictos
 */
router.get('/', authenticate, authorizeRoles(['admin', 'productor']), getConflictosByUser);

/**
 * @swagger
 * /conflictos/{id}/resolver:
 *   put:
 *     summary: Resolver un conflicto
 *     tags: [Conflictos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del conflicto a resolver
 *     requestBody:
 *       description: Comentario de resolución
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comentario'
 *     responses:
 *       200:
 *         description: Conflicto resuelto exitosamente
 *       404:
 *         description: Conflicto no encontrado
 */
router.put(
  '/:id/resolver',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: conflictoIdSchema, [Segments.BODY]: comentarioSchema }),
  resolveConflicto
);

/**
 * @swagger
 * /conflictos/{id}/comentario:
 *   post:
 *     summary: Agregar comentario a un conflicto
 *     tags: [Conflictos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del conflicto
 *     requestBody:
 *       description: Comentario a agregar
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comentario'
 *     responses:
 *       200:
 *         description: Comentario agregado exitosamente
 *       404:
 *         description: Conflicto no encontrado
 */
router.post(
  '/:id/comentario',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.PARAMS]: conflictoIdSchema, [Segments.BODY]: comentarioSchema }),
  addComentarioConflicto
);

/**
 * @swagger
 * /conflictos/involucrados/{id_involucrado}/decision:
 *   post:
 *     summary: Registrar decisión de un involucrado
 *     tags: [Conflictos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_involucrado
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del involucrado
 *     requestBody:
 *       description: Decisión a registrar
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Decision'
 *     responses:
 *       200:
 *         description: Decisión registrada exitosamente
 *       404:
 *         description: Involucrado no encontrado
 */
router.post(
  '/involucrados/:id_involucrado/decision',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.PARAMS]: involucradoIdSchema, [Segments.BODY]: decisionSchema }),
  addDecisionInvolucrado
);

/**
 * @swagger
 * /conflictos/{id}:
 *   delete:
 *     summary: Eliminar un conflicto
 *     tags: [Conflictos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del conflicto a eliminar
 *     responses:
 *       200:
 *         description: Conflicto eliminado exitosamente
 *       404:
 *         description: Conflicto no encontrado
 */
router.delete(
  '/conflictos/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: conflictoIdSchema }),
  deleteConflicto
);

export default router;