import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import logger from '../config/logger';

import * as MESSAGES from '../services/messages';
import { NotFoundError, InternalServerError, UnauthorizedError } from '../services/customErrors';

import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import { PagosWithRelations } from '../interfaces/PagosWithRelations';

import { CuentaCorriente, Pago, TipoMetodoPago } from '../models';

export const getEstadoCuentaCorriente = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req.user as JwtPayload)?.sub;
    logger.info(`GET /cuentas-corrientes/${userId} - Request to fetch account state`);

    const cuenta = await CuentaCorriente.findOne({ where: { id_usuario: userId } });

    if (!cuenta) {
      logger.warn(`Cuenta Corriente no encontrada para el usuario con ID ${userId}`);
      throw new NotFoundError(MESSAGES.ERROR.CUENTA_CORRIENTE.NOT_FOUND);
    }

    res.status(200).json(cuenta);
  } catch (error) {
    logger.error(
      `GET /cuentas-corrientes - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getDetallePagos = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    logger.info(`GET /cuentas-corrientes/${id}/pagos - Request to fetch account payments`);

     const pagos = await Pago.findAll({
       where: { id_usuario: id },
       include: [TipoMetodoPago],
     });

    if (!pagos.length) {
      logger.warn(`No se encontraron pagos para la cuenta con ID ${id}`);
      return res.status(404).json({ message: MESSAGES.ERROR.PAGO.NOT_FOUND });
    }

     const response: PagosWithRelations[] = pagos.map((pago) => ({
       id_pago: pago.id_pago,
       id_usuario: pago.id_usuario,
       monto: pago.monto,
       fecha_pago: pago.fecha_pago,
       id_tipo_metodo_pago: pago.id_tipo_metodo_pago,
       referencia: pago.referencia,
       tipoMetodoPago: pago.TipoMetodoPago
         ? {
             id_tipo_metodo_pago: pago.TipoMetodoPago.id_tipo_metodo_pago,
             descripcion: pago.TipoMetodoPago.descripcion,
           }
         : undefined,
     }));

    return res.status(200).json(response);
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `GET /cuentas-corrientes/${id}/pagos - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const deleteCuentaCorriente = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { rol_id } = req.user as JwtPayload;

    if (rol_id !== 1) {
      logger.warn(`Usuario no autorizado para eliminar cuentas corrientes`);
      throw new UnauthorizedError(MESSAGES.ERROR.AUTH.NOT_AUTHORIZED);
    }

    logger.info(`DELETE /cuentas-corrientes/${id} - Request to delete account`);

    const cuenta = await CuentaCorriente.findByPk(id, {
      include: [Pago],
    });

    if (!cuenta) {
      logger.warn(`Cuenta Corriente con ID ${id} no encontrada`);
      throw new NotFoundError(MESSAGES.ERROR.CUENTA_CORRIENTE.NOT_FOUND);
    }

    await Pago.destroy({ where: { id_usuario: cuenta.id_usuario } });
   
    await cuenta.destroy();

    logger.info(`Cuenta Corriente con ID ${id} eliminada correctamente`);
    res.status(200).json({ message: MESSAGES.SUCCESS.CUENTA_CORRIENTE.CUENTA_DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `DELETE /cuentas-corrientes/${id} - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const updateSaldoCuentaCorriente = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { nuevoSaldo } = req.body;

    if (typeof nuevoSaldo !== 'number' || nuevoSaldo < 0) {
      logger.warn(`Saldo inválido proporcionado para la cuenta con ID ${id}`);
      return res.status(400).json({ message: MESSAGES.ERROR.CUENTA_CORRIENTE.INVALID_SALDO });
    }

    logger.info(`PUT /cuentas-corrientes/${id}/saldo - Request to update account balance`);

    const cuenta = await CuentaCorriente.findByPk(id);

    if (!cuenta) {
      logger.warn(`Cuenta Corriente con ID ${id} no encontrada`);
      throw new NotFoundError(MESSAGES.ERROR.CUENTA_CORRIENTE.NOT_FOUND);
    }

    cuenta.saldo = nuevoSaldo;
    await cuenta.save();

    logger.info(`Saldo de la Cuenta Corriente con ID ${id} actualizado`);

    res.status(200).json({ message: MESSAGES.SUCCESS.CUENTA_CORRIENTE.SALDO_UPDATED, cuenta });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `PUT /cuentas-corrientes/${id}/saldo - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};
