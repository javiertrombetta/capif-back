import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

import * as MESSAGES from '../services/messages';
import { NotFoundError, InternalServerError } from '../services/customErrors';

import { Tramite, Usuario } from '../models';

export const getTramites = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info('GET /tramites - Request received to fetch all tramites');

    const tramites = await Tramite.findAll({ include: Usuario });

    if (!tramites.length) {
      logger.warn('No se encontraron trámites');
      throw new NotFoundError(MESSAGES.ERROR.TRAMITE.NOT_FOUND);
    }

    res.status(200).json(tramites);
  } catch (error) {
    logger.error(
      `GET /tramites - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getTramiteById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`GET /tramites/${id} - Request received to fetch tramite ID: ${id}`);

    const tramite = await Tramite.findByPk(id, { include: Usuario });

    if (!tramite) {
      logger.warn(`Tramite con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.TRAMITE.NOT_FOUND);
    }

    res.status(200).json(tramite);
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `GET /tramites/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const createTramite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tramite = await Tramite.create(req.body);
    logger.info('POST /tramites - Tramite creado con éxito');

    res.status(201).json({ message: MESSAGES.SUCCESS.TRAMITE.CREATED, tramite });
  } catch (error) {
    logger.error(
      `POST /tramites - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const updateTramite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const tramite = await Tramite.findByPk(id);

    if (!tramite) {
      logger.warn(`Tramite con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.TRAMITE.NOT_FOUND);
    }

    await tramite.update(req.body);
    logger.info(`PUT /tramites/${id} - Tramite actualizado con éxito`);

    res.status(200).json({ message: MESSAGES.SUCCESS.TRAMITE.UPDATED, tramite });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `PUT /tramites/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const deleteTramite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`DELETE /tramites/${id} - Request received to delete tramite ID: ${id}`);

    const tramite = await Tramite.findByPk(id);

    if (!tramite) {
      logger.warn(`Tramite con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.TRAMITE.NOT_FOUND);
    }

    await tramite.destroy();
    logger.info(`DELETE /tramites/${id} - Tramite eliminado con éxito`);

    res.status(200).json({ message: MESSAGES.SUCCESS.TRAMITE.DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `DELETE /tramites/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};
