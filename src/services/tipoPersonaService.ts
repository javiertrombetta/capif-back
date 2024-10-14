import TipoPersona from '../models/TipoPersona';

export const findTipoPersonaByDescripcion = async (descripcion: string) => {
  return await TipoPersona.findOne({ where: { descripcion } });
};