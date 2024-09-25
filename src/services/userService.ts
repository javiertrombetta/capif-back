import { Usuario, Rol, Estado, TipoPersona } from '../models';

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

export const findUsuarioById = async (id: number) => {
  return await Usuario.findByPk(id, {
    include: [
      { model: Rol, as: 'Rol' },
      { model: Estado, as: 'Estado' },
      { model: TipoPersona, as: 'TipoPersona' },
    ],
  });
};
