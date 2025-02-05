import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import bcrypt from "bcrypt";

import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";
import { UsuarioResponse } from "../interfaces/UsuarioResponse";

import {
  findUsuarios,
  assignVistasToUser,
  toggleUserViewStatusService,
  updateUserStatusById,
  updateUserData,
  deleteUserRelations,
  deleteUsuarioById,
  findVistasByUsuario,
} from "../services/userService";
import { getAuthenticatedUser, getTargetUser } from "../services/authService";
import { registrarAuditoria } from "../services/auditService";
import { handleGeneralError } from "../services/errorService";

import * as MESSAGES from "../utils/messages";
import * as Err from "../utils/customErrors";


// HABILITAR O DESHABILITAR EL TIPO REGISTRO DE UN USUARIO
export const availableDisableUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { usuarioId } = req.params;

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Buscar el usuario al que se le cambiará el estado mediante findUsuario
    const { user: targetUser }: UsuarioResponse = await getTargetUser({ userId: usuarioId }, req);

    // Alternar el tipo_registro entre HABILITADO y DESHABILITADO
    const nuevoEstado = targetUser.tipo_registro === "HABILITADO" ? "DESHABILITADO" : "HABILITADO";
    await updateUserStatusById(targetUser.id_usuario, nuevoEstado);

    // Crear una auditoría
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Cambio de estado a ${nuevoEstado}`,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario ${nuevoEstado} exitosamente: ${authUser.id_usuario}`
    );
    res.status(200).json({ message: `Usuario ${nuevoEstado} exitosamente.` });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al cambiar estado del usuario');
  }
};

// BLOQUEAR O DESBLOQUEAR USUARIO PARA SU LOGIN
export const blockOrUnblockUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { usuarioId } = req.params;
    const { isBlocked } = req.body;

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para ${
        isBlocked ? "bloquear" : "desbloquear"
      } al usuario`
    );

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Buscar el usuario al que se le cambiará el estado mediante findUsuario
    const { user: targetUser }: UsuarioResponse = await getTargetUser({ userId: usuarioId }, req);

    // Verificar si el usuario está DESHABILITADO
    if (targetUser.tipo_registro === "DESHABILITADO") {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se puede ${
          isBlocked ? "bloquear" : "desbloquear"
        } al usuario con ID ${targetUser.id_usuario} porque está DESHABILITADO.`
      );
      return next(new Err.ForbiddenError(MESSAGES.ERROR.USER.CANNOT_MODIFY_DISABLED_USER));
    }

    // Actualiza el estado de habilitación del usuario
    targetUser.is_bloqueado = isBlocked;
    await targetUser.save();

    // Mensaje de éxito según la acción realizada
    const message = isBlocked
      ? MESSAGES.SUCCESS.AUTH.USER_BLOCKED
      : MESSAGES.SUCCESS.AUTH.USER_UNBLOCKED;

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario con ID ${targetUser.id_usuario} ${
        isBlocked ? "bloqueado" : "desbloqueado"
      } correctamente.`
    );

    // Registrar en auditoría el cambio de estado de bloqueo  
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Usuario ${isBlocked ? "bloqueado" : "desbloqueado"}`,
    });

    res.status(200).json({ message });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al bloquear/desbloquear el usuario');
  }
};

// OBTENER TODOS LOS USUARIOS SEGÚN CONDICIONES
export const getUsers = async (
  req: Request<{}, {}, {}, { [key: string]: string | undefined }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { query } = req;

    logger.info(`${req.method} ${req.originalUrl} - Solicitud para obtener usuarios.`, query);

    const queryMapping: Record<string, string> = {
      usuarioId: "userId",
      estado: "tipo_registro",
      rolNombre: "nombre_rol",
    };

    const filters: Record<string, any> = {};
    for (const [key, value] of Object.entries(query)) {
      if (!value) continue;

      const mappedKey = queryMapping[key] || key;
      filters[mappedKey] = ["limit", "offset"].includes(key) ? Number(value) : value;
    }

    const usuarios = await findUsuarios(filters);

    if (usuarios.users.length < 1) {
      logger.warn(`${req.method} ${req.originalUrl} - No se encontraron usuarios con los filtros proporcionados.`);
    }
    else if(usuarios.users.length == 1){
      logger.info(`${req.method} ${req.originalUrl} - Se encontró ${usuarios.users.length} usuario.`);
    }    
    else{
      logger.info(`${req.method} ${req.originalUrl} - Se encontron ${usuarios.users.length} usuarios.`);
    }

    // Filtrar y mapear las vistas asociadas para devolver solo los campos requeridos
    const filteredUsers = usuarios.users.map((usuario) => ({
      id: usuario.user.id_usuario,
      email: usuario.user.email,
      nombre: usuario.user.nombre,
      apellido: usuario.user.apellido,
      telefono: usuario.user.telefono,
      rol: usuario.user.rol?.nombre_rol || null,
      estado: usuario.user.tipo_registro,
      isBloqueado: usuario.user.is_bloqueado,
      productoras: usuario.maestros.map((maestro) => ({
        id: maestro.productora?.id_productora,
        productora: maestro.productora?.nombre_productora,
      })),
      vistas: usuario.vistas
        .filter((vistaMaestro) => vistaMaestro.vista)
        .map((vistaMaestro) => ({
          id_vista_maestro: vistaMaestro.id_vista_maestro,
          is_habilitado: vistaMaestro.is_habilitado,
          nombre_vista: vistaMaestro.vista?.nombre_vista,
          nombre_vista_superior: vistaMaestro.vista?.nombre_vista_superior,
        })),
    }));

    res.status(200).json({
      total: usuarios.total,
      totalPages: Math.ceil(usuarios.total / (filters.limit || 50)),
      currentPage: filters.offset ? Math.floor(filters.offset / (filters.limit || 50)) + 1 : 1,
      data: filteredUsers,
    });
  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al buscar el o los usuarios");
  }
};

// ACTUALIZAR LOS DATOS DE UN USUARIO
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud para actualizar usuario`);

    const { usuarioId } = req.params;
    const { datosUsuario } = req.body;

    // Paso 1: Buscar el usuario autenticado y el usuario objetivo
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);
    const { user: targetUser }: UsuarioResponse = await getTargetUser({ userId: usuarioId }, req);    

    // Paso 2: Actualizar los datos del usuario mediante el servicio
    await updateUserData(targetUser, datosUsuario);

    // Paso 3: Registrar auditoría
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: "Actualización de datos del usuario",
    });

    logger.info(`${req.method} ${req.originalUrl} - Usuario actualizado exitosamente.`);

    res.status(200).json({ message: MESSAGES.SUCCESS.USUARIO.USUARIO_UPDATED });
    
  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al actualizar el usuario");
  }
};

// ELIMINAR UN USUARIO
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { usuarioId } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Solicitud para eliminar usuario`);

    // Paso 1: Buscar usuarios
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);
    const { user: targetUser, maestros: targetMaestros }: UsuarioResponse = await getTargetUser({ userId: usuarioId }, req);

    // Paso 2: Validar que no se elimine la cuenta propia
    if (authUser === targetUser) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no puede eliminar su propia cuenta.`);
      return next(
        new Err.ForbiddenError(MESSAGES.ERROR.USER.CANNOT_DELETE_SELF)
      );
    }

    // Paso 3: Validar si es productor_principal con productoras asociadas
    if (!targetUser.rol) {
      logger.warn(`${req.method} ${req.originalUrl} - El usuario autenticado no tiene un rol asignado`);
      return next(
        new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED)
      );
    }
        
    const hasAssociatedProductoras = targetMaestros.some((maestro) => maestro.productora);
    if (targetUser.rol.nombre_rol === "productor_principal" && hasAssociatedProductoras) {
      logger.warn(`${req.method} ${req.originalUrl} - El usuario tiene productoras asociadas y no puede ser eliminado.`);
      return next(new Err.ConflictError(MESSAGES.ERROR.USER.CANNOT_DELETE_PRINCIPAL_WITH_PRODUCTORA));
    }

    // Paso 4: Eliminar relaciones y registros asociados
    await deleteUserRelations(targetUser.id_usuario, authUser.id_usuario, targetMaestros);

    // Paso 5: Eliminar el usuario
    await deleteUsuarioById(targetUser.id_usuario);

    // Paso 5: Registrar auditoría
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "BAJA",
      detalle: "Eliminación de usuario",
    });

    logger.info(`${req.method} ${req.originalUrl} - Usuario eliminado exitosamente: ${targetUser.id_usuario}`);    
    res.status(200).json({ message: MESSAGES.SUCCESS.USUARIO.USUARIO_DELETED });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al eliminar usuario');  
  }
};

export const getVistasByUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { usuarioId } = req.params;
    const vistas = await findVistasByUsuario(usuarioId);
    res.status(200).json(vistas);
  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener vistas del usuario");
  }
};

export const updateUserViews = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { usuarioId } = req.params;
    const { roleName } = req.body;

    // Buscar usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);
    const { user: targetUser }: UsuarioResponse = await getTargetUser({ userId: usuarioId }, req);

    if (!targetUser.rol) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario sin rol asignado`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED)
      );
    }

    await assignVistasToUser(targetUser.id_usuario, undefined, roleName);

    logger.info(
      `${req.method} ${req.originalUrl} - Vistas actualizadas correctamente para el usuario: ${targetUser.id_usuario}`
    );

    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Actualizadas las vistas al rol ${targetUser.rol.nombre_rol} del usuario ID: ${targetUser.id_usuario}`,
    });

    res.status(200).json({ message: "Vistas actualizadas exitosamente" });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al actualizar vistas del usuario');    
  }
};

export const toggleUserViewStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { usuarioId } = req.params;
    const { vistas } = req.body;

    const { user: authUser, maestros: authMaestros }: UsuarioResponse = await getAuthenticatedUser(req);
    const { user: targetUser, maestros: targetMaestros }: UsuarioResponse = await getTargetUser({ userId: usuarioId }, req);

    // Validar que las propiedades necesarias existen
    if (!authUser.rol || !authUser.rol.nombre_rol) {
      throw new Err.InternalServerError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID);
    }

    if (!targetUser.rol || !targetUser.rol.nombre_rol) {
      throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID);
    }

    if (!authMaestros.length && authUser.rol.nombre_rol === "productor_principal") {
      throw new Err.InternalServerError(MESSAGES.ERROR.USER.NO_ASSOCIATED_PRODUCTORAS);
    }

    if (!targetMaestros.length) {
      throw new Err.BadRequestError(MESSAGES.ERROR.USER.NO_ASSOCIATED_PRODUCTORAS);
    }

    // Validar permisos según el rol
    if (authUser.rol.nombre_rol === "productor_principal") {
      if (targetUser.rol.nombre_rol !== "productor_secundario") {
        throw new Err.ForbiddenError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
      }
      if (authMaestros[0].productora_id !== targetMaestros[0].productora_id) {
        throw new Err.ForbiddenError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
      }
    } else if (authUser.rol.nombre_rol === "admin_secundario") {
      if (targetUser.rol.nombre_rol === "admin_principal") {
        throw new Err.ForbiddenError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
      }
    } else if (authUser.rol.nombre_rol !== "admin_principal") {
      throw new Err.ForbiddenError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    await toggleUserViewStatusService(usuarioId, vistas);

    logger.info(
      `${req.method} ${req.originalUrl} - Estado de vistas actualizado correctamente para el usuario: ${targetUser.id_usuario}`
    );

    res.status(200).json({ message: "Estado de vistas actualizado exitosamente" });

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al cambiar el estado de vistas del usuario");
  }
};

// CAMBIAR LA CLAVE DE UN USUARIO
export const changeUserPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para cambiar la clave del usuario`);

    const { usuarioId } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // Validar contraseñas
    if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
      logger.warn(`${req.method} ${req.originalUrl} - Las contraseñas no coinciden.`);
      return next(new Err.ConflictError(MESSAGES.ERROR.PASSWORD.CONFIRMATION_MISMATCH));
    }

    // Obtener información del usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    if (!authUser.rol) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario sin rol asignado.`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED));
    }

    // Determinar si el cambio es para el propio usuario o para otro
    const isSelfUpdate = !usuarioId || authUser.id_usuario === usuarioId;

    if (!isSelfUpdate) {
      // Validar que el usuario tenga permisos para cambiar la clave de otros
      if (!["admin_principal", "admin_secundario"].includes(authUser.rol.nombre_rol)) {
        logger.warn(
          `${req.method} ${req.originalUrl} - Usuario con rol no autorizado para cambiar la clave de otro usuario: ${authUser.rol.nombre_rol}.`
        );
        return next(new Err.ForbiddenError(MESSAGES.ERROR.USER.NOT_AUTHORIZED_TO_CHANGE_PASSWORD));
      }
    }

    // Determinar el usuario objetivo
    const targetUserId = isSelfUpdate ? authUser.id_usuario : usuarioId;

    // Buscar al usuario objetivo
    const { user: targetUser }: UsuarioResponse = await getTargetUser({ userId: targetUserId }, req);

    if (!targetUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario objetivo no encontrado: ${targetUserId}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    // Cifrar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la clave del usuario
    targetUser.clave = hashedPassword;
    await targetUser.save();

    // Registrar auditoría
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: isSelfUpdate
        ? `Clave actualizada por el propio usuario.`
        : `Clave actualizada para el usuario con ID ${targetUser.id_usuario} por ${authUser.id_usuario}.`,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Clave actualizada correctamente para el usuario con ID ${targetUserId}.`
    );

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.PASSWORD_RESET });
    
  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al cambiar la clave del usuario");
  }
};

// OBTENER LOS DATOS DEL USUARIO
export const getUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para obtener los datos del usuario`);

    // Verifica el usuario autenticado
    const { user: authUser, maestros: authMaestros, vistas: authVistas }: UsuarioResponse = await getAuthenticatedUser(req);

    // Filtrar los datos sensibles del usuario
    const filteredUser = {
      id: authUser.id_usuario,
      email: authUser.email,
      nombre: authUser.nombre,
      apellido: authUser.apellido,
      telefono: authUser.telefono,
      rol: authUser.rol?.nombre_rol || null,
      estado: authUser.tipo_registro,
      isBloqueado: authUser.is_bloqueado,
    };

    // Filtrar los datos de los maestros eliminando los elementos sin datos válidos
    const filteredMaestros = authMaestros
      .filter(authMaestro => authMaestro.productora)
      .map(authMaestro => ({
        id: authMaestro.productora!.id_productora,
        productora: authMaestro.productora!.nombre_productora,
      }));

    // Filtrar los datos de las vistas eliminando los elementos sin datos válidos
    const filteredVistas = authVistas
      .filter(vistaMaestro => vistaMaestro.vista)
      .map(vistaMaestro => ({
        vista: vistaMaestro.vista!.nombre_vista,
        vista_superior: vistaMaestro.vista!.nombre_vista_superior,
      }));

    // Respuesta filtrada
    res.status(200).json({
      usuario: filteredUser,
      productoras: filteredMaestros,
      vistas: filteredVistas,
    });
  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener los datos del usuario");
  }
};