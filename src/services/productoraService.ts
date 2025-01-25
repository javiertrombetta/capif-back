import { Op } from 'sequelize';
import { Productora, ProductoraDocumento, ProductoraDocumentoTipo, ProductoraISRC, ProductoraMensaje, ProductoraPremio} from '../models'

import * as MESSAGES from '../utils/messages';
import * as Err from '../utils/customErrors';

type ProductoraISRCData = {
  productora_id: string;
  tipo: string;
  codigo_productora?: string;
};

// Servicio para crear o actualizar una productora
export const createOrUpdateProductora = async (productoraData: any): Promise<Productora> => {
  let productora = await Productora.findOne({ where: { cuit_cuil: productoraData.cuit_cuil } });

  if (productora) {
    await productora.update(productoraData);
  } else {
    productora = await Productora.create(productoraData);
  }

  return productora;
};

// Servicio para obtener todas las productoras
export const findAllProductoras = async () => {
  const productoras = await Productora.findAll({
    include: [
      {
        model: ProductoraISRC,
        as: 'codigosDeLaProductora',
      },
    ],
  });

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
export const getAllPostulaciones = async (filters: { startDate?: string; endDate?: string; productoraName?: string }) => {
  const where: any = {};

  // Filtro por fechas
  if (filters.startDate || filters.endDate) {
    const fechaAsignacion: any = {};

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      if (isNaN(startDate.getTime())) {
        throw new Error('La fecha de inicio (startDate) no es válida.');
      }
      fechaAsignacion[Op.gte] = startDate;
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      if (isNaN(endDate.getTime())) {
        throw new Error('La fecha de fin (endDate) no es válida.');
      }
      fechaAsignacion[Op.lte] = endDate;
    }

    if (Object.keys(fechaAsignacion).length > 0) {
      where.fecha_asignacion = fechaAsignacion;
    }
  }

  // Filtro por nombre de productora
  const include: any[] = [];
  if (filters.productoraName) {
    include.push({
      model: Productora,
      as: 'productoraDelPremio',
      required: true,
      where: {
        nombre_productora: {
          [Op.iLike]: `%${filters.productoraName}%`,
        },
      },
    });
  }

  const postulaciones = await ProductoraPremio.findAll({
    where,
    include,
  });

  return postulaciones || [];
};

// Servicio para crear una postulación a una productora
export const createPostulacionesMassively = async (startDate: Date, endDate: Date) => {

  const productoras = await Productora.findAll({
    where: {
      fecha_ultimo_fonograma: {
        [Op.between]: [startDate, endDate],
      },
    },
  });

  if (productoras.length === 0) {
    return [];
  }

  const postulaciones = await Promise.all(
    productoras.map(async (productora) => {
      const newPostulacion = await ProductoraPremio.create({
        productora_id: productora.id_productora,
        codigo_postulacion: `POST-${productora.id_productora}-${Date.now()}`,
        fecha_asignacion: new Date(),
      });
      return newPostulacion;
    })
  );

  return postulaciones;
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
  const count = await ProductoraPremio.count();

  if (count === 0) {
    throw new Err.NotFoundError(MESSAGES.ERROR.POSTULACIONES.NOT_FOUND);
  }

  await ProductoraPremio.destroy({
    where: {},
    truncate: true,
  });
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

export const createProductoraMessage = async ({
  usuarioId,
  productoraId,
  tipoMensaje,
  mensaje,
}: {
  usuarioId: string;
  productoraId: string;
  tipoMensaje: string;
  mensaje: string;
}) => {
  return ProductoraMensaje.create({
    usuario_id: usuarioId,
    productora_id: productoraId,
    tipo_mensaje: tipoMensaje,
    mensaje: mensaje,
  });
};

export const getLastRejectionMessage = async (usuarioId: string) => {
  return ProductoraMensaje.findOne({
    where: {
      usuario_id: usuarioId,
      tipo_mensaje: "RECHAZO",
    },
    attributes: ["mensaje", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
};

export const processDocuments = async (
  userId: string,
  productoraId: string,
  documentos: any[]
): Promise<void> => {
  const tiposDocumentos = await ProductoraDocumentoTipo.findAll({
    where: {
      nombre_documento: documentos.map((doc) => doc.nombre_documento),
    },
  });

  for (const doc of documentos) {
    const tipoDocumento = tiposDocumentos.find((tipo) => tipo.nombre_documento === doc.nombre_documento);
    if (!tipoDocumento) {
      throw new Err.BadRequestError(`Tipo de documento no válido: ${doc.nombre_documento}`);
    }
    await ProductoraDocumento.create({
      usuario_principal_id: userId,
      productora_id: productoraId,
      tipo_documento_id: tipoDocumento.id_documento_tipo,
      ruta_archivo_documento: doc.ruta_archivo_documento,
    });
  }
};