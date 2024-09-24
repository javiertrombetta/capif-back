import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import logger from '../config/logger';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';

export const verifyToken = (token: string | undefined, secret: string): JwtPayload | null => {
  if (!token) return null;
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (err) {
    logger.error('Error verificando el token:', err);
    return null;
  }
};

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies['auth_token'] || req.header('Authorization')?.split(' ')[1]; // Soporte para token en cookies o headers
  const decodedToken = verifyToken(token, process.env.JWT_SECRET!);

  if (!decodedToken) {
    logger.warn('Acceso denegado: Token no proporcionado o inválido');
    return res.status(401).json({ error: 'Acceso denegado. Token no válido o no proporcionado.' });
  }

  req.user = decodedToken;
  next();
};

export const authorizeRoles = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = (req.user as JwtPayload)?.role;
    if (!roles.includes(userRole)) {
      logger.warn(`Acceso denegado: El rol ${userRole} no tiene permiso`);
      return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso.' });
    }
    next();
  };
};
