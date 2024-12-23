import { Op } from 'sequelize';

import {
  Productora,
  Usuario,
  UsuarioMaestro,
  UsuarioRol,
  UsuarioVista,
} from '../models';

export const createUsuario = async (userData: any) => {
  return await Usuario.create(userData);
};

export const createUsuarioMaestro = async (usuarioMaestroData: any) => {
  return await UsuarioMaestro.create(usuarioMaestroData);
};

export const updateUsuarioMaestro = async (usuarioRegistranteId: string, updateData: any) => {
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
        as: 'usuarioRegistrante',
        include: [
          {
            model: UsuarioRol,
            as: 'Rol',
          },
        ],
      },
    ],
  });

  if (!usuarioMaestro || !usuarioMaestro.usuarioRegistrante || !usuarioMaestro.rol) {
    throw new Error('Usuario no encontrado o sin rol asignado.');
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

  if (updateData.newRole && updateData.newRole !== usuarioMaestro.rol.nombre_rol) {
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
        as: 'usuarioRegistrante',
      },
    ],
  });

  if (!usuarioMaestro || !usuarioMaestro.usuarioRegistrante) {
    throw new Error('Usuario no encontrado');
  }

  await usuarioMaestro.destroy();
  await usuarioMaestro.usuarioRegistrante.destroy();

  return { message: 'Usuario eliminado correctamente' };
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
  if (filters.email || filters.tipo_registro || filters.nombre || filters.apellido) {
    const usuarioWhere: any = {};
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
      as: 'usuarioRegistrante',
      attributes: ['id_usuario', 'email', 'nombre', 'apellido', 'tipo_registro'],
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
      as: 'rol',
      attributes: ['id_rol', 'nombre_rol'],
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
      as: 'productora',
      attributes: ['id_productora', 'nombre_productora'],
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
    rol: usuarioMaestro.rol || { id_rol: 'DEFAULT', nombre_rol: 'usuario' },
    productora: usuarioMaestro.productora,
  }));

  return { user, maestros };
};

export const findRolByDescripcion = async (descripcion: string) => {
  const rol = await UsuarioRol.findOne({
    where: { descripcion },
  });

  if (!rol) {
    throw new Error(`No se encontró un rol con la descripción: ${descripcion}`);
  }

  return rol;
};

export const findVistasforUsuario = async (usuarioId: string) => {
  const vistas = await UsuarioVista.findAll({
    include: [
      {
        model: UsuarioVista,
        where: {
          usuario_id: usuarioId,
          acceso: true,
        },
      },
    ],
  });

  return vistas.map((vista) => vista.nombre_vista);
};
