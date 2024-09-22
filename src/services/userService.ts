import Usuario from '../models/Usuario';

export const findUserByEmail = async (email: string) => {
  return await Usuario.findOne({ where: { email } });
};

export const findUserById = async (id: number) => {
  return await Usuario.findByPk(id);
};
