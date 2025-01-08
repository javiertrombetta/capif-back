import Productora from '../models/Productora';
import * as MESSAGES from '../services/messages';
import * as Err from '../services/customErrors';

// Servicio para obtener todas las productoras
export const findAllProductoras = async () => {
  const productoras = await Productora.findAll();

  if (!productoras || productoras.length === 0) {
    throw new Err.NotFoundError(MESSAGES.ERROR.PRODUCTORA.NOT_FOUND);
  }

  return productoras;
};

// Servicio para obtener una productora por ID
export const findProductoraById = async (id: string) => {
  const productora = await Productora.findByPk(id);

  if (!productora) {
    throw new Err.NotFoundError(MESSAGES.ERROR.PRODUCTORA.NOT_FOUND);
  }

  return productora;
};