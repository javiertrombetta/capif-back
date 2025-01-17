import { Request, Response, NextFunction } from 'express';
import { isCelebrateError } from 'celebrate';
import { CustomError } from '../services/customErrors';
import logger from '../config/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, err);

  // Manejar errores de validación (Celebrate)
  if (isCelebrateError(err)) {
    const errorDetails =
      err.details.get('body') || err.details.get('params') || err.details.get('query');
    const message = errorDetails?.details[0]?.message || 'Ocurrió un error de validación.';
    return res.status(400).json({ error: message });
  }

  // Manejar errores personalizados
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Manejar errores genéricos no controlados
  res.status(500).json({ error: 'Error interno del servidor.' });
};
