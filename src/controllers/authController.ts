import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import logger from '../config/logger';

import * as MESSAGES from '../services/messages';
import { sendEmail } from '../services/emailService';
import { findUserByEmail, findUserById } from '../services/userService';
import { findRoleById, findEstadoById } from '../services/roleService';
import { hashPassword, verifyPassword } from '../services/passwordService';

import * as Err from '../services/customErrors';

import Usuario from '../models/Usuario';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, nombre, apellido, rol_id, estado_id } = req.body;

    const rol = await findRoleById(rol_id);
    if (!rol) {
      throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.ROLE_INVALID);
    }

    const estado = await findEstadoById(estado_id);
    if (!estado) {
      throw new Err.BadRequestError(MESSAGES.ERROR.VALIDATION.STATE_INVALID);
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new Err.ConflictError(MESSAGES.ERROR.USER.ALREADY_REGISTERED);
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await Usuario.create({
      email,
      clave: hashedPassword,
      nombre,
      apellido,
      rol_id,
      estado_id,
    });

    res.status(201).json({ message: MESSAGES.SUCCESS.REGISTER, user: newUser });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
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

    const user = await findUserByEmail(email);
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

    const user = await findUserById(decoded.id);
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