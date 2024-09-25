import { Usuario, Rol } from '../models';

export const findUsuarioByEmail = async (email: string) => {
  return await Usuario.findOne({
    where: { email },
    include: [{ model: Rol, attributes: ['descripcion'] }],
  });
};

export const findUsuarioById = async (id: number) => {
  return await Usuario.findByPk(id, {
    include: [{ model: Rol, attributes: ['descripcion'] }],
  });
};
