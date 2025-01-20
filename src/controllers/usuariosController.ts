import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";
import { UsuarioResponse } from "../interfaces/UsuarioResponse";

import {
  findUsuarios,
  assignVistasToUser,
  toggleUserViewStatusService,
  updateUserStatusById,
  createUser,
  validateUserRegistrationState,
  updateUserData,
  linkUserToProductora,
  updateUserRegistrationState,
  deleteUserRelations,
  deleteUsuarioById,
  findExistingUsuario,
  findVistasByRol,
  findVistasByUsuario,
} from "../services/userService";
import { createOrUpdateProductora, createProductoraMessage, generarCodigosISRC, processDocuments } from "../services/productoraService";
import { getAuthenticatedUser, getTargetUser } from "../services/authService";
import { sendEmailWithErrorHandling } from "../services/emailService";
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
    const { id_usuario } = req.body;

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Buscar el usuario al que se le cambiará el estado mediante findUsuario
    const { user: targetUser }: UsuarioResponse = await getTargetUser({ userId: id_usuario }, req);

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
      `${req.method} ${req.originalUrl} - Usuario ${nuevoEstado} exitosamente: ${id_usuario}`
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
    const { id_usuario, isBlocked } = req.body;

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para ${
        isBlocked ? "bloquear" : "desbloquear"
      } al usuario`
    );

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Buscar el usuario al que se le cambiará el estado mediante findUsuario
    const { user: targetUser }: UsuarioResponse = await getTargetUser({ userId: id_usuario }, req);

    // Verificar si el usuario está DESHABILITADO
    if (targetUser.tipo_registro === "DESHABILITADO") {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se puede ${
          isBlocked ? "bloquear" : "desbloquear"
        } al usuario con ID ${id_usuario} porque está DESHABILITADO.`
      );
      return next(new Err.ForbiddenError(MESSAGES.ERROR.USER.CANNOT_MODIFY_DISABLED_USER));
    }

    // Actualiza el estado de habilitación del usuario
    targetUser.is_bloqueado = !isBlocked;
    await targetUser.save();

    // Mensaje de éxito según la acción realizada
    const message = isBlocked
      ? MESSAGES.SUCCESS.AUTH.USER_BLOCKED
      : MESSAGES.SUCCESS.AUTH.USER_UNBLOCKED;

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario con ID ${id_usuario} ${
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
  req: Request<{}, {}, {}, { id_usuario?: string; [key: string]: string | undefined }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id_usuario, ...filters } = req.query;

    if (id_usuario) {
      logger.info(
        `${req.method} ${req.originalUrl} - Solicitud recibida para obtener un usuario con ID: ${id_usuario}`
      );

      // Buscar el usuario pasado por parámetro
      const { user: targetUser }: UsuarioResponse = await getTargetUser({ userId: id_usuario }, req);

      logger.info(
        `${req.method} ${req.originalUrl} - Usuario encontrado con éxito con ID: ${targetUser.id_usuario}`
      );
      res.status(200).json(targetUser);
      return;
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener usuarios filtrados.`,
      filters
    );

    // Construir filtros dinámicos a partir de la query
    const findFilters: any = {};

    if (filters.email) findFilters.email = String(filters.email);
    if (filters.nombre) findFilters.nombre = String(filters.nombre);
    if (filters.apellido) findFilters.apellido = String(filters.apellido);
    if (filters.tipo_registro) findFilters.tipo_registro = String(filters.tipo_registro);
    if (filters.rolId) findFilters.rolId = String(filters.rolId);
    if (filters.nombre_rol) findFilters.nombre_rol = String(filters.nombre_rol);
    if (filters.productoraId) findFilters.productoraId = String(filters.productoraId);
    if (filters.productoraNombre) findFilters.productoraNombre = String(filters.productoraNombre);
    if (filters.limit) findFilters.limit = parseInt(String(filters.limit), 10);
    if (filters.offset) findFilters.offset = parseInt(String(filters.offset), 10);

    // Obtener los usuarios con los filtros proporcionados
    const userData = await findUsuarios(Object.keys(findFilters).length ? findFilters : {});

    if (!userData || !userData.users.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontraron usuarios con los filtros proporcionados.`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Se encontraron exitosamente ${userData.users.length} usuarios.`
    );

    // Devolver todos los usuarios encontrados
    res.status(200).json(userData.users);

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al buscar el o los usuarios');    
  }
};

// CREAR UN USUARIO ADMIN
export const createSecondaryAdminUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, nombre, apellido, telefono } = req.body;

    logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para crear un usuario`);

    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Verificar si existe el usuario
    const existingUser = await findExistingUsuario({ email });
    if (existingUser) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario ya registrado: ${existingUser.email}`);
      return next(new Err.ConflictError(MESSAGES.ERROR.REGISTER.ALREADY_REGISTERED));
    }    

    const { newUser, tempPassword } = await createUser({
      email,
      nombre,
      apellido,
      telefono,
      rolNombre: 'admin_secundario',
    });

    if (!tempPassword) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se creó la clave temporal para el Administrador Secundario: ${newUser.id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.REGISTER.NO_TEMP_PASSWORD));
    }

    // Crear relaciones en UsuarioAccesoMaestro
    await assignVistasToUser(newUser.id_usuario, newUser.rol_id);

    logger.info(
      `${req.method} ${req.originalUrl} - Relaciones de vistas creadas para el rol admin_secundario: ${newUser.email}`
    );

    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: newUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "ALTA",
      detalle: "Creación de administrador secundario.",
    });

    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: newUser.id_usuario,
      modelo: "UsuarioVistaMaestro",
      tipo_auditoria: "ALTA",
      detalle: `Generación de vistas para el usuario con ID: (${newUser.id_usuario})`,
    });

    // Enviar correo con contraseña temporal
    const emailBody = MESSAGES.EMAIL_BODY.TEMP_PASSWORD(tempPassword);
    await sendEmailWithErrorHandling(
      {
        to: newUser.email,
        subject: "Registro exitoso - Contraseña temporal",
        html: emailBody,
        successLog: `Correo enviado a ${newUser.email} con la contraseña temporal.`,
        errorLog: `Error al enviar el correo al nuevo administrador secundario: ${newUser.email}.`,
      }, req, res, next);

    // Responder con éxito
    res.status(201).json({
      message: MESSAGES.SUCCESS.AUTH.REGISTER_SECONDARY,
      userId: newUser.id_usuario,

    });
  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al crear el administrador secundario');
  }
};

// OBTENER TODOS LOS REGISTROS PENDIENTES O EL DE UN USUARIO
export const getRegistrosPendientes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener registro(s) pendiente(s).`
    );

    const { id_usuario } = req.query;;

    if (id_usuario) {
      // Obtener datos del usuario pasado como parámetro
      const { user: targetUser, maestros: targetMaestros, hasSingleMaestro: hasTargetSingleMaestro }: UsuarioResponse = await getTargetUser({ userId: id_usuario as string }, req);

      if (targetUser.tipo_registro !== "ENVIADO") {
        logger.warn(
          `${req.method} ${req.originalUrl} - Usuario no tiene registro pendiente.`
        );
        return next(
          new Err.NotFoundError(MESSAGES.ERROR.REGISTER.NO_PENDING_USERS)
        );
      }

      if (!hasTargetSingleMaestro) {
        logger.warn(
          `${req.method} ${req.originalUrl} - El usuario tiene múltiples maestros asociados.`
        );
        return next(
          new Err.NotFoundError(
            MESSAGES.ERROR.USER.MULTIPLE_MASTERS_FOR_PRINCIPAL
          )
        );
      }

      const productoras = targetMaestros
        .filter((maestro) => maestro.productora)
        .map((maestro) => maestro.productora);

      if (productoras.length === 0) {
        logger.warn(
          `${req.method} ${req.originalUrl} - No se encontraron productoras asociadas para el usuario.`
        );
        return next(
          new Err.NotFoundError(MESSAGES.ERROR.USER.NO_ASSOCIATED_PRODUCTORAS)
        );
      }

      return res.status(200).json({
        message: MESSAGES.SUCCESS.APPLICATION.SAVED,
        data: { targetUser, productoras },
      });
    } else {
      // Obtener datos de todos los usuarios pendientes
      const pendingUsersData = await findUsuarios({ tipo_registro: "ENVIADO" });

      if (!pendingUsersData || !pendingUsersData.users.length) {
        logger.info(
          `${req.method} ${req.originalUrl} - No se encontraron usuarios pendientes.`
        );
        return next(
          new Err.NotFoundError(MESSAGES.ERROR.REGISTER.NO_PENDING_USERS)
        );
      }

      const usersWithSingleMaestro = pendingUsersData.users.filter(
        (user) => user.hasSingleMaestro
      );

      if (usersWithSingleMaestro.length === 0) {
        logger.info(
          `${req.method} ${req.originalUrl} - No se encontraron usuarios pendientes con un único maestro asociado.`
        );
        return next(
          new Err.NotFoundError(
            MESSAGES.ERROR.USER.MULTIPLE_MASTERS_FOR_PRINCIPAL
          )
        );
      }

      logger.info(
        `${req.method} ${req.originalUrl} - ${usersWithSingleMaestro.length} usuarios pendientes encontrados.`
      );

      return res.status(200).json({
        message: MESSAGES.SUCCESS.APPLICATION.FOUND,
        data: usersWithSingleMaestro,
      });
    }
  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al obtener los registros pendientes');    
  }
};

// APROBAR UNA APLICACIÓN
export const approveApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud para autorizar usuario`
    );

    const { id_usuario } = req.body;    

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Verifica el usuario pasado por parámetro
    const { user: targetUser, maestros: targetMaestros, hasSingleMaestro: hasTargetSingleMaestro }: UsuarioResponse = await getTargetUser({ userId: id_usuario }, req);

    // Validar si el usuario ya está aprobado
    if (targetUser.tipo_registro === "HABILITADO") {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario ya aprobado: ${targetUser.email}`
      );
      return next(
        new Err.ConflictError(
          `El usuario con ID: ${id_usuario} ya está aprobado y no puede ser procesado nuevamente.`
        )
      );
    }

    if (!hasTargetSingleMaestro) {
        logger.warn(
          `${req.method} ${req.originalUrl} - El usuario tiene múltiples maestros asociados.`
        );
        return next(
          new Err.NotFoundError(
            MESSAGES.ERROR.USER.MULTIPLE_MASTERS_FOR_PRINCIPAL
          )
        );
      }

    const productora = targetMaestros[0].productora;

    if (!productora) {
      logger.error(
        `${req.method} ${req.originalUrl} - Datos de productora no encontrados.`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.PRODUCTORA.NOT_FOUND));
    }
    // Establecer la fecha de hoy para fecha_alta en Productora
    productora.fecha_alta = new Date();

    // Llamar al servicio para generar códigos ISRC
    const productoraId = productora.id_productora;
    const isrcs = await generarCodigosISRC(productoraId);

    // Actualizar el tipo_registro del usuario a HABILITADO
    await targetUser.update({ tipo_registro: "HABILITADO" });
    
    // Crear relaciones en UsuarioVistasMaestro  
    await assignVistasToUser(targetUser.id_usuario, targetUser.rol_id);

    logger.info(
      `${req.method} ${req.originalUrl} - Relaciones de vistas completas creadas para el Productor Principal: ${targetUser.email}`
    );

    // Crear las auditorías correspondientes
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "Productora",
      tipo_auditoria: "CAMBIO",
      detalle: `Autorización de ${productora.nombre_productora} en Productora (${productora.id_productora})`,
    });

    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "ProductoraISRC",
      tipo_auditoria: "ALTA",
      detalle: `Generación de códigos ISRC para la Productora: (${productora.id_productora})`,
    });

    // Enviar el correo de notificación al usuario
    await sendEmailWithErrorHandling(
      {
        to: targetUser.email,
        subject: "Registro Exitoso como Productor Principal",
        html: MESSAGES.EMAIL_BODY.PRODUCTOR_PRINCIPAL_NOTIFICATION(
          productora.nombre_productora,
          productora.cuit_cuil,
          productora.cbu,
          productora.alias_cbu
        ),
        successLog: `Usuario autorizado y correo de notificación enviado a ${targetUser.email}.`,
        errorLog: `Error al enviar el correo de aprobación de aplicación a ${targetUser.email}.`,
      }, req, res, next);

    // Enviar respuesta exitosa al cliente
    return res.status(200).json({
      message: MESSAGES.SUCCESS.AUTH.AUTHORIZED,
      data: isrcs,
    });
  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al autorizar usuario');    
  }
};

// RECHAZAR UNA APLICACION
export const rejectApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud para rechazar aplicación`
    );

    const { id_usuario, comentario } = req.body;

    // Verifica el usuario autenticado
    const { user: authUser } = await getAuthenticatedUser(req);

    // Buscar el usuario pasado por parámetro
    const { user: targetUser, maestros: targetMaestros, hasSingleMaestro: hasTargetSingleMaestro }: UsuarioResponse = await getTargetUser({ userId: id_usuario }, req);

    // Verificar que el comentario está presente en el body
    if (!comentario || comentario.trim() === "") {
      logger.warn(
        `${req.method} ${req.originalUrl} - Comentario de rechazo no proporcionado.`
      );
      return next(
        new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.COMMENT_REQUIRED)
      );
    }

    // Crear registro de auditoría
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Rechazo de aplicación con comentario: ${comentario}`,
    });

    // Actualizar el tipo_registro del usuario a RECHAZADO
    await targetUser.update({ tipo_registro: "RECHAZADO" });

    if (!hasTargetSingleMaestro) {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario tiene múltiples maestros asociados.`
      );
      return next(
        new Err.NotFoundError(
          MESSAGES.ERROR.USER.MULTIPLE_MASTERS_FOR_PRINCIPAL
        )
      );
    }

    const productora = targetMaestros[0].productora;

    if (!productora) {
        logger.warn(
          `${req.method} ${req.originalUrl} - El usuario no tiene una productora asociada.`
        );
        return next(
          new Err.NotFoundError(
            MESSAGES.ERROR.USER.NO_ASSOCIATED_PRODUCTORAS
          )
        );
      }

    // Crear mensaje asociado al rechazo
    await createProductoraMessage({
      usuarioId: authUser.id_usuario,
      productoraId: productora.id_productora,
      tipoMensaje: "RECHAZO",
      mensaje: comentario,
    });

    // Enviar correo de notificación de rechazo
    await sendEmailWithErrorHandling(
      {
        to: targetUser.email,
        subject: "Rechazo de su Aplicación",
        html: MESSAGES.EMAIL_BODY.REJECTION_NOTIFICATION(targetUser.email, comentario),
        successLog: `Aplicación rechazada y correo de notificación enviado a ${targetUser.email}.`,
        errorLog: `Error al enviar el correo de rechazo a ${targetUser.email}.`,
      }, req, res, next);

    res.status(200).json({ message: MESSAGES.SUCCESS.APPLICATION.REJECTED });

  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al rechazar aplicación: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// ENVIAR UNA APLICACION PARA SER APROBADA
export const sendApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Enviando solicitud de aplicación`
    );

    const {
      id_usuario,
      productoraData,
      documentos,
      nombre,
      apellido,
      telefono,
    } = req.body;

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Buscar el usuario pasado por parámetro
    const { user: targetUser, hasSingleMaestro: hasTargetSingleMaestro }: UsuarioResponse = await getTargetUser({ userId: id_usuario }, req);
    
    if (!hasTargetSingleMaestro) {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario tiene múltiples maestros asociados.`
      );
      return next(
        new Err.NotFoundError(MESSAGES.ERROR.USER.MULTIPLE_MASTERS_FOR_PRINCIPAL)
      );
    }

    // Validar el estado del usuario
    validateUserRegistrationState(targetUser.tipo_registro);

    // Actualizar los datos básicos del usuario
    await updateUserData(targetUser, { nombre, apellido, telefono });
    logger.info(
      `${req.method} ${req.originalUrl} - Datos del usuario actualizados.`
    );

    // Manejar la productora
    const productora = await createOrUpdateProductora(productoraData);
    logger.info(
      `${req.method} ${req.originalUrl} - Productora procesada exitosamente.`
    );

    // Manejar relación de Usuario y Productora en UsuarioMaestro
    await linkUserToProductora(targetUser.id_usuario, productora.id_productora);
    logger.info(
      `${req.method} ${req.originalUrl} - Relación Usuario-Productora creada en UsuarioMaestro.`
    );

    // Manejar documentos
    if (documentos?.length) {
      await processDocuments(
        targetUser.id_usuario,
        productora.id_productora,
        documentos
      );
      logger.info(
        `${req.method} ${req.originalUrl} - Documentos procesados exitosamente.`
      );
    }

    // Actualizar el tipo_registro del usuario a ENVIADO
    await updateUserRegistrationState(targetUser, "ENVIADO");
    logger.info(
      `${req.method} ${req.originalUrl} - Tipo de registro actualizado a ENVIADO.`
    );

    // Registrar auditoría
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "Productora",
      tipo_auditoria: "ALTA",
      detalle: `Solicitud de aplicación enviada por ${targetUser.email} para la productora ${productora.id_productora}`,
    });

    logger.info(`${req.method} ${req.originalUrl} - Auditoría registrada.`);

    // Enviar correo de notificación al usuario
    await sendEmailWithErrorHandling(
      {
        to: targetUser.email,
        subject: "Solicitud de Aplicación Enviada",
        html: MESSAGES.EMAIL_BODY.APPLICATION_SUBMITTED(targetUser.email),
        successLog: `Correo de aplicación enviado a ${targetUser.email}`,
        errorLog: `Error al enviar el correo de aplicación a ${targetUser.email}`,
      }, req, res, next);

    res.status(200).json({ message: MESSAGES.SUCCESS.APPLICATION.SAVED });

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al enviar la aplicación");
  }
};

// ACTUALIZAR UNA APLICACION PENDIENTE
export const updateApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud para actualizar la aplicación`
    );

    const { id_usuario, productoraData, documentos } = req.body;

    // Validar que al menos uno de los datos esté presente
    if (!productoraData && (!documentos || documentos.length === 0)) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se proporcionaron datos para actualizar.`
      );
      return next(
        new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.NO_DATA_PROVIDED)
      );
    }

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Buscar el usuario pasado por parámetro
    const { user: targetUser }: UsuarioResponse = await getTargetUser({ userId: id_usuario }, req);

    const cambios: string[] = [];

    // Paso 1: Actualizar o crear la productora
    if (productoraData) {
      const productora = await createOrUpdateProductora(productoraData);
      cambios.push("Productora actualizada o creada");
      logger.info(`${req.method} ${req.originalUrl} - Productora procesada: ID=${productora.id_productora}`);
    }

    // Paso 2: Actualizar o crear documentos
    if (documentos && documentos.length > 0) {
      await processDocuments(targetUser.id_usuario, productoraData.id_productora, documentos);
      cambios.push("Documentos actualizados o creados");
      logger.info(`${req.method} ${req.originalUrl} - Documentos procesados.`);
    }

    // Paso 3: Registrar auditoría 
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "Aplicación",
      tipo_auditoria: "CAMBIO",
      detalle: `Actualización realizada: ${cambios.join(", ")}`,
    });

    // Paso 4: Enviar correo de notificación
    await sendEmailWithErrorHandling(
      {
        to: targetUser.email,
        subject: "Solicitud de Aplicación Enviada",
        html: MESSAGES.EMAIL_BODY.APPLICATION_SUBMITTED(targetUser.email),
        successLog: `Correo de actualización enviado a ${targetUser.email}`,
        errorLog: `Error al enviar el correo de actualización a ${targetUser.email}`,
      }, req, res, next);

    res.status(200).json({
      message: MESSAGES.SUCCESS.APPLICATION.UPDATED,
      cambios,
    });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al actualizar la aplicación');    
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

    const { id_usuario, datosUsuario } = req.body;

   // Paso 1: Buscar usuarios
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);   
    const { user: targetUser }: UsuarioResponse = await getTargetUser({ userId: id_usuario }, req);

    // Paso 2: Actualizar los datos del usuario mediante el servicio
    await updateUserData(targetUser, datosUsuario);

    // Paso 3: Registrar auditoría mediante el servicio
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
    handleGeneralError(err, req, res, next, 'Error al actualizar el usuario');
  }
};

// ELIMINAR UN USUARIO
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id_usuario } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Solicitud para eliminar usuario`);

    // Paso 1: Buscar usuarios
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);
    const { user: targetUser, maestros: targetMaestros }: UsuarioResponse = await getTargetUser({ userId: id_usuario }, req);

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

export const getVistasByRol = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roleName } = req.params;
    const vistas = await findVistasByRol(roleName);
    res.status(200).json(vistas);
  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener vistas por rol");
  }
};

export const getVistasByUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id_usuario } = req.params;
    const vistas = await findVistasByUsuario(id_usuario);
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
    const { id_usuario, roleName } = req.body;

    // Buscar usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);
    const { user: targetUser }: UsuarioResponse = await getTargetUser({ userId: id_usuario }, req);

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
    const { id_usuario, vistas } = req.body;

    if (!id_usuario) {
      throw new Err.BadRequestError("Debe proporcionar un ID de usuario.");
    }

    await toggleUserViewStatusService(id_usuario, vistas);

    logger.info(
      `${req.method} ${req.originalUrl} - Estado de vistas actualizado correctamente para el usuario: ${id_usuario}`
    );

    res.status(200).json({ message: "Estado de vistas actualizado exitosamente" });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al cambiar el estado de vistas del usuario')    
  }
};
