import { Request, NextFunction } from 'express';
import logger from '../config/logger';
import * as Err from '../utils/customErrors';
import { findUsuarios } from './userService';
import * as MESSAGES from "../utils/messages";
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import { UsuarioResponse } from '../interfaces/UsuarioResponse';

/**
 * Obtiene y valida al usuario autenticado basado en el token.
 * @param req La solicitud del cliente con el token del usuario.
 * @returns El usuario autenticado.
 */
export const getAuthenticatedUser = async (req: AuthenticatedRequest): Promise<UsuarioResponse> => {
  const userAuthId = req.userId as string;

  if (!userAuthId) {
    logger.warn(
      `${req.method} ${req.originalUrl} - Usuario sin token válido.`
    );
    throw new Err.UnauthorizedError(MESSAGES.ERROR.VALIDATION.NO_TOKEN_PROVIDED);
  }

  const authData = await findUsuarios({ userId: userAuthId, limit: 2 });

  if (!authData || !authData.users.length) {
    logger.warn(
      `${req.method} ${req.originalUrl} - Usuario autenticado no encontrado: ${userAuthId}`
    );
    throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
  }

  if (!authData.isSingleUser) {
    logger.warn(
      `${req.method} ${req.originalUrl} - Más de un usuario autenticado encontrado con ID: ${userAuthId}`
    );
    throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_SINGLE_USER);
  }

  return authData.users[0];
};

export interface Filters {
  userId?: string;
  email?: string;
  nombre?: string;
  apellido?: string;
  tipo_registro?: string | string[];
  rolId?: string;
  nombre_rol?: string;
  productoraId?: string;
  productoraNombre?: string;
  limit?: number;
  offset?: number;
}

/**
 * Obtiene y valida el usuario target basado en los filtros proporcionados.
 * @param filters Los filtros para buscar el usuario target.
 * @param req La solicitud del cliente para los logs (puede ser AuthenticatedRequest o Request).
 * @returns El usuario único encontrado si es único y coincide con los filtros.
 * @throws NotFoundError si no se encuentran usuarios.
 * @throws NotFoundError si se encuentran múltiples usuarios pero se espera uno solo.
 */
export const getTargetUser = async (
  filters: Filters,
  req: AuthenticatedRequest | Request
): Promise<UsuarioResponse> => {

  if (!Object.keys(filters).length) {
    throw new Err.BadRequestError("Al menos un filtro debe ser proporcionado en la búsqueda del usuario.");
  }

  const limitedFilters = { ...filters, limit: 2 };
  const userData = await findUsuarios(limitedFilters);
  console.log('USERDATA: ' + userData);

  if (!userData || !userData.users.length) {
    logger.warn(
      `${req.method} ${req.originalUrl} - Usuario no encontrado.`
    );
    throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
  }

  if (!userData.isSingleUser) {
    logger.warn(
      `${req.method} ${req.originalUrl} - Más de un usuario encontrado en la solicitud.`
    );
    throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_SINGLE_USER);
  }

  return userData.users[0];
};

  
  
