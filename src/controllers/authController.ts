import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import logger from '../config/logger';

import * as MESSAGES from '../services/messages';
import { sendEmail } from '../services/emailService';
import { findUsuarioByEmail, findUsuarioById } from '../services/userService';
import { findRolByDescripcion } from '../services/roleService';
import { findEstadoByDescripcion } from '../services/stateService';
import { hashPassword, verifyPassword } from '../services/passwordService';

import * as Err from '../services/customErrors';

import Usuario from '../models/Usuario';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
      telefono,
    } = req.body;
  
    const existingUser = await findUsuarioByEmail(email);
    if (existingUser) {
      throw new Err.ConflictError(MESSAGES.ERROR.USER.ALREADY_REGISTERED);    }


    const estadoNuevo = await findEstadoByDescripcion('nuevo');
    if (!estadoNuevo) {
      throw new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN);
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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
      estado_id: estadoNuevo.id_estado,
      registro_pendiente: true,
    });

    const emailToken = jwt.sign({ id_usuario: newUser.id_usuario }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });

    const validationLink = `${process.env.FRONTEND_URL}/validate-email/${emailToken}`;
    const emailBody = MESSAGES.EMAIL_BODY.VALIDATE_ACCOUNT(validationLink);

    await sendEmail({
      to: newUser.email,
      subject: 'Confirma tu cuenta',
      html: emailBody,
    });

    res.status(201).json({ message: MESSAGES.SUCCESS.REGISTER, user: newUser });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await findUsuarioByEmail(email);
    if (!user) {
      throw new Err.NotFoundError(MESSAGES.ERROR.VALIDATION.PASSWORD_INCORRECT);
    }

    const isPasswordValid = await verifyPassword(password, user.clave);
    if (!isPasswordValid) {
      throw new Err.UnauthorizedError(MESSAGES.ERROR.VALIDATION.PASSWORD_INCORRECT);
    }

    const token = jwt.sign({ id: user.id_usuario, role: user.rol_id }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: MESSAGES.SUCCESS.LOGIN, token });
  } catch (err) {
    next(err);
  }
};

export const recoverPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await findUsuarioByEmail(email);
    if (!user) {
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    const resetToken = jwt.sign(
      { id: user.id_usuario, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailBody = MESSAGES.EMAIL_BODY.PASSWORD_RECOVERY(resetLink);

    await sendEmail({
      to: user.email,
      subject: 'Recuperación de contraseña',
      html: emailBody,
    });

    res.status(200).json({ message: MESSAGES.SUCCESS.PASSWORD_RECOVERY_EMAIL_SENT });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (!decoded || typeof decoded !== 'object' || !decoded.id) {
      throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
    }

    const user = await findUsuarioById(decoded.id);
    if (!user) {
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    const hashedPassword = await hashPassword(newPassword);

    user.clave = hashedPassword;
    await user.save();

    res.status(200).json({ message: MESSAGES.SUCCESS.PASSWORD_RESET });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      logger.warn('Token expirado durante el restablecimiento de contraseña:', err);
      return next(new Err.BadRequestError(MESSAGES.ERROR.JWT.EXPIRED));
    }

    next(new Err.InternalServerError(MESSAGES.ERROR.PASSWORD.RESET_FAILED));
  }
};

export const validateEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await Usuario.findByPk(decoded.id_usuario);

    if (!user) {
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    const estadoConfirmado = await findEstadoByDescripcion('confirmado');
    if (!estadoConfirmado) {
      throw new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN);
    }

    user.estado_id = estadoConfirmado.id_estado;
    await user.save();

    res.status(200).json({ message: MESSAGES.SUCCESS.EMAIL_CONFIRMED });
  } catch (err) {
    next(err);
  }
};

export const authorizeProducer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_usuario } = req.body;

    const user = await Usuario.findByPk(id_usuario);
    if (!user) {
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }
   
    const estadoAutorizado = await findEstadoByDescripcion('autorizado');
    const rolProductor = await findRolByDescripcion('productor');

    if (!estadoAutorizado || !rolProductor) {
      throw new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN);
    }

    user.estado_id = estadoAutorizado.id_estado;
    user.rol_id = rolProductor.id_rol;
    await user.save();

    res.status(200).json({ message: MESSAGES.SUCCESS.AUTHORIZED });
  } catch (err) {
    next(err);
  }
};

export const blockOrUnblockUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_usuario, bloquear } = req.body;

    const user = await findUsuarioById(id_usuario);
    if (!user) {
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    const estado = await findEstadoByDescripcion(bloquear ? 'bloqueado' : 'habilitado');
    if (!estado) {
      throw new Err.InternalServerError(MESSAGES.ERROR.GENERAL.UNKNOWN);
    }

    user.estado_id = estado.id_estado;
    await user.save();

    const message = bloquear ? MESSAGES.SUCCESS.USER_BLOCKED : MESSAGES.SUCCESS.USER_UNBLOCKED;
    res.status(200).json({ message });
  } catch (err) {
    next(err);
  }
};

export const changeUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_usuario, nuevo_rol } = req.body;

    const user = await findUsuarioById(id_usuario);
    if (!user) {
      throw new Err.NotFoundError(MESSAGES.ERROR.USER.NOT_FOUND);
    }

    const rol = await findRolByDescripcion(nuevo_rol);
    if (!rol) {
      throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID);
    }

    user.rol_id = rol.id_rol;
    await user.save();

    res.status(200).json({ message: MESSAGES.SUCCESS.ROLE_UPDATED });
  } catch (err) {
    next(err);
  }
};