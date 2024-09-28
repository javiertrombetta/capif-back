import { Response, NextFunction } from 'express';
import logger from '../config/logger';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import * as MESSAGES from '../services/messages';
import { NotFoundError, InternalServerError } from '../services/customErrors';
import { Pago, Usuario } from '../models';

export const getAllPagos = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info('GET /pagos - Request received to fetch all payments');

    const pagos = await Pago.findAll();

    if (!pagos.length) {
      logger.warn('No se encontraron pagos');
      throw new NotFoundError(MESSAGES.ERROR.PAGO.NOT_FOUND);
    }

    res.status(200).json(pagos);
  } catch (error) {
    logger.error(`GET /pagos - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getPagosByUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`GET /pagos/${id} - Request received to fetch payments for user ID: ${id}`);

    const pagos = await Pago.findAll({ where: { id_usuario: id } });

    if (!pagos.length) {
      logger.warn(`No se encontraron pagos para el usuario con ID ${id}`);
      throw new NotFoundError(MESSAGES.ERROR.PAGO.NOT_FOUND);
    }

    res.status(200).json(pagos);
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `GET /pagos/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const createPago = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { monto, fecha_pago, id_usuario, metodo_pago, referencia } = req.body;
    logger.info('POST /pagos - Request received to create a new payment');

    const usuario = await Usuario.findByPk(id_usuario);
    if (!usuario) {
      logger.warn(`Usuario con ID ${id_usuario} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    const nuevoPago = await Pago.create({
      monto,
      fecha_pago,
      id_usuario,
      metodo_pago,
      referencia,
    });

    logger.info(`Pago creado exitosamente para el usuario con ID: ${id_usuario}`);
    res.status(201).json({ message: MESSAGES.SUCCESS.PAGO.PAGO_CREATED, nuevoPago });
  } catch (error) {
    logger.error(
      `POST /pagos - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const updatePago = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { monto, fecha_pago, metodo_pago, referencia } = req.body;
    logger.info(`PUT /pagos/${id} - Request received to update payment ID: ${id}`);

    const pago = await Pago.findByPk(id);

    if (!pago) {
      logger.warn(`Pago con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.PAGO.NOT_FOUND);
    }

    pago.monto = monto;
    pago.fecha_pago = fecha_pago;
    pago.metodo_pago = metodo_pago;
    pago.referencia = referencia;

    await pago.save();

    logger.info(`Pago con ID ${id} actualizado correctamente`);
    res.status(200).json({ message: MESSAGES.SUCCESS.PAGO.PAGO_UPDATED, pago });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `PUT /pagos/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const deletePago = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`DELETE /pagos/${id} - Request received to delete payment ID: ${id}`);

    const pago = await Pago.findByPk(id);

    if (!pago) {
      logger.warn(`Pago con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.PAGO.NOT_FOUND);
    }

    await pago.destroy();

    logger.info(`Pago con ID ${id} eliminado correctamente`);
    res.status(200).json({ message: MESSAGES.SUCCESS.PAGO.PAGO_DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `DELETE /pagos/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};
