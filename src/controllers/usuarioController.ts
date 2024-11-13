import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import { ParamsWithId } from '../interfaces/ParamsInRoutes';

import * as MESSAGES from '../services/messages';
import { sendEmail } from '../services/emailService';
import { findUsuario, findRolByDescripcion, findUsuariosByFilters } from '../services/userService';
import * as Err from '../services/customErrors';

import {
  Usuario,
  UsuarioMaestro,
  UsuarioRolTipo,
  AuditoriaEntidad,
  AuditoriaSesion,
} from '../models';


// BLOQUEAR O DESBLOQUEAR USUARIO
export const blockOrUnblockUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, isBlocked } = req.body;

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para ${
        isBlocked ? 'bloquear' : 'desbloquear'
      } al usuario`
    );

    // Realiza la consulta para obtener el usuario
    const userData = await findUsuario({ userId });
    const user = userData?.user;

    if (!user) {
      logger.warn(`${req.method} ${req.originalUrl} - No se encontró al usuario con ID: ${userId}`);
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    // Actualiza el estado de habilitación del usuario
    user.is_habilitado = !isBlocked;
    await user.save();

    // Mensaje de éxito según la acción realizada
    const message = isBlocked
      ? MESSAGES.SUCCESS.AUTH.USER_BLOCKED
      : MESSAGES.SUCCESS.AUTH.USER_UNBLOCKED;

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario con ID ${userId} ${
        isBlocked ? 'bloqueado' : 'desbloqueado'
      } correctamente.`
    );

    // Verifica que `req.user` es un JwtPayload y tiene la propiedad `id`
    const usuarioRegistranteId =
      typeof req.user === 'object' && 'id' in req.user ? req.user.id : null;
    if (!usuarioRegistranteId) {
      logger.warn(`${req.method} ${req.originalUrl} - ID de usuario no encontrado en el token.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Registrar en auditoría el cambio de estado de bloqueo
    await AuditoriaEntidad.create({
      usuario_originario_id: usuarioRegistranteId,
      usuario_destino_id: userId,
      entidad_afectada: 'Usuario',
      tipo_auditoria: 'CAMBIO',
      detalle: `Usuario ${isBlocked ? 'bloqueado' : 'desbloqueado'}`,
    });

    res.status(200).json({ message });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al bloquear/desbloquear usuario: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};

// CAMBIAR EL ROL A UN USUARIO
export const changeUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { userId, newRole } = req.body;

    // Verifica que el usuario autenticado esté presente en la solicitud
    const usuarioRegistranteId = req.user && typeof req.user === 'object' && 'id' in req.user ? req.user.id : null;
    if (!usuarioRegistranteId) {
      logger.warn(`${req.method} ${req.originalUrl} - ID de usuario no encontrado en el token.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Busca el usuario y su rol actual
    const userData = await findUsuario({ userId });
    const user = userData?.user;

    if (!user) {
      logger.warn(`${req.method} ${req.originalUrl} - No se encontró al usuario con ID: ${userId}`);
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    // Verifica que el tipo_registro del usuario sea "PRINCIPAL" o "SECUNDARIO"
    if (user.tipo_registro !== 'PRINCIPAL' && user.tipo_registro !== 'SECUNDARIO') {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario con ID ${userId} no está autorizado para cambiar de rol.`
      );
      return res.status(403).json({ message: MESSAGES.ERROR.VALIDATION.STATE_INVALID });
    }

    // Verifica si el rol deseado existe en la base de datos
    const rol = await findRolByDescripcion(newRole);
    if (!rol) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Rol inválido: ${newRole} para el usuario con ID: ${userId}`
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID);
    }

    // Busca el registro en UsuarioMaestro para este usuario
    const usuarioMaestro = await UsuarioMaestro.findOne({
      where: { usuario_registrante_id: user.id_usuario },
    });

    if (!usuarioMaestro) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró registro en UsuarioMaestro para el usuario con ID: ${userId}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NO_MAESTRO_RECORD);
    }

    // Actualiza el rol en UsuarioMaestro si ya existe el registro
    usuarioMaestro.rol_id = rol.id_tipo_rol;
    usuarioMaestro.fecha_ultimo_cambio_rol = new Date();
    await usuarioMaestro.save();

    logger.info(
      `${req.method} ${req.originalUrl} - Rol del usuario con ID ${userId} actualizado correctamente a ${newRole}.`
    );

    // Registrar la acción en AuditoriaEntidad
    await AuditoriaEntidad.create({
      usuario_originario_id: usuarioRegistranteId,
      usuario_destino_id: user.id_usuario,
      entidad_afectada: 'Usuario',
      tipo_auditoria: 'CAMBIO',
      detalle: `Rol actualizado a ${newRole}`,
    });

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.ROLE_UPDATED });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al cambiar el rol de usuario: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};

// OBTENER TODOS LOS USUARIOS SEGÚN CONDICIONES
export const getUsers = async (
  req: Request<ParamsWithId>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { rol, ...filters } = req.query;

    if (id) {
      logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para obtener usuario`);

      const user = await findUsuario({ userId: id });
      if (!user) {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado: ${id}`);
        return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
      }

      logger.info(`${req.method} ${req.originalUrl} - Usuario encontrado con éxito: ${id}`);
      res.status(200).json(user);
    }
  
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener usuarios filtrados.`,
      { rol, filters }
    );

    const userFilters: any = {};

    if (rol) {
      const rolObj = await findRolByDescripcion(String(rol));
      if (!rolObj) {
        logger.warn(`${req.method} ${req.originalUrl} - Rol no encontrado: ${rol}.`);
        return next(new Err.NotFoundError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID));
      }
      userFilters.rol_id = rolObj.id_tipo_rol;
    }

    const users = await findUsuariosByFilters(userFilters, []);

    logger.info(
      `${req.method} ${req.originalUrl} - Se encontraron exitosamente ${users.length} usuarios.`
    );
    res.status(200).json(users);
  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error: ${
        error instanceof Error ? error.message : 'Error desconocido.'
      }`
    );
    next(new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

