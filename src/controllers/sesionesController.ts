import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

import * as MESSAGES from '../services/messages';
import { NotFoundError, InternalServerError } from '../services/customErrors';

import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest'

import { Sesion, TipoActividad, LogActividad } from '../models';

export const getSesiones = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info('GET /sesiones - Request received to fetch all active sessions');

    const sesiones = await Sesion.findAll();

    if (!sesiones.length) {
      logger.warn('No se encontraron sesiones activas');
      throw new NotFoundError(MESSAGES.ERROR.SESION.NOT_FOUND);
    }

    const userId = typeof req.user === 'string' ? req.user : req.user?.id;
    if (!userId) {
      throw new InternalServerError('No se pudo identificar al usuario.');
    }
   
    const tipoActividad = await TipoActividad.findOne({
      where: { descripcion: 'Acceso al sistema' },
    });

    if (tipoActividad) {
      await LogActividad.create({
        id_usuario: userId,
        actividad: 'Consulta de sesiones activas',
        id_tipo_actividad: tipoActividad.id_tipo_actividad,
      });
    }

    res.status(200).json(sesiones);
  } catch (error) {
    logger.error(
      `GET /sesiones - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const deleteSesion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`DELETE /sesiones/${id} - Request received to delete session ID: ${id}`);

    const sesion = await Sesion.findByPk(id);

    if (!sesion) {
      logger.warn(`Sesion con ID ${id} no encontrada`);
      throw new NotFoundError(MESSAGES.ERROR.SESION.NOT_FOUND);
    }

    await sesion.destroy();
    logger.info(`DELETE /sesiones/${id} - Sesion eliminada correctamente`);

    const userId = typeof req.user === 'string' ? req.user : req.user?.id;
    if (!userId) {
      throw new InternalServerError('No se pudo identificar al usuario.');
    }

    const tipoActividad = await TipoActividad.findOne({
      where: { descripcion: 'Eliminación de usuario' },
    });

    if (tipoActividad) {
      await LogActividad.create({
        id_usuario: userId,
        actividad: 'Eliminación de sesión',
        id_tipo_actividad: tipoActividad.id_tipo_actividad,
      });
    }

    res.status(200).json({ message: MESSAGES.SUCCESS.SESION.DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `DELETE /sesiones/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const closeUserSessions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id_usuario } = req.params;
    logger.info(
      `DELETE /sesiones/usuario/${id_usuario} - Request received to close all sessions for user ID: ${id_usuario}`
    );

    const sesiones = await Sesion.findAll({ where: { id_usuario } });

    if (!sesiones.length) {
      logger.warn(`No se encontraron sesiones activas para el usuario con ID ${id_usuario}`);
      throw new NotFoundError(MESSAGES.ERROR.SESION.NOT_FOUND);
    }

    await Promise.all(sesiones.map((sesion) => sesion.destroy()));
    logger.info(
      `DELETE /sesiones/usuario/${id_usuario} - Todas las sesiones del usuario han sido cerradas`
    );

    const userId = typeof req.user === 'string' ? req.user : req.user?.id;
    if (!userId) {
      throw new InternalServerError('No se pudo identificar al usuario.');
    }

    const tipoActividad = await TipoActividad.findOne({
      where: { descripcion: 'Cierre de sesión de usuario' },
    });

    if (tipoActividad) {
      await LogActividad.create({
        id_usuario: userId,
        actividad: 'Cierre de sesiones de usuario',
        id_tipo_actividad: tipoActividad.id_tipo_actividad,
      });
    }


    res.status(200).json({ message: MESSAGES.SUCCESS.SESION.USER_SESSIONS_CLOSED });
  } catch (error) {
    const { id_usuario } = req.params;
    logger.error(
      `DELETE /sesiones/usuario/${id_usuario} - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};
