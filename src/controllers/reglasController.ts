import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import * as MESSAGES from '../services/messages';
import { NotFoundError, InternalServerError } from '../services/customErrors';
import Regla from '../models/Regla';

export const getAllReglas = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info('GET /reglas - Request received to fetch all rules');

    const reglas = await Regla.findAll();

    if (!reglas.length) {
      logger.warn('No se encontraron reglas');
      throw new NotFoundError(MESSAGES.ERROR.REGLA.NOT_FOUND);
    }

    res.status(200).json(reglas);
  } catch (error) {
    logger.error(
      `GET /reglas - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getReglaById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`GET /reglas/${id} - Request received to fetch rule ID: ${id}`);

    const regla = await Regla.findByPk(id);

    if (!regla) {
      logger.warn(`Regla con ID ${id} no encontrada`);
      throw new NotFoundError(MESSAGES.ERROR.REGLA.NOT_FOUND);
    }

    res.status(200).json(regla);
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `GET /reglas/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const createRegla = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { descripcion, activo } = req.body;

    logger.info('POST /reglas - Request received to create a new rule');

    const nuevaRegla = await Regla.create({
      descripcion,
      activo,
    });

    logger.info(`POST /reglas - Successfully created rule with ID: ${nuevaRegla.id_regla}`);
    res.status(201).json({ message: MESSAGES.SUCCESS.REGLA.REGLA_CREATED, nuevaRegla });
  } catch (error) {
    logger.error(
      `POST /reglas - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const updateRegla = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`PUT /reglas/${id} - Request received to update rule ID: ${id}`);

    const regla = await Regla.findByPk(id);

    if (!regla) {
      logger.warn(`Regla con ID ${id} no encontrada`);
      throw new NotFoundError(MESSAGES.ERROR.REGLA.NOT_FOUND);
    }

    Object.assign(regla, req.body);
    await regla.save();

    logger.info(`PUT /reglas/${id} - Successfully updated rule`);
    res.status(200).json({ message: MESSAGES.SUCCESS.REGLA.REGLA_UPDATED, regla });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `PUT /reglas/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const deleteRegla = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`DELETE /reglas/${id} - Request received to delete rule ID: ${id}`);

    const regla = await Regla.findByPk(id);

    if (!regla) {
      logger.warn(`Regla con ID ${id} no encontrada`);
      throw new NotFoundError(MESSAGES.ERROR.REGLA.NOT_FOUND);
    }

    await regla.destroy();

    logger.info(`DELETE /reglas/${id} - Successfully deleted rule`);
    res.status(200).json({ message: MESSAGES.SUCCESS.REGLA.REGLA_DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `DELETE /reglas/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};
