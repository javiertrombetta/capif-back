import { Op } from 'sequelize';
import Productora from '../models/Productora';
import ProductoraDocumento from '../models/ProductoraDocumento';
import ProductoraISRC from '../models/ProductoraISRC';
import ProductoraPremio from '../models/ProductoraPremio';
import * as MESSAGES from '../services/messages';
import * as Err from '../services/customErrors';

interface DateRange {
  fechaInicio?: string;
  fechaFin?: string;
}

type ProductoraISRCData = {
  productora_id: string;
  tipo: string;
  codigo_productora?: string;
};

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

// Servicio para crear una productora
export const createProductora = async (data: any) => {
  const existingProductora = await Productora.findOne({ where: { cuit_cuil: data.cuit_cuil } });

  if (existingProductora) {
    throw new Err.ConflictError(MESSAGES.ERROR.PRODUCTORA.ALREADY_EXISTS);
  }

  const newProductora = await Productora.create(data);

  if (!newProductora) {
    throw new Err.InternalServerError(MESSAGES.ERROR.PRODUCTORA.CREATION_FAILED);
  }

  return newProductora;
};

// Servicio para actualizar una productora
export const updateProductora = async (id: string, data: any) => {
  const productora = await Productora.findByPk(id);

  if (!productora) {
    throw new Err.NotFoundError(MESSAGES.ERROR.PRODUCTORA.NOT_FOUND);
  }

  await productora.update(data);

  return productora;
};

// Servicio para eliminar una productora
export const deleteProductora = async (id: string) => {
  const productora = await Productora.findByPk(id);

  if (!productora) {
    throw new Err.NotFoundError(MESSAGES.ERROR.PRODUCTORA.NOT_FOUND);
  }

  await productora.destroy();
};

// Servicio para obtener todos los documentos de una productora
export const getAllDocumentos = async (productoraId: string) => {
  const documentos = await ProductoraDocumento.findAll({ where: { productora_id: productoraId } });

  if (!documentos || documentos.length === 0) {
    throw new Err.NotFoundError(MESSAGES.ERROR.DOCUMENTOS.NOT_FOUND);
  }

  return documentos;
};

// Servicio para obtener un documento puntual de una productora
export const getDocumentoById = async (productoraId: string, docId: string) => {
  const documento = await ProductoraDocumento.findOne({
    where: { productora_id: productoraId, id_documento: docId },
  });

  if (!documento) {
    throw new Err.NotFoundError(MESSAGES.ERROR.DOCUMENTOS.NOT_FOUND_BY_ID);
  }

  return documento;
};

// Servicio para cargar un documento a una productora
export const createDocumento = async (productoraId: string, data: any) => {
  const documento = await ProductoraDocumento.create({ ...data, productora_id: productoraId });

  if (!documento) {
    throw new Err.InternalServerError(MESSAGES.ERROR.DOCUMENTOS.CREATION_FAILED);
  }

  return documento;
};

// Servicio para actualizar un documento de una productora
export const updateDocumento = async (productoraId: string, docId: string, data: any) => {
  const documento = await ProductoraDocumento.findOne({
    where: { productora_id: productoraId, id_documento: docId },
  });

  if (!documento) {
    throw new Err.NotFoundError(MESSAGES.ERROR.DOCUMENTOS.NOT_FOUND_BY_ID);
  }

  await documento.update(data);

  return documento;
};

// Servicio para eliminar un documento de una productora
export const deleteDocumento = async (productoraId: string, docId: string) => {
  const documento = await ProductoraDocumento.findOne({
    where: { productora_id: productoraId, id_documento: docId },
  });

  if (!documento) {
    throw new Err.NotFoundError(MESSAGES.ERROR.DOCUMENTOS.NOT_FOUND_BY_ID);
  }

  await documento.destroy();
};

// Servicio para eliminar todos los documentos de una productora
export const deleteAllDocumentos = async (productoraId: string) => {
  const documentos = await ProductoraDocumento.findAll({
    where: { productora_id: productoraId },
  });

  if (!documentos || documentos.length === 0) {
    throw new Err.NotFoundError(MESSAGES.ERROR.DOCUMENTOS.NOT_FOUND_BY_ID);
  }

  await ProductoraDocumento.destroy({
    where: { productora_id: productoraId },
  });
};

// Servicio para obtener el ISRC de una productora
export const getISRCById = async (productoraId: string) => {
  const isrcs = await ProductoraISRC.findAll({
    where: { productora_id: productoraId },
  });

  if (!isrcs || isrcs.length === 0) {
    throw new Err.NotFoundError(MESSAGES.ERROR.ISRC.NOT_FOUND_FOR_PRODUCTORA);
  }

  return isrcs;
};

export const getAllISRCs = async () => {
  const isrcs = await ProductoraISRC.findAll();

  if (!isrcs || isrcs.length === 0) {
    throw new Err.NotFoundError(MESSAGES.ERROR.ISRC.NOT_FOUND);
  }

  return isrcs;
};

// Servicio para crear un nuevo ISRC a a una productora
export const createISRC = async (productoraId: string, data: any) => {
  const existingISRC = await ProductoraISRC.findOne({
    where: { productora_id: productoraId, codigo_productora: data.codigo_productora },
  });

  if (existingISRC) {
    throw new Err.ConflictError(MESSAGES.ERROR.ISRC.ALREADY_EXISTS);
  }

  const newISRC = await ProductoraISRC.create({ ...data, productora_id: productoraId });

  if (!newISRC) {
    throw new Err.InternalServerError(MESSAGES.ERROR.ISRC.CREATION_FAILED);
  }

  return newISRC;
};

// Servicio para actualizar el ISRC de una productora
export const updateISRC = async (productoraId: string, data: any) => {
  const existingISRC = await ProductoraISRC.findOne({
    where: { productora_id: productoraId, id_productora_isrc: data.id_productora_isrc },
  });

  if (!existingISRC) {
    throw new Err.NotFoundError(MESSAGES.ERROR.ISRC.NOT_FOUND_FOR_PRODUCTORA);
  }

  await existingISRC.update(data);

  return existingISRC;
};

// Servicio para eliminar el ISRC de una productora
export const deleteISRC = async (productoraId: string) => {
  const isrcs = await ProductoraISRC.findAll({
    where: { productora_id: productoraId },
  });

  if (!isrcs || isrcs.length === 0) {
    throw new Err.NotFoundError(MESSAGES.ERROR.ISRC.NOT_FOUND_FOR_PRODUCTORA);
  }

  await ProductoraISRC.destroy({
    where: { productora_id: productoraId },
  });
};

// Servicio para obtener la postulación de una productora
export const getPostulacionById = async (productoraId: string) => {
  const postulaciones = await ProductoraPremio.findAll({
    where: { productora_id: productoraId },
  });

  if (!postulaciones || postulaciones.length === 0) {
    throw new Err.NotFoundError(MESSAGES.ERROR.POSTULACIONES.NOT_FOUND_FOR_PRODUCTORA);
  }

  return postulaciones;
};

// Servicio para obtener todas las postulaciones y OPCIONAL entre fechas definidas
export const getAllPostulaciones = async (filters: { startDate?: string; endDate?: string }) => {
  const where: any = {};

  if (filters.startDate) {
    where.fecha_asignacion = { ...where.fecha_asignacion, [Op.gte]: new Date(filters.startDate) };
  }

  if (filters.endDate) {
    where.fecha_asignacion = { ...where.fecha_asignacion, [Op.lte]: new Date(filters.endDate) };
  }

  const postulaciones = await ProductoraPremio.findAll({ where });

  if (!postulaciones || postulaciones.length === 0) {
    throw new Err.NotFoundError(MESSAGES.ERROR.POSTULACIONES.NOT_FOUND);
  }

  return postulaciones;
};

// Servicio para crear una postulación a una productora
export const createPostulacion = async (productoraId: string, data: any) => {
  const existingPostulacion = await ProductoraPremio.findOne({
    where: { productora_id: productoraId, codigo_postulacion: data.codigo_postulacion },
  });

  if (existingPostulacion) {
    throw new Err.ConflictError(MESSAGES.ERROR.POSTULACIONES.ALREADY_EXISTS);
  }

  const newPostulacion = await ProductoraPremio.create({ ...data, productora_id: productoraId });

  if (!newPostulacion) {
    throw new Err.InternalServerError(MESSAGES.ERROR.POSTULACIONES.CREATION_FAILED);
  }

  return newPostulacion;
};

// Servicio para actualizar la postulación de una productora
export const updatePostulacion = async (productoraId: string, data: any) => {
  const postulacion = await ProductoraPremio.findOne({
    where: { productora_id: productoraId, id_premio: data.id_premio },
  });

  if (!postulacion) {
    throw new Err.NotFoundError(MESSAGES.ERROR.POSTULACIONES.NOT_FOUND_FOR_PRODUCTORA);
  }

  await postulacion.update(data);

  return postulacion;
};

// Servicio para eliminar la postulación de una productora
export const deletePostulacion = async (productoraId: string) => {
  const postulaciones = await ProductoraPremio.findAll({
    where: { productora_id: productoraId },
  });

  if (!postulaciones || postulaciones.length === 0) {
    throw new Err.NotFoundError(MESSAGES.ERROR.POSTULACIONES.NOT_FOUND_FOR_PRODUCTORA);
  }

  await ProductoraPremio.destroy({
    where: { productora_id: productoraId },
  });
};

// Servicio para eliminar todas las postulaciones
export const deleteAllPostulaciones = async () => {
  const count = await ProductoraPremio.destroy({
    where: {},
    truncate: true, // Borra todas las filas sin restricciones
  });

  if (count === 0) {
    throw new Err.NotFoundError(MESSAGES.ERROR.POSTULACIONES.NOT_FOUND);
  }
};

// Servicio para crear los códigos ISRC al aprobar una solicitud
export const generarCodigosISRC = async (productoraId: string) => {
  if (!productoraId) {
    throw new Error("El ID de la productora es obligatorio.");
  }

  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const base = caracteres.length;

  // Función para generar el próximo código progresivo
  const generarCodigoProgresivo = (indice: number): string => {
    let codigo = "";
    do {
      codigo = caracteres[indice % base] + codigo;
      indice = Math.floor(indice / base);
    } while (indice > 0);

    // Ajustar el código a 3 caracteres llenando con "A"
    while (codigo.length < 3) {
      codigo = "A" + codigo;
    }

    return codigo;
  };

  const productoraISRCs: ProductoraISRCData[] = [
    { productora_id: productoraId, tipo: "AUDIO" },
    { productora_id: productoraId, tipo: "VIDEO" },
  ];

  // Obtener todos los códigos ya asignados
  const assignedCodes = await ProductoraISRC.findAll({
    attributes: ["codigo_productora"],
  });
  const usedCodes = new Set(
    assignedCodes.map((entry) => entry.codigo_productora)
  );

  // Generar los próximos dos códigos disponibles
  const availableCodes: string[] = [];
  let indice = 0;

  while (availableCodes.length < 2) {
    const codigo = generarCodigoProgresivo(indice);
    if (!usedCodes.has(codigo)) {
      availableCodes.push(codigo);
    }
    indice++;
  }

  // Asignar los códigos generados a los ISRC de la productora
  for (let i = 0; i < productoraISRCs.length; i++) {
    productoraISRCs[i].codigo_productora = availableCodes[i];
    await ProductoraISRC.create(productoraISRCs[i]);
  }

  return productoraISRCs;
};