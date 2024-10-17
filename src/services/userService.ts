import { Usuario, Rol, Estado, TipoPersona } from '../models';

export const createUsuario = async (userData: any) => {
  return await Usuario.create(userData);
};

export const findUsuariosByFilters = async (filters: any) => {
  return await Usuario.findAll({
    where: filters,
    include: [
      { model: Rol, as: 'Rol' },
      { model: Estado, as: 'Estado' },
      { model: TipoPersona, as: 'TipoPersona' },
    ],
  });
};

export const findUsuarioByEmail = async (email: string) => {
  return await Usuario.findOne({
    where: { email },
    include: [
      { model: Rol, as: 'Rol' },
      { model: Estado, as: 'Estado' },
      { model: TipoPersona, as: 'TipoPersona' },
    ],
  });
};

export const findUsuarioById = async (id: string) => {
  return await Usuario.findByPk(id, {
    include: [
      { model: Rol, as: 'Rol' },
      { model: Estado, as: 'Estado' },
      { model: TipoPersona, as: 'TipoPersona' },
    ],
  });
};

export const updateUsuarioById = async (id: string, updatedData: any) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) return null;
  return await usuario.update(updatedData);
};

export const deleteUsuarioById = async (id: string) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) return null;
  await usuario.destroy();
  return true;
};

export const findRolByDescripcion = async (descripcion: string) => {
  return await Rol.findOne({ where: { descripcion } });
};

export const findEstadoByDescripcion = async (descripcion: string) => {
  return await Estado.findOne({ where: { descripcion } });
};

export const findTipoPersonaByDescripcion = async (descripcion: string) => {
  return await TipoPersona.findOne({ where: { descripcion } });
};