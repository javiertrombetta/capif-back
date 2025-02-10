import { Op } from 'sequelize';
import { Productora, ProductoraDocumento, ProductoraDocumentoTipo, ProductoraISRC, ProductoraMensaje, ProductoraPremio, Usuario, UsuarioMaestro, UsuarioRol} from '../models'

import * as MESSAGES from '../utils/messages';
import * as Err from '../utils/customErrors';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { UPLOAD_DIR } from '../config/paths';

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

export const findAllProductoras = async (filters: {
  nombre?: string;
  cuit?: string;
  estado?: string;
  page?: number;
  limit?: number;
}) => {
  const { nombre, cuit, estado, page = 1, limit = 10 } = filters;

  // Construir filtros dinámicos
  const whereClause: any = {};

  if (estado) {
    if (estado === "Autorizada") {
      whereClause.fecha_alta = { [Op.ne]: null }; // Autorizada: fecha_alta no es nula
    } else if (estado === "Pendiente") {
      whereClause.fecha_alta = { [Op.eq]: null }; // Pendiente: fecha_alta es nula
    }
  }

  // Agregar filtros adicionales, si existen
  if (nombre) {
    whereClause.nombre_productora = { [Op.iLike]: `%${nombre}%` }; // Filtro parcial por nombre
  }

  if (cuit) {
    whereClause.cuit_cuil = { [Op.eq]: cuit }; // Filtro exacto por CUIT
  }

  // Calcular paginación
  const offset = (page - 1) * limit;

  // Buscar usuarios con rol productor_principal
  const usuariosPrincipales = await UsuarioMaestro.findAll({
    include: [
      {
        model: Usuario,
        as: "usuarioRegistrante",
        attributes: ["id_usuario"],
        include: [
          {
            model: UsuarioRol,
            as: "rol",
            attributes: ["nombre_rol"],
            where: { nombre_rol: "productor_principal" },
          },
        ],
      },
    ],
  });

  // Mapear la relación productora <-> usuario_principal
  const productoraUsuarioMap = new Map();
  usuariosPrincipales.forEach((usuarioMaestro) => {
    if (usuarioMaestro.productora_id && usuarioMaestro.usuarioRegistrante) {
      productoraUsuarioMap.set(
        usuarioMaestro.productora_id,
        usuarioMaestro.usuarioRegistrante.id_usuario
      );
    }
  });

  // Contar total de registros sin paginación
  const totalProductoras = await Productora.count({ where: whereClause });

  // Buscar productoras con paginación
  const productoras = await Productora.findAll({
    where: whereClause,
    limit,
    offset,
    include: [
      {
        model: ProductoraISRC,
        as: "codigosDeLaProductora",
        attributes: ["tipo", "codigo_productora"],
      },
    ],
  });

  // Obtener los documentos por separado y mapearlos por productora
  const documentos = await ProductoraDocumento.findAll({
    include: [
      {
        model: ProductoraDocumentoTipo,
        as: "tipoDeDocumento",
        attributes: ["nombre_documento"],
      },
    ],
  });

  const documentosPorProductora = new Map();
  documentos.forEach((doc) => {
    if (!documentosPorProductora.has(doc.productora_id)) {
      documentosPorProductora.set(doc.productora_id, []);
    }
    documentosPorProductora.get(doc.productora_id).push({
      nombre: doc.tipoDeDocumento?.nombre_documento,
      ruta: doc.ruta_archivo_documento,
    });
  });

  // Agregar el id_usuario del productor_principal, el estado y documentos a cada productora
  const productorasConUsuario = productoras.map((productora) => {
    const estado = productora.fecha_alta ? "Autorizada" : "Pendiente";

    return {
      usuarioPrincipal: productoraUsuarioMap.get(productora.id_productora) || null,
      estado,
      documentos: documentosPorProductora.get(productora.id_productora) || [],
      ...productora.toJSON(),
    };
  });

  return {
    total: totalProductoras,
    totalPages: Math.ceil(totalProductoras / limit),
    currentPage: page,
    data: productorasConUsuario,
  };
};

// Servicio para obtener una productora por ID
export const findProductoraById = async (id: string) => {
  // Buscar la productora con sus códigos ISRC
  const productora = await Productora.findByPk(id, {
    include: [
      {
        model: ProductoraISRC,
        as: "codigosDeLaProductora",
        attributes: ["tipo", "codigo_productora"],
      },
    ],
  });

  if (!productora) {
    throw new Err.NotFoundError(MESSAGES.ERROR.PRODUCTORA.NOT_FOUND);
  }

  // Buscar el productor principal asociado a esta productora
  const productorPrincipal = await UsuarioMaestro.findOne({
    where: { productora_id: id },
    include: [
      {
        model: Usuario,
        as: "usuarioRegistrante",
        attributes: ["id_usuario", "nombre", "apellido", "email"],
        include: [
          {
            model: UsuarioRol,
            as: "rol",
            attributes: ["nombre_rol"],
            where: { nombre_rol: "productor_principal" },
          },
        ],
      },
    ],
  });

  // Extraer los datos del productor principal (si existe)
  const productorPrincipalData = productorPrincipal?.usuarioRegistrante
    ? {
        id_usuario: productorPrincipal.usuarioRegistrante.id_usuario,
        nombre: productorPrincipal.usuarioRegistrante.nombre,
        apellido: productorPrincipal.usuarioRegistrante.apellido,
        email: productorPrincipal.usuarioRegistrante.email,
      }
    : null;

  // Agregar el productor principal al objeto de respuesta
  return {
    usuarioPrincipal: productorPrincipalData,
    ...productora.toJSON(),    
  };
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

// Servicio para obtener todos los archivos de una productora
export const getAllDocumentos = async (productoraId: string) => {
  const documentos = await ProductoraDocumento.findAll({ where: { productora_id: productoraId } });

  if (!documentos || documentos.length === 0) {
    throw new Err.NotFoundError(MESSAGES.ERROR.DOCUMENTOS.NOT_FOUND);
  }

  return documentos;
};

// Servicio para obtener todos los metadatos de los archivos de una productora
export const getDocumentosMetadata = async (productoraId: string) => {
  const documentos = await ProductoraDocumento.findAll({
    where: { productora_id: productoraId },
    attributes: ["id_documento", "ruta_archivo_documento"],
    include: [
      {
        model: ProductoraDocumentoTipo,
        as: "tipoDeDocumento",
        attributes: ["nombre_documento"],
      },
    ],
  });

  if (!documentos || documentos.length === 0) {
    throw new Err.NotFoundError(MESSAGES.ERROR.DOCUMENTOS.NOT_FOUND);
  }

  return documentos.map((doc) => ({
    id_documento: doc.id_documento,
    ruta_archivo_documento: doc.ruta_archivo_documento,
    tipo_documento: doc.tipoDeDocumento?.nombre_documento || "Desconocido",
  }));
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
export const createDocumentos = async (productoraId: string, documentosData: Array<{ 
  id_productora: string; 
  nombre_documento: string; 
  ruta_archivo_documento: string; 
}>) => {
  const documentosGuardados = [];

  for (const doc of documentosData) {
    // Buscar el tipo de documento en la base de datos
    const tipoDocumento = await ProductoraDocumentoTipo.findOne({
      where: { nombre_documento: doc.nombre_documento },
    });

    if (!tipoDocumento) {
      throw new Error(`Tipo de documento no válido: ${doc.nombre_documento}`);
    }

    // Verificar si ya existe un documento para esta productora con este tipo de documento
    const documentoExistente = await ProductoraDocumento.findOne({
      where: {
        productora_id: productoraId,
        tipo_documento_id: tipoDocumento.id_documento_tipo,
      },
    });

    if (documentoExistente) {
      // Actualizar la ruta del documento existente
      await documentoExistente.update({ ruta_archivo_documento: doc.ruta_archivo_documento });
     
      documentosGuardados.push(documentoExistente);
    } else {
      // Crear un nuevo documento si no existe
      const nuevoDocumento = await ProductoraDocumento.create({
        productora_id: productoraId,
        tipo_documento_id: tipoDocumento.id_documento_tipo,
        ruta_archivo_documento: doc.ruta_archivo_documento,
      });
            
      documentosGuardados.push(nuevoDocumento);
    }
  }

  return documentosGuardados;
};

// Servicio para actualizar un documento de una productora
export const updateDocumento = async (productoraId: string, docId: string, data: any, userRole: string) => {
  const documento = await ProductoraDocumento.findOne({
    where: { productora_id: productoraId, id_documento: docId },
  });

  if (!documento) {
    throw new Err.NotFoundError(MESSAGES.ERROR.DOCUMENTOS.NOT_FOUND_BY_ID);
  }

  if (documento.fecha_confirmado && userRole === 'productor_principal') {
    throw new Err.ForbiddenError('El documento ya está confirmado y no puede ser modificado por este rol.');
  }

  await documento.update(data);

  return documento;
};

// Servicio para eliminar un documento de una productora
export const deleteDocumento = async (productoraId: string, docId: string, userRole: string) => {
  const documento = await ProductoraDocumento.findOne({
    where: { productora_id: productoraId, id_documento: docId },
  });

  if (!documento) {
    throw new Err.NotFoundError(MESSAGES.ERROR.DOCUMENTOS.NOT_FOUND_BY_ID);
  }

  if (documento.fecha_confirmado && userRole === 'productor_principal') {
    throw new Err.ForbiddenError('El documento ya está confirmado y no puede ser modificado por este rol.');
  }

  const filePath = documento.ruta_archivo_documento;

  // Elimina el archivo del sistema de archivos
  await fsPromises.unlink(filePath);

  // Elimina el registro en la base de datos
  await documento.destroy();
};

import * as fs from 'fs/promises';

// Servicio para eliminar todos los documentos de una productora
export const deleteAllDocumentos = async (productoraId: string) => {
  const documentos = await ProductoraDocumento.findAll({
    where: { productora_id: productoraId },
  });

  if (!documentos || documentos.length === 0) {
    throw new Err.NotFoundError(MESSAGES.ERROR.DOCUMENTOS.NOT_FOUND_BY_ID);
  }

  // Elimina cada archivo del sistema de archivos
  for (const documento of documentos) {    
    const filePath = documento.ruta_archivo_documento;
    await fs.unlink(filePath);
  }

  // Elimina los registros de la base de datos
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
  } else {
    include.push({
      model: Productora,
      as: 'productoraDelPremio',
      required: true,
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

  // Generar y asignar los códigos a los ISRC de la productora
  let indice = 0;
  for (let i = 0; i < productoraISRCs.length; i++) {
    let codigoGenerado: string;

    // Buscar el próximo código disponible
    do {
      codigoGenerado = generarCodigoProgresivo(indice);
      indice++;
    } while (usedCodes.has(codigoGenerado)); // Asegurarse de que el código no esté en uso

    // Asignar y registrar el código
    productoraISRCs[i].codigo_productora = codigoGenerado as string;
    usedCodes.add(codigoGenerado); // Marcar el código como usado
    await ProductoraISRC.create(productoraISRCs[i]); // Insertar en la base de datos
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
      tipo_mensaje: "RECHAZO_APLICACION",
    },
    attributes: ["mensaje", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
};

export const processDocuments = async (
  userId: string,
  productoraId: string,
  documentos: any[],
  cuit: string
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

    const archivoNormalizado = `${cuit}_${doc.nombre_documento}${path.extname(doc.ruta_archivo_documento)}`;
    const nuevaRuta = path.join(UPLOAD_DIR, archivoNormalizado);

    // Verifica que el archivo existe y luego lo renombra
    await fsPromises.access(doc.ruta_archivo_documento);
    await fsPromises.rename(doc.ruta_archivo_documento, nuevaRuta);

    // Registra el documento en la base de datos
    await ProductoraDocumento.create({
      usuario_principal_id: userId,
      productora_id: productoraId,
      tipo_documento_id: tipoDocumento.id_documento_tipo,
      ruta_archivo_documento: nuevaRuta,
    });
  }
};