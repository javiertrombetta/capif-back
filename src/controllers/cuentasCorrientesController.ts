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
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener los pagos de la cuenta con ID ${id}`
    );
    
     const pagos = await Pago.findAll({
       where: { id_usuario: id },
       include: [TipoMetodoPago],
     });

    if (!pagos.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontraron pagos para la cuenta con ID ${id}`
      );
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

    logger.info(
      `${req.method} ${req.originalUrl} - ${pagos.length} pagos obtenidos para la cuenta con ID ${id}`
    );
    return res.status(200).json(response);
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `${req.method} ${req.originalUrl} - Error al obtener los pagos para la cuenta con ID ${id}: ${
        error instanceof Error ? error.message : 'Error desconocido'
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
     logger.info(
       `${req.method} ${req.originalUrl} - Solicitud recibida para eliminar la cuenta corriente con ID ${id}`
     );


    if (rol_id !== 1) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no autorizado para eliminar cuentas corrientes`
      );
      throw new UnauthorizedError(MESSAGES.ERROR.AUTH.NOT_AUTHORIZED);
    }

    const cuenta = await CuentaCorriente.findByPk(id, {
      include: [Pago],
    });

    if (!cuenta) {
      logger.warn(`${req.method} ${req.originalUrl} - Cuenta corriente con ID ${id} no encontrada`);
      throw new NotFoundError(MESSAGES.ERROR.CUENTA_CORRIENTE.NOT_FOUND);
    }

    await Pago.destroy({ where: { id_usuario: cuenta.id_usuario } });
   
    await cuenta.destroy();

    logger.info(
      `${req.method} ${req.originalUrl} - Cuenta corriente con ID ${id} eliminada correctamente`
    );
    res.status(200).json({ message: MESSAGES.SUCCESS.CUENTA_CORRIENTE.CUENTA_DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `${req.method} ${req.originalUrl} - Error al eliminar la cuenta corriente con ID ${id}: ${
        error instanceof Error ? error.message : 'Error desconocido'
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
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para actualizar el saldo de la cuenta con ID ${id}`
    );

    if (typeof nuevoSaldo !== 'number' || nuevoSaldo < 0) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Saldo inválido proporcionado para la cuenta con ID ${id}`
      );
      return res.status(400).json({ message: MESSAGES.ERROR.CUENTA_CORRIENTE.INVALID_SALDO });
    }  

    const cuenta = await CuentaCorriente.findByPk(id);

    if (!cuenta) {
      logger.warn(`${req.method} ${req.originalUrl} - Cuenta corriente con ID ${id} no encontrada`);
      throw new NotFoundError(MESSAGES.ERROR.CUENTA_CORRIENTE.NOT_FOUND);
    }

    cuenta.saldo = nuevoSaldo;
    await cuenta.save();

    logger.info(
      `${req.method} ${req.originalUrl} - Saldo de la cuenta con ID ${id} actualizado a ${nuevoSaldo}`
    );

    res.status(200).json({ message: MESSAGES.SUCCESS.CUENTA_CORRIENTE.SALDO_UPDATED, cuenta });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `${req.method} ${req.originalUrl} - Error al actualizar el saldo de la cuenta con ID ${id}: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};
