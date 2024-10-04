import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

import * as MESSAGES from '../services/messages';
import { NotFoundError, InternalServerError, BadRequestError } from '../services/customErrors';

import { Compania, Estado, TipoCompania } from '../models';

export const getAllProductores = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info('GET /productores - Request received to fetch all producers');

    const companias = await Compania.findAll({
      include: ['TipoCompania', 'Estado'],
    });

    if (!companias.length) {
      logger.warn('No se encontraron compañías productoras');
      throw new NotFoundError(MESSAGES.ERROR.PRODUCTOR.NOT_FOUND);
    }

    res.status(200).json(companias);
  } catch (error) {
    logger.error(
      `GET /productores - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getProductorById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`GET /productores/${id} - Request received to fetch producer ID: ${id}`);

    const compania = await Compania.findByPk(id, {
      include: ['TipoCompania', 'Estado'],
    });

    if (!compania) {
      logger.warn(`Compañía productora con ID ${id} no encontrada`);
      throw new NotFoundError(MESSAGES.ERROR.PRODUCTOR.NOT_FOUND);
    }

    res.status(200).json(compania);
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `GET /productores/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const createProductor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nombre_compania, direccion, telefono, email, cuit, tipo_compania_id, estado_id } =
      req.body;

    logger.info('POST /productores - Request received to create a new producer');

    const tipoCompania = await TipoCompania.findByPk(tipo_compania_id);
    if (!tipoCompania) {
      logger.warn('Tipo de compañía no válido');
      throw new BadRequestError(MESSAGES.ERROR.PRODUCTOR.INVALID_TIPO_COMPANIA);
    }

    const estado = await Estado.findByPk(estado_id);
    if (!estado) {
      logger.warn('Estado no válido');
      throw new BadRequestError(MESSAGES.ERROR.PRODUCTOR.INVALID_ESTADO);
    }

    const nuevaCompania = await Compania.create({
      nombre_compania,
      direccion,
      telefono,
      email,
      cuit,
      tipo_compania_id,
      estado_id,
    });

    logger.info(
      `POST /productores - Successfully created producer with ID: ${nuevaCompania.id_compania}`
    );
    res.status(201).json({ message: MESSAGES.SUCCESS.PRODUCTOR.PRODUCER_CREATED, nuevaCompania });
  } catch (error) {
    logger.error(
      `POST /productores - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const updateProductor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`PUT /productores/${id} - Request received to update producer ID: ${id}`);

    const compania = await Compania.findByPk(id);

    if (!compania) {
      logger.warn(`Compañía productora con ID ${id} no encontrada`);
      throw new NotFoundError(MESSAGES.ERROR.PRODUCTOR.NOT_FOUND);
    }

    Object.assign(compania, req.body);

    if (req.body.tipo_compania_id) {
      const tipoCompania = await TipoCompania.findByPk(req.body.tipo_compania_id);
      if (!tipoCompania) {
        throw new BadRequestError(MESSAGES.ERROR.PRODUCTOR.INVALID_TIPO_COMPANIA);
      }
    }

    if (req.body.estado_id) {
      const estado = await Estado.findByPk(req.body.estado_id);
      if (!estado) {
        throw new BadRequestError(MESSAGES.ERROR.PRODUCTOR.INVALID_ESTADO);
      }
    }

    await compania.save();

    logger.info(`PUT /productores/${id} - Successfully updated producer`);
    res.status(200).json({ message: MESSAGES.SUCCESS.PRODUCTOR.PRODUCER_UPDATED, compania });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `PUT /productores/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};


export const deleteProductor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`DELETE /productores/${id} - Request received to delete producer ID: ${id}`);

    const compania = await Compania.findByPk(id);

    if (!compania) {
      logger.warn(`Compañía productora con ID ${id} no encontrada`);
      throw new NotFoundError(MESSAGES.ERROR.PRODUCTOR.NOT_FOUND);
    }

    await compania.destroy();

    logger.info(`DELETE /productores/${id} - Successfully deleted producer`);
    res.status(200).json({ message: MESSAGES.SUCCESS.PRODUCTOR.PRODUCER_DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `DELETE /productores/${id} - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};
