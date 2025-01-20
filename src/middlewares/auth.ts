import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import logger from "../config/logger";
import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";
import { Usuario, UsuarioRol } from "../models";

// Verificar token y devolver el payload
export const verifyToken = (
  token: string | undefined,
  secret: string
): JwtPayload | null => {
  if (!token) return null;
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (err) {
    logger.error("Error verificando el token:", err);
    return null;
  }
};

// Middleware para autenticar el usuario
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies["auth_token"] || req.header("Authorization")?.split(" ")[1];

    if (!token) {
      logger.warn("Acceso denegado: Token no proporcionado");
      return res.status(401).json({
        error: "Acceso denegado. Token no válido o no proporcionado.",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (!decodedToken.id) {
      logger.warn("Acceso denegado: Token inválido");
      return res
        .status(401)
        .json({ error: "Acceso denegado. Token inválido." });
    }

    const usuario = await Usuario.findByPk(decodedToken.id, {
      include: [{ model: UsuarioRol, as: "rol", attributes: ["nombre_rol"] }],
    });

    if (!usuario) {
      logger.warn("Usuario no encontrado con el ID proporcionado en el token.");
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    if (usuario.is_bloqueado) {
      logger.warn(`Usuario ${usuario.email} está bloqueado.`);
      return res.status(403).json({ error: "Usuario bloqueado. Contacte al administrador." });
    }

    if (!usuario.rol) {
      logger.warn(`Usuario ${usuario.email} está bloqueado.`);
      return res.status(403).json({ error: "Usuario sin rol asignado. Contacte al administrador." });
    }

    // Asignar propiedades al request
    req.userId = usuario.id_usuario;
    req.role = usuario.rol.nombre_rol;

    // Verificar si existe la cookie `active_sesion`
    const activeSesion = req.cookies["active_sesion"];
    if (activeSesion) {
      try {
        const activeData = JSON.parse(activeSesion);

        // Validar productoraId
        if (!activeData.productoraId) {
          logger.warn("La cookie active_sesion no contiene un productoraId válido.");
          return res.status(400).json({
            error: "Cookie de sesión activa inválida: falta el productoraId.",
          });
        }

        // Asignar valores si son válidos 
        req.productoraId = activeData.productoraId;
      } catch (err) {
        logger.error("Error parseando la cookie active_sesion:", err);
        return res
          .status(400)
          .json({ error: "Cookie de sesión activa inválida. Formato incorrecto." });
      }
    }

    logger.info(
      `Autenticación exitosa. Usuario ID: ${req.userId}, Rol: ${req.role}`
    );

    next();
  } catch (err) {
    logger.error("Error en el middleware de autenticación:", err);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

// Middleware para autorizar roles
export const authorizeRoles = (roles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.role) {
        logger.warn(
          `Acceso denegado: No se encontró un rol en la solicitud. Usuario ID: ${req.userId || "desconocido"}`
        );
        return res.status(403).json({
          error: "No tienes permiso para acceder a este recurso. Rol no definido.",
        });
      }

      if (!roles.includes(req.role)) {
        logger.warn(
          `Acceso denegado: El rol ${req.role} no tiene permiso para acceder. Roles permitidos: ${roles.join(", ")}`
        );
        return res.status(403).json({
          error: "No tienes permiso para acceder a este recurso.",
        });
      }

      next();
    } catch (err) {
      logger.error("Error en el middleware de autorización:", err);
      return res.status(500).json({
        error: "Error interno del servidor.",
      });
    }
  };
};
