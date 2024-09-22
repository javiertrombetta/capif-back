import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../services/customErrors';
import logger from '../config/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message || 'Error desconocido', err);

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Error interno del servidor' });
};
