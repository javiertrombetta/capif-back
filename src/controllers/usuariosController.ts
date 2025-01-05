import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import crypto from "crypto";
import bcrypt from "bcrypt";

import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";

import * as MESSAGES from "../services/messages";
import * as Err from "../services/customErrors";
import { sendEmail } from "../services/emailService";

import { findUsuario, findRolByNombre, createVistaRelationsForUser } from "../services/userService";

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
        `${req.method} ${req.originalUrl} - Falta uno o más parámetros obligatorios (id_usuario).`
      );
      throw new Err.BadRequestError(
        MESSAGES.ERROR.VALIDATION.MISSING_PARAMETERS
      );
    }

    // Verifica el usuario autenticado
    const userAuthId = req.userId as string;
    if (!userAuthId) {
      logger.warn(
        `${req.method} ${req.originalUrl} - ID de usuario activo no encontrado en el token.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Buscar el usuario al que se le cambiará el estado mediante findUsuario
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

    // Alternar el tipo_registro entre HABILITADO y DESHABILITADO
    const nuevoEstado =
      user.tipo_registro === "HABILITADO" ? "DESHABILITADO" : "HABILITADO";
    await Usuario.update(
      { tipo_registro: nuevoEstado },
      { where: { id_usuario: user.id_usuario } }
    );

    // Crear una auditoría de la acción
    await AuditoriaCambio.create({
      usuario_originario_id: userAuthId,
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
    const { userId, isBlocked } = req.body;

    // Verificar que los parámetros necesarios estén en el body
    if (!userId || !isBlocked) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Falta uno o más parámetros obligatorios (id_usuario).`
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
        `${req.method} ${req.originalUrl} - ID de usuario activo no encontrado en el token.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Realiza la consulta para obtener el usuario
    const userData = await findUsuario({ userId });
    if (!userData) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado: ${userId}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    const user = userData.user;

    if (!user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró al usuario con ID: ${userId}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    // Verificar si el usuario está DESHABILITADO
    if (user.tipo_registro === "DESHABILITADO") {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se puede ${
          isBlocked ? "bloquear" : "desbloquear"
        } al usuario con ID ${userId} porque está DESHABILITADO.`
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
      `${req.method} ${req.originalUrl} - Usuario con ID ${userId} ${
        isBlocked ? "bloqueado" : "desbloqueado"
      } correctamente.`
    );

    // Registrar en auditoría el cambio de estado de bloqueo
    await AuditoriaCambio.create({
      usuario_originario_id: userAuthId,
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
    const { userId, productoraId, newRole } = req.body;

    // Verificar que los parámetros necesarios estén en el body
    if (!userId || !productoraId || !newRole) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Falta uno o más parámetros obligatorios (userId, productoraId, newRole).`
      );
      throw new Err.BadRequestError(
        MESSAGES.ERROR.VALIDATION.MISSING_PARAMETERS
      );
    }

    // Verificar el usuario activo desde AuthenticatedRequest
    const userAuthId = req.userId as string;

    if (!userAuthId || typeof userAuthId !== "string") {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario activo no encontrado o ID no válido en la solicitud.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Buscar el usuario y productora proporcionados
    const userData = await findUsuario({ userId, productoraId });

    // Error si se comprueba que no es igual lo buscado
    if (!userData) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    const user = userData.user;

    if (!user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró al usuario con ID: ${userId}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    if (!userData || userData.maestros.length === 0) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró el registro de UsuarioMaestro para userId: ${userId} y productoraId: ${productoraId}.`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NO_MAESTRO_RECORD);
    }

    if (userData.maestros.length > 1) {
      logger.error(
        `${req.method} ${req.originalUrl} - Más de un registro de UsuarioMaestro encontrado para userId: ${userId} y productoraId: ${productoraId}.`
      );
      throw new Err.BadRequestError(
        MESSAGES.ERROR.USER.MULTIPLE_MAESTRO_RECORDS
      );
    }

    const maestro = userData.maestros[0];

    // Verificar que el nuevo rol existe
    const rol = await findRolByNombre(newRole);
    if (!rol) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Rol inválido: ${newRole}.`
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID);
    }

    // Verificar que el usuario autenticado tiene permisos para cambiar roles
    const authenticatedUserData = await findUsuario({ userId: userAuthId });
    if (!authenticatedUserData) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado: ${userAuthId}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }
    const authenticatedRole = authenticatedUserData.maestros[0].rol.nombre_rol;

    if (
      authenticatedRole !== "admin_principal" &&
      authenticatedRole !== "admin_secundario"
    ) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario activo con ID ${userAuthId} no autorizado para cambiar roles.`
      );
      return res
        .status(403)
        .json({ message: MESSAGES.ERROR.USER.NOT_AUTHORIZED });
    }

    // Actualizar el rol en UsuarioMaestro
    const usuarioMaestro = await UsuarioMaestro.findOne({
      where: { id_usuario_maestro: maestro.maestroId },
    });

    if (!usuarioMaestro) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró registro en UsuarioMaestro para el maestro ID: ${maestro.maestroId}.`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NO_MAESTRO_RECORD);
    }

    usuarioMaestro.rol_id = rol.id_rol;
    usuarioMaestro.fecha_ultimo_cambio_rol = new Date();
    await usuarioMaestro.save();

    logger.info(
      `${req.method} ${req.originalUrl} - Rol del usuario con ID ${userId} actualizado correctamente a ${newRole}.`
    );

    // Registrar en Auditoría
    await AuditoriaCambio.create({
      usuario_originario_id: userAuthId,
      usuario_destino_id: user.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Rol actualizado a ${newRole} para el usuario con ID ${userId}`,
    });

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.ROLE_UPDATED });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al cambiar el rol de usuario: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// OBTENER TODOS LOS USUARIOS SEGÚN CONDICIONES
export const getUsers = async (
  req: Request<{ id?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const filters = req.query;

    if (id) {
      logger.info(
        `${req.method} ${req.originalUrl} - Solicitud recibida para obtener un usuario con ID: ${id}`
      );

      const user = await findUsuario({ userId: id });
      if (!user) {
        logger.warn(
          `${req.method} ${req.originalUrl} - Usuario no encontrado con ID: ${id}`
        );
        return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
      }

      logger.info(
        `${req.method} ${req.originalUrl} - Usuario encontrado con éxito con ID: ${id}`
      );
      res.status(200).json(user);
      return;
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener usuarios filtrados.`,
      filters
    );

    const findFilters: any = {};

    // Agregar filtros dinámicos desde la query
    if (filters.email) findFilters.email = String(filters.email);
    if (filters.nombresApellidos)
      findFilters.nombresApellidos = String(filters.nombresApellidos);
    if (filters.tipo_registro)
      findFilters.tipo_registro = String(filters.tipo_registro);
    if (filters.rolId) findFilters.rolId = String(filters.rolId);
    if (filters.nombre_rol) findFilters.nombre_rol = String(filters.nombre_rol);
    if (filters.productoraId)
      findFilters.productoraId = String(filters.productoraId);
    if (filters.productoraNombre)
      findFilters.productoraNombre = String(filters.productoraNombre);
    if (filters.limit) findFilters.limit = parseInt(String(filters.limit), 10);
    if (filters.offset)
      findFilters.offset = parseInt(String(filters.offset), 10);

    const users = await findUsuario(findFilters);

    if (!users || (Array.isArray(users) && users.length === 0)) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontraron usuarios con los filtros proporcionados.`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Se encontraron exitosamente ${
        Array.isArray(users) ? users.length : 1
      } usuarios.`
    );

    res.status(200).json(Array.isArray(users) ? users : [users]);
  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error: ${
        error instanceof Error ? error.message : "Error desconocido."
      }`
    );
    next(new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
  }
};

// OBTENER USUARIOS CON REGISTRO PENDIENTE
export const getRegistrosPendientes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener usuarios pendientes.`
    );

    // Configuración del filtro para usuarios con tipo_registro PENDIENTE
    const userFilters = { tipo_registro: "PENDIENTE" };

    // Buscar usuarios pendientes con su maestro asociado
    const pendingUsers = await findUsuario(userFilters);
    if (!pendingUsers) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado: ${userFilters}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    // Si no hay usuarios pendientes, devolver un array vacío
    if (
      !pendingUsers ||
      (Array.isArray(pendingUsers) && pendingUsers.length === 0)
    ) {
      logger.info(
        `${req.method} ${req.originalUrl} - No se encontraron usuarios pendientes.`
      );
      res.status(200).json([]);
    }

    // Filtrar usuarios con un único maestro asociado
    const usersWithSingleMaestro = Array.isArray(pendingUsers)
      ? pendingUsers.filter((user) => user.maestros.length === 1)
      : pendingUsers.maestros.length === 1
      ? [pendingUsers]
      : [];

    // Si no hay usuarios con un único maestro, devolver un array vacío
    if (usersWithSingleMaestro.length === 0) {
      logger.info(
        `${req.method} ${req.originalUrl} - No se encontraron usuarios pendientes con un único maestro asociado.`
      );
      res.status(200).json([]);
    }

    logger.info(
      `${req.method} ${req.originalUrl} - ${usersWithSingleMaestro.length} usuarios pendientes encontrados.`
    );

    res.status(200).json(usersWithSingleMaestro);
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
export const createUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, nombres_y_apellidos, telefono, rol } = req.body;

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para crear un usuario`,
      {
        email,
        nombres_y_apellidos,
        telefono,
        rol,
      }
    );

    // Verificar que se proporcionen los datos requeridos
    if (!email || !nombres_y_apellidos || !telefono || !rol) {
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
        `${req.method} ${req.originalUrl} - Usuario activo no encontrado o ID no válido en la solicitud.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Buscar datos del usuario autenticado
    const authenticatedData = await findUsuario({ userId: userAuthId });
    if (!authenticatedData) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario autenticado no encontrado o sin acceso válido.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // const authenticatedUser = authenticatedData.user;
    const authenticatedRole = authenticatedData.maestros[0].rol.nombre_rol;

    // Verificar que el rol del usuario autenticado sea válido
    if (authenticatedRole !== "admin_principal") {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario autenticado con rol no permitido para crear usuarios.`
      );
      return next(new Err.ForbiddenError(MESSAGES.ERROR.USER.NOT_AUTHORIZED));
    }

    // Verificar que el rol a crear sea válido según el rol del usuario autenticado
    if (authenticatedRole === "admin_principal" && rol !== "admin_secundario") {
      logger.warn(
        `${req.method} ${req.originalUrl} - Rol ${rol} no permitido para el usuario con rol ${authenticatedRole}.`
      );
      return next(
        new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID)
      );
    }

    // Verificar si el usuario ya existe utilizando `findUsuario`
    const existingUser = await findUsuario({ email });
    if (!existingUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado: ${email}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }
    if (existingUser.user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario ya registrado: ${email}`
      );
      return next(
        new Err.BadRequestError(MESSAGES.ERROR.REGISTER.ALREADY_REGISTERED)
      );
    }

    // Verificar si el rol existe
    const rolObj = await findRolByNombre(rol);
    if (!rolObj) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Rol no encontrado en la base de datos: ${rol}`
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
      email,
      clave: hashedPassword,
      tipo_registro: "HABILITADO",
      nombres_y_apellidos,
      telefono,
      fecha_ultimo_cambio_registro: new Date(),
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario creado exitosamente: ${newUser.id_usuario}`
    );

    // Crear el registro en UsuarioMaestro
    await UsuarioMaestro.create({
      usuario_registrante_id: newUser.id_usuario,
      rol_id: rolObj.id_rol,
      productora_id: null,
      fecha_ultimo_cambio_rol: new Date(),
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Registro en UsuarioMaestro creado exitosamente para usuario: ${newUser.id_usuario}`
    );

    // Crear relaciones en UsuarioVistaMaestro
    await createVistaRelationsForUser(newUser.id_usuario, rolObj.id_rol);

    logger.info(
      `${req.method} ${req.originalUrl} - Relaciones de vistas creadas para el Administrador Secundario: ${newUser.email}`
    );

    // Registrar en Auditoría
    await AuditoriaCambio.create({
      usuario_originario_id: userAuthId,
      usuario_destino_id: newUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "ALTA",
      detalle: `Usuario creado manualmente con rol ${rol}`,
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

// OBTENER LOS DATOS CARGADOS POR UN USUARIO
export const getRegistroPendiente = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud para cargar datos personales`
    );

    const { id_usuario } = req.body;

    // Verificar que se proporcionen los datos requeridos
    if (!id_usuario) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Faltan parámetros obligatorios.`
      );
      return next(
        new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.MISSING_PARAMETERS)
      );
    }

    // Buscar el usuario y los datos asociados mediante findUsuario
    const userData = await findUsuario({ userId: id_usuario });
    if (!userData) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado: ${id_usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    const { user, maestros } = userData;

    if (!user) {
      logger.error(`${req.method} ${req.originalUrl} - Usuario no encontrado.`);
      return res.status(404).json({
        message: MESSAGES.ERROR.USER.NOT_FOUND,
      });
    }

    if (user.tipo_registro !== "PENDIENTE") {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no tiene registro pendiente.`
      );
      return res.status(400).json({
        message: MESSAGES.ERROR.REGISTER.NO_PENDING_USERS,
      });
    }

    // Extraer las productoras asociadas
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

    if (productoras.length > 1) {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario ya tiene productoras asociadas.`
      );
      return next(
        new Err.NotFoundError(
          MESSAGES.ERROR.USER.MULTIPLE_MASTERS_FOR_PRINCIPAL
        )
      );
    }

    // Configurar la respuesta con datos personales y asociados
    const responseData: any = {
      user,
      productoras,
    };

    logger.info(
      `${req.method} ${req.originalUrl} - Datos personales y asociados cargados con éxito para el usuario ${id_usuario}`
    );

    res.status(200).json({
      message: MESSAGES.SUCCESS.APPLICATION.SAVED,
      data: responseData,
    });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al cargar datos personales: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN));
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

    const { usuario } = req.body;

    // Validar parámetros
    if (!usuario) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Faltan parámetros obligatorios.`
      );
      return next(
        new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.MISSING_PARAMETERS)
      );
    }

    // Verificar el usuario autenticado desde AuthenticatedRequest
    const userAuthId = req.userId as string;
    const authenticatedUserData = await findUsuario({ userId: userAuthId });
    if (!authenticatedUserData) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado: ${userAuthId}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }
    const authenticatedRole = authenticatedUserData.maestros[0].rol.nombre_rol;

    if (!userAuthId || !authenticatedUserData || !authenticatedUserData.user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no autenticado o sin datos válidos.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

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

    // Buscar al usuario mediante findUsuario
    const userData = await findUsuario({ userId: usuario });
    if (!userData) {
      logger.warn(
        `${req.method} ${req.originalUrl} - UsuarioMaestro no encontrado: ${usuario}`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND));
    }

    if (!userData.user) {
      logger.error(`${req.method} ${req.originalUrl} - Usuario no encontrado.`);
      return res.status(404).json({
        message: MESSAGES.ERROR.USER.NOT_FOUND,
      });
    }

    if (!userData.maestros[0].productora) {
      logger.error(
        `${req.method} ${req.originalUrl} - Datos de productora no encontrada.`
      );
      return res.status(404).json({
        message: MESSAGES.ERROR.PRODUCTORA.NOT_FOUND,
      });
    }

    if (userData.maestros.length > 1) {
      logger.error(
        `${req.method} ${req.originalUrl} - El usuario tiene más de una productora asignada.`
      );
      return res.status(404).json({
        message: MESSAGES.ERROR.USER.MULTIPLE_MAESTRO_RECORDS,
      });
    }

    // Establecer la fecha de hoy para fecha_alta en Productora
    userData.maestros[0].productora.fecha_alta = new Date();

    // Crear las auditorías correspondientes
    await AuditoriaCambio.create({
      usuario_originario_id: authenticatedUserData.user.id_usuario,
      usuario_destino_id: userData.user.id_usuario,
      modelo: "Productora",
      tipo_auditoria: "ALTA",
      detalle: `Autorización de ${userData.maestros[0].productora.nombre_productora} en Productora (${userData.maestros[0].productora.id_productora})`,
    });

    // Enviar el correo de notificación al usuario
    await sendEmail({
      to: userData.user.email,
      subject: "Registro Exitoso como Productor Principal",
      html: MESSAGES.EMAIL_BODY.PRODUCTOR_PRINCIPAL_NOTIFICATION(
        userData.maestros[0].productora.nombre_productora,
        userData.maestros[0].productora.cuit_cuil,
        userData.maestros[0].productora.cbu,
        userData.maestros[0].productora.alias_cbu
      ),
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario autorizado y correo enviado exitosamente.`
    );
    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.AUTHORIZED });
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
    const authenticatedUserData = await findUsuario({ userId: userAuthId });

    if (!authenticatedUserData) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    const authenticatedRole = authenticatedUserData.maestros[0].rol.nombre_rol;

    if (!userAuthId || !authenticatedUserData || !authenticatedUserData.user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no autenticado o sin datos válidos.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    if (
      !authenticatedRole ||
      (authenticatedRole !== "admin_principal" &&
        authenticatedRole !== "admin_secundario")
    ) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario autenticado no autorizado para realizar esta acción.`
      );
      return res.status(403).json({
        message: MESSAGES.ERROR.USER.NOT_AUTHORIZED,
      });
    }

    // Buscar el usuario mediante findUsuario
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
      tipo_auditoria: "RECHAZO",
      detalle: `Rechazo de aplicación con comentario: ${comentario}`,
    });

    // Enviar correo de notificación de rechazo

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
      `${req.method} ${req.originalUrl} - Solicitud para enviar aplicación`
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
    if (!productoraData || !documentos || !nombre || !apellido || !telefono) {
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

    await user.update({ nombre, apellido, telefono });
    await user.save();

    // Validar el tipo de persona (FÍSICA o JURÍDICA)
    const tipoPersonaValida = ["FISICA", "JURIDICA"].includes(
      productoraData.tipo_persona
    );
    if (!tipoPersonaValida) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Tipo de persona inválido.`
      );
      throw new Err.BadRequestError(
        "El tipo de persona debe ser FISICA o JURIDICA."
      );
    }

    // Crear la nueva Productora
    const nuevaProductora = await Productora.create({
      ...productoraData,
      fecha_alta: new Date(),
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Productora creada con éxito: ${nuevaProductora.id_productora}`
    );

    // Actualizar UsuarioMaestro con el productora_id
    const usuarioMaestro = await UsuarioMaestro.findOne({
      where: { usuario_registrante_id: id_usuario },
    });

    if (!usuarioMaestro) {
      logger.warn(
        `${req.method} ${req.originalUrl} - UsuarioMaestro no encontrado para el usuario: ${id_usuario}
    `
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NO_MAESTRO_RECORD);
    }

    usuarioMaestro.productora_id = nuevaProductora.id_productora;
    await usuarioMaestro.save();

    // Obtener los IDs correspondientes a los nombres de documentos enviados
    const nombresDocumentos = documentos.map(
      (doc: any) => doc.nombre_documento
    );

    const tiposDocumentos = await ProductoraDocumentoTipo.findAll({
      where: {
        nombre_documento: nombresDocumentos,
      },
    });

    // Crear los documentos
    const documentosCargados = documentos.map(async (doc: any) => {
      const tipoDocumento = tiposDocumentos.find(
        (tipo) => tipo.nombre_documento === doc.nombre_documento
      );

      if (!tipoDocumento) {
        logger.warn(
          `${req.method} ${req.originalUrl} - Tipo de documento no encontrado: ${doc.nombre_documento}`
        );
        throw new Err.BadRequestError(
          `No se encontró un tipo de documento con el nombre: ${doc.nombre_documento}`
        );
      }

      return await ProductoraDocumento.create({
        usuario_principal_id: id_usuario,
        productora_id: nuevaProductora.id_productora,
        tipo_documento_id: tipoDocumento.id_documento_tipo,
        ruta_archivo_documento: doc.ruta_archivo_documento,
      });
    });

    await Promise.all(documentosCargados); 

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
      tipo_auditoria: "APLICACION_ENVIADA",
      detalle: `Solicitud de aplicación enviada por ${user.email} para la productora ${nuevaProductora.id_productora}`,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Aplicación enviada exitosamente.`
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
      where: { cuit_cuil: productoraData?.cuit_cuil }, // Usar CUIT/CUIL como identificador
    });

    const cambios: string[] = [];

    // Paso 1: Modificar o crear los datos de la Productora
    if (productoraData) {
      if (productora) {
        await productora.update(productoraData);
        cambios.push("Productora actualizada");
      } else {
        const nuevaProductora = await Productora.create({
          ...productoraData,
          fecha_alta: new Date(), // Fecha de alta automática
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

    const authenticatedRole = authenticatedUserData.maestros[0].rol.nombre_rol;

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
