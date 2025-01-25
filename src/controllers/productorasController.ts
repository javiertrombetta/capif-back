import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { parseISO, isValid } from 'date-fns';
import * as MESSAGES from '../utils/messages';
import * as productoraService from '../services/productoraService';

// Obtener una productora por ID
export const getProductoraById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Solicitud para obtener la productora con ID: ${id}.`);

    if (!id) {
      logger.warn(`${req.method} ${req.originalUrl} - El ID de la productora es requerido.`);
      return res.status(400).json({ message: MESSAGES.ERROR.PRODUCTORA.ID_REQUIRED });
    }

    const productora = await productoraService.findProductoraById(id);

    logger.info(`${req.method} ${req.originalUrl} - Productora encontrada: ${productora.nombre_productora}.`);
    res.status(200).json({ productora });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al obtener la productora por ID: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Obtener todas las productoras
export const getAllProductoras = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud para obtener todas las productoras.`);

    const productoras = await productoraService.findAllProductoras();

    logger.info(`${req.method} ${req.originalUrl} - Se encontraron ${productoras.length} productoras.`);
    res.status(200).json({ productoras });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al obtener todas las productoras: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Crear una productora por ID
export const createProductora = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Creando nueva productora.`);

    const productoraData = req.body;

    const newProductora = await productoraService.createProductora(productoraData);

    logger.info(`${req.method} ${req.originalUrl} - Productora creada exitosamente: ${newProductora.id_productora}`);
    res.status(201).json({ message: MESSAGES.SUCCESS.PRODUCTORA.PRODUCTORA_CREATED, productora: newProductora });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al crear productora: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Actualizar una productora por ID
export const updateProductora = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const productoraData = req.body;

    logger.info(`${req.method} ${req.originalUrl} - Actualizando productora con ID: ${id}.`);

    const updatedProductora = await productoraService.updateProductora(id, productoraData);

    logger.info(`${req.method} ${req.originalUrl} - Productora actualizada exitosamente: ${id}`);
    res.status(200).json({ message: MESSAGES.SUCCESS.PRODUCTORA.UPDATED, productora: updatedProductora });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al actualizar productora: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Eliminar una productora por ID
export const deleteProductora = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Eliminando productora con ID: ${id}.`);

    await productoraService.deleteProductora(id);

    logger.info(`${req.method} ${req.originalUrl} - Productora eliminada exitosamente: ${id}`);
    res.status(200).json({ message: MESSAGES.SUCCESS.PRODUCTORA.DELETED });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al eliminar productora: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Obtener un documento puntual de una productora por IDs
export const getDocumentoById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, docId } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Obteniendo documento con ID: ${docId} para la productora con ID: ${id}.`);

    const documento = await productoraService.getDocumentoById(id, docId);

    logger.info(`${req.method} ${req.originalUrl} - Documento encontrado: ${documento.id_documento}`);
    res.status(200).json({ documento });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al obtener documento: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Obtener todos los documentos de una productora por ID
export const getAllDocumentos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Obteniendo documentos para la productora con ID: ${id}.`);

    const documentos = await productoraService.getAllDocumentos(id);

    logger.info(`${req.method} ${req.originalUrl} - Documentos encontrados: ${documentos.length}`);
    res.status(200).json({ documentos });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al obtener documentos: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Cargar un documento nuevo a una productora por ID
export const createDocumento = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const documentoData = req.body;

    logger.info(`${req.method} ${req.originalUrl} - Creando documento para la productora con ID: ${id}.`);

    const newDocumento = await productoraService.createDocumento(id, documentoData);

    logger.info(`${req.method} ${req.originalUrl} - Documento creado exitosamente: ${newDocumento.id_documento}`);
    res.status(201).json({ message: MESSAGES.SUCCESS.DOCUMENTO.CREATED, documento: newDocumento });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al crear documento: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Actualizar un documento de una productora
export const updateDocumento = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, docId } = req.params;
    const documentoData = req.body;

    logger.info(
      `${req.method} ${req.originalUrl} - Actualizando documento con ID: ${docId} para la productora con ID: ${id}.`
    );

    const updatedDocumento = await productoraService.updateDocumento(id, docId, documentoData);

    logger.info(`${req.method} ${req.originalUrl} - Documento actualizado exitosamente: ${docId}`);
    res.status(200).json({ message: MESSAGES.SUCCESS.DOCUMENTO.UPDATED, documento: updatedDocumento });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al actualizar documento: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Eliminar un documento de una productora
export const deleteDocumento = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, docId } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Eliminando documento con ID: ${docId} para la productora con ID: ${id}.`);

    await productoraService.deleteDocumento(id, docId);

    logger.info(`${req.method} ${req.originalUrl} - Documento eliminado exitosamente: ${docId}`);
    res.status(200).json({ message: MESSAGES.SUCCESS.DOCUMENTO.DELETED });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al eliminar documento: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Eliminar todos los documentos de una productora por ID
export const deleteAllDocumentos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Eliminando todos los documentos para la productora con ID: ${id}.`);

    await productoraService.deleteAllDocumentos(id);

    logger.info(`${req.method} ${req.originalUrl} - Todos los documentos eliminados exitosamente para la productora con ID: ${id}.`);
    res.status(200).json({ message: MESSAGES.SUCCESS.DOCUMENTO.ALL_DELETED });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al eliminar todos los documentos: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Obtener el ISRC de una productora por ID
export const getISRCById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Obteniendo ISRC para la productora con ID: ${id}.`);

    const isrcs = await productoraService.getISRCById(id);

    logger.info(`${req.method} ${req.originalUrl} - ISRC encontrado para la productora con ID: ${id}.`);
    res.status(200).json({ isrcs });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al obtener ISRC: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Obtener todos los ISRCs de las productoras
export const getAllISRCs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Obteniendo todos los ISRC.`);

    const isrcs = await productoraService.getAllISRCs();

    logger.info(`${req.method} ${req.originalUrl} - Total de ISRCs encontrados: ${isrcs.length}.`);
    res.status(200).json({ isrcs });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al obtener todos los ISRC: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Crear un ISRC para una productora por ID
export const createISRC = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const isrcData = req.body;

    logger.info(`${req.method} ${req.originalUrl} - Creando ISRC para la productora con ID: ${id}.`);

    const newISRC = await productoraService.createISRC(id, isrcData);

    logger.info(`${req.method} ${req.originalUrl} - ISRC creado exitosamente: ${newISRC.id_productora_isrc}`);
    res.status(201).json({ message: MESSAGES.SUCCESS.ISRC.CREATED, isrc: newISRC });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al crear ISRC: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Actualizar el ISRC de una productora por ID
export const updateISRC = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const isrcData = req.body;

    logger.info(`${req.method} ${req.originalUrl} - Actualizando ISRC para la productora con ID: ${id}.`);

    const updatedISRC = await productoraService.updateISRC(id, isrcData);

    logger.info(`${req.method} ${req.originalUrl} - ISRC actualizado exitosamente para la productora con ID: ${id}.`);
    res.status(200).json({ message: MESSAGES.SUCCESS.ISRC.UPDATED, isrc: updatedISRC });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al actualizar ISRC: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Eliminar el ISRC de una productora por ID
export const deleteISRC = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Eliminando ISRCs para la productora con ID: ${id}.`);

    await productoraService.deleteISRC(id);

    logger.info(`${req.method} ${req.originalUrl} - ISRCs eliminados exitosamente para la productora con ID: ${id}.`);
    res.status(200).json({ message: MESSAGES.SUCCESS.ISRC.DELETED });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al eliminar ISRCs: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Obtener la postulación de una productora por ID
export const getPostulacionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Obteniendo postulaciones para la productora con ID: ${id}.`);

    const postulaciones = await productoraService.getPostulacionById(id);

    logger.info(`${req.method} ${req.originalUrl} - Postulaciones encontradas para la productora con ID: ${id}.`);
    res.status(200).json({ postulaciones });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al obtener postulaciones: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Obtener todas las postulaciones y OPCIONAL entre fechas definidas
export const getAllPostulaciones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    // Validación de fechas
    const start = startDate ? parseISO(startDate as string) : undefined;
    const end = endDate ? parseISO(endDate as string) : undefined;

    if (startDate && !isValid(start)) {
      return res.status(400).json({ error: 'La fecha de inicio (startDate) no es válida.' });
    }

    if (endDate && !isValid(end)) {
      return res.status(400).json({ error: 'La fecha de fin (endDate) no es válida.' });
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Obteniendo todas las postulaciones ${
        start || end ? `entre ${start?.toISOString() || 'inicio'} y ${end?.toISOString() || 'hoy'}` : 'sin filtros de fecha'
      }.`
    );

    const postulaciones = await productoraService.getAllPostulaciones({
      startDate: start?.toISOString(),
      endDate: end?.toISOString(),
    });

    logger.info(`${req.method} ${req.originalUrl} - Total de postulaciones encontradas: ${postulaciones.length}.`);
    res.status(200).json({ postulaciones });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al obtener todas las postulaciones: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Crear la postulación para una productora por ID
export const createPostulacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const postulacionData = req.body;

    logger.info(`${req.method} ${req.originalUrl} - Creando una nueva postulación para la productora con ID: ${id}.`);

    const newPostulacion = await productoraService.createPostulacion(id, postulacionData);

    logger.info(`${req.method} ${req.originalUrl} - Postulación creada exitosamente: ${newPostulacion.id_premio}`);
    res.status(201).json({ message: MESSAGES.SUCCESS.POSTULACION.CREATED, postulacion: newPostulacion });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al crear la postulación: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Actualizar la postulación a una productora por ID
export const updatePostulacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const postulacionData = req.body;

    logger.info(`${req.method} ${req.originalUrl} - Actualizando postulación para la productora con ID: ${id}.`);

    const updatedPostulacion = await productoraService.updatePostulacion(id, postulacionData);

    logger.info(`${req.method} ${req.originalUrl} - Postulación actualizada exitosamente: ${updatedPostulacion.id_premio}`);
    res.status(200).json({ message: MESSAGES.SUCCESS.POSTULACION.UPDATED, postulacion: updatedPostulacion });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al actualizar la postulación: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Eliminar la postulación de una productora
export const deletePostulacion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Eliminando postulaciones para la productora con ID: ${id}.`);

    await productoraService.deletePostulacion(id);

    logger.info(`${req.method} ${req.originalUrl} - Postulaciones eliminadas exitosamente para la productora con ID: ${id}.`);
    res.status(200).json({ message: MESSAGES.SUCCESS.POSTULACION.DELETED });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al eliminar postulaciones: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};

// Eliminar todas las postulaciones
export const deleteAllPostulaciones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Eliminando todas las postulaciones de todas las productoras.`);

    await productoraService.deleteAllPostulaciones();

    logger.info(`${req.method} ${req.originalUrl} - Todas las postulaciones eliminadas exitosamente.`);
    res.status(200).json({ message: MESSAGES.SUCCESS.POSTULACION.ALL_DELETED });
  } catch (err) {
    logger.error(
      `${req.method} ${
        req.originalUrl
      } - Error al eliminar todas las postulaciones: ${err instanceof Error ? err.message : 'Error desconocido'}.`
    );
    next(err);
  }
};