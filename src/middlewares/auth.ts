import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import logger from '../config/logger';
import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import { UsuarioRol } from '../models';


// Verificar token y devolver el payload
export const verifyToken = (token: string | undefined, secret: string): JwtPayload | null => {
  if (!token) return null;
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (err) {
    logger.error('Error verificando el token:', err);
    return null;
  }
};

// Middleware para autenticar el usuario
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies['auth_token'] || req.header('Authorization')?.split(' ')[1];

    if (!token) {
      logger.warn('Acceso denegado: Token no proporcionado');
      return res.status(401).json({ error: 'Acceso denegado. Token no válido o no proporcionado.' });
    }

    const decodedToken = verifyToken(token, process.env.JWT_SECRET!);
    if (!decodedToken) {
      logger.warn('Acceso denegado: Token inválido');
      return res.status(401).json({ error: 'Acceso denegado. Token inválido.' });
    }

    // Asignar el usuario al request
    req.userId = decodedToken.id;

    // Verificar si existe la cookie `active_sesion`
    const activeSesion = req.cookies['active_sesion'];
    if (activeSesion) {
      try {
        const activeData = JSON.parse(activeSesion);
        req.maestroId = activeData.maestroId;
        req.productoraId = activeData.productoraId;
        req.roleId = activeData.rolId;
      } catch (err) {
        logger.error('Error parseando la cookie active_sesion:', err);
        return res.status(400).json({ error: 'Cookie de sesión activa inválida.' });
      }
    } else {
      // Si no existe la cookie `active_sesion`, asignar el rol "usuario" al usuario
      logger.info('Usuario autenticado sin maestro activo seleccionado');

      const rolUsuario = await UsuarioRol.findOne({
        where: { nombre_rol: 'usuario' }, // Busca el rol base "usuario"
        attributes: ['id_rol'],
      });

      if (!rolUsuario) {
        logger.error('Error: No se encontró el rol "usuario" en la base de datos.');
        return res.status(500).json({ error: 'Error interno del servidor: Rol base no encontrado.' });
      }

      // Asignar el ID del rol "usuario" al request
      req.roleId = rolUsuario.id_rol;
    }

    next();
  } catch (err) {
    logger.error('Error en el middleware de autenticación:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Middleware para autorizar roles
export const authorizeRoles = (roles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const roleId = req.roleId;

      if (!roleId) {
        logger.warn('Acceso denegado: Rol no encontrado en la solicitud');
        return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso.' });
      }
     
      const role = await UsuarioRol.findOne({
        where: { id_rol: roleId }, 
        attributes: ['nombre_rol'],
      });

      if (!role) {
        logger.warn(`Acceso denegado: El rol con ID ${roleId} no está definido en la base de datos.`);
        return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso.' });
      }

      const roleName = role.nombre_rol;

      if (!roles.includes(roleName)) {
        logger.warn(`Acceso denegado: El rol ${roleName} no tiene permiso para acceder.`);
        return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso.' });
      }

      next();

    } catch (err) {
      logger.error('Error en el middleware de autorización:', err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  };
};
