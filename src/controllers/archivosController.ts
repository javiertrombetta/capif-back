import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import * as MESSAGES from '../services/messages';
import { NotFoundError, BadRequestError, InternalServerError } from '../services/customErrors';
import { Archivo } from '../models';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import { findUsuarioById } from '../services/userService';
import { findRolByDescripcion } from '../services/roleService';

export const getArchivosByRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId =
      req.user && typeof req.user === 'object' && 'id' in req.user ? req.user.id : null;
    if (!userId) {
      next(new BadRequestError('ID de usuario no encontrado en la solicitud'));
      return;
    }

    const usuario = await findUsuarioById(userId);
    if (!usuario) {
      next(new NotFoundError(MESSAGES.ERROR.GENERAL.NOT_FOUND));
      return;
    }

    const rolAdmin = await findRolByDescripcion('administrador');
    const rolProductor = await findRolByDescripcion('productor');

    let archivos;
    if (usuario.rol_id === rolAdmin?.id_rol) {
      archivos = await Archivo.findAll();
    } else if (usuario.rol_id === rolProductor?.id_rol) {
      archivos = await Archivo.findAll({
        where: { id_usuario: usuario.id_usuario },
      });
    } else {
      res.status(403).json({ message: MESSAGES.ERROR.GENERAL.NOT_AUTHORIZED });
      return;
    }

    logger.info(`GET /archivos - Successfully fetched ${archivos.length} archivos`);
    res.status(200).json(archivos);
  } catch (error) {
    logger.error(
      `GET /archivos - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const createArchivo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id_usuario, nombre_archivo, ruta_archivo, tipo_archivo } = req.body; 
    logger.info('POST /archivos - Request received to create archivo');
    const newArchivo = await Archivo.create({
      id_usuario,
      nombre_archivo,
      ruta_archivo,
      tipo_archivo,
    });
    logger.info(`POST /archivos - Successfully created archivo with ID: ${newArchivo.id_archivo}`);
    res.status(201).json({ message: MESSAGES.SUCCESS.REGISTER, newArchivo });
  } catch (error) {
    logger.error(
      `POST /archivos - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const updateArchivo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre_archivo, ruta_archivo, tipo_archivo } = req.body;
    logger.info(`PUT /archivos/${id} - Request received to update archivo`);
    const updatedArchivo = await Archivo.update(
      { nombre_archivo, ruta_archivo, tipo_archivo },
      { where: { id_archivo: Number(id) }, returning: true }
    );
    if (!updatedArchivo[1].length) {
      logger.warn(`PUT /archivos/${id} - Archivo not found`);
      throw new NotFoundError(MESSAGES.ERROR.GENERAL.NOT_FOUND);
    }
    logger.info(`PUT /archivos/${id} - Successfully updated archivo`);
    res
      .status(200)
      .json({ message: MESSAGES.SUCCESS.ROLE_UPDATED, updatedArchivo: updatedArchivo[1][0] });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `PUT /archivos/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const deleteArchivo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`DELETE /archivos/${id} - Request received to delete archivo`);
    const result = await Archivo.destroy({ where: { id_archivo: Number(id) } });
    if (!result) {
      logger.warn(`DELETE /archivos/${id} - Archivo not found`);
      throw new NotFoundError(MESSAGES.ERROR.GENERAL.NOT_FOUND);
    }
    logger.info(`DELETE /archivos/${id} - Successfully deleted archivo`);
    res.status(204).json({ message: MESSAGES.SUCCESS.USER_DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `DELETE /archivos/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};
