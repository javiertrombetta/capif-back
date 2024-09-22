import Rol from '../models/Rol';
import Estado from '../models/Estado';

export const findRoleById = async (rol_id: number) => {
  return await Rol.findOne({ where: { id_rol: rol_id } });
};

export const findEstadoById = async (estado_id: number) => {
  return await Estado.findOne({ where: { id_estado: estado_id } });
};
