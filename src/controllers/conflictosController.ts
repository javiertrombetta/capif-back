import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";

import { handleGeneralError } from "../services/errorService";
import * as conflictosService from "../services/conflictosService";


export const crearConflicto = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { isrc, fecha_periodo_desde, fecha_periodo_hasta } = req.body;

    logger.info(`${req.method} ${req.originalUrl} - Creando conflicto para ISRC: ${isrc}.`);

    const resultado = await conflictosService.crearConflicto(req, isrc, fecha_periodo_desde, fecha_periodo_hasta);

    res.status(201).json(resultado);
  } catch (error) {
    handleGeneralError(error, req, res, next, "Error al crear el conflicto");
  }
};

export const obtenerConflictos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fecha_desde, fecha_hasta, estado, isrc, productora_id } = req.query;

    logger.info(`${req.method} ${req.originalUrl} - Obteniendo conflictos con filtros`);

    const resultado = await conflictosService.obtenerConflictos({
      fecha_desde: fecha_desde as string,
      fecha_hasta: fecha_hasta as string,
      estado: estado as string,
      isrc: isrc as string,
      productora_id: productora_id as string,
    });

    res.status(200).json(resultado);
  } catch (error) {
    handleGeneralError(error, req, res, next, "Error al obtener los conflictos");
  }
};

export const obtenerConflicto = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Obteniendo conflicto con ID: ${id}`);

    const resultado = await conflictosService.obtenerConflicto(id);

    res.status(200).json(resultado);
  } catch (error) {
    handleGeneralError(error, req, res, next, "Error al obtener el conflicto");
  }
};

export const actualizarEstadoConflicto = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado_conflicto } = req.body;

    logger.info(`${req.method} ${req.originalUrl} - Actualizando estado del conflicto con ID: ${id}`);

    const resultado = await conflictosService.actualizarEstadoConflicto(req, id, estado_conflicto);

    res.status(200).json(resultado);
  } catch (error) {
    handleGeneralError(error, req, res, next, "Error al actualizar el estado del conflicto");
  }
};

export const desistirConflicto = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Cancelando conflicto con ID: ${id}`);

    const resultado = await conflictosService.desistirConflicto(req, id);

    res.status(200).json(resultado);
  } catch (error) {
    handleGeneralError(error, req, res, next, "Error al cancelar el conflicto");
  }
};

export const eliminarConflicto = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Eliminando conflicto con ID: ${id}`);

    const resultado = await conflictosService.eliminarConflicto(req, id);

    res.status(200).json(resultado);
  } catch (error) {
    handleGeneralError(error, req, res, next, "Error al eliminar el conflicto");
  }
};

export const actualizarPorResolucion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { resoluciones } = req.body;

    logger.info(`${req.method} ${req.originalUrl} - Aplicando resolución al conflicto con ID: ${id}`);

    const resultado = await conflictosService.actualizarPorResolucion(req, id, resoluciones);

    res.status(200).json(resultado);
  } catch (error) {
    handleGeneralError(error, req, res, next, "Error al aplicar la resolución");
  }
};

export const otorgarProrroga = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Otorgando prórroga al conflicto con ID: ${id}`);

    const resultado = await conflictosService.otorgarProrroga(req, id);

    res.status(200).json(resultado);
  } catch (error) {
    handleGeneralError(error, req, res, next, "Error al otorgar la prórroga");
  }
};

export const confirmarPorcentaje = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { participacion_id, porcentaje_confirmado } = req.body;

    logger.info(`${req.method} ${req.originalUrl} - Confirmando porcentaje para el conflicto con ID: ${id}`);

    const resultado = await conflictosService.confirmarPorcentaje(req, id, participacion_id, porcentaje_confirmado);

    res.status(200).json(resultado);
  } catch (error) {
    handleGeneralError(error, req, res, next, "Error al confirmar el porcentaje");
  }
};

export const enviarDocumentos = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre_participante } = req.body;

    logger.info(`${req.method} ${req.originalUrl} - Enviando documentos para el conflicto ID: ${id}`);

    const resultado = await conflictosService.enviarDocumentos(req, id, nombre_participante, req.files as Express.Multer.File[]);

    res.status(200).json(resultado);
  } catch (error) {
    handleGeneralError(error, req, res, next, "Error al enviar documentos");
  }
};

export const generarReporteConflictos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fecha_desde, fecha_hasta, estado, isrc, productora_id, formato } = req.query;

    logger.info(`${req.method} ${req.originalUrl} - Generando reporte de conflictos`);

    const resultado = await conflictosService.generarReporteConflictos({
      fecha_desde: fecha_desde as string,
      fecha_hasta: fecha_hasta as string,
      estado: estado as string,
      isrc: isrc as string,
      productora_id: productora_id as string,
      formato: formato as string,
    });

    if (resultado.formato === "csv") {
      res.header("Content-Type", "text/csv");
      res.attachment("reporte_conflictos.csv");
      res.send(resultado.data);
    } else {
      res.status(200).json(resultado);
    }
  } catch (error) {
    handleGeneralError(error, req, res, next, "Error al generar el reporte de conflictos");
  }
};