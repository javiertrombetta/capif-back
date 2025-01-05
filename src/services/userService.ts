import { Op } from "sequelize";

import {
  Productora,
  Usuario,
  UsuarioMaestro,
  UsuarioRol,
  UsuarioVista,
  UsuarioVistaMaestro,
} from "../models";

import { v4 as uuidv4 } from "uuid";

export const createUsuario = async (userData: any) => {
  return await Usuario.create(userData);
};

export const createUsuarioMaestro = async (usuarioMaestroData: any) => {
  return await UsuarioMaestro.create(usuarioMaestroData);
};

export const updateUsuarioMaestro = async (
  usuarioRegistranteId: string,
  updateData: any
) => {
  return await UsuarioMaestro.update(updateData, {
    where: { usuario_registrante_id: usuarioRegistranteId },
  });
};

export const updateUsuarioById = async (userId: string, updateData: any) => {
  const usuarioMaestro = await UsuarioMaestro.findOne({
    where: { usuario_registrante_id: userId },
    include: [
      {
        model: Usuario,
        as: "usuarioRegistrante",
        include: [
          {
            model: UsuarioRol,
            as: "Rol",
          },
        ],
      },
    ],
  });

  if (
    !usuarioMaestro ||
    !usuarioMaestro.usuarioRegistrante ||
    !usuarioMaestro.rol
  ) {
    throw new Error("Usuario no encontrado o sin rol asignado.");
  }

  const user = usuarioMaestro.usuarioRegistrante;

  if (updateData) {
    await user.update({
      nombre: updateData.nombre ?? user.nombre,
      apellido: updateData.apellido ?? user.apellido,
      telefono: updateData.telefono ?? user.telefono,
      email: updateData.email ?? user.email,
    });
  }

  if (
    updateData.newRole &&
    updateData.newRole !== usuarioMaestro.rol.nombre_rol
  ) {
    usuarioMaestro.rol_id = updateData.newRole;
    usuarioMaestro.fecha_ultimo_cambio_rol = new Date();
    await usuarioMaestro.save();
  }

  return user;
};

export const deleteUsuarioById = async (userId: string) => {
  const usuarioMaestro = await UsuarioMaestro.findOne({
    where: { usuario_registrante_id: userId },
    include: [
      {
        model: Usuario,
        as: "usuarioRegistrante",
      },
    ],
  });

  if (!usuarioMaestro || !usuarioMaestro.usuarioRegistrante) {
    throw new Error("Usuario no encontrado");
  }

  await usuarioMaestro.destroy();
  await usuarioMaestro.usuarioRegistrante.destroy();

  return { message: "Usuario eliminado correctamente" };
};

// BUSQUEDA DE UN USUARIO SEGUN UNO O VARIOS FILTROS
export const findUsuario = async (filters: {
  userId?: string;
  email?: string;
  nombre?: string;
  apellido?: string;
  tipo_registro?: string;
  rolId?: string;
  nombre_rol?: string;
  productoraId?: string;
  productoraNombre?: string;
  limit?: number;
  offset?: number;
}) => {
  const whereCondition: any = {};
  const includeCondition: any[] = [];

  // Filtro principal por UsuarioMaestro
  if (filters.userId) {
    whereCondition.usuario_registrante_id = filters.userId;
  }

  // Filtro por Usuario
  if (
    filters.email ||
    filters.tipo_registro ||
    filters.nombre ||
    filters.apellido ||
    filters.userId
  ) {
    const usuarioWhere: any = {};
    if (filters.userId) {
      usuarioWhere.id_usuario = filters.userId;
    }
    if (filters.email) {
      usuarioWhere.email = filters.email;
    }
    if (filters.tipo_registro) {
      usuarioWhere.tipo_registro = filters.tipo_registro;
    }
    if (filters.nombre) {
      usuarioWhere.nombre = { [Op.like]: `%${filters.nombre}%` };
    }
    if (filters.apellido) {
      usuarioWhere.apellido = { [Op.like]: `%${filters.apellido}%` };
    }

    includeCondition.push({
      model: Usuario,
      as: "usuarioRegistrante",
      attributes: [
        "id_usuario",
        "email",
        "clave",
        "nombre",
        "apellido",
        "tipo_registro",
        "email_verification_token",
      ],
      where: usuarioWhere,
    });
  }

  // Filtro por rol
  if (filters.rolId || filters.nombre_rol) {
    const rolWhere: any = {};
    if (filters.rolId) {
      rolWhere.id_rol = filters.rolId;
    }
    if (filters.nombre_rol) {
      rolWhere.nombre_rol = filters.nombre_rol;
    }

    includeCondition.push({
      model: UsuarioRol,
      as: "rol",
      attributes: ["id_rol", "nombre_rol"],
      where: rolWhere,
    });
  }

  // Filtro por Productora
  if (filters.productoraId || filters.productoraNombre) {
    const productoraWhere: any = {};
    if (filters.productoraId) {
      productoraWhere.id_productora = filters.productoraId;
    }
    if (filters.productoraNombre) {
      productoraWhere.nombre_productora = filters.productoraNombre;
    }

    includeCondition.push({
      model: Productora,
      as: "productora",
      attributes: ["id_productora", "nombre_productora"],
      where: productoraWhere,
    });
  }

  // Consulta principal
  const usuariosMaestro = await UsuarioMaestro.findAll({
    where: whereCondition,
    limit: filters.limit || 50,
    offset: filters.offset || 0,
    include: includeCondition,
  });
  // Si no se encuentran resultados
  if (!usuariosMaestro || usuariosMaestro.length === 0) {
    return null;
  }

  // Procesar los resultados
  const user = usuariosMaestro[0].usuarioRegistrante;

  const maestros = usuariosMaestro.map((usuarioMaestro) => ({
    maestroId: usuarioMaestro.id_usuario_maestro,
    rol: usuarioMaestro.rol || { id_rol: uuidv4(), nombre_rol: "usuario" },
    productora: usuarioMaestro.productora,
  }));

  return { user, maestros };
};

export const findRolByNombre = async (nombre_rol: string) => {
  const rol = await UsuarioRol.findOne({
    where: { nombre_rol },
  });

  if (!rol) {
    throw new Error(`No se encontró un rol con la descripción: ${nombre_rol}`);
  }

  return rol;
};

export const findVistasforUsuario = async (usuarioId: string): Promise<string[]> => {
  const vistas = await UsuarioVistaMaestro.findAll({
    where: { usuario_id: usuarioId, is_habilitado: true },
    include: [{ model: UsuarioVista, as: "vista", attributes: ["nombre_vista"] }],
  });

  return vistas.map((vista) => {
    if (!vista.vista) {
      throw new Error("Vista no definida en UsuarioVistaMaestro.");
    }
    return vista.vista.nombre_vista;
  });
};

export const findVistasForRol = async (rolId: string): Promise<{ id_vista: string; nombre_vista: string }[]> => {
  if (!rolId) {
    throw new Error("El ID del rol es obligatorio para buscar vistas asociadas.");
  }

  const vistas = await UsuarioVista.findAll({
    where: { rol_id: rolId },
    attributes: ["id_vista", "nombre_vista"],
  });

  if (!vistas || vistas.length === 0) {
    throw new Error(`No se encontraron vistas para el rol con ID: ${rolId}`);
  }

  return vistas;
};

export const createVistaRelationsForUser = async (
  usuarioId: string,
  rolId: string
): Promise<void> => {
  if (!usuarioId || !rolId) {
    throw new Error("UsuarioId y RolId son obligatorios para crear relaciones.");
  }

  // Obtener las vistas asociadas al rol
  const vistas = await findVistasForRol(rolId);

  if (!vistas || vistas.length === 0) {
    throw new Error(`No se encontraron vistas para el rol con ID: ${rolId}`);
  }

  // Crear relaciones en UsuarioVistaMaestro
  const vistasMaestroData = vistas.map((vista) => ({
    usuario_id: usuarioId,
    vista_id: vista.id_vista,
    is_habilitado: true,
  }));

  await UsuarioVistaMaestro.bulkCreate(vistasMaestroData);

  console.log(`Se asignaron ${vistasMaestroData.length} vistas al usuario con ID: ${usuarioId}`);
};