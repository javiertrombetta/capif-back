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
      next(new BadRequestError(MESSAGES.ERROR.USER.NOT_FOUND));
      return;
    }

    logger.info(`${req.method} ${req.originalUrl} - Se hizo una solicitud para obtener archivos.`);

    const usuario = await findUsuarioById(userId);
    if (!usuario) {
      next(new NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
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
      res.status(403).json({ message: MESSAGES.ERROR.USER.NOT_AUTHORIZED });
      return;
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Se obtuvieron un total de ${archivos.length} archivos.`
    );
    res.status(200).json(archivos);
  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error: ${
        error instanceof Error ? error.message : MESSAGES.ERROR.GENERAL.UNKNOWN
      }`
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

    logger.info(`${req.method} ${req.originalUrl} - Se hizo una solicitud para crear un archivo.`);

    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [];
    if (!allowedTypes.includes(tipo_archivo)) {
      throw new BadRequestError(
        MESSAGES.ERROR.GENERAL.INVALID_FILE_TYPE.replace('%s', allowedTypes.join(', '))
      );
    }

    const newArchivo = await Archivo.create({
      id_usuario,
      nombre_archivo,
      ruta_archivo,
      tipo_archivo,
    });
    logger.info(
      `${req.method} ${req.originalUrl} - Archivo creado exitosamente con ID: ${newArchivo.id_archivo}`
    );
    res.status(201).json({ message: MESSAGES.SUCCESS.ARCHIVO.ARCHIVO_CREATED, newArchivo });
  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error: ${
        error instanceof Error ? error.message : MESSAGES.ERROR.GENERAL.UNKNOWN
      }`
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
    const userId =
      req.user && typeof req.user === 'object' && 'id' in req.user ? req.user.id : null;

    logger.info(
      `${req.method} ${req.originalUrl} - Se hizo una solicitud para actualizar el archivo con ID: ${id}.`
    );

    if (!userId) {
      next(new BadRequestError(MESSAGES.ERROR.USER.NOT_FOUND));
      return;
    }

    const archivo = await Archivo.findByPk(Number(id));
    if (!archivo) {
      logger.warn(`${req.method} ${req.originalUrl} - Archivo no encontrado`);
      throw new NotFoundError(MESSAGES.ERROR.ARCHIVO.NOT_FOUND);
    }

    const usuario = await findUsuarioById(userId);
    if (!usuario) {
      next(new NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
      return;
    }

    const rolAdmin = await findRolByDescripcion('administrador');

    if (usuario.rol_id !== rolAdmin?.id_rol && archivo.id_usuario !== usuario.id_usuario) {
      logger.warn(`${req.method} ${req.originalUrl} - ${MESSAGES.ERROR.USER.NOT_AUTHORIZED}`);
      res.status(403).json({ message: MESSAGES.ERROR.USER.NOT_AUTHORIZED });
      return;
    }

    const updatedArchivo = await Archivo.update(
      { nombre_archivo, ruta_archivo, tipo_archivo },
      { where: { id_archivo: Number(id) }, returning: true }
    );

    if (!updatedArchivo[1].length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Archivo no encontrado tras intentar actualizar`
      );
      throw new NotFoundError(MESSAGES.ERROR.ARCHIVO.NOT_FOUND);
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Archivo actualizado exitosamente con ID: ${id}.`
    );
    res.status(200).json({
      message: MESSAGES.SUCCESS.ARCHIVO.ARCHIVO_UPDATED,
      updatedArchivo: updatedArchivo[1][0],
    });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `${req.method} ${req.originalUrl} - Error: ${
        error instanceof Error ? error.message : MESSAGES.ERROR.GENERAL.UNKNOWN
      }`
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
    logger.info(
      `${req.method} ${req.originalUrl} - Se hizo una solicitud para eliminar el archivo con ID: ${id}.`
    );

    const archivo = await Archivo.findByPk(Number(id));

    if (!archivo) {
      logger.warn(`${req.method} ${req.originalUrl} - ${MESSAGES.ERROR.ARCHIVO.NOT_FOUND}`);
      throw new NotFoundError(MESSAGES.ERROR.ARCHIVO.NOT_FOUND);
    }

    const { nombre_archivo, id_usuario } = archivo;

    const result = await Archivo.destroy({ where: { id_archivo: Number(id) } });

    if (!result) {
      logger.warn(`${req.method} ${req.originalUrl} - ${MESSAGES.ERROR.ARCHIVO.NOT_FOUND}`);
      throw new NotFoundError(MESSAGES.ERROR.ARCHIVO.NOT_FOUND);
    }

    logger.info(
      `${req.method} ${req.originalUrl} - ${MESSAGES.SUCCESS.ARCHIVO.ARCHIVO_DELETED}. Detalles: nombre_archivo=${nombre_archivo}, id_usuario=${id_usuario}`
    );

    res.status(204).json({ message: MESSAGES.SUCCESS.ARCHIVO.ARCHIVO_DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `${req.method} ${req.originalUrl} - Error: ${
        error instanceof Error ? error.message : MESSAGES.ERROR.GENERAL.UNKNOWN
      }`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};
