import { Request, NextFunction } from 'express';
import logger from '../config/logger';
import * as Err from '../utils/customErrors';
import { findUsuarios } from './userService';
import * as MESSAGES from "../utils/messages";
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import { UsuarioResponse } from '../interfaces/UsuarioResponse';
import { AuditoriaCambio, AuditoriaSesion, Productora, ProductoraDocumento, ProductoraMensaje, UsuarioVistaMaestro } from '../models';
import { Op } from 'sequelize';

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

// Eliminar la productora por ID
export const deleteProductoraById = async (productoraId: string) => {
  if (!productoraId) {
    throw new Error("El ID de la productora es obligatorio.");
  }

  await Productora.destroy({
    where: { id_productora: productoraId },
  });

  console.log(`Productora con ID ${productoraId} eliminada.`);
};

// Eliminar documentos asociados a la productora
export const deleteProductoraDocumentos = async (productoraId: string) => {
  if (!productoraId) {
    throw new Error("El ID de la productora es obligatorio.");
  }

  await ProductoraDocumento.destroy({
    where: { productora_id: productoraId },
  });

  console.log(
    `Documentos asociados a la productora con ID ${productoraId} eliminados.`
  );
};

// Eliminar mensajes asociados a la productora
export const deleteProductoraMensajes = async (productoraId: string) => {
  if (!productoraId) {
    throw new Error("El ID de la productora es obligatorio.");
  }

  await ProductoraMensaje.destroy({
    where: { productora_id: productoraId },
  });

  console.log(
    `Mensajes asociados a la productora con ID ${productoraId} eliminados.`
  );
};

// Eliminar vistas asociadas al usuario
export const deleteUsuarioVistaMaestro = async (usuarioId: string) => {
  if (!usuarioId) {
    throw new Error("El ID del usuario es obligatorio.");
  }

  await UsuarioVistaMaestro.destroy({
    where: { usuario_id: usuarioId },
  });

  console.log(`Vistas asociadas al usuario con ID ${usuarioId} eliminadas.`);
};

// Eliminar registros de auditoría asociados al usuario
export const deleteAuditoriasByUsuario = async (usuarioId: string) => {
  if (!usuarioId) {
    throw new Error("El ID del usuario es obligatorio.");
  }

  await AuditoriaCambio.destroy({
    where: {
      [Op.or]: [
        { usuario_originario_id: usuarioId },
        { usuario_destino_id: usuarioId },
      ],
    },
  });

  await AuditoriaSesion.destroy({
    where: { usuario_registrante_id: usuarioId },
  });

  console.log(`Auditorías asociadas al usuario con ID ${usuarioId} eliminadas.`);
};
  
  
