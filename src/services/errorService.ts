import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import * as MESSAGES from "../utils/messages";
import * as Err from "../utils/customErrors";

export function handleGeneralError(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
  customMessage: string
): void {
  const errorMessage =
    err instanceof Error ? err.message : 'Error desconocido';

  if (err instanceof Err.CustomError) {
    logger.warn(`${req.method} ${req.originalUrl} - ${customMessage}: ${errorMessage}`);
    res.status(err.statusCode).json({ error: err.message });
  } else {
    logger.error(`${req.method} ${req.originalUrl} - ${customMessage}: ${errorMessage}`);
    res.status(500).json({ error: MESSAGES.ERROR.GENERAL.UNKNOWN });
  }
}

export function handleEmailError(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
  customMessage: string
): void {
  const errorMessage = err instanceof Error ? err.message : 'Error desconocido';

  if (res.headersSent) {
    logger.error(`${req.method} ${req.originalUrl} - ${customMessage}: ${errorMessage} (No se envió respuesta porque ya fue enviada)`);
    return;
  }

  if (err instanceof Err.CustomError) {
    logger.warn(`${req.method} ${req.originalUrl} - ${customMessage}: ${errorMessage}`);
    res.status(err.statusCode).json({ error: err.message });
  } else {
    logger.error(`${req.method} ${req.originalUrl} - ${customMessage}: ${errorMessage}`);
    res.status(500).json({ error: MESSAGES.ERROR.EMAIL.SEND_FAILED });
  }
}