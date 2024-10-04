import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import logger from '../config/logger';

import * as MESSAGES from '../services/messages';
import { NotFoundError, InternalServerError, BadRequestError } from '../services/customErrors';

import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';

import { Usuario, Compania, PostulacionPremio } from '../models';

export const getAllPostulaciones = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info('GET /premios - Request received to fetch all postulaciones');

    const postulaciones = await PostulacionPremio.findAll({
      include: [Usuario, Compania],
    });

    if (!postulaciones.length) {
      logger.warn('No se encontraron postulaciones a premios');
      throw new NotFoundError(MESSAGES.ERROR.PREMIO.NOT_FOUND);
    }

    res.status(200).json(postulaciones);
  } catch (error) {
    logger.error(
      `GET /premios - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getPostulacionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`GET /premios/${id} - Request received to fetch postulación ID: ${id}`);

    const postulacion = await PostulacionPremio.findByPk(id, {
      include: [Usuario, Compania],
    });

    if (!postulacion) {
      logger.warn(`Postulación con ID ${id} no encontrada`);
      throw new NotFoundError(MESSAGES.ERROR.PREMIO.NOT_FOUND);
    }

    res.status(200).json(postulacion);
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `GET /premios/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const createPostulacion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id_compania, codigo_postulacion, fecha_asignacion } = req.body;
    const id_usuario = (req.user as JwtPayload)?.id || req.user;

    if (!id_usuario || !id_compania || !codigo_postulacion) {
      logger.warn('POST /premios - Missing required fields');
      throw new BadRequestError(MESSAGES.ERROR.VALIDATION.GENERAL);
    }

    logger.info('POST /premios - Request received to create a new postulación');

    const newPostulacion = await PostulacionPremio.create({
      id_usuario,
      id_compania,
      codigo_postulacion,
      fecha_asignacion,
    });

    logger.info(`POST /premios - Successfully created postulación for user ID: ${id_usuario}`);
    res.status(201).json({ message: MESSAGES.SUCCESS.PREMIO.PREMIO_CREATED, newPostulacion });
  } catch (error) {
    logger.error(
      `POST /premios - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const updatePostulacion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { codigo_postulacion, fecha_asignacion } = req.body;

    logger.info(`PUT /premios/${id} - Request received to update postulación ID: ${id}`);

    const postulacion = await PostulacionPremio.findByPk(id);

    if (!postulacion) {
      logger.warn(`Postulación con ID ${id} no encontrada`);
      throw new NotFoundError(MESSAGES.ERROR.PREMIO.NOT_FOUND);
    }

    postulacion.codigo_postulacion = codigo_postulacion || postulacion.codigo_postulacion;
    postulacion.fecha_asignacion = fecha_asignacion || postulacion.fecha_asignacion;

    await postulacion.save();

    logger.info(`PUT /premios/${id} - Successfully updated postulación`);
    res.status(200).json({ message: MESSAGES.SUCCESS.PREMIO.PREMIO_UPDATED, postulacion });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `PUT /premios/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const deletePostulacion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`DELETE /premios/${id} - Request received to delete postulación ID: ${id}`);

    const postulacion = await PostulacionPremio.findByPk(id);

    if (!postulacion) {
      logger.warn(`Postulación con ID ${id} no encontrada`);
      throw new NotFoundError(MESSAGES.ERROR.PREMIO.NOT_FOUND);
    }

    await postulacion.destroy();

    logger.info(`DELETE /premios/${id} - Successfully deleted postulación`);
    res.status(200).json({ message: MESSAGES.SUCCESS.PREMIO.PREMIO_DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `DELETE /premios/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};
