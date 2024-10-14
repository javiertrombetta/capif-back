import express from 'express';
import { celebrate, Segments } from 'celebrate';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import {
  getEstadoCuentaCorriente,
  getDetallePagos,
  deleteCuentaCorriente,
  updateSaldoCuentaCorriente,
} from '../controllers/cuentasCorrientesController';
import { userIdSchema, updateSaldoSchema } from '../services/validationSchemas';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cuentas Corrientes
 *   description: Gestión de las cuentas corrientes de los usuarios (versión evolutiva)
 */

/**
 * @swagger
 * /cuentas-corrientes/estado:
 *   get:
 *     summary: Obtener el estado de la cuenta corriente
 *     tags: [Cuentas Corrientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de cuenta obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CuentaCorriente'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cuenta corriente no encontrada
 */
router.get(
  '/estado',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  getEstadoCuentaCorriente
);

/**
 * @swagger
 * /cuentas-corrientes/{id}/pagos:
 *   get:
 *     summary: Obtener los pagos de una cuenta corriente
 *     tags: [Cuentas Corrientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagos obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pago'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Pagos no encontrados
 */
router.get(
  '/:id/pagos',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.PARAMS]: userIdSchema }),
  getDetallePagos
);

/**
 * @swagger
 * /cuentas-corrientes/{id}:
 *   delete:
 *     summary: Eliminar una cuenta corriente
 *     tags: [Cuentas Corrientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la cuenta corriente
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cuenta corriente eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cuenta corriente no encontrada
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: userIdSchema }),
  deleteCuentaCorriente
);

/**
 * @swagger
 * /cuentas-corrientes/{id}/saldo:
 *   put:
 *     summary: Actualizar el saldo de una cuenta corriente
 *     tags: [Cuentas Corrientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la cuenta corriente
 *     requestBody:
 *       description: Nuevo saldo de la cuenta corriente
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSaldo'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saldo actualizado exitosamente
 *       400:
 *         description: Saldo inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Cuenta corriente no encontrada
 */
router.put(
  '/:id/saldo',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({
    [Segments.PARAMS]: userIdSchema,
    [Segments.BODY]: updateSaldoSchema,
  }),
  updateSaldoCuentaCorriente
);

export default router;