import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

import { getAuditChanges, getRepertoireAuditChanges, getSessionAuditChanges } from "../services/auditService";
import { handleGeneralError } from "../services/errorService";


export const getChanges = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Listando cambios de auditoría.`);

    const response = await getAuditChanges(req);

    return res.status(200).json(response);
  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener los cambios de auditoría");
  }
};


export const getRepertoireChanges = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Listando cambios en repertorios.`);

    const response = await getRepertoireAuditChanges(req);

    return res.status(200).json(response);
  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener los cambios en repertorios");
  }
};

export const getSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Listando sesiones iniciadas.`);

    const response = await getSessionAuditChanges(req);

    return res.status(200).json(response);
  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener las sesiones iniciadas");
  }
};