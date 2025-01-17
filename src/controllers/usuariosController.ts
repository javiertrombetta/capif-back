import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import crypto from "crypto";
import bcrypt from "bcrypt";

import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";

import * as MESSAGES from "../services/messages";
import * as Err from "../services/customErrors";
import { sendEmail } from "../services/emailService";

import {
  findUsuarios,
  findRolByNombre,
  assignVistasToUser,
  updateUserViewsService,
  toggleUserViewStatusService,
  deleteUsuarioMaestrosByUserId,
  updateUsuarioById,
} from "../services/userService";

import { generarCodigosISRC } from "../services/productoraService";

import {
  Usuario,
  UsuarioMaestro,
  Productora,
  ProductoraDocumento,
  AuditoriaCambio,
  ProductoraDocumentoTipo,
} from "../models";

// HABILITAR O DESHABILITAR EL REGISTRO DE UN USUARIO
export const availableDisableUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id_usuario } = req.body;

    // Verificar que los parámetros necesarios estén en el body
    if (!id_usuario) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Falta uno o más parámetros obligatorios.`
      );
      throw new Err.BadRequestError(
        MESSAGES.ERROR.VALIDATION.MISSING_PARAMETERS
      );
    }

    // Verifica el usuario autenticado
    const userAuthId = req.userId as string;

    if (!userAuthId) {
      logger.warn(
        `${req.method} ${req.originalUrl} - ID de usuario autenticado no encontrado en el token.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Buscar el administrador para validar los datos
    const authData = await findUsuarios({ userId: userAuthId });

    if (!authData || !authData.users.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Administrador no encontrado: ${userAuthId}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.ADMIN.NOT_FOUND));
    }

    if (!authData.isSingleUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Más de un usuario encontrado con ID: ${userAuthId}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.ADMIN.NOT_SINGLE_USER));
    }

    // Extraer el primer usuario de la respuesta
    const admin = authData.users[0].user;

    // Buscar el usuario al que se le cambiará el estado mediante findUsuario
    const userData = await findUsuarios({ userId: id_usuario });
    
    if (!userData || !userData.users.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    if (!userData.isSingleUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Más de un usuario encontrado con ID: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_SINGLE_USER));
    }

    // Extraer el primer usuario de la respuesta
    const user = userData.users[0].user;

    // Alternar el tipo_registro entre HABILITADO y DESHABILITADO
    const nuevoEstado =
      user.tipo_registro === "HABILITADO" ? "DESHABILITADO" : "HABILITADO";
    await Usuario.update(
      { tipo_registro: nuevoEstado },
      { where: { id_usuario: user.id_usuario } }
    );

    // Crear una auditoría de la acción
    await AuditoriaCambio.create({
      usuario_originario_id: admin.id_usuario,
      usuario_destino_id: user.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Cambio de estado a ${nuevoEstado}`,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario ${nuevoEstado} exitosamente: ${id_usuario}`
    );
    res.status(200).json({ message: `Usuario ${nuevoEstado} exitosamente` });

  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al cambiar estado del usuario: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

// BLOQUEAR O DESBLOQUEAR USUARIO
export const blockOrUnblockUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id_usuario, isBlocked } = req.body;

    // Verificar que los parámetros necesarios estén en el body
    if (!id_usuario || !isBlocked) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Falta uno o más parámetros obligatorios.`
      );
      throw new Err.BadRequestError(
        MESSAGES.ERROR.VALIDATION.MISSING_PARAMETERS
      );
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para ${
        isBlocked ? "bloquear" : "desbloquear"
      } al usuario`
    );

    // Verifica el usuario autenticado
    const userAuthId = req.userId as string;

    if (!userAuthId) {
      logger.warn(
        `${req.method} ${req.originalUrl} - ID de usuario autenticado no encontrado en el token.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Buscar el administrador para validar los datos
    const authData = await findUsuarios({ userId: userAuthId });

    if (!authData || !authData.users.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Administrador no encontrado: ${userAuthId}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.ADMIN.NOT_FOUND));
    }

    if (!authData.isSingleUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Más de un usuario encontrado con ID: ${userAuthId}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.ADMIN.NOT_SINGLE_USER));
    }

    // Extraer el primer usuario de la respuesta
    const admin = authData.users[0].user;

    // Realiza la consulta para obtener el usuario
    const userData = await findUsuarios({ userId: id_usuario });

    if (!userData || !userData.users.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    if (!userData.isSingleUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Más de un usuario encontrado con ID: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_SINGLE_USER));
    }

    const user = userData.users[0].user;   

    // Verificar si el usuario está DESHABILITADO
    if (user.tipo_registro === "DESHABILITADO") {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se puede ${
          isBlocked ? "bloquear" : "desbloquear"
        } al usuario con ID ${id_usuario} porque está DESHABILITADO.`
      );
      return next(
        new Err.ForbiddenError(MESSAGES.ERROR.USER.CANNOT_MODIFY_DISABLED_USER)
      );
    }

    // Actualiza el estado de habilitación del usuario
    user.is_bloqueado = !isBlocked;
    await user.save();

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
    await AuditoriaCambio.create({
      usuario_originario_id: admin.id_usuario,
      usuario_destino_id: user.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Usuario ${isBlocked ? "bloqueado" : "desbloqueado"}`,
    });

    res.status(200).json({ message });

  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al bloquear/desbloquear usuario: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// CAMBIAR EL ROL A UN USUARIO
export const changeUserRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id_usuario, newRole } = req.body;

    // Validar parámetros
    if (!id_usuario || !newRole) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Faltan uno o más parámetros obligatorios.`
      );
      return res
        .status(400)
        .json({ message: MESSAGES.ERROR.VALIDATION.MISSING_PARAMETERS });
    }

    // Verifica el usuario autenticado
    const userAuthId = req.userId as string;

    if (!userAuthId) {
      logger.warn(
        `${req.method} ${req.originalUrl} - ID de usuario autenticado no encontrado en el token.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Buscar el administrador para validar los datos
    const authData = await findUsuarios({ userId: userAuthId });

    if (!authData || !authData.users.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Administrador no encontrado: ${userAuthId}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.ADMIN.NOT_FOUND));
    }

    if (!authData.isSingleUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Más de un usuario encontrado con ID: ${userAuthId}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.ADMIN.NOT_SINGLE_USER));
    }

    // Extraer el primer usuario de la respuesta
    const admin = authData.users[0].user;

    // Verificar que el usuario existe
    const userData = await findUsuarios({ userId: id_usuario });

    if (!userData || !userData.users.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado con ID: ${id_usuario}`
      );
      return res.status(404).json({ message: MESSAGES.ERROR.USER.NOT_FOUND });
    }

    if (!userData.isSingleUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Más de un usuario encontrado con ID: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_SINGLE_USER));
    }

    const user = userData.users[0].user;

    // Buscar el nuevo rol
    const rol = await findRolByNombre(newRole);
    if (!rol) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Rol no válido: ${newRole}.`
      );
      return res
        .status(400)
        .json({ message: MESSAGES.ERROR.VALIDATION.ROLE_INVALID });
    }

    // Eliminar relaciones de UsuarioMaestro asociadas al usuario
    await deleteUsuarioMaestrosByUserId(user.id_usuario);

    // Actualizar el rol del usuario
    const updatedUser = await updateUsuarioById(user.id_usuario, {
      newRole,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Rol del usuario con ID ${user.id_usuario} actualizado a ${newRole}.`
    );

    // Registrar en Auditoría
    await AuditoriaCambio.create({
      usuario_originario_id: admin.id_usuario,
      usuario_destino_id: user.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Rol cambiado a ${newRole}.`,
    });

    res.status(200).json({
      message: MESSAGES.SUCCESS.AUTH.ROLE_UPDATED,
      user: updatedUser,
    });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al cambiar el rol del usuario: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
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

      const userData = await findUsuarios({ userId: id_usuario });

      if (!userData || !userData.users.length) {
        logger.warn(
          `${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`
        );
        return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
      }

      if (!userData.isSingleUser) {
        logger.warn(
          `${req.method} ${req.originalUrl} - Más de un usuario encontrado con ID: ${id_usuario}`
        );
        return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_SINGLE_USER));
      }

      const user = userData.users[0].user;

      logger.info(
        `${req.method} ${req.originalUrl} - Usuario encontrado con éxito con ID: ${user.id_usuario}`
      );
      res.status(200).json(user);
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

  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error: ${
        error instanceof Error ? error.message : "Error desconocido."
      }`
    );
    next(new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

// CREAR UN USUARIO ADMIN
export const createAdminUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, nombre, apellido, telefono } = req.body;

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para crear un usuario`);

    // Verificar que se proporcionen los datos requeridos
    if (!email || !nombre || !apellido) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Faltan uno o más parámetros obligatorios.`
      );
      return next(
        new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.MISSING_PARAMETERS)
      );
    }

    // Verifica el usuario autenticado
    const userAuthId = req.userId as string;

    if (!userAuthId) {
      logger.warn(
        `${req.method} ${req.originalUrl} - ID de usuario autenticado no encontrado en el token.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Buscar el administrador para validar los datos
    const authData = await findUsuarios({ userId: userAuthId });

    if (!authData || !authData.users.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Administrador no encontrado: ${userAuthId}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.ADMIN.NOT_FOUND));
    }

    if (!authData.isSingleUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Más de un usuario encontrado con ID: ${userAuthId}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.ADMIN.NOT_SINGLE_USER));
    }

    // Extraer el primer usuario de la respuesta
    const admin = authData.users[0].user;

    // Verificar si el usuario ya existe
    const userData = await findUsuarios({ email });

    if (!userData || !userData.users.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado: ${email}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    if (!userData.isSingleUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Más de un usuario encontrado con el email: ${email}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_SINGLE_USER));
    }

    // Extraer el primer usuario de la respuesta
    const existingUser = userData.users[0].user;

    if (existingUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario ya registrado: ${email}`
      );
      return next(
        new Err.BadRequestError(MESSAGES.ERROR.REGISTER.ALREADY_REGISTERED)
      );
    }

    // Verificar si el rol admin_secundario
    const secondaryRole = await findRolByNombre('admin_secundario');
    if (!secondaryRole) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Rol no encontrado en la base de datos: ${secondaryRole}`
      );
      return next(
        new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID)
      );
    }

    // Generación de clave temporal y su cifrado
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Crear el usuario con tipo_registro "HABILITADO" y la fecha actual
    const newUser = await Usuario.create({
      rol_id: secondaryRole.id_rol,
      email,
      clave: hashedPassword,
      tipo_registro: "HABILITADO",
      nombre,
      apellido,
      telefono: telefono || null,
      fecha_ultimo_cambio_rol: new Date(),
      fecha_ultimo_cambio_registro: new Date(),
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario creado exitosamente: ${newUser.id_usuario}`
    );   

    // Crear relaciones en UsuarioAccesoMaestro
    await assignVistasToUser(newUser.id_usuario, secondaryRole.id_rol);

    logger.info(
      `${req.method} ${req.originalUrl} - Relaciones de vistas creadas para ${secondaryRole.nombre_rol}: ${newUser.email}`
    );

    // Registrar en Auditoría
    await AuditoriaCambio.create({
      usuario_originario_id: admin.id_usuario,
      usuario_destino_id: newUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "ALTA",
      detalle: `Creación de administrador secundario.`,
    });

    // Envío de contraseña temporal por correo
    const emailBody = MESSAGES.EMAIL_BODY.TEMP_PASSWORD(tempPassword);
    try {
      await sendEmail({
        to: newUser.email,
        subject: "Registro exitoso - Contraseña temporal",
        html: emailBody,
      });

      logger.info(
        `${req.method} ${req.originalUrl} - Correo enviado a ${newUser.email}`
      );
    } catch (emailError) {
      logger.error(
        `${req.method} ${req.originalUrl} - Error al enviar correo: ${
          emailError instanceof Error ? emailError.message : "Error desconocido"
        }`
      );
      return next(
        new Err.InternalServerError(MESSAGES.ERROR.EMAIL.TEMP_FAILED)
      );
    }

    // Respuesta exitosa
    res.status(201).json({
      message: MESSAGES.SUCCESS.AUTH.REGISTER_SECONDARY,
      userId: newUser.id_usuario,
    });
  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al crear usuario: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`
    );
    next(new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const getRegistrosPendientes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener registro(s) pendiente(s).`
    );

    const { id_usuario } = req.body;

    if (id_usuario) {
      // Obtener datos de un único usuario
      const userData = await findUsuarios({ userId: id_usuario });

      if (!userData || !userData.users.length) {
        logger.warn(
          `${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`
        );
        return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
      }

      if (!userData.isSingleUser) {
        logger.warn(
          `${req.method} ${req.originalUrl} - Más de un usuario encontrado con ID: ${id_usuario}`
        );
        return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_SINGLE_USER));
      }

      // Extraer el primer usuario y maestros asociados de la respuesta
      const user = userData.users[0].user;
      const { maestros, isSingleMaestro } = userData.users[0];

      if (user.tipo_registro !== "ENVIADO") {
        logger.warn(
          `${req.method} ${req.originalUrl} - Usuario no tiene registro pendiente.`
        );
        return next(
          new Err.NotFoundError(MESSAGES.ERROR.REGISTER.NO_PENDING_USERS)
        );
      }

      if (!isSingleMaestro) {
        logger.warn(
          `${req.method} ${req.originalUrl} - El usuario tiene múltiples maestros asociados.`
        );
        return next(
          new Err.NotFoundError(
            MESSAGES.ERROR.USER.MULTIPLE_MASTERS_FOR_PRINCIPAL
          )
        );
      }

      const productoras = maestros
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
        data: { user, productoras },
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
        (user) => user.isSingleMaestro
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
    logger.error(
      `${req.method} ${req.originalUrl} - Error: ${
        err instanceof Error ? err.message : "Error desconocido."
      }`
    );
    return next(new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

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

    // Validar parámetros
    if (!id_usuario) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Faltan uno o más parámetros obligatorios.`
      );
      return next(
        new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.MISSING_PARAMETERS)
      );
    }

    // Verifica el usuario autenticado
    const userAuthId = req.userId as string;

    if (!userAuthId) {
      logger.warn(
        `${req.method} ${req.originalUrl} - ID de usuario autenticado no encontrado en el token.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Buscar el administrador para validar los datos
    const authData = await findUsuarios({ userId: userAuthId });

    if (!authData || !authData.users.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Administrador no encontrado: ${userAuthId}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.ADMIN.NOT_FOUND));
    }

    if (!authData.isSingleUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Más de un usuario encontrado con ID: ${userAuthId}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.ADMIN.NOT_SINGLE_USER));
    }

    // Extraer el primer usuario de la respuesta
    const admin = authData.users[0].user;

    const userData = await findUsuarios({ userId: id_usuario });

    if (!userData || !userData.users.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    if (!userData.isSingleUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Más de un usuario encontrado con ID: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_SINGLE_USER));
    }

    if (!userData.users[0].maestros.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No existen maestros asociados al ID: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NO_MAESTRO_RECORD));
    }

    // Extraer el primer usuario de la respuesta
    const { user, maestros, isSingleMaestro } = userData.users[0];  

    // Validar si el usuario ya está aprobado
    if (user.tipo_registro === "HABILITADO") {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario ya aprobado: ${user.email}`
      );
      return next(
        new Err.ConflictError(
          `El usuario con ID: ${id_usuario} ya está aprobado y no puede ser procesado nuevamente.`
        )
      );
    }

    if (!isSingleMaestro) {
        logger.warn(
          `${req.method} ${req.originalUrl} - El usuario tiene múltiples maestros asociados.`
        );
        return next(
          new Err.NotFoundError(
            MESSAGES.ERROR.USER.MULTIPLE_MASTERS_FOR_PRINCIPAL
          )
        );
      }

    const productora = maestros[0].productora;

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
    await user.update({ tipo_registro: "HABILITADO" });    

    // Crear las auditorías correspondientes
    await AuditoriaCambio.create({
      usuario_originario_id: admin.id_usuario,
      usuario_destino_id: user.id_usuario,
      modelo: "Productora",
      tipo_auditoria: "CAMBIO",
      detalle: `Autorización de ${productora.nombre_productora} en Productora (${productora.id_productora})`,
    });

    await AuditoriaCambio.create({
      usuario_originario_id: admin.id_usuario,
      usuario_destino_id: user.id_usuario,
      modelo: "ProductoraISRC",
      tipo_auditoria: "ALTA",
      detalle: `Generación de códigos ISRC para la Productora: (${productora.id_productora})`,
    });

    // Enviar el correo de notificación al usuario
    // await sendEmail({
    //   to: userData.user.email,
    //   subject: "Registro Exitoso como Productor Principal",
    //   html: MESSAGES.EMAIL_BODY.PRODUCTOR_PRINCIPAL_NOTIFICATION(
    //     productora.nombre_productora,
    //     productora.cuit_cuil,
    //     productora.cbu,
    //     productora.alias_cbu
    //   ),
    // });

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario autorizado y correo enviado exitosamente.`
    );

    // Enviar respuesta exitosa al cliente
    return res.status(200).json({
      message: MESSAGES.SUCCESS.AUTH.AUTHORIZED,
      data: isrcs,
    });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al autorizar usuario: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
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

    // Validar parámetros
    if (!id_usuario || !comentario) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Faltan parámetros obligatorios.`
      );
      return next(
        new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.MISSING_PARAMETERS)
      );
    }

    // Verificar el usuario autenticado desde AuthenticatedRequest
    const userAuthId = req.userId as string;
    const authenticatedUserData = await findUsuarios({ userId: userAuthId });

    if (!authenticatedUserData || !authenticatedUserData.users.length) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    if (!authenticatedUserData.isSingleUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Más de un usuario encontrado con ID: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_SINGLE_USER));
    }

    // Buscar el usuario mediante findUsuario
    const userData = await findUsuarios({ userId: id_usuario });
    if (!userData) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    const { user } = userData;

    if (!user) {
      logger.error(`${req.method} ${req.originalUrl} - Usuario no encontrado.`);
      return res.status(404).json({
        message: MESSAGES.ERROR.USER.NOT_FOUND,
      });
    }

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
    await AuditoriaCambio.create({
      usuario_originario_id: userAuthId,
      usuario_destino_id: user.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Rechazo de aplicación con comentario: ${comentario}`,
    });

    // Enviar correo de notificación de rechazo

    // Actualizar el tipo_registro del usuario a PENDIENTE
    await user.update({ tipo_registro: "RECHAZADO" });

    await sendEmail({
      to: user.email,
      subject: "Rechazo de su Aplicación",
      html: MESSAGES.EMAIL_BODY.REJECTION_NOTIFICATION(user.email, comentario),
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Aplicación rechazada y correo de notificación enviado.`
    );

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
) => {
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

    // Validar parámetros
    if (!id_usuario || !productoraData || !nombre || !apellido || !telefono) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Faltan parámetros obligatorios.`
      );
      return next(
        new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.MISSING_PARAMETERS)
      );
    }

    // Verificar el usuario autenticado desde AuthenticatedRequest
    const userAuthId = req.userId as string;
    if (!userAuthId) {
      logger.warn(
        `${req.method} ${req.originalUrl} - ID de usuario activo no encontrado en el token.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    logger.debug(
      `${req.method} ${req.originalUrl} - ID de usuario autenticado: ${userAuthId}`
    );

    // Buscar al usuario mediante findUsuario
    const userData = await findUsuario({ userId: id_usuario });
    if (!userData || !userData.user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado con ID: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }   
    
    const user = userData.user;
    
    if (userData.user.tipo_registro === "CONFIRMADO") {
      logger.info(
        `${req.method} ${req.originalUrl} - Usuario con estado CONFIRMADO encontrado: ${userData.user.email}`
      );
    } else if (userData.user.tipo_registro === "PENDIENTE") {
      logger.info(
        `${req.method} ${req.originalUrl} - Usuario con estado PENDIENTE encontrado: ${userData.user.email}`
      );
    } else if (userData.user.tipo_registro === "RECHAZADO") {
      logger.info(
        `${req.method} ${req.originalUrl} - Usuario con estado RECHAZADO encontrado: ${userData.user.email}`
      );
    } else {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario con un estado inesperado: ${userData.user.tipo_registro}`
      );

      return next(
        new Err.BadRequestError(
          `El usuario tiene un estado de registro no permitido: ${userData.user.tipo_registro}. Solo se permiten los estados CONFIRMADO, PENDIENTE o RECHAZADO.`
        )
      );
    }

    if (!user) {
      logger.error(`${req.method} ${req.originalUrl} - Usuario no encontrado.`);
      return res.status(404).json({
        message: MESSAGES.ERROR.USER.NOT_FOUND,
      });
    }

    await user.update({ nombre, apellido, telefono });
    logger.info(
      `${req.method} ${req.originalUrl} - Datos del usuario actualizados: nombre=${nombre}, apellido=${apellido}, telefono=${telefono}`
    );

    let productora = null;

    // Verificar si existe una relación en UsuarioMaestro con la productora
    const existingRelation = userData.maestros.find(
      (maestro) => maestro.productora?.id_productora === productoraData.id_productora
    );

    // Validar el tipo de persona (FÍSICA o JURÍDICA)
    const tipoPersonaValida = ["FISICA", "JURIDICA"].includes(
      productoraData.tipo_persona
    );
    if (!tipoPersonaValida) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Tipo de persona inválido: ${productoraData.tipo_persona}`
      );
      throw new Err.BadRequestError(
        "El tipo de persona debe ser FISICA o JURIDICA."
      );
    }

    // Manejar creación o actualización de la productora
    if (productoraData.id_productora) {
      // Buscar productora existente por ID
      productora = await Productora.findOne({
        where: { id_productora: productoraData.id_productora },
      });

      if (productora) {
        // Actualizar datos de la productora existente
        await productora.update(productoraData);
        logger.info(
          `${req.method} ${req.originalUrl} - Productora actualizada con ID: ${productora.id_productora}`
        );
      } else {
        // Crear una nueva productora si no existe
        productora = await Productora.create({ ...productoraData, fecha_alta: null });
        logger.info(
          `${req.method} ${req.originalUrl} - Nueva productora creada con ID: ${productora.id_productora}`
        );
      }
    } else {
      // Crear nueva productora si no se proporciona un ID
      productora = await Productora.create({ ...productoraData, fecha_alta: null });
      logger.info(
        `${req.method} ${req.originalUrl} - Nueva productora creada sin ID proporcionado. ID asignado: ${productora.id_productora}`
      );
    }

    // Verificar si existe una relación UsuarioMaestro para esta productora
    if (!existingRelation) {
      await UsuarioMaestro.create({
        usuario_registrante_id: id_usuario,
        productora_id: productora.id_productora,
      });
      logger.info(
        `${req.method} ${req.originalUrl} - Relación UsuarioMaestro creada para la productora con ID: ${productora.id_productora}`
      );
    }

    // Manejar documentos de forma opcional
    if (documentos && documentos.length > 0) {

      logger.info(
        `${req.method} ${req.originalUrl} - Procesando documentos. Cantidad: ${documentos.length}`
      );

      const tiposDocumentos = await ProductoraDocumentoTipo.findAll({
        where: {
          nombre_documento: documentos.map((doc: { nombre_documento: string }) => doc.nombre_documento),
        },
      });

      await Promise.all(
        documentos.map(async (doc: { nombre_documento: string; ruta_archivo_documento: string }) => {
          const tipoDocumento = tiposDocumentos.find((tipo) => tipo.nombre_documento === doc.nombre_documento);
          if (!tipoDocumento) {

            logger.warn(
              `${req.method} ${req.originalUrl} - Tipo de documento no válido: ${doc.nombre_documento}`
            );

            throw new Err.BadRequestError(`Tipo de documento no válido: ${doc.nombre_documento}`);
          }
          await ProductoraDocumento.create({
            usuario_principal_id: id_usuario,
            productora_id: existingRelation?.productora?.id_productora || productora?.id_productora,
            tipo_documento_id: tipoDocumento.id_documento_tipo,
            ruta_archivo_documento: doc.ruta_archivo_documento,
          });

          logger.info(
            `${req.method} ${req.originalUrl} - Documento registrado: ${doc.nombre_documento}, ruta: ${doc.ruta_archivo_documento}`
          );

        })
      );
    }

    // Actualizar el tipo_registro del usuario a ENVIADO
    await user.update({ tipo_registro: "ENVIADO" });

    logger.info(
      `${req.method} ${req.originalUrl} - Tipo de registro actualizado a ENVIADO para el usuario: ${user.email}`
    );

    // Enviar correo de notificación al usuario
    // await sendEmail({
    //   to: user.email,
    //   subject: "Solicitud de Aplicación Enviada",
    //   html: MESSAGES.EMAIL_BODY.APPLICATION_SUBMITTED(user.email),
    // });

    // Registrar auditoría
    await AuditoriaCambio.create({
      usuario_originario_id: userAuthId,
      usuario_destino_id: user.id_usuario,
      modelo: "Productora",
      tipo_auditoria: "ALTA",
      detalle: `Solicitud de aplicación enviada por ${user.email} para la productora ${productora.id_productora}`,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Auditoría registrada exitosamente.`
    );

    res.status(200).json({ message: MESSAGES.SUCCESS.APPLICATION.SAVED });

  } catch (err) {
    
    logger.error(
      `${req.method} ${req.originalUrl} - Error al enviar aplicación: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// ACTUALIZAR UNA APLICACION PENDIENTE
export const updateApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
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
    const usuarioRegistranteId = req.userId;
    if (!usuarioRegistranteId) {
      logger.warn(
        `${req.method} ${req.originalUrl} - ID de usuario activo no encontrado en el token.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Buscar al usuario mediante findUsuario
    const userData = await findUsuario({ userId: id_usuario });
    if (!userData) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    const { user } = userData;

    if (!user) {
      logger.error(`${req.method} ${req.originalUrl} - Usuario no encontrado.`);
      return res.status(404).json({
        message: MESSAGES.ERROR.USER.NOT_FOUND,
      });
    }

    // Obtener los datos de la Productora asociada al usuario
    const productora = await Productora.findOne({
      where: { cuit_cuil: productoraData.cuit_cuil },
    });

    if (!productora) {
      logger.error(`${req.method} ${req.originalUrl} - Paroductora no encontrada.`);
      return res.status(404).json({
        message: MESSAGES.ERROR.PRODUCTORA.NOT_FOUND,
      });
    }

    const cambios: string[] = [];

    // Paso 1: Modificar o crear los datos de la Productora, en caso de que no esté ya dada de alta
    if (productoraData && !productora.fecha_alta) {
      if (productora) {
        await productora.update(productoraData);
        cambios.push("Productora actualizada");
      } else {
        const nuevaProductora = await Productora.create({
          ...productoraData,
        });
        cambios.push(
          `Productora creada con ID: ${nuevaProductora.id_productora}`
        );
      }
    }

    // Paso 2: Actualizar o crear documentos específicos en ProductoraDocumento
    if (documentos && documentos.length > 0) {
      for (const documento of documentos) {
        const documentoExistente = await ProductoraDocumento.findOne({
          where: {
            usuario_principal_id: id_usuario,
            tipo_documento_id: documento.tipo_documento_id,
          },
        });

        if (documentoExistente) {
          await documentoExistente.update({
            ruta_archivo_documento: documento.ruta_archivo_documento,
          });
          cambios.push(
            `Documento actualizado: tipo_documento_id = ${documento.tipo_documento_id}`
          );
        } else {
          await ProductoraDocumento.create({
            usuario_principal_id: id_usuario,
            productora_id: productora ? productora.id_productora : null,
            tipo_documento_id: documento.tipo_documento_id,
            ruta_archivo_documento: documento.ruta_archivo_documento,
          });
          cambios.push(
            `Documento creado: tipo_documento_id = ${documento.tipo_documento_id}`
          );
        }
      }
    }

    // Paso 3: Auditar la actualización de la aplicación
    await AuditoriaCambio.create({
      usuario_originario_id: usuarioRegistranteId,
      usuario_destino_id: user.id_usuario,
      modelo: "Productora",
      tipo_auditoria: "CAMBIO",
      detalle: `Actualización realizada: ${cambios.join(", ")}`,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Auditoría registrada para la aplicación.`
    );

    // Paso 4: Auditar la actualización de la aplicación
    await AuditoriaCambio.create({
      usuario_originario_id: usuarioRegistranteId,
      usuario_destino_id: user.id_usuario,
      modelo: "Aplicación",
      tipo_auditoria: "CAMBIO",
      detalle: `Actualización realizada: ${cambios.join(", ")}`,
    });

    // Paso 5: Enviar el correo de notificación al usuario
    await sendEmail({
      to: user.email,
      subject: "Actualización de Aplicación Enviada",
      html: MESSAGES.EMAIL_BODY.APPLICATION_SUBMITTED(user.email),
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Aplicación actualizada y correo enviado exitosamente.`
    );

    res.status(200).json({
      message: MESSAGES.SUCCESS.APPLICATION.UPDATED,
      cambios,
    });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al actualizar la aplicación: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// ACTUALIZAR LOS DATOS DE UN USUARIO
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud para actualizar usuario`
    );

    const { id_usuario, datosUsuario } = req.body;

    // Verifica el usuario autenticado
    const userAuthId = req.userId as string;
    if (!userAuthId) {
      logger.warn(
        `${req.method} ${req.originalUrl} - ID de usuario activo no encontrado en el token.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Paso 1: Buscar al usuario mediante findUsuario
    const userData = await findUsuario({ userId: id_usuario });
    if (!userData) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    const { user } = userData;

    if (!user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró al usuario con ID: ${id_usuario}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    // Paso 2: Actualizar los datos de Usuario
    await user.update(datosUsuario);

    // Auditar la actualización del usuario
    await AuditoriaCambio.create({
      usuario_originario_id: userAuthId,
      usuario_destino_id: user.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Actualización de datos del usuario`,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario actualizado exitosamente.`
    );
    res.status(200).json({ message: MESSAGES.SUCCESS.USUARIO.USUARIO_UPDATED });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al actualizar el usuario: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
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

    // Verificar el usuario autenticado desde AuthenticatedRequest
    const userAuthId = req.userId as string;
    const authenticatedUserData = await findUsuario({ userId: userAuthId });

    if (!authenticatedUserData) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    const authenticatedRole = authenticatedUserData.user.rol?.nombre_rol;

    if (
      !authenticatedRole ||
      (authenticatedRole !== "admin_principal" &&
        authenticatedRole !== "admin_secundario")
    ) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario autenticado no autorizado para realizar esta acción.`
      );
      res.status(403).json({
        message: MESSAGES.ERROR.USER.NOT_AUTHORIZED,
      });
    }

    // Evitar que el usuario autenticado elimine su propia cuenta
    if (id_usuario === userAuthId) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario autenticado no puede eliminar su propia cuenta.`
      );
      res.status(400).json({
        message: MESSAGES.ERROR.USER.CANNOT_DELETE_SELF,
      });
    }

    // Buscar el usuario mediante findUsuario
    const userData = await findUsuario({ userId: id_usuario });
    if (!userData) {
      console.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    const { user, maestros } = userData;

    if (!user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró al usuario con ID: ${id_usuario}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    // Eliminar todos los registros de UsuarioMaestro asociados
    for (const maestro of maestros) {
      await AuditoriaCambio.create({
        usuario_originario_id: userAuthId,
        usuario_destino_id: user.id_usuario,
        modelo: "UsuarioMaestro",
        tipo_auditoria: "ELIMINACION",
        detalle: `Registro de UsuarioMaestro eliminado`,
      });
    }

    await UsuarioMaestro.destroy({
      where: { usuario_registrante_id: id_usuario },
    });

    // Auditar la eliminación del usuario
    await AuditoriaCambio.create({
      usuario_originario_id: userAuthId,
      usuario_destino_id: user.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "ELIMINACION",
      detalle: `Usuario eliminado`,
    });

    // Eliminar el registro de Usuario
    await Usuario.destroy({
      where: { id_usuario },
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario eliminado exitosamente: ${id_usuario}`
    );
    res.status(200).json({ message: MESSAGES.SUCCESS.USUARIO.USUARIO_DELETED });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al eliminar usuario: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

export const updateUserViews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id_usuario, vistas } = req.body;

    if (!id_usuario) {
      throw new Err.BadRequestError("Debe proporcionar un ID de usuario.");
    }

    await updateUserViewsService(id_usuario, vistas);

    logger.info(
      `${req.method} ${req.originalUrl} - Vistas actualizadas correctamente para el usuario: ${id_usuario}`
    );

    res.status(200).json({ message: "Vistas actualizadas exitosamente" });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al actualizar vistas del usuario: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
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

    res
      .status(200)
      .json({ message: "Estado de vistas actualizado exitosamente" });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al cambiar el estado de vistas del usuario: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};
