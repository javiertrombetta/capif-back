import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import logger from "../config/logger";

import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";
import { verifyToken } from "../middlewares/auth";

import * as MESSAGES from "../services/messages";
import { sendEmail } from "../services/emailService";
import {
  createUsuario,
  createUsuarioMaestro,
  updateUsuarioMaestro,
  findUsuario,
  findVistasforUsuario,
  findRolByNombre,
  assignVistasToUser,
} from "../services/userService";
import { actualizarFechaFinSesion } from "../services/sesionService";
import {
  hashPassword,
  verifyPassword,
  handleTokenVerification,
} from "../services/validationsService";
import * as Err from "../services/customErrors";

import {
  AuditoriaCambio,
  AuditoriaSesion,
} from "../models";

// REGISTER PRODUCTOR 'PRIMARIO'
export const registerPrimary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para registrar un nuevo usuario`
    );

    const { email, password } = req.body;

    // Verifica si el usuario ya existe
    const existingUser = await findUsuario({ email });
    if (existingUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario ya registrado: ${email}`
      );
      throw new Err.ConflictError(MESSAGES.ERROR.REGISTER.ALREADY_REGISTERED);
    }

    // Cifra la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea un nuevo usuario con el estado 'NUEVO'
    const newUsuario = await createUsuario({
      email,
      clave: hashedPassword,
      tipo_registro: "NUEVO",
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario registrado exitosamente: ${email}`
    );

    const userRol = await findRolByNombre("productor_principal");

    // Crear el registro correspondiente en UsuarioMaestro usando el servicio
    const newUsuarioMaestro = await createUsuarioMaestro({
      usuario_registrante_id: newUsuario.id_usuario,
      rol_id: userRol.id_rol,
      productora_id: null,
      fecha_ultimo_cambio_rol: new Date(),
    });

    // Crear relaciones en UsuarioVistaMaestro
    await assignVistasToUser(newUsuario.id_usuario, userRol.id_rol);

    logger.info(
      `${req.method} ${req.originalUrl} - Relaciones de vistas creadas para el Productor Principal: ${email}`
    );

    // Configuración del token de verificación de email
    const tokenExpiration = process.env.EMAIL_TOKEN_EXPIRATION || "1d";
    if (!process.env.JWT_SECRET)
      throw new Error("Falta JWT_SECRET en el archivo de configuración");
    const emailToken = jwt.sign(
      { id_usuario: newUsuario.id_usuario },
      process.env.JWT_SECRET,
      {
        expiresIn: tokenExpiration,
      }
    );

    try {
      const decoded = handleTokenVerification(
        emailToken,
        process.env.JWT_SECRET!
      ) as JwtPayload;
      newUsuario.email_verification_token = emailToken;
      newUsuario.email_verification_token_expires = new Date(
        decoded.exp! * 1000
      );
    } catch (err) {
      logger.error(
        `${req.method} ${req.originalUrl} - Error al verificar el token de email para ${newUsuario.email}`,
        err
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
    }

    await newUsuario.save();

    logger.debug(
      `${req.method} ${req.originalUrl} - Token de verificación generado para: ${email}`
    );

    // Enviar correo de verificación
    /*
    const validationLink = `${emailToken}`;
    const emailBody = MESSAGES.EMAIL_BODY.VALIDATE_ACCOUNT(validationLink);
    await sendEmail({
      to: newUsuario.email,
      subject: "Confirmá tu cuenta para ingresar al sistema",
      html: emailBody,
    });
 
    logger.info(
      `${req.method} ${req.originalUrl} - Correo de validación enviado a: ${email}`
    );
    
    */

    // Registra la acción en AuditoriaCambio

    await AuditoriaCambio.create({
      usuario_originario_id: null,
      usuario_destino_id: newUsuario.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "ALTA",
      detalle: `Registro en Usuario (${newUsuario.id_usuario})`,
    });

    await AuditoriaCambio.create({
      usuario_originario_id: null,
      usuario_destino_id: newUsuario.id_usuario,
      modelo: "UsuarioMaestro",
      tipo_auditoria: "ALTA",
      detalle: `Registro de usuario principal en UsuarioMaestro (${newUsuarioMaestro.id_usuario_maestro})`,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Auditoría registrada para el usuario: ${email}`
    );

    // Retorno de mensaje al usuario comn código
    res
      .status(201)
      .json({ message: MESSAGES.SUCCESS.AUTH.REGISTER_PRIMARY_FIRST });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error en el registro: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// REGISTER PRODUCTOR 'SECUNDARIO'
export const registerSecondary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para registrar un usuario secundario`
    );

    const { email, nombre, apellido, telefono } = req.body;

    // Obtener el ID del usuario autenticado desde el token
    const primaryUserAuthId = req.userId as string;
    const primaryProductoraAuthId = req.productoraId;

    if (!primaryUserAuthId || !primaryProductoraAuthId) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no autenticado o sin datos válidos.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Verificar el usuario autenticado
    const primaryUserData = await findUsuario({
      userId: primaryUserAuthId,
      productoraNombre: primaryProductoraAuthId,
    });

    // Error si se comprueba que no es igual lo buscado a lo pasado por el body
    if (!primaryUserData) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario principal no encontrado o sin acceso válido.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Error si tiene más de un maestro asociado porque el principal solo puede tener una asociación
    if (primaryUserData.maestros.length !== 1) {
      logger.error(
        `${req.method} ${req.originalUrl} - Usuario principal tiene múltiples maestros asociados.`
      );
      throw new Err.ConflictError(
        MESSAGES.ERROR.USER.MULTIPLE_MASTERS_FOR_PRINCIPAL
      );
    }

    if (
      !primaryUserData.maestros[0].productora ||
      !primaryUserData.maestros[0].productora.nombre_productora
    ) {
      logger.error(
        `${req.method} ${req.originalUrl} - Productora asociada no tiene un nombre válido.`
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.PRODUCTORA.INVALID_NAME);
    }

    const primaryUser = primaryUserData.user;
    const primaryUserRoleName = primaryUserData.maestros[0].rol.nombre_rol;
    const primaryProductoraId =
      primaryUserData.maestros[0].productora.id_productora;

    if (
      !primaryUser ||
      primaryUser.tipo_registro !== "HABILITADO" ||
      (primaryUserRoleName !== "admin_principal" &&
        primaryUserRoleName !== "productor_principal")
    ) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no autorizado para registrar secundarios.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Verificar que el usuario primario tiene una productora asignada
    if (!primaryProductoraId) {
      throw new Error("El usuario principal no tiene una productora asociada.");
    }

    // Verifica si el usuario a crear ya existe
    const existingUser = await findUsuario({ email });
    if (!existingUser || !existingUser.user) {
      throw new Error("El usuario principal no tiene una productora asociada.");
    }

    if (existingUser) {
      const existingUserData = existingUser.user;

      // Si el usuario ya existe y tiene tipo_registro NUEVO o CONFIRMADO, actualizar en lugar de crear uno nuevo
      if (
        existingUserData.tipo_registro === "NUEVO" ||
        existingUserData.tipo_registro === "CONFIRMADO"
      ) {
        await existingUserData.update({
          tipo_registro: "HABILITADO",
        });

        // Llamar a updateUsuarioMaestro desde userService para actualizar el registro en UsuarioMaestro
        const secondaryUserRole =
          primaryUserRoleName === "admin_principal"
            ? "admin_secundario"
            : "productor_secundario";

        await updateUsuarioMaestro(existingUserData.id_usuario, {
          productora_id: primaryProductoraId,
          rol_id: secondaryUserRole,
        });

        // Crear relaciones de vistas
        const rolObj = await findRolByNombre(secondaryUserRole);
        await assignVistasToUser(existingUser.user.id_usuario, rolObj.id_rol);

        logger.info(
          `${req.method} ${req.originalUrl} - Relaciones de vistas creadas para el Productor Secundario: ${existingUser.user.email}`
        );

        // Auditoría de actualización
        await AuditoriaCambio.create({
          usuario_originario_id: primaryUser.id_usuario,
          usuario_destino_id: existingUserData.id_usuario,
          modelo: "UsuarioMaestro",
          tipo_auditoria: "CAMBIO",
          detalle: `Actualización en UsuarioMaestro (${existingUser.maestros})`,
        });

        logger.info(
          `${req.method} ${req.originalUrl} - Usuario secundario existente actualizado: ${email}`
        );
        return res
          .status(200)
          .json({ message: MESSAGES.SUCCESS.AUTH.REGISTER_SECONDARY });
      } else {
        logger.warn(
          `${req.method} ${req.originalUrl} - Usuario ya registrado: ${email}`
        );
        throw new Err.ConflictError(MESSAGES.ERROR.REGISTER.ALREADY_REGISTERED);
      }
    }

    // Genera una clave temporal
    const { nanoid } = await import("nanoid");
    const temporaryPassword = nanoid(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Determina el rol del usuario secundario basado en el rol del usuario principal
    const secondaryUserRole =
      primaryUserRoleName === "admin_principal"
        ? "admin_secundario"
        : "productor_secundario";

    // Crea el nuevo usuario con tipo_registro SECUNDARIO
    const newUsuario = await createUsuario({
      email,
      clave: hashedPassword,
      tipo_registro: "HABILITADO",
      nombre,
      apellido,
      telefono,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario secundario registrado exitosamente: ${email}`
    );

    // Crear el registro en UsuarioMaestro para el usuario secundario con el rol asignado
    const newUsuarioMaestro = await createUsuarioMaestro({
      usuario_registrante_id: newUsuario.id_usuario,
      rol_id: secondaryUserRole,
      productora_id: primaryProductoraId,
      fecha_ultimo_cambio_rol: new Date(),
    });

    // Configuración del token de verificación de email
    const tokenExpiration = process.env.EMAIL_TOKEN_EXPIRATION || "1d";
    if (!process.env.JWT_SECRET)
      throw new Error("Falta JWT_SECRET en el archivo de configuración");
    const emailToken = jwt.sign(
      { id_usuario: newUsuario.id_usuario },
      process.env.JWT_SECRET,
      {
        expiresIn: tokenExpiration,
      }
    );

    // Guarda el token de verificación en el usuario
    try {
      const decoded = handleTokenVerification(
        emailToken,
        process.env.JWT_SECRET!
      ) as JwtPayload;
      newUsuario.email_verification_token = emailToken;
      newUsuario.email_verification_token_expires = new Date(
        decoded.exp! * 1000
      );
    } catch (err) {
      logger.error(
        `${req.method} ${req.originalUrl} - Error al verificar el token de email para el usuario secundario ${newUsuario.email}`,
        err
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
    }

    await newUsuario.save();

    logger.debug(
      `${req.method} ${req.originalUrl} - Token de verificación generado para el usuario secundario: ${email}`
    );

    // Enviar correo de verificación con clave temporal
    const validationLink = `${emailToken}`;
    const emailBody = MESSAGES.EMAIL_BODY.VALIDATE_ACCOUNT_WITH_TEMP_PASSWORD(
      validationLink,
      temporaryPassword
    );
    await sendEmail({
      to: newUsuario.email,
      subject: "Confirmá tu cuenta secundaria para ingresar al sistema",
      html: emailBody,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Correo de verificación enviado a: ${email}`
    );

    // Registrar acción en AuditoriaCambio
    const auditoriaDetalle = `Registro en Usuario (${newUsuario.id_usuario})`;
    await AuditoriaCambio.create({
      usuario_originario_id: primaryUser.id_usuario,
      usuario_destino_id: newUsuario.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "ALTA",
      detalle: auditoriaDetalle,
    });

    await AuditoriaCambio.create({
      usuario_originario_id: primaryUser.id_usuario,
      usuario_destino_id: newUsuario.id_usuario,
      modelo: "UsuarioMaestro",
      tipo_auditoria: "CAMBIO",
      detalle: `Registro de usuario secundario en UsuarioMaestro (${newUsuarioMaestro.id_usuario_maestro})`,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Auditoría registrada para el usuario secundario: ${email}`
    );

    // Retorno de mensaje de éxito
    res.status(201).json({ message: MESSAGES.SUCCESS.AUTH.REGISTER_SECONDARY });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error en el registro de usuario secundario: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// LOGIN
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para iniciar sesión`
    );

    const { email, password } = req.body;

    // Consulta para obtener el usuario y los maestros asociados
    const userData = await findUsuario({ email });
    if (!userData || !userData.user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Intento de inicio de sesión fallido. Usuario no encontrado: ${email}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    const user = userData.user;
    const maestros = userData.maestros;

    // Verificación de sesión existente
    const existingToken = req.cookies["auth_token"];
    const decodedToken = verifyToken(existingToken, process.env.JWT_SECRET!);

    if (decodedToken && decodedToken.id === user.id_usuario) {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario ${email} ya ha iniciado sesión previamente.`
      );
      return res
        .status(400)
        .json({ message: MESSAGES.ERROR.VALIDATION.ALREADY_LOGGED_IN });
    }

    // Verificación de confirmación de cuenta
    if (user.tipo_registro === "NUEVO") {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario ${email} no está confirmado.`
      );
      return res
        .status(403)
        .json({ message: MESSAGES.ERROR.REGISTER.USER_NOT_CONFIRMED });
    }

    // Validación de contraseña
    const isPasswordValid = await verifyPassword(password, user.clave);
    const MAX_LOGIN_ATTEMPTS = parseInt(
      process.env.MAX_LOGIN_ATTEMPTS || "5",
      10
    );

    if (!isPasswordValid) {
      // Incrementa intentos fallidos
      user.intentos_fallidos += 1;

      // Si los intentos fallidos alcanzan el límite, bloquea el usuario
      if (user.intentos_fallidos >= MAX_LOGIN_ATTEMPTS) {
        user.is_bloqueado = true;
        logger.warn(
          `${req.method} ${req.originalUrl} - El usuario ${email} ha sido bloqueado por superar el máximo de intentos fallidos`
        );

        // Registro en auditoría de bloqueo de usuario        
        await AuditoriaCambio.create({
          usuario_originario_id: user.id_usuario,
          modelo: "Usuario",
          tipo_auditoria: "ERROR",
          detalle: `Bloqueo después de ${MAX_LOGIN_ATTEMPTS} intentos fallidos`,
        });
        
      }

      // Guardar cambios en intentos fallidos y estado de habilitación del usuario
      await user.save();

      // Registro de auditoría para intento de inicio de sesión fallido

      if (!user.is_bloqueado) {
        await AuditoriaCambio.create({
          usuario_originario_id: user.id_usuario,
          modelo: "Usuario",
          tipo_auditoria: "ERROR",
          detalle: `Intento ${user.intentos_fallidos} fallido de inicio de sesión.`,
        });
      }

      // Registra en el log y lanza un error de autenticación
      logger.warn(
        `${req.method} ${req.originalUrl} - Intento de inicio de sesión fallido. Contraseña incorrecta para el usuario: ${email}. Intentos fallidos: ${user.intentos_fallidos}`
      );

      throw new Err.UnauthorizedError(
        MESSAGES.ERROR.VALIDATION.PASSWORD_INCORRECT
      );
    }

    user.intentos_fallidos = 0;
    await user.save();

    // Preparar los datos de las productoras
    const productoras: { id: string; nombre: string }[] = [];

    maestros.forEach((maestro) => {
      if (maestro.productora && maestro.productora.nombre_productora) {
        productoras.push({
          id: maestro.productora.id_productora,
          nombre: maestro.productora.nombre_productora,
        });
      }
    });

    // Obtener las vistas permitidas para este usuario
    const vistasPermitidas = await findVistasforUsuario(user.id_usuario);

    // Generar un token básico con `userId`
    const token = jwt.sign(
      { id: user.id_usuario, vistas: vistasPermitidas },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_EXPIRATION || "1h",
      }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: parseInt(process.env.COOKIE_MAX_AGE || "3600000", 10),
    });

    // Registro de auditoría para acceso exitoso

    await AuditoriaCambio.create({
      usuario_originario_id: user.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "AUTH",
      detalle: `Inicio de sesión exitoso`,
    });

    // Registro de sesión

    await AuditoriaSesion.create({
      usuario_registrante_id: user.id_usuario,
      fecha_inicio_sesion: new Date(),
      ip_origen: req.ip,
      navegador: req.headers["user-agent"] || null,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Inicio de sesión exitoso para el usuario: ${email}`
    );

    return res
      .status(200)
      .json({ message: MESSAGES.SUCCESS.AUTH.LOGIN, productoras });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error en el inicio de sesión: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// OBTENER EL ROL DEL USUARIO AUTENTICADO
export const getRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud para obtener el rol del usuario`
    );

    const { productora_id } = req.query;

    // Verificar que el usuario esté autenticado
    const primaryUserAuthId = req.userId as string;

    if (!primaryUserAuthId) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado.`);
      return res
        .status(401)
        .json({ message: MESSAGES.ERROR.USER.NOT_AUTHORIZED });
    }

    // Buscar información del usuario autenticado
    const userData = await findUsuario({
      userId: primaryUserAuthId,
      productoraId: productora_id ? (productora_id as string) : undefined,
    });

    if (
      !userData ||
      !userData.user ||
      !userData.maestros ||
      userData.maestros.length === 0
    ) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró información del usuario con ID: ${primaryUserAuthId}`
      );
      return res.status(404).json({ message: MESSAGES.ERROR.USER.NOT_FOUND });
    }

    const maestro = userData.maestros[0];
    const roleName = maestro.rol.nombre_rol;

    if (!roleName) {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario con ID ${primaryUserAuthId} no tiene un rol asignado.`
      );
      return res
        .status(404)
        .json({ message: MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED });
    }

    // Validar si el rol requiere `productora_id`
    if (
      (roleName === "productor_principal" &&
        userData.user.tipo_registro !== "HABILITADO" &&
        userData.user.tipo_registro !== "DESHABILITADO") ||
      roleName === "productor_secundario"
    ) {
      if (!productora_id) {
        logger.warn(
          `${req.method} ${req.originalUrl} - El rol ${roleName} requiere un productora_id.`
        );
        return res
          .status(400)
          .json({ message: MESSAGES.ERROR.VALIDATION.PRODUCTORA_ID_REQUIRED });
      }
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Rol del usuario con ID ${primaryUserAuthId}: ${roleName}`
    );

    res.status(200).json({ role: roleName });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al obtener el rol del usuario: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// SELECCIONAR PRODUCTORA ACTIVA Y CARGAR LA COOKIE CORRESPONDIENTE
export const selectProductora = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productoraId } = req.body;

    if (!productoraId) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Falta el productoraId en la solicitud.`
      );
      return res
        .status(400)
        .json({ message: MESSAGES.ERROR.VALIDATION.PRODUCTORA_ID_REQUIRED });
    }

    const primaryUserAuthId = req.userId as string;

    if (!primaryUserAuthId) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Buscar el UsuarioMaestro asociado al usuarioId y productoraId
    const userData = await findUsuario({
      userId: primaryUserAuthId,
      productoraId,
    });

    if (
      !userData ||
      !userData.maestros ||
      !userData ||
      userData.maestros.length === 0
    ) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró un maestro asociado con la productora ${productoraId}.`
      );
      return res
        .status(403)
        .json({ message: MESSAGES.ERROR.VALIDATION.PRODUCTORA_NOT_ALLOWED });
    }

    const selectedMaestro = userData.maestros.find(
      (maestro) =>
        maestro.productora &&
        maestro.productora.id_productora &&
        maestro.productora.id_productora === productoraId
    );

    if (!selectedMaestro || !selectedMaestro.productora) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Productora no asociada al usuario.`
      );
      return res
        .status(403)
        .json({ message: MESSAGES.ERROR.VALIDATION.PRODUCTORA_NOT_ALLOWED });
    }

    // Crear cookie `active_sesion` con los datos de la productora seleccionada
    res.cookie(
      "active_sesion",
      JSON.stringify({
        maestroId: selectedMaestro.maestroId,
        productoraId: selectedMaestro.productora.id_productora,
        rolId: selectedMaestro.rol.id_rol,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: parseInt(process.env.COOKIE_MAX_AGE || "3600000", 10),
      }
    );

    // Registro en auditoría de selección de productora
    await AuditoriaCambio.create({
      usuario_originario_id: primaryUserAuthId,
      modelo: "UsuarioMaestro",
      tipo_auditoria: "Cambio",
      detalle: `Cookie de productora activa (${productoraId})`,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Productora activa asignada: ${selectedMaestro.productora.nombre_productora}`
    );

    res
      .status(200)
      .json({ message: MESSAGES.SUCCESS.AUTH.PRODUCTORA_SELECTED });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al seleccionar productora: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// OBTENER LAS PRODUCTORAS ASOCIADAS AL USUARIO
export const getProductoras = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId as string;

    if (!userId) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado.`);
      return next(
        new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED)
      );
    }

    // Buscar las productoras asociadas al usuario actual
    const userData = await findUsuario({ userId });
    if (!userData) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    if (!userData.maestros.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontraron productoras asociadas para el usuario.`
      );
      return res
        .status(404)
        .json({ message: MESSAGES.ERROR.USER.NO_ASSOCIATED_PRODUCTORAS });
    }

    // Filtrar y mapear las productoras válidas
    const productoras = userData.maestros
      .map((maestro) => maestro.productora)
      .filter((productora) => productora && productora.nombre_productora)
      .map((productora) => ({
        id: productora!.id_productora,
        nombre: productora!.nombre_productora,
      }));

    if (!productoras.length) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontraron productoras válidas asociadas para el usuario.`
      );
      return res
        .status(404)
        .json({ message: MESSAGES.ERROR.USER.NO_ASSOCIATED_PRODUCTORAS });
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Productoras asociadas obtenidas correctamente.`
    );
    return res.status(200).json({ productoras });
  } catch (err) {
    const error = err as Error;
    logger.error(
      `${req.method} ${req.originalUrl} - Error al obtener productoras: ${error.message}`
    );
    next(error);
  }
};

// SOLICITAR RESETEO DE CLAVE
export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para restablecer la contraseña`
    );

    const { email } = req.body;

    // Verifica si el usuario existe
    const result = await findUsuario({ email });
    if (!result || !result.user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Solicitud de restablecimiento de contraseña fallida. Usuario no encontrado: ${email}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    const user = result.user;

    // Configuración de expiración del token de restablecimiento
    const tokenExpiration = process.env.RESET_TOKEN_EXPIRATION || "1h";
    if (!process.env.JWT_SECRET) {
      throw new Error("Falta JWT_SECRET en el archivo de configuración");
    }

    // Genera el token de restablecimiento
    const resetToken = jwt.sign(
      { id_usuario: user.id_usuario },
      process.env.JWT_SECRET,
      {
        expiresIn: tokenExpiration,
      }
    );
    user.reset_password_token = resetToken;

    // Calcula la fecha de expiración del token de restablecimiento
    try {
      const decoded = handleTokenVerification(
        resetToken,
        process.env.JWT_SECRET!
      ) as JwtPayload;
      user.reset_password_token_expires = new Date(decoded.exp! * 1000);
    } catch (err) {
      logger.error(
        `${req.method} ${req.originalUrl} - Error al verificar el token de restablecimiento de contraseña para el usuario: ${email}`,
        err
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
    }

    await user.save();

    logger.debug(
      `${req.method} ${req.originalUrl} - Token de restablecimiento de contraseña generado para el usuario: ${email}`
    );

    // Registro en auditoría para la solicitud de restablecimiento de contraseña
    await AuditoriaCambio.create({
      usuario_originario_id: user.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Solicitud de cambio de clave.`,
    });

    // Genera el enlace de restablecimiento y envía el correo electrónico
    const resetLink = `${resetToken}`;
    const emailBody = MESSAGES.EMAIL_BODY.PASSWORD_RECOVERY(resetLink);
    await sendEmail({
      to: user.email,
      subject: "Solicitud de restablecimiento de contraseña",
      html: emailBody,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Correo de restablecimiento de contraseña enviado a: ${email}`
    );
    res
      .status(200)
      .json({ message: MESSAGES.SUCCESS.AUTH.PASSWORD_RESET_REQUESTED });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error en la solicitud de restablecimiento de contraseña: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// VALIDAR EL TOKEN ENVIADO AL RESETEAR LA CLAVE
export const validateEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para validar el email`
    );

    const { token } = req.params;
    // Verificar el token usando handleTokenVerification
    let decoded: JwtPayload;
    try {
      decoded = handleTokenVerification(
        token,
        process.env.JWT_SECRET!
      ) as JwtPayload;
    } catch (err) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Token de verificación inválido o expirado.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.JWT.INVALID);
    }

    // Busca al usuario usando el ID decodificado y verifica el token y su expiración
    const result = await findUsuario({ userId: decoded.id_usuario });
    if (!result) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }
    const user = result.user;

    if (
      !user ||
      user.email_verification_token !== token ||
      user.email_verification_token_expires! < new Date()
    ) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado o token inválido.`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    // Actualiza el tipo_registro del usuario a "CONFIRMADO" y limpia el token de verificación
    user.tipo_registro = "CONFIRMADO";
    user.email_verification_token = null;
    user.email_verification_token_expires = null;
    await user.save();

    logger.info(
      `${req.method} ${req.originalUrl} - Email validado correctamente para el usuario ${user.email}`
    );

    // Registrar en la auditoría el cambio de estado a "CONFIRMADO"
    await AuditoriaCambio.create({
      usuario_originario_id: user.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `${user.email} confirmado`,
    });

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.EMAIL_CONFIRMED });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error en la validación del email: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// COMPLETAR EL PERFIL LUEGO DE VERIFICADO EL MAIL
export const completeProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud para completar el perfil del usuario`
    );

    const { nombre, apellido, telefono } = req.body;
    const userId = req.userId as string;

    // Validar datos obligatorios
    if (!nombre || !apellido) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Datos incompletos para completar el perfil.`
      );
      return res
        .status(400)
        .json({ message: MESSAGES.ERROR.VALIDATION.MISSING_PARAMETERS });
    }

    // Buscar el usuario
    const userData = await findUsuario({ userId });

    if (!userData) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    const user = userData.user;

    if (!user || user.tipo_registro !== "CONFIRMADO") {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no encontrado o no verificado: ${userId}`
      );
      return res.status(404).json({ message: MESSAGES.ERROR.USER.NOT_FOUND });
    }

    // Actualizar perfil
    user.nombre = nombre;
    user.apellido = apellido;
    user.telefono = telefono || null;
    user.tipo_registro = "HABILITADO";
    await user.save();

    // Registrar auditoría
    await AuditoriaCambio.create({
      usuario_originario_id: userId,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Perfil completado para el usuario con ID ${userId}`,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Perfil completado exitosamente para el usuario: ${user.email}`
    );
    res
      .status(200)
      .json({ message: MESSAGES.SUCCESS.AUTH.REGISTER_PRIMARY_SECOND });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error en la validación del email: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// CAMBIAR CLAVE UNA VEZ VALIDADO EL MAIL
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para restablecer la contraseña del usuario`
    );

    const { token, newPassword } = req.body;

    // Verificar el token usando handleTokenVerification
    let decoded: JwtPayload;
    try {
      decoded = handleTokenVerification(
        token,
        process.env.JWT_SECRET!
      ) as JwtPayload;
    } catch (err) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Token de restablecimiento inválido o expirado.`
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
    }

    // Buscar el usuario usando el id del token y verificar el token y su expiración
    const result = await findUsuario({ userId: decoded.id_usuario });

    if (!result) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    const user = result.user;

    if (
      !user ||
      user.reset_password_token !== token ||
      user.reset_password_token_expires! < new Date()
    ) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Token de restablecimiento de contraseña inválido o expirado.`
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
    }

    // Cifra la nueva contraseña
    const hashedPassword = await hashPassword(newPassword);
    user.clave = hashedPassword;

    // Limpia el token de restablecimiento y su fecha de expiración
    user.reset_password_token = null;
    user.reset_password_token_expires = null;
    await user.save();

    // Limpia la cookie de autenticación para cerrar sesión
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Contraseña restablecida exitosamente para el usuario ${user.email}. Sesión cerrada.`
    );

    // Registro en auditoría para el restablecimiento de la contraseña
    await AuditoriaCambio.create({
      usuario_originario_id: user.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Clave modificada por mail`,
    });

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.PASSWORD_RESET });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      logger.warn("El token de restablecimiento de contraseña ha expirado.");
      return next(new Err.BadRequestError(MESSAGES.ERROR.JWT.EXPIRED));
    }
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error en el restablecimiento de contraseña: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// OBTENER LOS DATOS DEL USUARIO
export const getUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener los datos del usuario`
    );

    const userId = req.userId as string;

    if (!userId) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no autenticado o ID no válido.`
      );
      return res
        .status(401)
        .json({ message: MESSAGES.ERROR.USER.NOT_AUTHORIZED });
    }

    // Buscar el usuario y sus maestros asociados
    const result = await findUsuario({ userId });

    if (!result || !result.user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró un usuario con el ID: ${userId}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Datos del usuario obtenidos correctamente para el usuario con ID: ${userId}`
    );

    // Devuelve el usuario y sus maestros asociados
    res.status(200).json({ user: result.user, maestros: result.maestros, vistas: result.vistas });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al obtener los datos del usuario: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// CAMBIAR LA CLAVE DE UN USUARIO
export const changeUserPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para cambiar la clave del usuario`
    );

    const { userId, newPassword, confirmPassword } = req.body;
    const userIdFromToken = req.userId as string;

    if (!userIdFromToken) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado.`);
      return res
        .status(401)
        .json({ message: MESSAGES.ERROR.USER.NOT_AUTHORIZED });
    }

    if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Las contraseñas no coinciden.`
      );
      return res
        .status(400)
        .json({ message: MESSAGES.ERROR.PASSWORD.CONFIRMATION_MISMATCH });
    }

    // Buscar información del usuario autenticado
    const authenticatedUserData = await findUsuario({
      userId: userIdFromToken,
    });

    if (!authenticatedUserData) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    const authenticatedUser = authenticatedUserData.user;
    const authenticatedRole = authenticatedUserData.maestros[0].rol.nombre_rol;

    if (!authenticatedUser || !authenticatedRole) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario autenticado no válido.`
      );
      return res
        .status(403)
        .json({ message: MESSAGES.ERROR.USER.NOT_AUTHORIZED });
    }

    // Verificar si el usuario autenticado está cambiando su propia clave
    const isSelfUpdate = !userId || userIdFromToken === userId;

    if (!isSelfUpdate) {
      // Solo admin_principal o admin_secundario pueden cambiar la clave de otros usuarios
      if (
        authenticatedRole !== "admin_principal" &&
        authenticatedRole !== "admin_secundario"
      ) {
        logger.warn(
          `${req.method} ${req.originalUrl} - Usuario con rol ${authenticatedRole} no autorizado para cambiar la clave de otro usuario.`
        );
        return res.status(403).json({
          message: MESSAGES.ERROR.USER.NOT_AUTHORIZED_TO_CHANGE_PASSWORD,
        });
      }
    }

    // Buscar el usuario objetivo
    const targetUserId = isSelfUpdate ? userIdFromToken : userId;
    const targetUserData = await findUsuario({ userId: targetUserId });

    if (!targetUserData) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    const targetUser = targetUserData.user;

    if (!targetUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario objetivo no encontrado con ID: ${targetUserId}`
      );
      return res.status(404).json({ message: MESSAGES.ERROR.USER.NOT_FOUND });
    }

    // Cifrar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la clave
    targetUser.clave = hashedPassword;
    await targetUser.save();

    // Auditar la acción
    await AuditoriaCambio.create({
      usuario_originario_id: userIdFromToken,
      usuario_destino_id: isSelfUpdate ? undefined : targetUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: isSelfUpdate
        ? `Clave actualizada por el propio usuario.`
        : `Clave actualizada para el usuario con ID ${targetUser.id_usuario} por ${authenticatedRole}.`,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Clave actualizada correctamente para el usuario con ID ${targetUserId}.`
    );

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.PASSWORD_RESET });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al cambiar la clave del usuario: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};

// CERRAR SESIÓN
export const logout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authToken = req.cookies["auth_token"];
    const activeSesion = req.cookies["active_sesion"];

    if (!authToken) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró cookie de autenticación.`
      );
      return res
        .status(400)
        .json({ message: MESSAGES.ERROR.VALIDATION.NO_COOKIE_FOUND });
    }

    // Limpia la cookie de autenticación para cerrar sesión
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Limpia la cookie de sesión activa
    if (activeSesion) {
      res.clearCookie("active_sesion", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      logger.info(
        `${req.method} ${req.originalUrl} - Cookie 'active_sesion' eliminada correctamente.`
      );
    }

    // Verifica si `req.user` es un JwtPayload y extrae el id
    const primaryUserAuthId = req.userId as string;

    logger.info(
      `${req.method} ${req.originalUrl} - Logout exitoso para el usuario ID ${primaryUserAuthId}`
    );

    // Registro de auditoría para el cierre de sesión en AuditoriaCambio
    await AuditoriaCambio.create({
      usuario_originario_id: primaryUserAuthId,
      modelo: "Usuario",
      tipo_auditoria: "AUTH",
      detalle: "Logout exitoso",
    });

    // Llama al servicio para actualizar la fecha de fin de sesión
    await actualizarFechaFinSesion(primaryUserAuthId);

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.LOGOUT });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error durante el proceso de logout: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
    next(err);
  }
};