import { Op } from "sequelize";

import {
  Productora,
  Usuario,
  UsuarioMaestro,
  UsuarioRol,
  UsuarioVista,
  UsuarioVistaMaestro,
} from "../models";

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
  // Buscar el usuario por su ID
  const usuario = await Usuario.findOne({
    where: { id_usuario: userId },
    include: [
      {
        model: UsuarioRol,
        as: "rol",
      },
    ],
  });

  if (!usuario || !usuario.rol) {
    throw new Error("Usuario no encontrado o sin rol asignado.");
  }

  // Actualizar datos del usuario si se proporcionan
  if (updateData) {
    await usuario.update({
      nombre: updateData.nombre ?? usuario.nombre,
      apellido: updateData.apellido ?? usuario.apellido,
      telefono: updateData.telefono ?? usuario.telefono,
      email: updateData.email ?? usuario.email,
    });
  }

  // Cambiar el rol si se solicita un cambio
  if (updateData.newRole && updateData.newRole !== usuario.rol.nombre_rol) {
    const nuevoRol = await UsuarioRol.findOne({
      where: { nombre_rol: updateData.newRole },
    });

    if (!nuevoRol) {
      throw new Error("El nuevo rol especificado no existe.");
    }

    usuario.rol_id = nuevoRol.id_rol;
    usuario.fecha_ultimo_cambio_rol = new Date();
    await usuario.save();
  }

  return usuario;
};

export const deleteUsuarioById = async (userId: string) => {
  // Verificar si el usuario existe
  const usuario = await Usuario.findOne({
    where: { id_usuario: userId },
  });

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  // Eliminar registros relacionados en UsuarioMaestro
  const deletedMaestros = await UsuarioMaestro.destroy({
    where: { usuario_registrante_id: userId },
  });

  // Eliminar el usuario
  await usuario.destroy();

  return {
    message: "Usuario y relaciones eliminados correctamente",
    details: {
      deletedUsuario: userId,
      deletedMaestros,
    },
  };
};

export const deleteUsuarioMaestrosByUserId = async (userId: string) => {
  await UsuarioMaestro.destroy({
    where: { usuario_registrante_id: userId },
  });
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
  const whereUsuario: any = {};
  const includeUsuario: any[] = [];
  const includeMaestro: any[] = [];

  // Filtro por Usuario
  if (filters.userId) {
    whereUsuario.id_usuario = filters.userId;
  }
  if (filters.email) {
    whereUsuario.email = filters.email;
  }
  if (filters.tipo_registro) {
    whereUsuario.tipo_registro = filters.tipo_registro;
  }
  if (filters.nombre) {
    whereUsuario.nombre = { [Op.like]: `%${filters.nombre}%` };
  }
  if (filters.apellido) {
    whereUsuario.apellido = { [Op.like]: `%${filters.apellido}%` };
  }

  // Filtro por rol
  if (filters.rolId || filters.nombre_rol) {
    const whereRol: any = {};
    if (filters.rolId) {
      whereRol.id_rol = filters.rolId;
    }
    if (filters.nombre_rol) {
      whereRol.nombre_rol = filters.nombre_rol;
    }

    includeUsuario.push({
      model: UsuarioRol,
      as: "rol",
      attributes: ["id_rol", "nombre_rol"],
      where: whereRol,
    });
  }

  // Filtro por Productora
  if (filters.productoraId || filters.productoraNombre) {
    const whereProductora: any = {};
    if (filters.productoraId) {
      whereProductora.id_productora = filters.productoraId;
    }
    if (filters.productoraNombre) {
      whereProductora.nombre_productora = filters.productoraNombre;
    }

    includeMaestro.push({
      model: Productora,
      as: "productora",
      attributes: ["id_productora", "nombre_productora"],
      where: whereProductora,
    });
  }

  // Buscar Usuarios
  const usuarios = await Usuario.findAll({
    where: whereUsuario,
    include: includeUsuario,
    limit: filters.limit || 50,
    offset: filters.offset || 0,
  });

  if (!usuarios || usuarios.length === 0) {
    return null;
  }

  // Determinar si hay un único usuario
  const isSingleUser = usuarios.length === 1 ? 1 : 0;

  // Buscar UsuariosMaestro relacionados
  const usuariosMaestro = await UsuarioMaestro.findAll({
    where: {
      usuario_registrante_id: { [Op.in]: usuarios.map((u) => u.id_usuario) },
    },
    include: includeMaestro,
  });

  // Procesar resultados
  const maestros = usuariosMaestro.map((usuarioMaestro) => ({
    maestroId: usuarioMaestro.id_usuario_maestro,
    productora: usuarioMaestro.productora,
  }));

  // Buscar vistas asociadas

  const vistas = await UsuarioVistaMaestro.findAll({
    where: { usuario_id: usuarios[0].id_usuario },
    include: [
      {
        model: UsuarioVista,
        as: "vista",
        attributes: ["id_vista", "nombre_vista"],
      },
    ],
  });

  // Formatear vistas
  const vistasFormatted = vistas.map((vista) => ({
    id_vista: vista.vista?.id_vista,
    nombre_vista: vista.vista?.nombre_vista,
    is_habilitado: vista.is_habilitado,
  }));

  return { user: usuarios[0], maestros, vistas: vistasFormatted, isSingleUser };
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

export const findVistasforUsuario = async (
  usuarioId: string
): Promise<string[]> => {
  const vistas = await UsuarioVistaMaestro.findAll({
    where: { usuario_id: usuarioId, is_habilitado: true },
    include: [
      { model: UsuarioVista, as: "vista", attributes: ["nombre_vista"] },
    ],
  });

  return vistas.map((vista) => {
    if (!vista.vista) {
      throw new Error("Vista no definida en UsuarioAccesoMaestro.");
    }
    return vista.vista.nombre_vista;
  });
};

export const assignVistasToUser = async (
  usuarioId: string,
  rolId: string
): Promise<void> => {
  if (!usuarioId || !rolId) {
    throw new Error("UsuarioId y RolId son obligatorios para asignar vistas.");
  }

  // Buscar vistas asociadas al rol y crear relaciones para el usuario
  const vistas = await UsuarioVista.findAll({
    where: { rol_id: rolId },
    attributes: ["id_vista", "nombre_vista"],
  });

  if (!vistas || vistas.length === 0) {
    throw new Error(`No se encontraron vistas para el rol con ID: ${rolId}`);
  }

  const vistasMaestroData = vistas.map((vista) => ({
    usuario_id: usuarioId,
    vista_id: vista.id_vista,
    is_habilitado: true,
  }));

  await UsuarioVistaMaestro.bulkCreate(vistasMaestroData);

  console.log(
    `Se asignaron ${vistasMaestroData.length} vistas al usuario con ID: ${usuarioId}`
  );
};

export const updateUserViewsService = async (
  usuarioId: string,
  vistas: string[]
): Promise<void> => {
  if (!vistas || !Array.isArray(vistas)) {
    throw new Error("Debe proporcionar un array de vistas.");
  }

  // Eliminar todas las vistas actuales del usuario
  await UsuarioVistaMaestro.destroy({
    where: { usuario_id: usuarioId },
  });

  // Crear nuevas vistas para el usuario
  const vistasMaestroData = vistas.map((vistaId) => ({
    usuario_id: usuarioId,
    vista_id: vistaId,
    is_habilitado: true,
  }));

  await UsuarioVistaMaestro.bulkCreate(vistasMaestroData);
};

export const toggleUserViewStatusService = async (
  usuarioId: string,
  vistas: { id_vista: string; is_habilitado: boolean }[]
): Promise<void> => {
  if (!vistas || !Array.isArray(vistas)) {
    throw new Error("Debe proporcionar un array de vistas.");
  }

  for (const vista of vistas) {
    if (!vista.id_vista || typeof vista.is_habilitado !== "boolean") {
      throw new Error("El formato de las vistas es incorrecto.");
    }

    // Actualizar el estado de la vista
    await UsuarioVistaMaestro.update(
      { is_habilitado: vista.is_habilitado },
      {
        where: {
          usuario_id: usuarioId,
          vista_id: vista.id_vista,
        },
      }
    );
  }
};
