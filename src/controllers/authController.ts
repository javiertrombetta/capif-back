import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Op } from 'sequelize';
import logger from '../config/logger';

import { verifyToken } from '../middlewares/auth';

import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import { UserWithRelations } from '../interfaces/UserWithRelations';

import * as MESSAGES from '../services/messages';
import { sendEmail } from '../services/emailService';
import { findUsuarioByEmail, findUsuarioById } from '../services/userService';
import { findRolByDescripcion } from '../services/roleService';
import { findEstadoByDescripcion } from '../services/stateService';
import { hashPassword, verifyPassword } from '../services/validationsService';
import * as Err from '../services/customErrors';

import Usuario from '../models/Usuario';

//const validationLink = `${process.env.FRONTEND_URL}/validate-email/${emailToken}`

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
    if (!decodedToken) {
      logger.warn(`${req.method} ${req.originalUrl} - Token inválido o expirado.`);
      return res.status(401).json({ message: MESSAGES.ERROR.VALIDATION.INVALID_TOKEN });
    }

    const user = await findUsuarioById(decodedToken.id);
    if (!user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró un usuario con el ID: ${decodedToken.id}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

     logger.info(
       `${req.method} ${req.originalUrl} - Datos del usuario obtenidos correctamente para el usuario con ID: ${user.id_usuario}`
     );
    res.status(200).json({ user });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al obtener los datos del usuario: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};

export const register = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para registrar un nuevo usuario`
    );

    const {
      email,
      password,
      nombre,
      apellido,
      cuit,
      tipo_persona_id,
      domicilio,
      ciudad,
      provincia,
      pais,
      codigo_postal,
      telefono,
    } = req.body;

    const existingUser = await findUsuarioByEmail(email);
    if (existingUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Intento de registro fallido. Usuario ya registrado: ${email}`
      );
      throw new Err.ConflictError(MESSAGES.ERROR.USER.ALREADY_REGISTERED);
    }

    const estadoNuevo = await findEstadoByDescripcion('nuevo');
    if (!estadoNuevo) {
      logger.error(
        `${req.method} ${req.originalUrl} - Error interno: estado "nuevo" no encontrado.`
      );
      throw new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await Usuario.create({
      email,
      clave: hashedPassword,
      nombre,
      apellido,
      cuit,
      tipo_persona_id,
      domicilio,
      ciudad,
      provincia,
      pais,
      telefono,
      codigo_postal,
      estado_id: estadoNuevo.id_estado,
    });

    logger.info(`${req.method} ${req.originalUrl} - Usuario registrado exitosamente: ${email}`);

    const emailToken = jwt.sign({ id_usuario: newUser.id_usuario }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });
    newUser.email_verification_token = emailToken;
    newUser.email_verification_token_expires = new Date(Date.now() + 60 * 60 * 1000);
    await newUser.save();

    logger.debug(
      `${req.method} ${req.originalUrl} - Token de verificación generado para el usuario ${email}`
    );

    const validationLink = `${emailToken}`;
    const emailBody = MESSAGES.EMAIL_BODY.VALIDATE_ACCOUNT(validationLink);
    await sendEmail({
      to: newUser.email,
      subject: 'Confirmá tu cuenta para poder ingresar al sistema',
      html: emailBody,
    });

    logger.info(`${req.method} ${req.originalUrl} - Correo de validación enviado a ${email}`);
    res.status(201).json({ message: MESSAGES.SUCCESS.AUTH.REGISTER });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error en el registro de usuario: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};

export const login = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    
    logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para iniciar sesión`);

    const { email, password } = req.body;

    const existingToken = req.cookies['auth_token'];
    const decodedToken = verifyToken(existingToken, process.env.JWT_SECRET!);

    if (decodedToken) {
      const user = (await findUsuarioByEmail(email)) as UserWithRelations; 
      if (user && decodedToken.id === user.id_usuario) {
        logger.warn(
          `${req.method} ${req.originalUrl} - El usuario ${email} ya ha iniciado sesión previamente.`
        );
        return res.status(400).json({ message: MESSAGES.ERROR.VALIDATION.ALREADY_LOGGED_IN });
      }
    }

    const user = (await findUsuarioByEmail(email)) as UserWithRelations;
    if (!user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Intento de inicio de sesión fallido. Usuario no encontrado: ${email}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }
    
    const rolAdministrador = await findRolByDescripcion('admin');  
    if (!user.isHabilitado && user.Rol?.descripcion !== rolAdministrador?.descripcion) {
      logger.warn(`${req.method} ${req.originalUrl} - El usuario ${email} está bloqueado.`);
      return res.status(403).json({ message: MESSAGES.ERROR.VALIDATION.USER_BLOCKED });
    }

    const estadoNuevo = await findEstadoByDescripcion('nuevo');
    if (user.estado_id === estadoNuevo?.id_estado) {
      logger.warn(`${req.method} ${req.originalUrl} - El usuario ${email} no está confirmado.`);
      return res.status(403).json({ message: MESSAGES.ERROR.VALIDATION.USER_NOT_CONFIRMED });
    }

    const isPasswordValid = await verifyPassword(password, user.clave);
    const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);

    if (!isPasswordValid) {   

      if (user.Rol?.descripcion !== rolAdministrador?.descripcion) {        
        user.intentos_fallidos += 1;
        
        if (user.intentos_fallidos >= MAX_LOGIN_ATTEMPTS) {
          user.isHabilitado = false;
          logger.warn(
            `${req.method} ${req.originalUrl} - El usuario ${email} ha sido bloqueado por superar el máximo de intentos fallidos`
          );
        }

        await user.save();
      }

      logger.warn(
        `${req.method} ${req.originalUrl} - Intento de inicio de sesión fallido. Contraseña incorrecta para el usuario: ${email}. Intentos fallidos: ${user.intentos_fallidos}`
      );
      throw new Err.UnauthorizedError(MESSAGES.ERROR.VALIDATION.PASSWORD_INCORRECT);
    }

    if (user.intentos_fallidos > 0 && user.Rol?.descripcion !== rolAdministrador?.descripcion) {
      user.intentos_fallidos = 0;
      await user.save();
    }

    const token = jwt.sign(
      { id: user.id_usuario, role: user.Rol?.descripcion },
      process.env.JWT_SECRET!,
      {
        expiresIn: '1h',
      }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000,
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

export const requestPasswordReset = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para restablecer la contraseña`
    );

    const { email } = req.body;

    const user = await findUsuarioByEmail(email);
    if (!user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Solicitud de restablecimiento de contraseña fallida. Usuario no encontrado: ${email}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    const resetToken = jwt.sign({ id_usuario: user.id_usuario }, process.env.JWT_SECRET!, {
      expiresIn: process.env.RESET_TOKEN_EXPIRATION || '1h',
    });
    user.reset_password_token = resetToken;
    user.reset_password_token_expires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    logger.debug(
      `${req.method} ${req.originalUrl} - Token de restablecimiento de contraseña generado para el usuario: ${email}`
    );

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

export const resetPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para restablecer la contraseña del usuario`
    );

    const { token, newPassword } = req.body;

    const user = await Usuario.findOne({
      where: {
        reset_password_token: token,
        reset_password_token_expires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Token de restablecimiento de contraseña inválido o expirado.`
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
    }

    const hashedPassword = await hashPassword(newPassword);
    user.clave = hashedPassword;

    user.reset_password_token = null;
    user.reset_password_token_expires = null;
    await user.save();
  
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Contraseña restablecida exitosamente para el usuario ${user.email}. Sesión cerrada.`
    );
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

export const validateEmail = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para validar el email`);

    const { token } = req.params;

    const user = await Usuario.findOne({
      where: {
        email_verification_token: token,
        email_verification_token_expires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Token de verificación de email inválido o expirado.`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    const estadoConfirmado = await findEstadoByDescripcion('confirmado');
    if (!estadoConfirmado) {
      logger.error(
        `${req.method} ${req.originalUrl} - Error interno: estado "confirmado" no encontrado.`
      );
      throw new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN);
    }

    user.estado_id = estadoConfirmado.id_estado;
    user.email_verification_token = null;
    user.email_verification_token_expires = null;
    await user.save();

    logger.info(
      `${req.method} ${req.originalUrl} - Email validado correctamente para el usuario ${user.email}`
    );
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

export const authorizeUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    logger.info(`${req.method} ${req.originalUrl} - Solicitud recibida para autorizar al usuario`);

    const { id_usuario } = req.body;

    const user = await Usuario.findByPk(id_usuario);
    if (!user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró al usuario con ID: ${id_usuario}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    const estadoConfirmado = await findEstadoByDescripcion('confirmado');
    if (!estadoConfirmado) {
      logger.error(
        `${req.method} ${req.originalUrl} - Error interno: estado "confirmado" no encontrado.`
      );
      throw new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN);
    }

    if (user.estado_id !== estadoConfirmado.id_estado) {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario con ID ${id_usuario} no está confirmado y no puede ser autorizado.`
      );
      return res.status(400).json({ message: MESSAGES.ERROR.VALIDATION.STATE_INVALID });
    }

    const estadoAutorizado = await findEstadoByDescripcion('autorizado');
   if (!estadoAutorizado) {
     logger.error(
       `${req.method} ${req.originalUrl} - Error interno: estado "autorizado" no encontrado.`
     );
     throw new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN);
   }

    if (user.estado_id === estadoAutorizado.id_estado) {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario con ID ${id_usuario} ya ha sido autorizado.`
      );
      return res.status(400).json({ message: MESSAGES.ERROR.VALIDATION.STATE_INVALID });
    }

    const rolProductor = await findRolByDescripcion('productor');
    if (!rolProductor) {
      logger.error(
        `${req.method} ${req.originalUrl} - Error interno: rol "productor" no encontrado.`
      );
      throw new Err.InternalServerError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID);
    }

    user.estado_id = estadoAutorizado.id_estado;
    user.rol_id = rolProductor.id_rol;
    await user.save();

    logger.info(
      `${req.method} ${req.originalUrl} - Usuario con ID ${id_usuario} autorizado correctamente como productor.`
    );
    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.AUTHORIZED });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al autorizar productor: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};



export const blockOrUnblockUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    const { id_usuario, bloquear } = req.body;

    logger.info(
      `${req.method} ${req.originalUrl} - Solicitud recibida para ${
        bloquear ? 'bloquear' : 'desbloquear'
      } al usuario`
    );

    const user = await findUsuarioById(id_usuario);
    if (!user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró al usuario con ID: ${id_usuario}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }
  
    user.isHabilitado = !bloquear;
    await user.save();

    const message = bloquear
      ? MESSAGES.SUCCESS.AUTH.USER_BLOCKED
      : MESSAGES.SUCCESS.AUTH.USER_UNBLOCKED;
 
    logger.info(
      `${req.method} ${req.originalUrl} - Usuario con ID ${id_usuario} ${
        bloquear ? 'bloqueado' : 'desbloqueado'
      } correctamente.`
    );
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


export const changeUserRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id_usuario, nuevo_rol } = req.body;

    const user = await findUsuarioById(id_usuario);
   if (!user) {
     logger.warn(
       `${req.method} ${req.originalUrl} - No se encontró al usuario con ID: ${id_usuario}`
     );
     throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
   }
    
    const estadoAutorizado = await findEstadoByDescripcion('autorizado');
    if (!estadoAutorizado) {
      logger.error(
        `${req.method} ${req.originalUrl} - Error interno: estado "autorizado" no encontrado.`
      );
      throw new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN);
    }

    if (user.estado_id !== estadoAutorizado.id_estado) {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario con ID ${id_usuario} no está autorizado y no puede cambiar de rol.`
      );
      return res.status(403).json({ message: MESSAGES.ERROR.VALIDATION.STATE_INVALID });
    }
   
    const rolAdministrador = await findRolByDescripcion('administrador');
    const rolProductor = await findRolByDescripcion('productor');

    if (!rolAdministrador || !rolProductor) {
      logger.error(
        `${req.method} ${req.originalUrl} - Error interno: rol "administrador" o "productor" no encontrado.`
      );
      throw new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN);
    }
   
    if (user.rol_id !== rolAdministrador.id_rol && user.rol_id !== rolProductor.id_rol) {
      logger.warn(
        `${req.method} ${req.originalUrl} - El usuario con ID ${id_usuario} no tiene rol asignado.`
      );
      return res.status(403).json({ message: MESSAGES.ERROR.USER.NOT_AUTHORIZED_TO_CHANGE_ROLE });
    }
 
    const rol = await findRolByDescripcion(nuevo_rol);
    if (!rol) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Rol inválido: ${nuevo_rol} para el usuario con ID: ${id_usuario}`
      );
      throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID);
    }
    
    user.rol_id = rol.id_rol;
    await user.save();

    logger.info(
      `${req.method} ${req.originalUrl} - Rol del usuario con ID ${id_usuario} actualizado correctamente a ${nuevo_rol}.`
    );
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

export const logout = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {  
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    const user = req.user as JwtPayload;
    const email = user?.email || 'desconocido';

    logger.info(`${req.method} ${req.originalUrl} - Logout exitoso para el usuario: ${email}`);
    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.LOGOUT });
  } catch (err) {
    logger.error('Error durante el proceso de logout', err);
    next(err);
  }
};

export const changeUserPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id_usuario, newPassword, confirmPassword } = req.body;
    const userIdFromToken = (req.user as JwtPayload)?.id;

    if (newPassword !== confirmPassword) {
      logger.warn('${req.method} ${req.originalUrl} - Las contraseñas no coinciden.');
      return res.status(400).json({ message: MESSAGES.ERROR.PASSWORD.CONFIRMATION_MISMATCH });
    }

    const user = await findUsuarioById(id_usuario);
    if (!user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró al usuario con ID: ${id_usuario}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    const authenticatedUser = await findUsuarioById(userIdFromToken);
    if (!authenticatedUser) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró al usuario autenticado con ID: ${userIdFromToken}`
      );
      return res.status(403).json({ message: MESSAGES.ERROR.USER.NOT_AUTHORIZED });
    }

    const rolAdministrador = await findRolByDescripcion('administrador');
    if (!rolAdministrador) {
      logger.error('${req.method} ${req.originalUrl} - El rol administrador no fue encontrado.');
      throw new Err.InternalServerError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID);
    }

    const isAdmin = authenticatedUser.rol_id === rolAdministrador.id_rol;

    if (!isAdmin && userIdFromToken !== id_usuario) {
      logger.warn(
        `${req.method} ${req.originalUrl} - Usuario con ID ${userIdFromToken} no está autorizado para cambiar la clave de otro usuario.`
      );
      return res.status(403).json({ message: MESSAGES.ERROR.USER.NOT_AUTHORIZED_TO_CHANGE_ROLE });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.clave = hashedPassword;
    await user.save();

    logger.info(
      `${req.method} ${req.originalUrl} - Clave actualizada correctamente para el usuario con ID ${id_usuario}.`
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

export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id_usuario } = req.body;

    const user = await findUsuarioById(id_usuario);
    if (!user) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se encontró al usuario con ID: ${id_usuario}`
      );
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    const estadoNuevo = await findEstadoByDescripcion('nuevo');
    const estadoConfirmado = await findEstadoByDescripcion('confirmado');

    if (!estadoNuevo || !estadoConfirmado) {
      logger.error(
        '${req.method} ${req.originalUrl} - Error interno: estado "nuevo" o "confirmado" no encontrado.'
      );
      throw new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN);
    }

    if (user.estado_id !== estadoNuevo.id_estado && user.estado_id !== estadoConfirmado.id_estado) {
      logger.warn(
        `${req.method} ${req.originalUrl} - No se puede eliminar al usuario con ID ${id_usuario} debido a su estado actual.`
      );
      return res.status(403).json({ message: MESSAGES.ERROR.VALIDATION.STATE_ALREADY_AUTHORIZED });
    }

    await user.destroy();
    logger.info(
      `${req.method} ${req.originalUrl} - Usuario con ID ${id_usuario} eliminado correctamente.`
    );
    res.status(200).json({ message: MESSAGES.SUCCESS.AUTH.USER_DELETED });
  } catch (err) {
    logger.error(
      `${req.method} ${req.originalUrl} - Error al eliminar usuario: ${
        err instanceof Error ? err.message : 'Error desconocido'
      }`
    );
    next(err);
  }
};