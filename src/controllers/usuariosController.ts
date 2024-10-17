import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import logger from '../config/logger';

import {
  findUsuariosByFilters,
  createUsuario,
  findUsuarioById,
  findUsuarioByEmail,
  updateUsuarioById,
  deleteUsuarioById,
  findRolByDescripcion,
  findEstadoByDescripcion,
  findTipoPersonaByDescripcion,
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
    const {
      nombre,
      apellido,
      email,
      password,
      rol,
      estado,
      cuit,
      tipo_persona,
      domicilio,
      ciudad,
      provincia,
      pais,
      codigo_postal,
      telefono,
    } = req.body;

    logger.info('POST /users - Request received to create user', { nombre, email, rol });

    if (
      !nombre ||
      !apellido ||
      !email ||
      !password ||
      !rol ||
      !estado ||
      !cuit ||
      !tipo_persona ||
      !ciudad ||
      !provincia ||
      !pais ||
      !codigo_postal
    ) {
      logger.warn('POST /users - Bad request, missing required fields');
      return next(new BadRequestError(MESSAGES.ERROR.VALIDATION.GENERAL));
    }

    const existingUser = await findUsuarioByEmail(email);
    if (existingUser) {
      logger.warn('POST /users - Email already registered');
      return next(new BadRequestError(MESSAGES.ERROR.USER.ALREADY_REGISTERED));
    }

    const [rolObj, estadoObj, tipoPersonaObj] = await Promise.all([
      findRolByDescripcion(rol),
      findEstadoByDescripcion(estado),
      findTipoPersonaByDescripcion(tipo_persona),
    ]);

    if (!rolObj) {
      logger.warn('POST /users - Invalid role');
      return next(new BadRequestError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID));
    }
    if (!estadoObj) {
      logger.warn('POST /users - Invalid state');
      return next(new BadRequestError(MESSAGES.ERROR.VALIDATION.STATE_INVALID));
    }
    if (!tipoPersonaObj) {
      logger.warn('POST /users - Invalid person type');
      return next(new BadRequestError(MESSAGES.ERROR.VALIDATION.INVALID_USER_TYPE));
    }

    const hashedClave = await bcrypt.hash(password, 10);

    const newUserData = {
      nombre,
      apellido,
      email,
      clave: hashedClave,
      rol_id: rolObj.id_rol,
      estado_id: estadoObj.id_estado,
      cuit,
      tipo_persona_id: tipoPersonaObj.id_tipo_persona,
      domicilio,
      ciudad,
      provincia,
      pais,
      codigo_postal,
      telefono,
    };

    const newUser = await createUsuario(newUserData);

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

    const user = await findUsuarioById(id);
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
    const { id_usuario } = req.params;
    logger.info(`PUT /users/${id_usuario} - Request received to update user`);

    const updatedUser = await updateUsuarioById(id_usuario, req.body);
    if (!updatedUser) {
      logger.warn(`PUT /users/${id_usuario} - User not found`);
      return next(new NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    logger.info(`PUT /users/${id_usuario} - Successfully updated user`);
    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.ROLE_UPDATED, updatedUser });
  } catch (error) {
    const { id_usuario } = req.params;
    logger.error(
      `PUT /users/${id_usuario} - Error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
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

    const result = await deleteUsuarioById(id);
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