import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { NotFoundError, BadRequestError, InternalServerError } from '../services/customErrors';
import * as MESSAGES from '../services/messages';
import { ParamsWithId } from '../interfaces/ParamsInRoutes';
import { Estado, Consulta } from '../models';

export const getConsultas = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener todas las consultas`
    );
    const consultas = await Consulta.findAll();
    logger.info(
      `${req.method} ${req.originalUrl} - ${consultas.length} consultas obtenidas con éxito`
    );
    res.status(200).json(consultas);
  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al obtener consultas: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getConsultaById = async (
  req: Request<ParamsWithId>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener la consulta con ID ${id}`
    );
    const consulta = await Consulta.findByPk(id);
    if (!consulta) {
      logger.warn(`${req.method} ${req.originalUrl} - Consulta con ID ${id} no encontrada`);
      return next(new NotFoundError(MESSAGES.ERROR.CONSULTA.NOT_FOUND));
    }
    logger.info(`${req.method} ${req.originalUrl} - Consulta con ID ${id} obtenida con éxito`);
    res.status(200).json(consulta);
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `${req.method} ${req.originalUrl} - Error al obtener la consulta con ID ${id}: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const createConsulta = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { asunto, mensaje, id_usuario, estado_id } = req.body;
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para crear una nueva consulta`,
      { asunto, id_usuario }
    );

    if (!asunto || !id_usuario || !estado_id) {
      logger.warn(`${req.method} ${req.originalUrl} - Datos incompletos para crear la consulta`);
      return next(new BadRequestError(MESSAGES.ERROR.VALIDATION.GENERAL));
    }

    const estado = await Estado.findByPk(estado_id);
    if (!estado) {
      logger.warn(`${req.method} ${req.originalUrl} - Estado con ID ${estado_id} no encontrado`);
      return next(new BadRequestError(MESSAGES.ERROR.VALIDATION.STATE_INVALID));
    }

    const nuevaConsulta = await Consulta.create({ asunto, mensaje, id_usuario, estado_id });

    logger.info(
      `${req.method} ${req.originalUrl} - Consulta creada con éxito con ID: ${nuevaConsulta.id_consulta}`
    );
    res.status(201).json({ message: MESSAGES.SUCCESS.CONSULTA.CONSULTA_ADDED, nuevaConsulta });
  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al crear la consulta: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const updateConsulta = async (
  req: Request<ParamsWithId>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado_id } = req.body;
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para actualizar la consulta con ID ${id}`
    );

    if (estado_id) {
      const estado = await Estado.findByPk(estado_id);
      if (!estado) {
        logger.warn(`${req.method} ${req.originalUrl} - Estado con ID ${estado_id} no encontrado`);
        return next(new BadRequestError(MESSAGES.ERROR.VALIDATION.STATE_INVALID));
      }
    }

    const [rowsUpdated, [consultaActualizada]] = await Consulta.update(req.body, {
      where: { id_consulta: id },
      returning: true,
    });

    if (!rowsUpdated) {
      logger.warn(`${req.method} ${req.originalUrl} - Consulta con ID ${id} no encontrada`);
      return next(new NotFoundError(MESSAGES.ERROR.CONSULTA.NOT_FOUND));
    }

    logger.info(`${req.method} ${req.originalUrl} - Consulta con ID ${id} actualizada con éxito`);
    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.ROLE_UPDATED, consultaActualizada });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `${req.method} ${req.originalUrl} - Error al actualizar la consulta con ID ${id}: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const deleteConsulta = async (
  req: Request<ParamsWithId>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para eliminar la consulta con ID ${id}`
    );
    const result = await Consulta.destroy({ where: { id_consulta: id } });

    if (!result) {
      logger.warn(`${req.method} ${req.originalUrl} - Consulta con ID ${id} no encontrada`);
      return next(new NotFoundError(MESSAGES.ERROR.CONSULTA.NOT_FOUND));
    }

    logger.info(`${req.method} ${req.originalUrl} - Consulta con ID ${id} eliminada con éxito`);
    res.status(200).json({ message: MESSAGES.SUCCESS.CONSULTA.CONSULTA_DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(    
      `${req.method} ${req.originalUrl} - Error al eliminar la consulta con ID ${id}: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};