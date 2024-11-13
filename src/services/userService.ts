type FindUsuarioOptions = { email?: string; userId?: string };

interface Company {
  id: string;
  nombre: string;
}

import {
  Usuario,
  UsuarioMaestro,
  UsuarioRolTipo,
  ProductoraPersonaFisica,
  ProductoraPersonaJuridica,
  Productora,
} from '../models';

export const createUsuario = async (userData: any) => {
  return await Usuario.create(userData);
};

export const createUsuarioMaestro = async (usuarioMaestroData: any) => {
  return await UsuarioMaestro.create(usuarioMaestroData);
};

export const findUsuario = async ({ email, userId }: FindUsuarioOptions) => {
  const whereCondition = email
    ? { '$usuarioRegistrante.email$': email }
    : { usuario_registrante_id: userId };

  const usuarioMaestro = await UsuarioMaestro.findOne({
    where: whereCondition,
    include: [
      {
        model: Usuario,
        as: 'usuarioRegistrante',
        include: [
          {
            model: UsuarioRolTipo,
            as: 'Rol',
          },
        ],
      },
      {
        model: Productora,
        as: 'productora',
        include: [
          {
            model: ProductoraPersonaFisica,
            as: 'personaFisica',
          },
          {
            model: ProductoraPersonaJuridica,
            as: 'personaJuridica',
          },
        ],
      },
    ],
  });

  if (!usuarioMaestro || !usuarioMaestro.usuarioRegistrante || !usuarioMaestro.productora)
    return null;

  const user = usuarioMaestro.usuarioRegistrante;

  return {
    user,
    role: usuarioMaestro.rol?.nombre_rol || 'usuario',
    productora_id: usuarioMaestro.productora_id,
  };
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
            model: UsuarioRolTipo,
            as: 'Rol',
          },
        ],
      },
    ],
  });

  if (!usuarioMaestro || !usuarioMaestro.usuarioRegistrante) {
    throw new Error('Usuario no encontrado');
  }

  const user = usuarioMaestro.usuarioRegistrante;

  if (updateData) {
    await user.update({
      nombres_y_apellidos: updateData.nombres_y_apellidos ?? user.nombres_y_apellidos,
      telefono: updateData.telefono ?? user.telefono,
      email: updateData.email ?? user.email,
    });
  }

  if (updateData.newRole && updateData.newRole !== usuarioMaestro.rol?.nombre_rol) {
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

export const findRolByDescripcion = async (descripcion: string) => {
  const rol = await UsuarioRolTipo.findOne({
    where: { descripcion },
  });

  if (!rol) {
    throw new Error(`No se encontró un rol con la descripción: ${descripcion}`);
  }

  return rol;
};

export const findUsuariosByFilters = async (filters: any, include: any[]) => {
  return await UsuarioMaestro.findAll({
    where: filters,
    include,
  });
};

/**
 * Obtiene los nombres de las productoras asociadas a un usuario.
 * @param userId - ID del usuario activo.
 * @returns Lista de nombres de productoras asociadas al usuario.
 */
export const getAssociatedCompanies = async (userId: string): Promise<Company[]> => {
  const usuarioMaestroRecords = await UsuarioMaestro.findAll({
    where: { usuario_registrante_id: userId },
    include: [
      {
        model: Productora,
        as: 'productora',
        attributes: ['id_productora', 'nombre_productora'],
      },
    ],
  });

  // Extraer el id y el nombre de las productoras y devolverlos como un array de objetos
  const companies = usuarioMaestroRecords
    .map((record) => ({
      id: record.productora?.id_productora,
      nombre: record.productora?.nombre_productora,
    }))
    .filter(
      (company): company is Company => company.id !== undefined && company.nombre !== undefined
    );

  return companies;
};
