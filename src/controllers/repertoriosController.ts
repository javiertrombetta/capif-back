import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

import * as MESSAGES from '../services/messages';
import { NotFoundError, InternalServerError } from '../services/customErrors';

import { Repertorio, Estado } from '../models';

export const getRepertorios = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info('GET /repertorios - Request received to fetch all repertorios');

    const repertorios = await Repertorio.findAll({ include: Estado });

    if (!repertorios.length) {
      logger.warn('No se encontraron repertorios');
      throw new NotFoundError(MESSAGES.ERROR.REPERTORIO.NOT_FOUND);
    }

    res.status(200).json(repertorios);
  } catch (error) {
    logger.error(
      `GET /repertorios - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getRepertorioById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`GET /repertorios/${id} - Request received to fetch repertorio ID: ${id}`);

    const repertorio = await Repertorio.findByPk(id, { include: Estado });

    if (!repertorio) {
      logger.warn(`Repertorio con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.REPERTORIO.NOT_FOUND);
    }

    res.status(200).json(repertorio);
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `GET /repertorios/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const createRepertorio = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { titulo, tipo, id_usuario, estado } = req.body;
    logger.info('POST /repertorios - Request received to create a new repertorio');

    // Buscar el estado en la base de datos
    const estadoEncontrado = await Estado.findOne({ where: { descripcion: estado } });

    if (!estadoEncontrado) {
      logger.warn(`Estado con descripción ${estado} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.ESTADO.NOT_FOUND);
    }

    const nuevoRepertorio = await Repertorio.create({
      titulo,
      tipo,
      id_usuario,
      estado_id: estadoEncontrado.id_estado,
    });

    logger.info(
      `POST /repertorios - Successfully created repertorio with ID: ${nuevoRepertorio.id_repertorio}`
    );
    res.status(201).json({ message: MESSAGES.SUCCESS.REPERTORIO.CREATED, nuevoRepertorio });
  } catch (error) {
    logger.error(
      `POST /repertorios - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const createRepertorioByTema = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { titulo, artista, id_usuario, estado } = req.body;
    logger.info('POST /repertorios/tema - Request received to create repertorio by tema');

    const estadoEncontrado = await Estado.findOne({ where: { descripcion: estado } });

    if (!estadoEncontrado) {
      logger.warn(`Estado con descripción ${estado} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.ESTADO.NOT_FOUND);
    }

    const nuevoRepertorio = await Repertorio.create({
      titulo,
      tipo: 'tema',
      id_usuario,
      estado_id: estadoEncontrado.id_estado,
    });

    logger.info(
      `POST /repertorios/tema - Successfully created repertorio by tema with ID: ${nuevoRepertorio.id_repertorio}`
    );
    res.status(201).json({ message: MESSAGES.SUCCESS.REPERTORIO.CREATED_BY_TEMA, nuevoRepertorio });
  } catch (error) {
    logger.error(
      `POST /repertorios/tema - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const createRepertorioByAlbum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { titulo, artista, id_usuario, estado } = req.body;
    logger.info('POST /repertorios/album - Request received to create repertorio by album');

    const estadoEncontrado = await Estado.findOne({ where: { descripcion: estado } });

    if (!estadoEncontrado) {
      logger.warn(`Estado con descripción ${estado} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.ESTADO.NOT_FOUND);
    }

    const nuevoRepertorio = await Repertorio.create({
      titulo,
      tipo: 'album',
      id_usuario,
      estado_id: estadoEncontrado.id_estado,
    });

    logger.info(
      `POST /repertorios/album - Successfully created repertorio by album with ID: ${nuevoRepertorio.id_repertorio}`
    );
    res
      .status(201)
      .json({ message: MESSAGES.SUCCESS.REPERTORIO.CREATED_BY_ALBUM, nuevoRepertorio });
  } catch (error) {
    logger.error(
      `POST /repertorios/album - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const updateRepertorio = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    logger.info(`PUT /repertorios/${id} - Request received to update repertorio ID: ${id}`);

    const repertorio = await Repertorio.findByPk(id);

    if (!repertorio) {
      logger.warn(`Repertorio con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.REPERTORIO.NOT_FOUND);
    }
    
    if (estado) {
      const estadoEncontrado = await Estado.findOne({ where: { descripcion: estado } });
      if (!estadoEncontrado) {
        logger.warn(`Estado con descripción ${estado} no encontrado`);
        throw new NotFoundError(MESSAGES.ERROR.ESTADO.NOT_FOUND);
      }
      req.body.estado_id = estadoEncontrado.id_estado;
    }

    Object.assign(repertorio, req.body);
    await repertorio.save();

    logger.info(`PUT /repertorios/${id} - Successfully updated repertorio`);
    res.status(200).json({ message: MESSAGES.SUCCESS.REPERTORIO.UPDATED, repertorio });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `PUT /repertorios/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const deleteRepertorio = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`DELETE /repertorios/${id} - Request received to delete repertorio ID: ${id}`);

    const repertorio = await Repertorio.findByPk(id);

    if (!repertorio) {
      logger.warn(`Repertorio con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.REPERTORIO.NOT_FOUND);
    }

    await repertorio.destroy();

    logger.info(`DELETE /repertorios/${id} - Successfully deleted repertorio`);
    res.status(200).json({ message: MESSAGES.SUCCESS.REPERTORIO.DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `DELETE /repertorios/${id} - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const downloadRepertorio = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(
      `GET /repertorios/${id}/descargar - Request received to download repertorio ID: ${id}`
    );

    const repertorio = await Repertorio.findByPk(id);

    if (!repertorio) {
      logger.warn(`Repertorio con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.REPERTORIO.NOT_FOUND);
    }

    res.status(200).json({ message: MESSAGES.SUCCESS.REPERTORIO.DOWNLOADED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `GET /repertorios/${id}/descargar - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getRepertoriosDepuracion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info(
      'GET /repertorios/depuracion - Request received to fetch repertorios for depuration'
    );

    const estadoDepuracion = await Estado.findOne({ where: { descripcion: 'a depurar' } });

    if (!estadoDepuracion) {
      logger.warn('Estado "a depurar" no encontrado');
      throw new NotFoundError(MESSAGES.ERROR.ESTADO.NOT_FOUND);
    }

    const repertorios = await Repertorio.findAll({
      where: { estado_id: estadoDepuracion.id_estado },
    });

    if (!repertorios.length) {
      logger.warn('No se encontraron repertorios a depurar');
      throw new NotFoundError(MESSAGES.ERROR.REPERTORIO.NOT_FOUND);
    }

    res.status(200).json(repertorios);
  } catch (error) {
    logger.error(
      `GET /repertorios/depuracion - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const updateRepertorioDepuracion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(
      `PUT /repertorios/${id}/depuracion - Request received to update depurado repertorio ID: ${id}`
    );

    const repertorio = await Repertorio.findByPk(id);

    if (!repertorio) {
      logger.warn(`Repertorio con ID ${id} no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.REPERTORIO.NOT_FOUND);
    }

    const estadoDepuracion = await Estado.findOne({ where: { descripcion: 'a depurar' } });

    if (!estadoDepuracion) {
      logger.warn('Estado "a depurar" no encontrado');
      throw new NotFoundError(MESSAGES.ERROR.ESTADO.NOT_FOUND);
    }

    if (repertorio.estado_id !== estadoDepuracion.id_estado) {
      logger.warn(`Repertorio con ID ${id} no está en estado de depuración`);
      throw new NotFoundError(MESSAGES.ERROR.REPERTORIO.INVALID_STATE);
    }

    Object.assign(repertorio, req.body);
    await repertorio.save();

    logger.info(`PUT /repertorios/${id}/depuracion - Successfully updated depurado repertorio`);
    res.status(200).json({ message: MESSAGES.SUCCESS.REPERTORIO.UPDATED_DEPURACION, repertorio });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `PUT /repertorios/${id}/depuracion - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const generarLoteEnvio = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info('POST /repertorios/lote-envio - Request received to generate lote de envío');

    // Lógica para generar el lote de envío

    res.status(200).json({ message: MESSAGES.SUCCESS.REPERTORIO.LOTE_ENVIO_GENERADO });
  } catch (error) {
    logger.error(
      `POST /repertorios/lote-envio - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};