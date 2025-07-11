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
  removeUsuarioMaestro,
} from "../services/userService";
import { getAuthenticatedUser, getTargetUser } from "../services/authService";
import { registrarAuditoria } from "../services/auditService";
import { handleGeneralError } from "../services/errorService";

import * as MESSAGES from "../utils/messages";
import * as Err from "../utils/customErrors";
import { formatUserResponse } from "../utils/formatResponse";


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
  req: AuthenticatedRequest,
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

    // Obtener el usuario autenticado con su información de productora
    const { user: authUser, maestros: authMaestros }: UsuarioResponse = await getAuthenticatedUser(req);

    if (!authUser.rol) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario sin rol asignado`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED));
    }

    // Si el usuario autenticado es `productor_principal`, filtrar solo los productores_secundarios de su productora
    if (authUser.rol.nombre_rol === "productor_principal") {
      if (!authMaestros.length || !authMaestros[0].productora) {
        logger.warn(`${req.method} ${req.originalUrl} - Productor principal sin productora asignada`);
        return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NO_PRODUCTORA_PRINCIPAL));
      }

      // Obtener el ID de la productora a la que pertenece el productor_principal
      const productoraId = authMaestros[0].productora.id_productora;

      // Aplicar los filtros para que solo se devuelvan `productores_secundarios` de la misma productora
      filters.productoraId = productoraId;
      filters.rolNombre = "productor_secundario";

      logger.info(`${req.method} ${req.originalUrl} - Filtrando productores_secundarios de la productora ${productoraId}`);
    }

    // Obtener usuarios con los filtros aplicados
    const usuarios = await findUsuarios(filters);

    if (usuarios.users.length < 1) {
      logger.warn(`${req.method} ${req.originalUrl} - No se encontraron usuarios con los filtros proporcionados.`);
    } else if (usuarios.users.length === 1) {
      logger.info(`${req.method} ${req.originalUrl} - Se encontró ${usuarios.users.length} usuario.`);
    } else {
      logger.info(`${req.method} ${req.originalUrl} - Se encontraron ${usuarios.users.length} usuarios.`);
    }

    // Filtrar para mapear la respuesta
    const filteredUsers = usuarios.users
      .map(formatUserResponse);

    res.status(200).json({
      total: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / (filters.limit || 50)),
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

    // Obtener información del usuario autenticado y del usuario objetivo
    const { user: authUser, maestros: authMaestros }: UsuarioResponse = await getAuthenticatedUser(req);
    const { user: targetUser, maestros: targetMaestros }: UsuarioResponse = await getTargetUser({ userId: usuarioId }, req);    

    if (!authUser.rol || !targetUser.rol) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario sin rol asignado`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED));
    }

    // Determinar si el usuario está actualizando sus propios datos
    const isSelfUpdate = authUser.id_usuario === usuarioId;

    if (!isSelfUpdate) {
      // Un admin_principal puede modificar los datos de cualquier usuario
      if (authUser.rol.nombre_rol === "admin_principal") {
        // No hay restricciones adicionales para admin_principal
      }
      // Un admin_secundario puede modificar los datos de productor_principal o productor_secundario
      else if (authUser.rol.nombre_rol === "admin_secundario") {
        if (targetUser.rol.nombre_rol === "admin_principal") {
          return next(new Err.ForbiddenError("No puede modificar los datos de un admin_principal."));
        }
      }
      // Un productor_principal solo puede modificar los datos de un productor_secundario de su misma productora
      else if (authUser.rol.nombre_rol === "productor_principal") {
        if (targetUser.rol.nombre_rol !== "productor_secundario") {
          return next(new Err.ForbiddenError("Solo puede modificar los datos de un productor_secundario."));
        }

        // Validar que ambos pertenezcan a la misma productora
        if (!req.productoraId) {
          return next(new Err.ForbiddenError("No tiene permiso para modificar datos de este usuario."));
        }

        const authPerteneceMismaProductora = authMaestros.some(
          (maestro) => maestro.productora_id === req.productoraId
        );

        const targetPerteneceMismaProductora = targetMaestros.some(
          (maestro) => maestro.productora_id === req.productoraId
        );

        if (!authPerteneceMismaProductora || !targetPerteneceMismaProductora) {
          return next(new Err.ForbiddenError("El usuario seleccionado no pertenece a su productora."));
        }
      }
      // Un productor_secundario no puede modificar datos de otro usuario
      else if (authUser.rol.nombre_rol === "productor_secundario") {
        return next(new Err.ForbiddenError("No tiene permiso para modificar datos de otro usuario."));
      }
    }

    // Actualizar los datos del usuario
    await updateUserData(targetUser, datosUsuario);

    // Registrar auditoría
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

    // Obtener usuario autenticado y su productora
    const { user: authUser, maestros: authMaestros }: UsuarioResponse = await getAuthenticatedUser(req);
    const { user: targetUser, maestros: targetMaestros }: UsuarioResponse = await getTargetUser({ userId: usuarioId }, req);

    if (!authUser.rol || !targetUser.rol) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario sin rol asignado`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED));
    }

    // Si el usuario autenticado es productor_principal
    if (authUser.rol.nombre_rol === "productor_principal") {
      // Validar que el targetUser es un productor_secundario
      if (targetUser.rol.nombre_rol !== "productor_secundario") {
        return next(new Err.ForbiddenError(MESSAGES.ERROR.USER.NOT_AUTHORIZED));
      }

      // Validar que el usuario autenticado pertenece a una productora
      if (!req.productoraId) {
        return next(new Err.ForbiddenError(MESSAGES.ERROR.VALIDATION.PRODUCTORA_ID_REQUIRED));
      }

      // Validar que el authUser pertenece a la productora
      const authPerteneceMismaProductora = authMaestros.some(
        (maestro) => maestro.productora_id === req.productoraId
      );

      if (!authPerteneceMismaProductora) {
        return next(new Err.ForbiddenError(MESSAGES.ERROR.USER.NOT_AUTHORIZED));
      }

      // Validar que el targetUser también pertenece a la misma productora
      const targetPerteneceMismaProductora = targetMaestros.some(
        (maestro) => maestro.productora_id === req.productoraId
      );

      if (!targetPerteneceMismaProductora) {
        return next(new Err.ForbiddenError(MESSAGES.ERROR.USER.NOT_AUTHORIZED));
      }
    }

    // Permitir cambio de vistas
    await assignVistasToUser(targetUser.id_usuario, undefined, roleName);

    logger.info(
      `${req.method} ${req.originalUrl} - Vistas actualizadas correctamente para el usuario: ${targetUser.id_usuario}`
    );

    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Actualizadas las vistas al rol ${roleName} del usuario ID: ${targetUser.id_usuario}`,
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
    
    if (authUser.rol.nombre_rol === "admin_secundario" && targetUser.rol.nombre_rol === "admin_principal") {
      throw new Err.ForbiddenError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    if (!authMaestros.length && authUser.rol.nombre_rol === "productor_principal") {
      throw new Err.InternalServerError(MESSAGES.ERROR.USER.NO_ASSOCIATED_PRODUCTORAS);
    }

    if (!targetMaestros.length && !["admin_principal", "admin_secundario"].includes(targetUser.rol.nombre_rol)) {
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
    const { user: authUser, maestros: authMaestros }: UsuarioResponse = await getAuthenticatedUser(req);
    const { user: targetUser, maestros: targetMaestros }: UsuarioResponse = await getTargetUser({ userId: usuarioId }, req);

    if (!authUser.rol || !targetUser.rol) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario sin rol asignado`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED));
    }    

    // Determinar si el cambio es para el propio usuario
    const isSelfUpdate = authUser.id_usuario === usuarioId;

    if (!isSelfUpdate) {
      // Validaciones adicionales si es un `productor_principal`
      if (authUser.rol.nombre_rol === "productor_principal") {
        // Solo puede cambiar la clave de un `productor_secundario`
        if (targetUser.rol.nombre_rol !== "productor_secundario") {
          return next(new Err.ForbiddenError("Solo puede cambiar la clave de un productor_secundario."));
        }

        // Validar que ambos pertenecen a la misma productora
        if (!req.productoraId) {
          return next(new Err.ForbiddenError("No tiene permiso para cambiar la clave de este usuario."));
        }

        const authPerteneceMismaProductora = authMaestros.some(
          (maestro) => maestro.productora_id === req.productoraId
        );

        const targetPerteneceMismaProductora = targetMaestros.some(
          (maestro) => maestro.productora_id === req.productoraId
        );

        if (!authPerteneceMismaProductora || !targetPerteneceMismaProductora) {
          return next(new Err.ForbiddenError("El usuario seleccionado no pertenece a su productora."));
        }
      }
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
      `${req.method} ${req.originalUrl} - Clave actualizada correctamente para el usuario con ID ${usuarioId}.`
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
        cuit: authMaestro.productora!.cuit_cuil,
      }));

    // Filtrar los datos de las vistas eliminando los elementos sin datos válidos
    const filteredVistas = authVistas
      .filter(vistaMaestro => vistaMaestro.vista && vistaMaestro.is_habilitado === true)
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

export const removeUsuarioMaestroRelation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { usuarioId } = req.params;
    const { productoraId: bodyProductoraId } = req.body;

    // Obtener información del usuario autenticado
    const { user: authUser, maestros: authMaestros, hasSingleMaestro: hasAuthSingleMaestro }: UsuarioResponse = await getAuthenticatedUser(req);

    // Obtener información del usuario objetivo
    const { user: targetUser, maestros: targetMaestros }: UsuarioResponse = await getTargetUser({ userId: usuarioId }, req);

    // Validar que ambos usuarios tengan roles asignados
    if (!authUser.rol || !targetUser.rol) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario sin rol asignado`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED));
    }

    let productoraIdToRemove: string | null = null;

    // Si el usuario es administrador, usa la productoraId del body
    if (["admin_principal", "admin_secundario"].includes(authUser.rol.nombre_rol)) {
      if (!bodyProductoraId) {
        throw new Err.BadRequestError("Debes proporcionar una productora_id al eliminar la relación.");
      }
      productoraIdToRemove = bodyProductoraId;
    } 
    // Si el usuario es productor principal, obtiene la productoraId de su maestro
    else if (authUser.rol.nombre_rol === "productor_principal") {
      if (!hasAuthSingleMaestro || authMaestros.length !== 1) {
        logger.warn(`${req.method} ${req.originalUrl} - El usuario tiene múltiples maestros asociados.`);
        return next(new Err.NotFoundError(MESSAGES.ERROR.USER.MULTIPLE_MASTERS_FOR_PRINCIPAL));
      }

      productoraIdToRemove = authMaestros[0].productora_id;

      if (!productoraIdToRemove) {
        logger.warn(`${req.method} ${req.originalUrl} - Productora no encontrada para el usuario autenticado.`);
        throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.PRODUCTORA_ID_REQUIRED);
      }

      // Validar que el usuario objetivo sea productor_secundario
      if (targetUser.rol.nombre_rol !== "productor_secundario") {
        throw new Err.ForbiddenError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
      }

      // Validar que la productora del usuario autenticado se encuentre en los maestros del usuario objetivo
      const targetProductoraIds = targetMaestros.map(maestro => maestro.productora_id);
      if (!targetProductoraIds.includes(productoraIdToRemove)) {
        throw new Err.ForbiddenError(MESSAGES.ERROR.USER.CANNOT_DELETE_OTHERS);
      }
    } else {
      throw new Err.ForbiddenError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Validar que productoraIdToRemove no sea null antes de llamar al servicio
    if (!productoraIdToRemove) {
      throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.PRODUCTORA_ID_REQUIRED);
    }

    // Llamar al servicio para eliminar la relación
    await removeUsuarioMaestro(productoraIdToRemove, usuarioId);

    logger.info(
      `${req.method} ${req.originalUrl} - Relación UsuarioMaestro eliminada exitosamente: Usuario ${usuarioId}, Productora ${productoraIdToRemove}`
    );

    res.status(200).json({ message: "Relación eliminada exitosamente." });

  } catch (err) {
    next(err);
  }
};