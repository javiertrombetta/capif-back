import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { UPLOAD_DIR } from '../app';
import path from "path";
import jwt, { JwtPayload } from "jsonwebtoken";
import logger from "../config/logger";

import { verifyToken } from "../middlewares/auth";
import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";
import { UsuarioResponse } from "../interfaces/UsuarioResponse";

import { sendEmailWithErrorHandling } from "../services/emailService";
import {
  createUser,
  createUsuarioMaestro,
  assignVistasToUser,
  findExistingUsuario,
  findUsuarios,
  validateUserRegistrationState,
  updateUserData,
  linkUserToProductora,
  updateUserRegistrationState,
} from "../services/userService";
import { deleteAuditoriasByUsuario, deleteProductoraById, deleteProductoraDocumentos, deleteProductoraMensajes, deleteUsuarioVistaMaestro, getAuthenticatedUser, getTargetUser } from "../services/authService";
import { createOrUpdateProductora, createProductoraMessage, generarCodigosISRC, getLastRejectionMessage, processDocuments } from "../services/productoraService";
import { handleGeneralError } from "../services/errorService";
import {
  hashPassword,
  verifyPassword,
  handleTokenVerification,
} from "../utils/validationsService";
import { actualizarFechaFinSesion, registrarAuditoria, registrarSesion } from "../services/auditService";

import * as Err from "../utils/customErrors";
import * as MESSAGES from "../utils/messages";
import { ProductoraDocumento } from "../models";


// LOGIN
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para iniciar sesión`);

    const { email, password } = req.body;

    // Consulta para obtener el usuario y los maestros asociados
    const { user: targetUser, maestros: targetMaestros }: UsuarioResponse = await getTargetUser({ email }, req);
    
    // Verificación de sesión existente
    const existingToken = req.cookies["auth_token"];
    const decodedToken = verifyToken(existingToken, process.env.JWT_SECRET!);

    if (decodedToken && decodedToken.id === targetUser.id_usuario) {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario ${email} se encuentra con una sesión activa.`
      );
      return next(new Err.ConflictError(MESSAGES.ERROR.VALIDATION.ALREADY_LOGGED_IN));
    }

    // Verificación de confirmación de cuenta
    if (targetUser.tipo_registro === "NUEVO") {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario ${email} no está confirmado.`
      );
      return res.status(200).json({ message: MESSAGES.ERROR.VALIDATION.ALREADY_LOGGED_IN });
    }

    // Validación de contraseña
    const isPasswordValid = await verifyPassword(password, targetUser.clave);
    const MAX_LOGIN_ATTEMPTS = parseInt( process.env.MAX_LOGIN_ATTEMPTS || "5", 10);

    if (!isPasswordValid) {
      // Incrementa intentos fallidos
      targetUser.intentos_fallidos += 1;

      // Si los intentos fallidos alcanzan el límite, bloquea el usuario
      if (targetUser.intentos_fallidos >= MAX_LOGIN_ATTEMPTS) {
        targetUser.is_bloqueado = true;
        logger.warn(
          `${req.method} ${req.originalUrl} - El usuario ${email} ha sido bloqueado por superar el máximo de intentos fallidos`
        );

        // Registro en auditoría de bloqueo de usuario
        await registrarAuditoria({
          usuario_originario_id: targetUser.id_usuario,
          usuario_destino_id: targetUser.id_usuario,
          modelo: "Usuario",
          tipo_auditoria: "ERROR",
          detalle: `Bloqueo después de ${MAX_LOGIN_ATTEMPTS} intentos fallidos`,
        });
      }

      // Guardar cambios en intentos fallidos y estado de habilitación del usuario
      await targetUser.save();

      // Registro de auditoría para intento de inicio de sesión fallido
      if (!targetUser.is_bloqueado) {
        await registrarAuditoria({
          usuario_originario_id: targetUser.id_usuario,
          usuario_destino_id: targetUser.id_usuario,
          modelo: "Usuario",
          tipo_auditoria: "ERROR",
          detalle: `Intento ${targetUser.intentos_fallidos} fallido de inicio de sesión.`,
        });
      }

      // Registra en el log y lanza un error de autenticación
      logger.warn(
        `${req.method} ${req.originalUrl} - Intento de inicio de sesión fallido. Contraseña incorrecta para el usuario: ${email}. Intentos fallidos: ${targetUser.intentos_fallidos}`
      );

      throw new Err.UnauthorizedError(MESSAGES.ERROR.VALIDATION.PASSWORD_INCORRECT);
    }

    targetUser.intentos_fallidos = 0;
    await targetUser.save();

    // Preparar los datos de las productoras
    const productoras: { id: string; nombre: string }[] = [];

    targetMaestros.forEach((maestro) => {
      if (maestro.productora && maestro.productora.nombre_productora) {
        productoras.push({
          id: maestro.productora.id_productora,
          nombre: maestro.productora.nombre_productora,
        });
      }
    });

    // Generar un token básico con `userId`
    const token = jwt.sign(
      { id: targetUser.id_usuario },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRATION || "1h" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: parseInt(process.env.COOKIE_MAX_AGE || "3600000", 10),
    });

    // Registro de auditoría para acceso exitoso
    await registrarAuditoria({
      usuario_originario_id: targetUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "AUTH",
      detalle: "Inicio de sesión exitoso",
    });

    // Registro de sesión
    await registrarSesion({
      usuarioRegistranteId: targetUser.id_usuario,
      ipOrigen: req.ip || "IP desconocida",
      navegador: req.headers["user-agent"] || "Navegador desconocido",
      fechaInicioSesion: new Date(),
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Inicio de sesión exitoso para el usuario: ${email}`
    );

    return res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.LOGIN, productoras });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error en el inicio de sesión');
  }
};

// CERRAR SESIÓN
export const logout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authToken = req.cookies["auth_token"];
    const activeSesion = req.cookies["active_sesion"];

    if (!authToken) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró cookie de autenticación.`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.VALIDATION.NO_COOKIE_FOUND));
    }

    // Limpiar la cookie de autenticación
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Limpiar la cookie de sesión activa
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

    // Obtener el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    logger.info(
      `${req.method} ${req.originalUrl} - Logout exitoso para el usuario ID ${authUser.id_usuario}`
    );

    // Registrar auditoría para el cierre de sesión
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: authUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "AUTH",
      detalle: "Logout exitoso",
    });

    // Actualizar la fecha de fin de sesión
    await actualizarFechaFinSesion(authUser.id_usuario);

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.LOGOUT });
  } catch (err) {
    handleGeneralError(err, req, res, next, "Error durante el proceso de logout");
  }
};

// REGISTER PRODUCTOR 'PRIMARIO'
export const registerPrimaryProductor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para registrar un nuevo productor principal`);

    const { email, password } = req.body;

    // Verificar si existe el usuario
    const existingUser = await findExistingUsuario({ email });
    if (existingUser) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario ya registrado: ${existingUser.email}`);
      return next(new Err.ConflictError(MESSAGES.ERROR.REGISTER.ALREADY_REGISTERED));
    }
    
    // Crear el nuevo usuario
    const { newUser } = await createUser({
      email,
      rolNombre: "productor_principal",
      tipoRegistro: "NUEVO",
      clave: password,
    });

    logger.info(`${req.method} ${req.originalUrl} - Usuario creado exitosamente: ${email}`);

    // Crear relaciones en UsuarioVistasMaestro pero solo con vista de usuario para carga de datos
    await assignVistasToUser(newUser.id_usuario, undefined, 'usuario');

    logger.info(
      `${req.method} ${req.originalUrl} - Relaciones de vistas reducidas creadas para el Productor Principal: ${email}`
    );

    // Generar token de verificación
    const tokenExpiration = process.env.EMAIL_TOKEN_EXPIRATION || "1d";
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      logger.error("JWT_SECRET no está configurado en las variables de entorno.");
      throw new Error("Configuración del sistema incompleta: JWT_SECRET faltante.");
    }

    const emailToken = jwt.sign(
      { id_usuario: newUser.id_usuario },
      secret,
      { expiresIn: tokenExpiration }
    );

    // Decodificar y verificar el token
    const decoded = jwt.decode(emailToken);
    if (decoded && typeof decoded !== "string" && decoded.exp) {
      newUser.email_verification_token = emailToken;
      newUser.email_verification_token_expires = new Date(decoded.exp * 1000);
    } else {
      logger.error(`${req.method} ${req.originalUrl} - Error al decodificar el token de email para ${newUser.email}`);
      throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
    }

    await newUser.save();

    // Enviar correo de verificación
    const validationLink = `${emailToken}`;
    const emailBody = MESSAGES.EMAIL_BODY.VALIDATE_ACCOUNT(validationLink);

    await sendEmailWithErrorHandling(
      {
        to: newUser.email,
        subject: "Confirmá tu cuenta para ingresar al sistema",
        html: emailBody,
        successLog: `Correo enviado a ${newUser.email} con el token de verificación.`,
        errorLog: `Error al enviar el correo al Productor Principal: ${newUser.email}.`,
      }, req, res, next);

    logger.info(
      `${req.method} ${req.originalUrl} - Correo de validación enviado a: ${email}`
    );

    // Registrar auditoría
    await registrarAuditoria({
      usuario_originario_id: newUser.id_usuario,
      usuario_destino_id: newUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "ALTA",
      detalle: `Registro en Usuario con ID: (${newUser.id_usuario})`,
    });

    await registrarAuditoria({
      usuario_originario_id: newUser.id_usuario,
      usuario_destino_id: newUser.id_usuario,
      modelo: "UsuarioVistaMaestro",
      tipo_auditoria: "ALTA",
      detalle: `Generación de vistas para el usuario con ID: (${newUser.id_usuario})`,
    });

    logger.info(`${req.method} ${req.originalUrl} - Auditoría registrada para el usuario: ${email}`);

    // Responder con éxito
    res.status(201).json({
      message: MESSAGES.SUCCESS.AUTH.REGISTER_PRIMARY_FIRST,
      token: newUser.email_verification_token,
    });
  } catch (err) {
    handleGeneralError(err, req, res, next, "Error en el registro de nuevo productor principal");
  }
};

// REGISTER PRODUCTOR 'SECUNDARIO'
export const registerSecondaryProductor = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para registrar un usuario secundario`);

    const { email, nombre, apellido, telefono } = req.body;

    // Verificar si existe el usuario
    const existingUser = await findExistingUsuario({ email });
    if (existingUser) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario ya registrado: ${existingUser.email}`);
      return next(new Err.ConflictError(MESSAGES.ERROR.REGISTER.ALREADY_REGISTERED));
    }

    // Verificar el usuario autenticado
    const { user: authUser, maestros: authMaestros, hasSingleMaestro: hasAuthSingleMaestro }: UsuarioResponse = await getAuthenticatedUser(req);

    if (!hasAuthSingleMaestro || authMaestros.length !== 1) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario autenticado no tiene una única asociación de maestro.`
      );
      throw new Err.ConflictError(MESSAGES.ERROR.USER.MULTIPLE_MASTERS_FOR_PRINCIPAL);
    }

    const productora = authMaestros[0].productora;

    if (!productora || !productora.id_productora) {
      logger.error(
        `${req.method} ${req.originalUrl} - Usuario autenticado no tiene una productora asociada válida.`
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.PRODUCTORA.INVALID_NAME);
    }    

    // Genera una clave temporal
    const generateTemporaryPassword = (length = 10) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    };

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Crear el usuario secundario
    const { newUser } = await createUser({
      email,
      nombre,
      apellido,
      telefono,
      rolNombre: "productor_secundario",
      tipoRegistro: "HABILITADO",
      clave: hashedPassword,
    });

    logger.info(`${req.method} ${req.originalUrl} - Usuario secundario registrado exitosamente: ${email}`);

    // Crear el registro en UsuarioMaestro
    const newUsuarioMaestro = await createUsuarioMaestro({
      usuario_id: newUser.id_usuario,
      productora_id: productora.id_productora,
    });

    logger.info(`${req.method} ${req.originalUrl} - UsuarioMaestro registrado para el usuario secundario: ${email}`);

    // Crear relaciones en UsuarioVistasMaestro  
    await assignVistasToUser(newUser.id_usuario, newUser.rol_id);

    logger.info(
      `${req.method} ${req.originalUrl} - Relaciones de vistas creadas para el Productor Secundario: ${email}`
    );

    // Generar y asignar el token de verificación
    const tokenExpiration = process.env.EMAIL_TOKEN_EXPIRATION || "1d";
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      logger.error("JWT_SECRET no está configurado en las variables de entorno.");
      throw new Error("Configuración del sistema incompleta: JWT_SECRET faltante.");
    }

    const emailToken = jwt.sign(
      { id_usuario: newUser.id_usuario },
      secret,
      { expiresIn: tokenExpiration }
    );

    // Decodificar y verificar el token
    const decoded = jwt.decode(emailToken);
    if (decoded && typeof decoded !== "string" && decoded.exp) {
      newUser.email_verification_token = emailToken;
      newUser.email_verification_token_expires = new Date(decoded.exp * 1000);
    } else {
      logger.error(`${req.method} ${req.originalUrl} - Error al decodificar el token de email para ${newUser.email}`);
      throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
    }

    await newUser.save();  

    // Enviar correo de verificación con clave temporal
    const validationLink = `${emailToken}`;
    const emailBody = MESSAGES.EMAIL_BODY.VALIDATE_ACCOUNT_WITH_TEMP_PASSWORD(
      validationLink,
      temporaryPassword
    );

    await sendEmailWithErrorHandling(
      {
        to: newUser.email,
        subject: "Confirmá tu cuenta secundaria para ingresar al sistema",
        html: emailBody,
        successLog: `Correo enviado a ${newUser.email} con la clave temporal.`,
        errorLog: `Error al enviar el correo al Productor Secundario: ${newUser.email}.`,
      }, req, res, next);

    logger.info(`${req.method} ${req.originalUrl} - Correo de verificación enviado a: ${email}`);

    // Registrar auditorías
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: newUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "ALTA",
      detalle: `Registro en Usuario (${newUser.id_usuario})`,
    });

    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: newUser.id_usuario,
      modelo: "UsuarioMaestro",
      tipo_auditoria: "ALTA",
      detalle: `Registro de usuario secundario en UsuarioMaestro (${newUsuarioMaestro.id_usuario_maestro})`,
    });

    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: newUser.id_usuario,
      modelo: "UsuarioVistaMaestro",
      tipo_auditoria: "ALTA",
      detalle: `Generación de vistas para el usuario con ID: (${newUser.id_usuario})`,
    });

    logger.info(`${req.method} ${req.originalUrl} - Auditorías registradas para el usuario secundario: ${email}`);

    // Responder con éxito
    res.status(201).json({ message: MESSAGES.SUCCESS.AUTH.REGISTER_SECONDARY });

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error en el registro de usuario secundario");    
  }
};

// SELECCIONAR PRODUCTORA ACTIVA Y CARGAR LA COOKIE CORRESPONDIENTE
export const selectAuthProductora = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productoraId } = req.params;

    // Verifica el usuario autenticado y obtiene sus datos
    const { user: authUser, maestros: authMaestros }: UsuarioResponse = await getAuthenticatedUser(req);

    // Comprobar que el usuario tenga maestros asociados
    if (!authMaestros || authMaestros.length === 0) {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario autenticado no tiene productoras asociadas.`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NO_ASSOCIATED_PRODUCTORAS));
    }

    // Comprobar que el rol esté presente
    if (!authUser.rol) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario sin rol asignado`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED)
      );
    }

    // Buscar el maestro asociado a la productora seleccionada
    const selectedMaestro = authMaestros.find(
      (maestro) =>
        maestro.productora &&
        maestro.productora.id_productora === productoraId
    );

    if (!selectedMaestro || !selectedMaestro.productora) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Productora ${productoraId} no asociada al usuario.`
      );
      return next(
        new Err.ForbiddenError(MESSAGES.ERROR.USER.NO_ASSOCIATED_PRODUCTORAS)
      );
    }

    // Crear cookie `active_sesion` con los datos de la productora seleccionada
    res.cookie(
      "active_sesion",
      JSON.stringify({
        productoraId: selectedMaestro.productora.id_productora,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: parseInt(process.env.COOKIE_MAX_AGE || "3600000", 10),
      }
    );

    logger.info(
      `${req.method} ${req.originalUrl} - Productora activa asignada: ${selectedMaestro.productora.nombre_productora}`
    );

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.PRODUCTORA_SELECTED });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al seleccionar productora');    
  }
};

// OBTENER LAS PRODUCTORAS ASOCIADAS AL USUARIO
export const getAuthProductoras = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Verifica el usuario autenticado
    const { maestros: authMaestros }: UsuarioResponse = await getAuthenticatedUser(req);

    // Comprobar que el usuario tenga maestros asociados
    if (!authMaestros || authMaestros.length === 0) {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario autenticado no tiene productoras asociadas.`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NO_ASSOCIATED_PRODUCTORAS));
    }

    // Filtrar y mapear las productoras válidas
    const productoras = authMaestros
      .filter((maestro) => maestro.productora && maestro.productora.nombre_productora)
      .map((maestro) => ({
        id: maestro.productora!.id_productora,
        nombre: maestro.productora!.nombre_productora,
      }));

    if (productoras.length === 0) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontraron productoras válidas asociadas para el usuario.`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.NO_ASSOCIATED_PRODUCTORAS));
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Productoras asociadas obtenidas correctamente.`
    );

    res.status(200).json({ productoras });

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener las productoras del usuario");
  }
};

// SOLICITAR RESETEO DE CLAVE
export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para restablecer la contraseña`);

    const { email } = req.body;

    // Buscar el usuario pasado por parámetro
    const { user: targetUser }: UsuarioResponse = await getTargetUser({ email }, req);

    // Configuración de expiración del token de restablecimiento
    const tokenExpiration = process.env.RESET_TOKEN_EXPIRATION || "1h";
    if (!process.env.JWT_SECRET) {
      throw new Error("Falta JWT_SECRET en el archivo de configuración");
    }

    // Genera el token de restablecimiento
    const resetToken = jwt.sign(
      { id_usuario: targetUser.id_usuario },
      process.env.JWT_SECRET,
      {
        expiresIn: tokenExpiration,
      }
    );
    targetUser.reset_password_token = resetToken;

    // Calcula la fecha de expiración del token de restablecimiento
    try {
      const decoded = handleTokenVerification(
        resetToken,
        process.env.JWT_SECRET!
      ) as JwtPayload;
      targetUser.reset_password_token_expires = new Date(decoded.exp! * 1000);
    } catch (err) {
      logger.error(
        `${req.method} ${req.originalUrl} - Error al verificar el token de restablecimiento de contraseña para el usuario: ${email}`,
        err
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
    }

    await targetUser.save();   

    // Registro en auditoría para la solicitud de restablecimiento de contraseña
    await registrarAuditoria({
      usuario_originario_id: targetUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Solicitud de cambio de clave.`,
    });

    // Genera el enlace de restablecimiento y envía el correo electrónico
    const resetLink = `${resetToken}`;
    const emailBody = MESSAGES.EMAIL_BODY.PASSWORD_RECOVERY(resetLink);
    await sendEmailWithErrorHandling(
      {
        to: targetUser.email,
        subject: "Solicitud de restablecimiento de contraseña",
        html: emailBody,
        successLog: `Correo de restablecimiento de contraseña enviado a: ${targetUser.email}`,
        errorLog: `Error al enviar el correo de restablecimiento de contraseña a: ${targetUser.email}.`,
      }, req, res, next);
    
    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.PASSWORD_RESET_REQUESTED });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error en la solicitud de restablecimiento de contraseña');    
  }
};

// VALIDAR EL TOKEN ENVIADO AL RESETEAR LA CLAVE
export const validateEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para validar el email`);

    const { token } = req.params;
    
    // Verificar el token usando handleTokenVerification
    let decoded: JwtPayload;
    try {
      decoded = handleTokenVerification(
        token,
        process.env.JWT_SECRET!
      ) as JwtPayload;
    } catch (err) {
      logger.warn(`${req.method} ${req.originalUrl} - Token de verificación inválido o expirado.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.JWT.INVALID);
    }
    
    // Busca al usuario decodificado
    const { user: targetUser }: UsuarioResponse = await getTargetUser({ userId: decoded.id_usuario }, req);

    // Verificar que el token no esté expirado
    if (targetUser.email_verification_token !== token || targetUser.email_verification_token_expires! < new Date()) {
      logger.warn(`${req.method} ${req.originalUrl} - Token inválido o expirado.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.VALIDATION.INVALID_TOKEN);
    }

    // Actualiza el tipo_registro del usuario a "CONFIRMADO" y limpia el token de verificación
    targetUser.tipo_registro = "CONFIRMADO";
    targetUser.email_verification_token = null;
    targetUser.email_verification_token_expires = null;
    await targetUser.save();

    logger.info(
      `${req.method} ${req.originalUrl} - Email validado correctamente para el usuario ${targetUser.email}`
    );

    // Registrar en la auditoría el cambio de estado a "CONFIRMADO"
    await registrarAuditoria({
      usuario_originario_id: targetUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `${targetUser.email} confirmado`,
    });

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.EMAIL_CONFIRMED });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error en la validación del email');    
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
        `${req.method} ${req.originalUrl} - Token de restablecimiento inválido o expirado: ${
          err instanceof Error ? err.message : 'Error desconocido'
        }`
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
    }
    
    // Buscar el usuario usando el id del token
    const { user: targetUser }: UsuarioResponse = await getTargetUser({ userId: decoded.id_usuario }, req);

    // Verificar si existe el token
    if (!targetUser || targetUser.reset_password_token !== token || targetUser.reset_password_token_expires! < new Date()) {
      logger.warn(`${req.method} ${req.originalUrl} - Token de restablecimiento de contraseña inválido o expirado.`);
      throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
    }

    // Cifra la nueva contraseña
    const hashedPassword = await hashPassword(newPassword);
    targetUser.clave = hashedPassword;

    // Limpia el token de restablecimiento y su fecha de expiración
    targetUser.reset_password_token = null;
    targetUser.reset_password_token_expires = null;
    await targetUser.save();

    // Limpia la cookie de autenticación para cerrar sesión
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Contraseña restablecida exitosamente para el usuario ${targetUser.email}. Sesión cerrada.`
    );

    // Registro en auditoría para el restablecimiento de la contraseña
    await registrarAuditoria({
      usuario_originario_id: targetUser.id_usuario,
      usuario_destino_id: targetUser.id_usuario,
      modelo: "Usuario",
      tipo_auditoria: "CAMBIO",
      detalle: `Solicitud de cambio de clave por email: ${targetUser.email}`,
    });

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.PASSWORD_RESET });
    
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      logger.warn("El token de restablecimiento de contraseña ha expirado.");
      return next(new Err.BadRequestError(MESSAGES.ERROR.JWT.EXPIRED));
    }
    handleGeneralError(err, req, res, next, 'Error en el restablecimiento de contraseña');    
  }
};

// OBTENER EL TIPO DE REGISTRO DE UN USUARIO
export const getAuthTipoRegistro = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para obtener el tipo_registro de un usuario.`);

    // Buscar el usuario pasado como parámetro
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    const response: any = {
      id_usuario: authUser.id_usuario,
      tipo_registro: authUser.tipo_registro,
    };

    // Si el tipo_registro es RECHAZADO, buscar el último mensaje de rechazo
    if (authUser.tipo_registro === "RECHAZADO") {
      logger.info(`${req.method} ${req.originalUrl} - Usuario con tipo_registro RECHAZADO. Buscando último mensaje.`);

      const ultimoMensajeRechazo = await getLastRejectionMessage(authUser.id_usuario);

      if (!ultimoMensajeRechazo) {
        logger.info(
          `${req.method} ${req.originalUrl} - No se encontraron mensajes de rechazo para el usuario.`
        );
        return next(new Err.NotFoundError(MESSAGES.ERROR.MESSAGE.NO_REJECT));
      }

      response.mensaje_rechazo = {
        mensaje: ultimoMensajeRechazo.mensaje,
        fecha: ultimoMensajeRechazo.createdAt,
      };

      logger.info(`${req.method} ${req.originalUrl} - Último mensaje de rechazo encontrado: ${ultimoMensajeRechazo.mensaje}`);
    }

    return res.status(200).json({
      message: MESSAGES.SUCCESS.USUARIO.TYPE_REGISTER_FOUND,
      data: response,
    });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al obtener el tipo_registro del usuario');
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

    const { usuarioId } = req.query;;

    if (usuarioId) {
      // Obtener datos del usuario pasado como parámetro
      const { user: targetUser, maestros: targetMaestros }: UsuarioResponse = await getTargetUser({ userId: usuarioId as string }, req);

      if (targetUser.tipo_registro !== "ENVIADO") {
        logger.warn(
          `${req.method} ${req.originalUrl} - Usuario no tiene registro pendiente.`
        );
        return next(
          new Err.NotFoundError(MESSAGES.ERROR.REGISTER.NO_PENDING_USERS)
        );
      }

      if (targetMaestros.length > 0) {
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

    const { usuarioId } = req.params;

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Verifica el usuario pasado por parámetro
    const { user: targetUser, maestros: targetMaestros, hasSingleMaestro: hasTargetSingleMaestro }: UsuarioResponse = await getTargetUser({ userId: usuarioId }, req);

    // Validar si el usuario ya está aprobado
    if (targetUser.tipo_registro === "HABILITADO") {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario ya aprobado: ${targetUser.email}`
      );
      return next(
        new Err.ConflictError(
          `El usuario con ID: ${usuarioId} ya está aprobado y no puede ser procesado nuevamente.`
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

    // Actualizar los documentos asociados con fecha_confirmado
    const documentos = await ProductoraDocumento.findAll({
      where: { productora_id: productoraId },
    });

    if (documentos && documentos.length > 0) {
      const fechaConfirmacion = new Date();
      await Promise.all(
        documentos.map((documento) =>
          documento.update({ fecha_confirmado: fechaConfirmacion })
        )
      );
      logger.info(
        `${req.method} ${req.originalUrl} - Documentos confirmados exitosamente para la productora: ${productoraId}`
      );
    }

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

    const validIsrcs = isrcs.map((isrc) => ({
      tipo: isrc.tipo,
      codigo_productora: isrc.codigo_productora || "N/A",
    }));

    // Enviar el correo de notificación al usuario
    await sendEmailWithErrorHandling(
      {
        to: targetUser.email,
        subject: "Registro Exitoso como Productor Principal",
        html: MESSAGES.EMAIL_BODY.PRODUCTOR_PRINCIPAL_NOTIFICATION(
          targetUser.nombre!,
          productora.nombre_productora,
          productora.cuit_cuil,
          productora.cbu,
          productora.alias_cbu,
          validIsrcs
        ),
        successLog: `Usuario autorizado y correo de notificación enviado a ${targetUser.email}.`,
        errorLog: `Error al enviar el correo de aprobación de aplicación a ${targetUser.email}.`,
      },
      req,
      res,
      next
    );

    // Enviar respuesta exitosa al cliente
    return res.status(200).json({
      message: MESSAGES.SUCCESS.AUTH.AUTHORIZED,
      data: isrcs,
    });
  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al autorizar usuario');    
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

export const getUserBlockStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para verificar el estado de bloqueo del usuario autenticado.`
    );

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);   

    // Respuesta con el estado de bloqueo
    res.status(200).json({ isBlocked: authUser.is_bloqueado });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al obtener el estado de bloqueo del usuario');    
  }
};

export const deleteApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { usuarioId } = req.params;

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud para eliminar una aplicación con ID: ${usuarioId}.`
    );

    // Buscar el usuario al que se le cambiará el estado mediante findUsuario
    const { user: targetUser, maestros: targetMaestros, hasSingleMaestro: targetHasSingleMaestros }: UsuarioResponse = await getTargetUser({ userId: usuarioId }, req);

    // Verificar condiciones
    if (targetUser.tipo_registro === "HABILITADO" || targetUser.tipo_registro === "DESHABILITADO") {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario con tipo_registro no permitido para eliminar: ${targetUser.tipo_registro}.`
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.STATE_INVALID);
    }

    if (!targetHasSingleMaestros) {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario tiene más de un maestro asociado.`
      );
      throw new Err.ConflictError(MESSAGES.ERROR.USER.MULTIPLE_MAESTRO_RECORDS);
    }

    if (!targetMaestros[0].productora_id) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Productora no encontrada.`
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.PRODUCTORA_ID_REQUIRED);
    }

    if (!targetUser.rol) {
      logger.warn(`${req.method} ${req.originalUrl} - El usuario no tiene un rol asignado`);
      return next(
        new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED)
      );
    }

    if (targetUser.rol.nombre_rol !== "productor_principal") {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario no tiene el rol requerido para esta acción: ${targetUser.rol.nombre_rol}.`
      );
      throw new Err.ForbiddenError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID);
    }

    // Eliminar entidades relacionadas
    await deleteProductoraById(targetMaestros[0].productora_id);
    await deleteProductoraDocumentos(targetMaestros[0].productora_id);
    await deleteProductoraMensajes(targetMaestros[0].productora_id);
    await deleteUsuarioVistaMaestro(targetUser.id_usuario);
    await deleteAuditoriasByUsuario(targetUser.id_usuario);

    // Eliminar el usuario
    await targetUser.destroy();

    logger.info(
      `${req.method} ${req.originalUrl} - Aplicación eliminada exitosamente para el usuario con ID: ${targetUser.id_usuario}.`
    );

    res.status(200).json({ message: "Aplicación eliminada exitosamente." });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al eliminar la aplicación de un productor principal');
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

    const { usuarioId } = req.params;
    const { comentario } = req.body;

    // Verifica el usuario autenticado
    const { user: authUser } = await getAuthenticatedUser(req);

    // Buscar el usuario pasado por parámetro
    const { user: targetUser, maestros: targetMaestros, hasSingleMaestro: hasTargetSingleMaestro }: UsuarioResponse = await getTargetUser({ userId: usuarioId }, req);

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
      tipoMensaje: "RECHAZO_APLICACION",
      mensaje: comentario,
    });

    // Enviar correo de notificación de rechazo
    await sendEmailWithErrorHandling(
      {
        to: targetUser.email,
        subject: "Rechazo de su Aplicación",
        html: MESSAGES.EMAIL_BODY.REJECTION_NOTIFICATION(targetUser.nombre!, comentario),
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
      productoraData,
      nombre,
      apellido,
      telefono,  
    } = req.body;

    // Verifica el usuario autenticado
    const { user: authUser, maestros: authMaestros }: UsuarioResponse = await getAuthenticatedUser(req);

    if (authMaestros.length > 0) {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario tiene múltiples maestros asociados.`
      );
      return next(
        new Err.NotFoundError(MESSAGES.ERROR.USER.MULTIPLE_MASTERS_FOR_PRINCIPAL)
      );
    }

    // Validar el estado del usuario
    validateUserRegistrationState(authUser.tipo_registro);

    // Actualizar los datos básicos del usuario
    await updateUserData(authUser, { nombre, apellido, telefono });
    logger.info(`${req.method} ${req.originalUrl} - Datos del usuario actualizados.`);

    // Manejar la productora
    const productora = await createOrUpdateProductora(productoraData);
    logger.info(`${req.method} ${req.originalUrl} - Productora procesada exitosamente.`);

    // Manejar relación de Usuario y Productora en UsuarioMaestro
    await linkUserToProductora(authUser.id_usuario, productora.id_productora);
    logger.info(`${req.method} ${req.originalUrl} - Relación Usuario-Productora creada en UsuarioMaestro.`);    

    // Actualizar el tipo_registro del usuario a ENVIADO
    await updateUserRegistrationState(authUser, "ENVIADO");
    logger.info(`${req.method} ${req.originalUrl} - Tipo de registro actualizado a ENVIADO.`);

    // Registrar auditoría
    await registrarAuditoria({
      usuario_originario_id: authUser.id_usuario,
      usuario_destino_id: authUser.id_usuario,
      modelo: "Productora",
      tipo_auditoria: "ALTA",
      detalle: `Solicitud de aplicación enviada por ${authUser.email} para la productora ${productora.id_productora}`,
    });

    logger.info(`${req.method} ${req.originalUrl} - Auditoría registrada.`);

    // Enviar correo de notificación al usuario
    await sendEmailWithErrorHandling(
      {
        to: authUser.email,
        subject: "Solicitud de Aplicación Enviada",
        html: MESSAGES.EMAIL_BODY.APPLICATION_SUBMITTED(nombre),
        successLog: `Correo de aplicación enviado a ${authUser.email}`,
        errorLog: `Error al enviar el correo de aplicación a ${authUser.email}`,
      },
      req,
      res,
      next
    );

    res.status(200).json({ productora: productora.id_productora, message: MESSAGES.SUCCESS.APPLICATION.SAVED, });

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al enviar la aplicación");
  }
};

// OBTENER EL ROL DEL USUARIO AUTENTICADO
export const getRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud para obtener el rol del usuario`);

    // Buscar información del usuario autenticado usando su id_usuario
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    // Comprobar que el rol esté presente
    if (!authUser.rol) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario sin rol asignado`
      );
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED)
      );
    }

    const roleName = authUser.rol.nombre_rol;   

    logger.info(
      `${req.method} ${req.originalUrl} - Se obtuvo el rol del usuario ID ${authUser.id_usuario}: ${roleName}`
    );

    res.status(200).json({ role: roleName });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al obtener el rol del usuario');    
  }
};