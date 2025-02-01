import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";

import * as repertorioService from "../services/repertorioService";
import { handleGeneralError } from "../services/errorService";

export const validateISRC = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isrc } = req.body;

    logger.info(`${req.method} ${req.originalUrl} - Validando ISRC: ${isrc}.`);

    const validationResult = await repertorioService.validateISRC(isrc);

    return res.status(200).json({
      isrc,
      available: validationResult.available,
      message: validationResult.message,
    });
  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al validar el ISRC");
  }
};

export const createFonograma = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Creando nuevo fonograma.`);
    
    const newFonograma = await repertorioService.createFonograma(req);

    return res.status(201).json({ message: newFonograma.message, data: newFonograma.fonograma });

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al crear el fonograma");
  }
};

export const cargarRepertoriosMasivo = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Carga masiva de repertorios iniciada.`);

    const response = await repertorioService.cargarRepertoriosMasivo(req);

    return res.status(201).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al procesar la carga masiva de repertorios");
  }
};

export const getFonogramaById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Buscando fonograma por ID.`);

    const fonograma = await repertorioService.getFonogramaById(req.params.id);

    return res.status(200).json({ message: "Fonograma encontrado", data: fonograma });

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener el fonograma");
  }
};

export const updateFonograma = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Actualizando fonograma con ID: ${req.params.id}`);

    const updatedFonograma = await repertorioService.updateFonograma(req.params.id, req);

    return res.status(200).json({ message: "Fonograma actualizado exitosamente.", data: updatedFonograma });

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al actualizar el fonograma");
  }
};

export const deleteFonograma = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Eliminando fonograma con ID: ${req.params.id}`);

    const response = await repertorioService.deleteFonograma(req.params.id, req);

    return res.status(200).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al eliminar el fonograma");
  }
};

export const listFonogramas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Listando fonogramas.`);

    const response = await repertorioService.listFonogramas(req.query.search as string);

    return res.status(200).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al listar los fonogramas");
  }
};

export const addArchivoToFonograma = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Agregando archivo al fonograma con ID: ${req.params.id}`);

    const response = await repertorioService.addArchivoToFonograma(req.params.id, req);

    return res.status(200).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al agregar archivo al fonograma");
  }
};

export const getArchivoByFonograma = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Obteniendo archivo de fonograma con ID: ${req.params.id}`);

    const archivoPath = await repertorioService.getArchivoByFonograma(req.params.id);

    return res.sendFile(archivoPath);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener el archivo del fonograma");
  }
};

export const enviarFonograma = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Enviando fonogramas.`);

    const response = await repertorioService.enviarFonograma(req);

    return res.status(200).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al enviar los fonogramas");
  }
};

export const getNovedadesFonograma = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Obteniendo novedades de fonogramas.`);

    const response = await repertorioService.getNovedadesFonograma(req.query);

    return res.status(200).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener las novedades de fonogramas");
  }
};

export const getEnviosByFonograma = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Obteniendo envíos para el fonograma con ID: ${req.params.id}`);

    const response = await repertorioService.getEnviosByFonograma(req.params.id);

    return res.status(200).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener los envíos del fonograma");
  }
};

export const addParticipacionToFonograma = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Agregando participaciones al fonograma con ID: ${req.params.id}`);

    const response = await repertorioService.addParticipacionToFonograma(req.params.id, req);

    return res.status(201).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al agregar participaciones al fonograma");
  }
};

export const listParticipaciones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Listando participaciones para el fonograma con ID: ${req.params.id}`);

    const response = await repertorioService.listParticipaciones(req.params.id, req.query);

    return res.status(200).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener las participaciones del fonograma");
  }
};

export const updateParticipacion = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Actualizando participación en fonograma con ID: ${req.params.id}`);

    const response = await repertorioService.updateParticipacion(req.params.id, req.params.shareId, req);

    return res.status(200).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al actualizar la participación");
  }
};

export const deleteParticipacion = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Eliminando participación con ID: ${req.params.shareId} del fonograma con ID: ${req.params.id}`);

    const response = await repertorioService.deleteParticipacion(req.params.id, req.params.shareId, req);

    return res.status(200).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al eliminar la participación");
  }
};

export const addTerritorioToFonograma = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Agregando territorio al fonograma con ID: ${req.params.id}`);

    const response = await repertorioService.addTerritorioToFonograma(req.params.id, req);

    return res.status(201).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al agregar el territorio al fonograma");
  }
};

export const listTerritorios = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Listando territorios para el fonograma con ID: ${req.params.id}`);

    const response = await repertorioService.listTerritorios(req.params.id);

    return res.status(200).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener los territorios del fonograma");
  }
};

export const updateTerritorio = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Actualizando territorio con ID: ${req.params.territoryId} en fonograma con ID: ${req.params.id}`);

    const response = await repertorioService.updateTerritorio(req.params.id, req.params.territoryId, req);

    return res.status(200).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al actualizar el estado del territorio en el fonograma");
  }
};

export const deleteTerritorio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Eliminando territorio con ID: ${req.params.territoryId} del fonograma con ID: ${req.params.id}`);

    const response = await repertorioService.deleteTerritorio(req.params.id, req.params.territoryId, req);

    return res.status(200).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al eliminar el territorio del fonograma");
  }
};