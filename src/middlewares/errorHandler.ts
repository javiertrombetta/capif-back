import { Request, Response, NextFunction } from 'express';
import { isCelebrateError } from 'celebrate';
import { CustomError } from '../services/customErrors';
import logger from '../config/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message || 'Error desconocido', err);

  if (isCelebrateError(err)) {
    const errorDetails =
      err.details.get('body') || err.details.get('params') || err.details.get('query');
    const message = errorDetails?.details[0]?.message || 'Ocurrió un error de validación.';

    return res.status(400).json({ message });
  }

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Error interno del servidor' });
};
