import Fonograma from "../models/Fonograma";
import ProductoraISRC from "../models/ProductoraISRC";
import * as MESSAGES from "../utils/messages";

import * as Err from "../utils/customErrors";

export const validateISRC = async (isrc: string) => {

  if (!isrc || typeof isrc !== "string") {
    throw new Err. BadRequestError(MESSAGES.ERROR.ISRC.ISRC_REQUIRED);
  }

  if (isrc.length !== 12) {
    return { valid: false, message: MESSAGES.ERROR.ISRC.ISRC_LENGTH };
  }

  if (!isrc.startsWith("AR")) {
    throw new Err.BadRequestError(MESSAGES.ERROR.ISRC.ISRC_PREFIX);
  }

  const codigoProductora = isrc.substring(2, 5);
  const anioISRC = isrc.substring(5, 7);
  const currentYear = new Date().getFullYear().toString().slice(-2);

  const productoraISRC = await ProductoraISRC.findOne({
    where: { codigo_productora: codigoProductora, tipo: "AUDIO" },
  });

  if (!productoraISRC) {
    throw new Err.NotFoundError(MESSAGES.ERROR.ISRC.ISRC_PRODUCTORA_INVALID);
  }

  if (anioISRC !== currentYear) {
    throw new Err.BadRequestError(
      MESSAGES.ERROR.ISRC.ISRC_YEAR_MISMATCH.replace("{year}", currentYear)
    );
  }

  const fonogramaExistente = await Fonograma.findOne({ where: { isrc } });

  if (fonogramaExistente) {
    throw new Err.ConflictError(MESSAGES.ERROR.ISRC.ISRC_IN_USE);
  }

  return { available: true, message: MESSAGES.SUCCESS.ISRC.ISRC_AVAILABLE };
};