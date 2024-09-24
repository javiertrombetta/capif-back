import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as Err from '../services/customErrors';
import * as MESSAGES from '../services/messages';

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const handleTokenVerification = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    throw new Err.BadRequestError(MESSAGES.ERROR.JWT.INVALID);
  }
};
