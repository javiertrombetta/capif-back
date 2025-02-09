import { Op } from "sequelize";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import {
  AuditoriaCambio,
  Productora,
  Usuario,
  UsuarioMaestro,
  UsuarioRol,
  UsuarioVista,
  UsuarioVistaMaestro,
} from "../models";
import { UsuarioResponse } from "../interfaces/UsuarioResponse";

export const createUser = async ({
  email,
  nombre,
  apellido,
  telefono,
  rolNombre,
  tipoRegistro = "HABILITADO",
  clave,
}: {
  email: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  rolNombre: string;
  tipoRegistro?: string;
  clave?: string;
}) => {
  // Verificar si el usuario ya existe
  const existingUser = await Usuario.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("El usuario ya está registrado.");
  }

  // Verificar si el rol existe
  const rol = await UsuarioRol.findOne({ where: { nombre_rol: rolNombre } });
  if (!rol) {
    throw new Error(`El rol ${rolNombre} no existe.`);
  }

  // Generar clave temporal o usar la proporcionada
  const tempPassword = clave || crypto.randomBytes(8).toString("hex");
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Crear el usuario
  const newUser = await Usuario.create({
    email,
    nombre: nombre || null,
    apellido: apellido || null,
    telefono: telefono || null,
    rol_id: rol.id_rol,
    tipo_registro: tipoRegistro,
    clave: hashedPassword,
    fecha_ultimo_cambio_rol: new Date(),
    fecha_ultimo_cambio_registro: new Date(),
  });

  return { newUser, tempPassword: clave ? null : tempPassword };
};

export const createUsuarioMaestro = async (usuarioMaestroData: any) => {
  return await UsuarioMaestro.create(usuarioMaestroData);
};

export const updateUsuarioMaestro = async (
  usuarioRegistranteId: string,
  updateData: any
) => {
  return await UsuarioMaestro.update(updateData, {
    where: { usuario_id: usuarioRegistranteId },
  });
};

export const updateUserData = async (
  user: Usuario,
  data: { nombre: string; apellido: string; telefono: string }
): Promise<void> => {
  await user.update(data);
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

export const updateUserRegistrationState = async (
  user: Usuario,
  newState: string
): Promise<void> => {
  await user.update({ tipo_registro: newState });
};

export const updateUserStatusById = async (userId: string, nuevoEstado: string) => {
  const updated = await Usuario.update(
    { tipo_registro: nuevoEstado },
    { where: { id_usuario: userId } }
  );

  if (updated[0] === 0) {
    throw new Error("Usuario no encontrado o no se pudo actualizar.");
  }

  return `Estado actualizado a '${nuevoEstado}' para el usuario con ID: ${userId}`;
};


export const deleteUsuarioById = async (userId: string): Promise<void> => {
  const usuario = await Usuario.findOne({ where: { id_usuario: userId } });

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  await usuario.destroy();
};

export const deleteUsuarioMaestrosByUserId = async (userId: string) => {
  await UsuarioMaestro.destroy({
    where: { usuario_id: userId },
  });
};

export const deleteUserRelations = async (
  userId: string,
  userAuthId: string,
  maestros: UsuarioMaestro[]
): Promise<void> => {
  for (const maestro of maestros) {
    await AuditoriaCambio.create({
      usuario_originario_id: userAuthId,
      usuario_destino_id: userId,
      modelo: "UsuarioMaestro",
      tipo_auditoria: "ELIMINACION",
      detalle: `Registro de UsuarioMaestro eliminado por ${userAuthId}`,
    });
  }

  await UsuarioMaestro.destroy({
    where: { usuario_id: userId },
  });
};

/**
 * Busca un usuario en la base de datos según los filtros proporcionados.
 * @param filters - Filtros opcionales para buscar usuarios.
 * @returns Usuario encontrado o `null` si no existe.
 * @throws Error si ocurre algún problema al buscar.
 */
export const findExistingUsuario = async (filters: {
  id_usuario?: string;
  email?: string;
  nombre?: string;
  apellido?: string;
  tipo_registro?: string | string[];
}): Promise<Usuario | null> => {
  try {
    // Construir la consulta según los filtros proporcionados
    const whereClause: any = {};

    if (filters.id_usuario) {
      whereClause.id_usuario = filters.id_usuario;
    }
    if (filters.email) {
      whereClause.email = filters.email;
    }
    if (filters.nombre) {
      whereClause.nombre = { [Op.like]: `%${filters.nombre}%` };
    }
    if (filters.apellido) {
      whereClause.apellido = { [Op.like]: `%${filters.apellido}%` };
    }
    if (filters.tipo_registro) {
      whereClause.tipo_registro = Array.isArray(filters.tipo_registro)
        ? { [Op.in]: filters.tipo_registro }
        : filters.tipo_registro;
    }

    // Buscar el usuario en la base de datos
    const user = await Usuario.findOne({
      where: whereClause,
    });

    return user;
  } catch (error) {
    throw new Error(
      `Error al buscar usuario: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`
    );
  }
};

// BUSQUEDA DE UN USUARIO SEGUN UNO O VARIOS FILTROS
interface Filters {
  userId?: string;
  email?: string;
  nombre?: string;
  apellido?: string;
  tipo_registro?: string | string[];
  rolId?: string;
  nombre_rol?: string;
  productoraId?: string;
  productoraNombre?: string;
  limit?: number;
  offset?: number;
}

export const findUsuarios = async (filters: Filters): Promise<{ users: UsuarioResponse[]; total: number; isSingleUser: boolean }> => {
  const whereUsuario: Record<string, any> = {};
  const includeUsuario: any[] = [];

  // Validaciones de límites
  if (filters.limit && typeof filters.limit !== "number") {
    throw new Error("El parámetro 'limit' debe ser un número.");
  }
  if (filters.offset && typeof filters.offset !== "number") {
    throw new Error("El parámetro 'offset' debe ser un número.");
  }

  // Filtro por Usuario
  if (filters.userId) whereUsuario.id_usuario = filters.userId;
  if (filters.email) whereUsuario.email = { [Op.iLike]: `%${filters.email}%` };
  if (filters.tipo_registro) {
    whereUsuario.tipo_registro = Array.isArray(filters.tipo_registro)
      ? { [Op.in]: filters.tipo_registro }
      : filters.tipo_registro;
  }
  if (filters.nombre) whereUsuario.nombre = { [Op.iLike]: `%${filters.nombre}%` };
  if (filters.apellido) whereUsuario.apellido = { [Op.iLike]: `%${filters.apellido}%` };

  // Filtro por rol
  const whereRol: Record<string, any> = {};
  if (filters.rolId) whereRol.id_rol = filters.rolId;
  if (filters.nombre_rol) whereRol.nombre_rol = { [Op.iLike]: `%${filters.nombre_rol}%` };

  includeUsuario.push({
    model: UsuarioRol,
    as: "rol",
    attributes: ["id_rol", "nombre_rol"],
    where: Object.keys(whereRol).length ? whereRol : undefined,
  });

  // Filtros de Productora aplicados en UsuarioMaestro
  if (filters.productoraId || filters.productoraNombre) {
    includeUsuario.push({
      model: UsuarioMaestro,
      as: "usuariosRegistrantes",
      attributes: [],
      include: [
        {
          model: Productora,
          as: "productora",
          attributes: [],
          where: {
            ...(filters.productoraId && { id_productora: filters.productoraId }),
            ...(filters.productoraNombre && { nombre_productora: { [Op.iLike]: `%${filters.productoraNombre}%` }, }),
          },
        },
      ],
    });
  }  

  // Obtener los registros paginados
  const usuarios = await Usuario.findAll({
    where: whereUsuario,
    include: includeUsuario,
    limit: filters.limit ?? 10,
    offset: filters.offset ?? 0,
  });

  if (!usuarios.length) return { users: [], total: 0, isSingleUser: false };

  // Determinar si es un único usuario
  const isSingleUser = usuarios.length === 1;


  // Buscar UsuariosMaestro relacionados para todos los usuarios encontrados
  const usuariosMaestro = await UsuarioMaestro.findAll({
    where: { usuario_id: { [Op.in]: usuarios.map((u) => u.id_usuario) } },
    include: [
      {
        model: Productora,
        as: "productora",
        attributes: ["id_productora", "nombre_productora"],
      },
    ],
  });

  const maestrosPorUsuario = usuarios.reduce((acc, usuario) => {
    const maestros = usuariosMaestro.filter((maestro) => maestro.usuario_id === usuario.id_usuario);

    acc[usuario.id_usuario] = {
      maestros,
      hasSingleMaestro: maestros.length === 1,
    };
    return acc;
  }, {} as Record<string, { maestros: UsuarioMaestro[]; hasSingleMaestro: boolean }>);

  // Buscar vistas asociadas para todos los usuarios de forma optimizada
  const vistasAsociadas = await UsuarioVistaMaestro.findAll({
    where: { usuario_id: { [Op.in]: usuarios.map((u) => u.id_usuario) } },
    include: [
      {
        model: UsuarioVista,
        as: "vista",
        attributes: ["id_vista", "nombre_vista", "nombre_vista_superior"],
      },
    ],
  });

  const vistasPorUsuario = vistasAsociadas.reduce((acc, vistaMaestro) => {
    if (vistaMaestro.vista && vistaMaestro.usuario_id) {
      if (!acc[vistaMaestro.usuario_id]) {
        acc[vistaMaestro.usuario_id] = [];
      }
      acc[vistaMaestro.usuario_id].push(vistaMaestro);
    }
    return acc;
  }, {} as Record<string, UsuarioVistaMaestro[]>);

  // Formatear la respuesta final
  return {
    users: usuarios.map((usuario) => {
      const usuarioMaestroData = maestrosPorUsuario[usuario.id_usuario] || { maestros: [], hasSingleMaestro: false };
      return {
        user: usuario,
        maestros: usuarioMaestroData.maestros,
        vistas: vistasPorUsuario[usuario.id_usuario] || [],
        hasSingleMaestro: usuarioMaestroData.hasSingleMaestro,
      };
    }),
    total: usuarios.length,
    isSingleUser,
  };
};

export const findRolByNombre = async (nombre_rol: string) => {
  const rol = await UsuarioRol.findOne({
    where: { nombre_rol },
  });

  if (!rol) {
    throw new Error(`No se encontró el rol: ${nombre_rol}`);
  }

  return rol;
};

export const findVistasByUsuario = async (idUsuario: string) => {
  if (!idUsuario) {
    throw new Error("Debe proporcionar un ID de usuario.");
  }

  // Buscar las vistas habilitadas del usuario
  const vistas = await UsuarioVistaMaestro.findAll({
    where: { usuario_id: idUsuario },
    include: [
      {
        model: UsuarioVista,
        as: "vista",
        attributes: ["id_vista", "nombre_vista", "nombre_vista_superior"],
      },
    ],
  });

  // Extraer solo las vistas
  return vistas.map((vistaMaestro) => vistaMaestro.vista);
};

export const assignVistasToUser = async (
  usuarioId: string,
  rolId?: string,
  nombreRol?: string,
  isHabilitado: boolean = true
): Promise<void> => {
  if (!usuarioId || (!rolId && !nombreRol)) {
    throw new Error("UsuarioId y RolId o nombreRol son obligatorios.");
  }

  // Buscar el rolId si solo se pasa el nombre del rol
  let rolIdToUse = rolId;
  if (!rolId && nombreRol) {
    const rol = await UsuarioRol.findOne({
      where: { nombre_rol: nombreRol },
      attributes: ["id_rol"],
    });

    if (!rol) {
      throw new Error(`No se encontró un rol con el nombre: ${nombreRol}`);
    }
    rolIdToUse = rol.id_rol;
  }

  // Obtener las vistas asociadas al rol
  const vistasToAssign = await UsuarioVista.findAll({
    where: { rol_id: rolIdToUse },
    attributes: ["id_vista"],
  });

  if (!vistasToAssign || vistasToAssign.length === 0) {
    throw new Error(`No se encontraron vistas para el rol con ID: ${rolIdToUse}`);
  }

  // Eliminar todas las vistas actuales del usuario antes de asignar las nuevas
  await UsuarioVistaMaestro.destroy({
    where: { usuario_id: usuarioId },
  });

  // Crear relaciones para el usuario con el estado de habilitación
  const vistasMaestroData = vistasToAssign.map((vista) => ({
    usuario_id: usuarioId,
    vista_id: vista.id_vista,
    is_habilitado: isHabilitado,
  }));

  await UsuarioVistaMaestro.bulkCreate(vistasMaestroData);  
};

export const toggleUserViewStatusService = async (
  usuarioId: string,
  vistas: { nombre_vista: string; is_habilitado: boolean }[]
): Promise<void> => {
  if (!vistas || !Array.isArray(vistas)) {
    throw new Error("Debe proporcionar un array de vistas.");
  }

  // Buscar el rol del usuario
  const usuario = await Usuario.findOne({
    where: { id_usuario: usuarioId },
    attributes: ["rol_id"],
  });

  if (!usuario || !usuario.rol_id) {
    throw new Error(`No se encontró el usuario con ID: ${usuarioId} o no tiene rol asociado.`);
  }

  const rolId = usuario.rol_id;

  for (const vista of vistas) {
    if (!vista.nombre_vista || typeof vista.is_habilitado !== "boolean") {
      throw new Error("El formato de las vistas es incorrecto.");
    }

    // Buscar el ID de la vista basada en el nombre y el rol_id
    const vistaData = await UsuarioVista.findOne({
      where: { 
        nombre_vista: vista.nombre_vista,
        rol_id: rolId,
      },
      attributes: ["id_vista"],
    });

    if (!vistaData) {
      throw new Error(`No se encontró una vista con el nombre: ${vista.nombre_vista} para el rol asociado al usuario.`);
    }
    
    // Buscar o verificar la relación en UsuarioVistaMaestro
    const existingVista = await UsuarioVistaMaestro.findOne({
      where: {
        usuario_id: usuarioId,
        vista_id: vistaData.id_vista,
      },
    });

    if (!existingVista) {
      throw new Error(`No se encontró la relación entre el usuario y la vista.`);
    }

    // Actualizar el estado de la vista
    await UsuarioVistaMaestro.update(
      { is_habilitado: vista.is_habilitado },
      {
        where: {
          usuario_id: usuarioId,
          vista_id: vistaData.id_vista,
        },
      }
    ); 
  }
};

export const validateUserRegistrationState = (tipoRegistro: string): void => {
  if (!["CONFIRMADO", "PENDIENTE", "RECHAZADO"].includes(tipoRegistro)) {
    throw new Error(`El usuario tiene un estado de registro no permitido: ${tipoRegistro}.`);
  }
};

export const linkUserToProductora = async (
  userId: string,
  productoraId: string
): Promise<void> => {
  // Verificar si la relación ya existe
  const existingRelation = await UsuarioMaestro.findOne({
    where: {
      usuario_id: userId,
      productora_id: productoraId,
    },
  });

  if (existingRelation) {
    // Si la relación ya existe, no es necesario crearla nuevamente
    console.info(
      `Relación existente encontrada: usuario_id=${userId}, productora_id=${productoraId}`
    );
    return;
  }

  // Crear una nueva relación
  await UsuarioMaestro.create({
    usuario_id: userId,
    productora_id: productoraId,
  });

  console.info(
    `Relación Usuario-Productora creada exitosamente: usuario_id=${userId}, productora_id=${productoraId}`
  );
};