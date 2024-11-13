import Estado from '../models/TipoEstado';

export const findEstadoById = async (estado_id: string) => {
  return await Estado.findOne({ where: { id_estado: estado_id } });
};

export const findEstadoByDescripcion = async (descripcion: string) => {
  return await Estado.findOne({ where: { descripcion } });
};
