import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

import {
  findUsuariosByFilters,
  createUsuario,
  findUsuarioById,
  updateUsuarioById,
  deleteUsuarioById,
} from '../services/userService';
import { NotFoundError, BadRequestError, InternalServerError } from '../services/customErrors';
import * as MESSAGES from '../services/messages';

import { ParamsWithId } from '../interfaces/ParamsInRoutes';

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rol_id, estado_id, tipo_persona_id } = req.query;

    logger.info('GET /users - Request received', { rol_id, estado_id, tipo_persona_id });

    const filters: any = {};
    if (rol_id) filters.rol_id = rol_id;
    if (estado_id) filters.estado_id = estado_id;
    if (tipo_persona_id) filters.tipo_persona_id = tipo_persona_id;

    const users = await findUsuariosByFilters(filters);

    logger.info(`GET /users - Successfully fetched ${users.length} users`);
    res.status(200).json(users);
  } catch (error) {
    logger.error(`GET /users - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getRegistrosPendientes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info('GET /users/pending - Request received');

    const pendingUsers = await findUsuariosByFilters({ isRegistro_pendiente: true });

    logger.info(`GET /users/pending - Successfully fetched ${pendingUsers.length} pending users`);
    res.status(200).json(pendingUsers);
  } catch (error) {
    logger.error(
      `GET /users/pending - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nombre, apellido, email, clave, rol_id, estado_id, cuit, tipo_persona_id } = req.body;

    logger.info('POST /users - Request received to create user', { nombre, email, rol_id });

    if (
      !nombre ||
      !apellido ||
      !email ||
      !clave ||
      !rol_id ||
      !estado_id ||
      !cuit ||
      !tipo_persona_id
    ) {
      logger.warn('POST /users - Bad request, missing required fields');
      return next(new BadRequestError(MESSAGES.ERROR.VALIDATION.GENERAL));
    }

    const newUser = await createUsuario(req.body);

    logger.info(`POST /users - Successfully created user with ID: ${newUser.id_usuario}`);
    res.status(201).json({ message: MESSAGES.SUCCESS.AUTH.REGISTER, newUser });
  } catch (error) {
    logger.error(
      `POST /users - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getUserById = async (
  req: Request<ParamsWithId>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`GET /users/${id} - Request received`);

    const user = await findUsuarioById(Number(id));
    if (!user) {
      logger.warn(`GET /users/${id} - User not found`);
      return next(new NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    logger.info(`GET /users/${id} - Successfully fetched user`);
    res.status(200).json(user);
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `GET /users/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const updateUser = async (
  req: Request<ParamsWithId>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`PUT /users/${id} - Request received to update user`);

    const updatedUser = await updateUsuarioById(Number(id), req.body);
    if (!updatedUser) {
      logger.warn(`PUT /users/${id} - User not found`);
      return next(new NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    logger.info(`PUT /users/${id} - Successfully updated user`);
    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.ROLE_UPDATED, updatedUser });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `PUT /users/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const deleteUser = async (
  req: Request<ParamsWithId>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info(`DELETE /users/${id} - Request received to delete user`);

    const result = await deleteUsuarioById(Number(id));
    if (!result) {
      logger.warn(`DELETE /users/${id} - User not found`);
      return next(new NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    logger.info(`DELETE /users/${id} - Successfully deleted user`);
    res.status(204).json({ message: MESSAGES.SUCCESS.AUTH.USER_DELETED });
  } catch (error) {
    const { id } = req.params;
    logger.error(
      `DELETE /users/${id} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    next(new InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};