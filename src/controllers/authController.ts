import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import logger from '../config/logger';

import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import { verifyToken } from '../middlewares/auth';

import * as MESSAGES from '../services/messages';
import { sendEmail } from '../services/emailService';
import {
  createUsuario,
  createUsuarioMaestro,
  updateUsuarioMaestro,
  findUsuario,
  getAssociatedCompanies,
} from '../services/userService';
import { actualizarFechaFinSesion } from '../services/sesionService';
import {
  hashPassword,
  verifyPassword,
  handleTokenVerification,
} from '../services/validationsService';
import * as Err from '../services/customErrors';

import { AuditoriaEntidad, AuditoriaSesion } from '../models';


// REGISTER USUARIO 'PRIMARIO'
export const registerPrimary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para registrar un nuevo usuario`
    );

    const { email, password, nombres_y_apellidos, telefono } = req.body;

    // Verifica si el usuario ya existe
    const existingUser = await findUsuario({ email });
    if (existingUser) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario ya registrado: ${email}`);
      throw new Err.ConflictError(MESSAGES.ERROR.REGISTER.ALREADY_REGISTERED);
    }

    // Cifra la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea un nuevo usuario con el estado 'NUEVO'
    const newUser = await createUsuario({
      email,
      clave: hashedPassword,
      tipo_registro: 'NUEVO',
      nombres_y_apellidos,
      telefono,
    });

    logger.info(`${req.method} ${req.originalUrl} - Usuario registrado exitosamente: ${email}`);

    // Crear el registro correspondiente en UsuarioMaestro usando el servicio
    await createUsuarioMaestro({
      usuario_registrante_id: newUser.id_usuario,
      rol_id: 'usuario',
      productora_id: null,
      fecha_ultimo_cambio_rol: new Date(),
    });

    // Configuración del token de verificación de email
    const tokenExpiration = process.env.EMAIL_TOKEN_EXPIRATION || '1d';
    if (!process.env.JWT_SECRET) throw new Error('Falta JWT_SECRET en el archivo de configuración');
    const emailToken = jwt.sign({ id_usuario: newUser.id_usuario }, process.env.JWT_SECRET, {
      expiresIn: tokenExpiration,
    });

    try {
      const decoded = handleTokenVerification(emailToken, process.env.JWT_SECRET!) as JwtPayload;
      newUser.email_verification_token = emailToken;
      newUser.email_verification_token_expires = new Date(decoded.exp! * 1000);
    } catch (err) {
      logger.error(
        `${req.method} ${req.originalUrl} - Error al verificar el token de email para ${newUser.email}`,
        err
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
    }

    await newUser.save();

    logger.debug(
      `${req.method} ${req.originalUrl} - Token de verificación generado para: ${email}`
    );

    // Enviar correo de verificación
    const validationLink = `${emailToken}`;
    const emailBody = MESSAGES.EMAIL_BODY.VALIDATE_ACCOUNT(validationLink);
    await sendEmail({
      to: newUser.email,
      subject: 'Confirmá tu cuenta para ingresar al sistema',
      html: emailBody,
    });

    logger.info(`${req.method} ${req.originalUrl} - Correo de validación enviado a: ${email}`);

    // Registra la acción en AuditoriaEntidad
    await AuditoriaEntidad.create({
      usuario_originario_id: null,
      usuario_destino_id: newUser.id_usuario,
      entidad_afectada: 'Usuario',
      tipo_auditoria: 'ALTA',
      detalle: 'Registro de nuevo usuario principal',
    });

    await AuditoriaEntidad.create({
      usuario_originario_id: null,
      usuario_destino_id: newUser.id_usuario,
      entidad_afectada: 'UsuarioMaestro',
      tipo_auditoria: 'ALTA',
      detalle: 'Registro de nuevo usuario principal',
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Auditoría registrada para el usuario: ${email}`
    );

    // Retorno de mensaje al usuario comn código
    res.status(201).json({ message: MESSAGES.SUCCESS.AUTH.REGISTER_PRIMARY });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error en el registro: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};


// REGISTER USUARIO 'SECUNDARIO'
export const registerSecondary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para registrar un usuario secundario`
    );

    const { email, nombres_y_apellidos, telefono } = req.body;

    // Obtener el ID del usuario autenticado desde el token
    const primaryUserId = typeof req.user === 'object' && 'id' in req.user ? req.user.id : null;
    if (!primaryUserId) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no autenticado o sin ID válido.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Verificar que el usuario autenticado es de tipo PRIMARIO
    const primaryUserData = await findUsuario({ userId: primaryUserId });
    const primaryUser = primaryUserData?.user;
    const primaryUserRole = primaryUserData?.role;
    const primaryProductora = primaryUserData?.productora;

    if (
      !primaryUser ||
      primaryUser.tipo_registro !== 'HABILITADO' ||
      (primaryUserRole !== 'admin_principal' && primaryUserRole !== 'productor_principal')
    ) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario no autorizado para registrar secundarios.`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.USER.NOT_AUTHORIZED);
    }

    // Verificar que el usuario primario tiene una productora asignada
    if (!primaryProductora) {
      throw new Error('El usuario principal no tiene una productora asociada.');
    }

    // Verifica si el usuario ya existe
    const existingUser = await findUsuario({ email });
    if (existingUser) {
      const { user: existingUserData, role: existingUserRole } = existingUser;

      // Si el usuario ya existe y tiene tipo_registro NUEVO o CONFIRMADO, actualizar en lugar de crear uno nuevo
      if (
        existingUserData.tipo_registro === 'NUEVO' ||
        existingUserData.tipo_registro === 'CONFIRMADO'
      ) {
        await existingUserData.update({
          tipo_registro: 'HABILITADO',
        });

        // Llamar a updateUsuarioMaestro desde userService para actualizar el registro en UsuarioMaestro
        await updateUsuarioMaestro(existingUserData.id_usuario, {
          productora_id: primaryProductora,
          rol_id:
            existingUserRole === 'admin_principal' ? 'admin_secundario' : 'productor_secundario',
        });

        // Auditoría de actualización
        await AuditoriaEntidad.create({
          usuario_originario_id: primaryUserId,
          usuario_destino_id: existingUserData.id_usuario,
          entidad_afectada: 'UsuarioMaestro',
          tipo_auditoria: 'CAMBIO',
          detalle: `Asignación de productora y rol para usuario existente`,
        });

        logger.info(
          `${req.method} ${req.originalUrl} - Usuario secundario existente actualizado: ${email}`
        );
        return res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.REGISTER_SECONDARY });
      } else {
        logger.warn(`${req.method} ${req.originalUrl} - Usuario ya registrado: ${email}`);
        throw new Err.ConflictError(MESSAGES.ERROR.REGISTER.ALREADY_REGISTERED);
      }
    }

    // Genera una clave temporal
    const temporaryPassword = nanoid(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Determina el rol del usuario secundario basado en el rol del usuario principal
    const secondaryUserRole =
      primaryUserRole === 'admin_principal' ? 'admin_secundario' : 'productor_secundario';

    // Crea el nuevo usuario con tipo_registro SECUNDARIO
    const newUser = await createUsuario({
      email,
      clave: hashedPassword,
      tipo_registro: 'HABILITADO',
      nombres_y_apellidos,
      telefono,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario secundario registrado exitosamente: ${email}`
    );

    // Crear el registro en UsuarioMaestro para el usuario secundario con el rol asignado
    await createUsuarioMaestro({
      usuario_registrante_id: newUser.id_usuario,
      rol_id: secondaryUserRole,
      productora_id: primaryUserData.productora,
      fecha_ultimo_cambio_rol: new Date(),
    });

    // Configuración del token de verificación de email
    const tokenExpiration = process.env.EMAIL_TOKEN_EXPIRATION || '1d';
    if (!process.env.JWT_SECRET) throw new Error('Falta JWT_SECRET en el archivo de configuración');
    const emailToken = jwt.sign({ id_usuario: newUser.id_usuario }, process.env.JWT_SECRET, {
      expiresIn: tokenExpiration,
    });

    // Guarda el token de verificación en el usuario
    try {
      const decoded = handleTokenVerification(emailToken, process.env.JWT_SECRET!) as JwtPayload;
      newUser.email_verification_token = emailToken;
      newUser.email_verification_token_expires = new Date(decoded.exp! * 1000);
    } catch (err) {
      logger.error(
        `${req.method} ${req.originalUrl} - Error al verificar el token de email para el usuario secundario ${newUser.email}`,
        err
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
    }

    await newUser.save();

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
      to: newUser.email,
      subject: 'Confirmá tu cuenta secundaria para ingresar al sistema',
      html: emailBody,
    });

    logger.info(`${req.method} ${req.originalUrl} - Correo de verificación enviado a: ${email}`);

    // Registrar acción en AuditoriaEntidad
    const auditoriaDetalle = `Usuario secundario ${email} creado con rol ${secondaryUserRole}`;
    await AuditoriaEntidad.create({
      usuario_originario_id: primaryUserId,
      usuario_destino_id: newUser.id_usuario,
      entidad_afectada: 'Usuario',
      tipo_auditoria: 'ALTA',
      detalle: auditoriaDetalle,
    });

    // Auditoría de actualización
    await AuditoriaEntidad.create({
      usuario_originario_id: primaryUserId,
      usuario_destino_id: newUser.id_usuario,
      entidad_afectada: 'UsuarioMaestro',
      tipo_auditoria: 'CAMBIO',
      detalle: `Asignación de productora y rol de usuario secundario`,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Auditoría registrada para el usuario secundario: ${email}`
    );

    // Retorno de mensaje de éxito
    res.status(201).json({ message: MESSAGES.SUCCESS.AUTH.REGISTER_SECONDARY });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error en el registro de usuario secundario: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};


// LOGIN
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para iniciar sesión`);

    const { email, password } = req.body;

    // Realiza la consulta para obtener el usuario
    const userData = await findUsuario({ email });
    const user = userData?.user;
    const role = userData?.role;
    const maestro = userData?.maestro;

    if (!user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Intento de inicio de sesión fallido. Usuario no encontrado: ${email}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    // Verificación de sesión existente
    const existingToken = req.cookies['auth_token'];
    const decodedToken = verifyToken(existingToken, process.env.JWT_SECRET!);

    if (decodedToken && decodedToken.id === user.id_usuario) {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario ${email} ya ha iniciado sesión previamente.`
      );
      return res.status(400).json({ message: MESSAGES.ERROR.VALIDATION.ALREADY_LOGGED_IN });
    }

    // Verificación de confirmación de cuenta
    if (user.tipo_registro === 'NUEVO') {
      logger.warn(`${req.method} ${req.originalUrl} - El usuario ${email} no está confirmado.`);
      return res.status(403).json({ message: MESSAGES.ERROR.REGISTER.USER_NOT_CONFIRMED });
    }

    // Validación de contraseña
    const isPasswordValid = await verifyPassword(password, user.clave);
    const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);

    if (!isPasswordValid) {
      // Incrementa intentos fallidos y verifica si debe bloquear al usuario
      if (role !== 'admin_principal' && role !== 'admin_secundario') {
        user.intentos_fallidos += 1;

        // Si los intentos fallidos alcanzan el límite, deshabilitar el usuario
        if (user.intentos_fallidos >= MAX_LOGIN_ATTEMPTS) {
          user.is_bloqueado = false;
          logger.warn(
            `${req.method} ${req.originalUrl} - El usuario ${email} ha sido bloqueado por superar el máximo de intentos fallidos`
          );

          // Registro en auditoría de bloqueo de usuario
          await AuditoriaEntidad.create({
            usuario_registrante_id: user.id_usuario,
            entidad_afectada: 'Usuario',
            tipo_auditoria: 'ERROR',
            detalle: `Bloqueo después de ${MAX_LOGIN_ATTEMPTS} intentos fallidos`,
          });
        }

        // Guardar cambios en intentos fallidos y estado de habilitación del usuario
        await user.save();
      }

      // Registro de auditoría para intento de inicio de sesión fallido
      await AuditoriaEntidad.create({
        usuario_originario_id: user.id_usuario,
        entidad_afectada: 'Usuario',
        tipo_auditoria: 'ERROR',
        detalle: `Intento ${user.intentos_fallidos} fallido de inicio de sesión.`,
      });

      // Registra en el log y lanza un error de autenticación
      logger.warn(
        `${req.method} ${req.originalUrl} - Intento de inicio de sesión fallido. Contraseña incorrecta para el usuario: ${email}. Intentos fallidos: ${user.intentos_fallidos}`
      );

      throw new Err.UnauthorizedError(MESSAGES.ERROR.VALIDATION.PASSWORD_INCORRECT);
    }

    // Reiniciar intentos fallidos si la autenticación es exitosa
    if (
      user.intentos_fallidos > 0 &&
      (role === 'productor_principal' || role === 'productor_secundario')
    ) {
      user.intentos_fallidos = 0;
      await user.save();
    }

    // Generar nuevo token con el rol
    const token = jwt.sign(
      { id: user.id_usuario, role: role || 'usuario', maestro: maestro },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRATION || '1h' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE || '3600000', 10),
    });

    // Registro de auditoría para acceso exitoso
    await AuditoriaEntidad.create({
      usuario_originario_id: user.id_usuario,
      entidad_afectada: 'Usuario',
      tipo_auditoria: 'AUTH',
      detalle: `Inicio de sesión exitoso`,
    });

    // Registro de sesión
    await AuditoriaSesion.create({
      usuario_registrante_id: user.id_usuario,
      fecha_inicio_sesion: new Date(),
      ip_origen: req.ip,
      navegador: req.headers['user-agent'] || null,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Inicio de sesión exitoso para el usuario: ${email}`
    );

    return res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.LOGIN });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error en el inicio de sesión: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};


// SOLICITAR RESETEO DE CLAVE
export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
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
    const tokenExpiration = process.env.RESET_TOKEN_EXPIRATION || '1h';
    if (!process.env.JWT_SECRET) {
      throw new Error('Falta JWT_SECRET en el archivo de configuración');
    }

    // Genera el token de restablecimiento
    const resetToken = jwt.sign({ id_usuario: user.id_usuario }, process.env.JWT_SECRET, {
      expiresIn: tokenExpiration,
    });
    user.reset_password_token = resetToken;

    // Calcula la fecha de expiración del token de restablecimiento
    try {
      const decoded = handleTokenVerification(resetToken, process.env.JWT_SECRET!) as JwtPayload;
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
    await AuditoriaEntidad.create({
      usuario_originario_id: user.id_usuario,
      entidad_afectada: 'Usuario',
      tipo_auditoria: 'CAMBIO',
      detalle: `Solicitud de cambio de clave.`,
    });

    // Genera el enlace de restablecimiento y envía el correo electrónico
    const resetLink = `${resetToken}`;
    const emailBody = MESSAGES.EMAIL_BODY.PASSWORD_RECOVERY(resetLink);
    await sendEmail({
      to: user.email,
      subject: 'Solicitud de restablecimiento de contraseña',
      html: emailBody,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Correo de restablecimiento de contraseña enviado a: ${email}`
    );
    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.PASSWORD_RESET_REQUESTED });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error en la solicitud de restablecimiento de contraseña: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};


// VALIDAR EL TOKEN ENVIADO AL RESETEAR LA CLAVE
export const validateEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para validar el email`);

    const { token } = req.params;

    // Verificar el token usando handleTokenVerification
    let decoded: JwtPayload;
    try {
      decoded = handleTokenVerification(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (err) {
      logger.warn(`${req.method} ${req.originalUrl} - Token de verificación inválido o expirado.`);
      throw new Err.UnauthorizedError(MESSAGES.ERROR.JWT.INVALID);
    }

    // Busca al usuario usando el ID decodificado y verifica el token y su expiración
    const result = await findUsuario({ userId: decoded.id_usuario });
    const user = result?.user;

    if (
      !user ||
      user.email_verification_token !== token ||
      user.email_verification_token_expires! < new Date()
    ) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario no encontrado o token inválido.`);
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    // Actualiza el tipo_registro del usuario a "CONFIRMADO" y limpia el token de verificación
    user.tipo_registro = 'CONFIRMADO';
    user.email_verification_token = null;
    user.email_verification_token_expires = null;
    await user.save();

    logger.info(
      `${req.method} ${req.originalUrl} - Email validado correctamente para el usuario ${user.email}`
    );

    // Registrar en la auditoría el cambio de estado a "CONFIRMADO"
    await AuditoriaEntidad.create({
      usuario_originario_id: user.id_usuario,
      entidad_afectada: 'Usuario',
      tipo_auditoria: 'CAMBIO',
      detalle: `${user.email} confirmado`,
    });

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.EMAIL_CONFIRMED });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error en la validación del email: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};


// CAMBIAR CLAVE UNA VEZ VALIDADO EL MAIL
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para restablecer la contraseña del usuario`
    );

    const { token, newPassword } = req.body;

    // Verificar el token usando handleTokenVerification
    let decoded: JwtPayload;
    try {
      decoded = handleTokenVerification(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (err) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Token de restablecimiento inválido o expirado.`
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
    }

    // Buscar el usuario usando el id del token y verificar el token y su expiración
    const result = await findUsuario({ userId: decoded.id_usuario });
    const user = result?.user;

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
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Contraseña restablecida exitosamente para el usuario ${user.email}. Sesión cerrada.`
    );

    // Registro en auditoría para el restablecimiento de la contraseña
    await AuditoriaEntidad.create({
      usuario_originario_id: user.id_usuario,
      entidad_afectada: 'Usuario',
      tipo_auditoria: 'CAMBIO',
      detalle: `Clave modificada por mail`,
    });

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.PASSWORD_RESET });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      logger.warn('El token de restablecimiento de contraseña ha expirado.');
      return next(new Err.BadRequestError(MESSAGES.ERROR.JWT.EXPIRED));
    }
    logger.error(
      `${req.method} ${req.originalUrl} - Error en el restablecimiento de contraseña: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};


// OBTENER LOS DATOS DEL USUARIO
export const getUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para obtener los datos del usuario`
    );

    const token = req.cookies['auth_token'];

    if (!token) {
      logger.warn(`${req.method} ${req.originalUrl} - Token no proporcionado en la cookie.`);
      return res.status(401).json({ message: MESSAGES.ERROR.VALIDATION.NO_TOKEN_PROVIDED });
    }

    const decodedToken = verifyToken(token, process.env.JWT_SECRET!);
    if (!decodedToken || !decodedToken.id) {
      logger.warn(`${req.method} ${req.originalUrl} - Token inválido o expirado.`);
      return res.status(401).json({ message: MESSAGES.ERROR.VALIDATION.INVALID_TOKEN });
    }

    // Utilizar findUsuario para obtener los datos completos del usuario
    const result = await findUsuario({ userId: decodedToken.id });
    const user = result?.user;

    if (!user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró un usuario con el ID: ${decodedToken.id}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Datos del usuario obtenidos correctamente para el usuario con ID: ${user.id_usuario}`
    );
    res.status(200).json({ user, role: result.role, productora_id: result.productora });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al obtener los datos del usuario: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};


// CAMBIARLE LA CLAVE A UN USUARIO
export const changeUserPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, newPassword, confirmPassword } = req.body;
    const userIdFromToken = (req.user as JwtPayload)?.id;

    if (newPassword !== confirmPassword) {
      logger.warn(`${req.method} ${req.originalUrl} - Las contraseñas no coinciden.`);
      return res.status(400).json({ message: MESSAGES.ERROR.PASSWORD.CONFIRMATION_MISMATCH });
    }

    // Buscar el usuario cuyo password se va a cambiar
    const userData = await findUsuario({ userId });
    const user = userData?.user;

    if (!user) {
      logger.warn(`${req.method} ${req.originalUrl} - No se encontró al usuario con ID: ${userId}`);
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    // Buscar el usuario autenticado desde el token
    const authenticatedUserData = await findUsuario({ userId: userIdFromToken });
    const authenticatedUser = authenticatedUserData?.user;

    if (!authenticatedUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró al usuario autenticado con ID: ${userIdFromToken}`
      );
      return res.status(403).json({ message: MESSAGES.ERROR.USER.NOT_AUTHORIZED });
    }

    // Verificar si el rol del usuario autenticado es admin_principal o admin_secundario
    const isAdmin =
      authenticatedUserData?.role === 'admin_principal' ||
      authenticatedUserData?.role === 'admin_secundario';

    // Verificar que el usuario autenticado sea administrador o esté cambiando su propia contraseña
    if (!isAdmin && userIdFromToken !== userId) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario con ID ${userIdFromToken} no está autorizado para cambiar la clave de otro usuario.`
      );
      return res
        .status(403)
        .json({ message: MESSAGES.ERROR.USER.NOT_AUTHORIZED_TO_CHANGE_PASSWORD });
    }

    // Cifrar la nueva contraseña y actualizarla en el usuario
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.clave = hashedPassword;
    await user.save();

    // Registrar en auditoría el cambio de clave
    await AuditoriaEntidad.create({
      usuario_originario_id: userIdFromToken,
      usuario_destino_id: userId,
      entidad_afectada: 'Usuario',
      tipo_auditoria: 'CAMBIO',
      detalle: `Clave actualizada para el usuario con ID ${userId}`,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Clave actualizada correctamente para el usuario con ID ${userId}.`
    );
    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.PASSWORD_RESET });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al cambiar la clave del usuario: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};


// OBTENER LAS PRODUCTORAS ASOCIADAS AL USUARIO ACTIVO Y GUARDARLAS EN UNA COOKIE
export const getProductoras = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as JwtPayload)?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const productoras = await getAssociatedCompanies(userId);

    res.status(200).json({ productoras });
  } catch (err) {
    console.error('Error al obtener las productoras:', err);
    next(err);
  }
};


// CAMBIAR DE PRODUCTORA ACTIVA
export const setActiveProductora = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as JwtPayload)?.id;
    const { productoraId } = req.body;

    if (!userId || !productoraId) {
      return res.status(401).json({ message: 'Usuario o productora no especificados' });
    }

    // Verificar si la productora está asociada al usuario
    const productoras = await getAssociatedCompanies(userId);
    const productoraExists = productoras.some((productora) => productora.id === productoraId);

    if (!productoraExists) {
      return res.status(403).json({ message: 'No tienes acceso a esta productora' });
    }

    // Almacenar la productora seleccionada en una cookie
    res.cookie('active_company', productoraId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE || '3600000', 10),
    });

    res.status(200).json({ message: 'Productora activa actualizada' });
  } catch (err) {
    console.error('Error al cambiar de productora:', err);
    next(err);
  }
};


// CERRAR SESION
export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authToken = req.cookies['auth_token'];

    if (!authToken) {
      logger.warn(`${req.method} ${req.originalUrl} - No se encontró cookie de autenticación.`);
      return res.status(400).json({ message: MESSAGES.ERROR.VALIDATION.NO_COOKIE_FOUND });
    }

    // Limpia la cookie de autenticación para cerrar sesión
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Verifica si `req.user` es un JwtPayload y extrae el id y email del usuario
    const user = req.user as JwtPayload;
    const userId = user?.id || 'desconocido';
    const email = user?.email || 'desconocido';

    logger.info(`${req.method} ${req.originalUrl} - Logout exitoso para el usuario: ${email}`);

    // Registro de auditoría para el cierre de sesión en AuditoriaEntidad
    await AuditoriaEntidad.create({
      usuario_originario_id: userId,
      entidad_afectada: 'Usuario',
      tipo_auditoria: 'AUTH',
      detalle: 'Logout exitoso',
    });

    // Llama al servicio para actualizar la fecha de fin de sesión
    await actualizarFechaFinSesion(userId);

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.LOGOUT });
  } catch (err) {
    logger.error(`${req.method} ${req.originalUrl} - Error durante el proceso de logout`, err);
    next(err);
  }
};