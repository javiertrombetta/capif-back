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
    logger.info('GET /consultas - Request received');
    const consultas = await Consulta.findAll();
    logger.info(`GET /consultas - Successfully fetched ${consultas.length} consultas`);
    res.status(200).json(consultas);
  } catch (error) {
    logger.error(
      `GET /consultas - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
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
    logger.info(`GET /consultas/${id} - Request received`);
    const consulta = await Consulta.findByPk(id);
    if (!consulta) {
      logger.warn(`GET /consultas/${id} - Consulta not found`);
      return next(new NotFoundError(MESSAGES.ERROR.CONSULTA.NOT_FOUND));
    }
    logger.info(`GET /consultas/${id} - Successfully fetched consulta`);
    res.status(200).json(consulta);
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `GET /consultas/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
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

    logger.info('POST /consultas - Request received to create consulta', { asunto, id_usuario });
 
    if (!asunto || !id_usuario || !estado_id) {
      logger.warn('POST /consultas - Bad request, missing required fields');
      return next(new BadRequestError(MESSAGES.ERROR.VALIDATION.GENERAL));
    }

    const estado = await Estado.findByPk(estado_id);
    if (!estado) {
      logger.warn(`POST /consultas - Estado ID ${estado_id} not found`);
      return next(new BadRequestError(MESSAGES.ERROR.VALIDATION.STATE_INVALID));
    }

    const newConsulta = await Consulta.create({
      asunto,
      mensaje,
      id_usuario,
      estado_id,
    });

    logger.info(
      `POST /consultas - Successfully created consulta with ID: ${newConsulta.id_consulta}`
    );
    res.status(201).json({ message: MESSAGES.SUCCESS.CONSULTA.CONSULTA_ADDED, newConsulta });
  } catch (error) {
    logger.error(
      `POST /consultas - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
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

    logger.info(`PUT /consultas/${id} - Request received to update consulta`);

     if (estado_id) {
       const estado = await Estado.findByPk(estado_id);
       if (!estado) {
         logger.warn(`PUT /consultas/${id} - Estado ID ${estado_id} not found`);
         return next(new BadRequestError(MESSAGES.ERROR.VALIDATION.STATE_INVALID));
       }
     }

    const updatedConsulta = await Consulta.update(req.body, {
      where: { id_consulta: id },
      returning: true,
    });
    if (!updatedConsulta[1].length) {
      logger.warn(`PUT /consultas/${id} - Consulta not found`);
      return next(new NotFoundError(MESSAGES.ERROR.CONSULTA.NOT_FOUND));
    }
    logger.info(`PUT /consultas/${id} - Successfully updated consulta`);
    res
      .status(200)
      .json({ message: MESSAGES.SUCCESS.AUTH.ROLE_UPDATED, updatedConsulta: updatedConsulta[1][0] });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `PUT /consultas/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
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
    logger.info(`DELETE /consultas/${id} - Request received to delete consulta`);
    const result = await Consulta.destroy({
      where: { id_consulta: id },
    });
    if (!result) {
      logger.warn(`DELETE /consultas/${id} - Consulta not found`);
      return next(new NotFoundError(MESSAGES.ERROR.CONSULTA.NOT_FOUND));
    }
    logger.info(`DELETE /consultas/${id} - Successfully deleted consulta`);
    res.status(200).json({ message: MESSAGES.SUCCESS.CONSULTA.CONSULTA_DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `DELETE /consultas/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};