import Rol from '../models/UsuarioRolTipo';

export const findRolById = async (rol_id: string) => {
  return await Rol.findOne({ where: { id_rol: rol_id } });
};

export const findRolByDescripcion = async (descripcion: string) => {
  return await Rol.findOne({ where: { descripcion } });
};
