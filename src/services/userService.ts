import Usuario from '../models/Usuario';

export const findUsuarioByEmail = async (email: string) => {
  return await Usuario.findOne({ where: { email } });
};

export const findUsuarioById = async (id: number) => {
  return await Usuario.findByPk(id);
};
