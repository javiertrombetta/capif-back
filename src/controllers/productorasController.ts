import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import * as MESSAGES from '../services/messages';
import * as productoraService from '../services/productoraService';

// Obtener todas las productoras
export const getAllProductoras = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud para obtener todas las productoras.`);

    const productoras = await productoraService.findAllProductoras();

    logger.info(`${req.method} ${req.originalUrl} - Se encontraron ${productoras.length} productoras.`);
    res.status(200).json({ productoras });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al obtener todas las productoras: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Obtener una productora por ID
export const getProductoraById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Solicitud para obtener la productora con ID: ${id}.`);

    if (!id) {
      logger.warn(`${req.method} ${req.originalUrl} - El ID de la productora es requerido.`);
      return res.status(400).json({ message: MESSAGES.ERROR.PRODUCTORA.ID_REQUIRED });
    }

    const productora = await productoraService.findProductoraById(id);

    logger.info(`${req.method} ${req.originalUrl} - Productora encontrada: ${productora.nombre_productora}.`);
    res.status(200).json({ productora });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al obtener la productora por ID: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};