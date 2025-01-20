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

  logger.error(`${req.method} ${req.originalUrl} - ${customMessage}: ${errorMessage}`);
  next(new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
}

export function handleEmailError(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
  customMessage: string
): void {
  const errorMessage =
    err instanceof Error ? err.message : 'Error desconocido';

  logger.error(`${req.method} ${req.originalUrl} - ${customMessage}: ${errorMessage}`);
  next(new Err.InternalServerError(MESSAGES.ERROR.EMAIL.TEMP_FAILED));
}