import { Request, Response, NextFunction } from 'express';
import { parseISO, isValid } from 'date-fns';
import archiver from 'archiver';
import fs from 'fs';
import * as path from 'path';

import logger from '../config/logger';
import { UPLOAD_DIR } from '../config/paths';

import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';
import { UsuarioResponse } from '../interfaces/UsuarioResponse';

import * as productoraService from '../services/productoraService';
import { handleGeneralError } from '../services/errorService';
import { getAuthenticatedUser } from '../services/authService';

import * as MESSAGES from '../utils/messages';
import * as Err from "../utils/customErrors";

// Obtener una productora por ID
export const getProductoraById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Solicitud para obtener la productora con ID: ${id}.`);

    const productora = await productoraService.findProductoraById(id);

    logger.info(`${req.method} ${req.originalUrl} - Productora encontrada: ${productora.nombre_productora}.`);
    res.status(200).json({ productora });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al obtener la productora por ID');
  }
};

// Obtener todas las productoras
export const getAllProductoras = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Solicitud para obtener todas las productoras.`);

    // Capturar filtros desde los query params
    const { nombre, cuit, estado, page, limit } = req.query;

    const result = await productoraService.findAllProductoras({
      nombre: nombre as string,
      cuit: cuit as string,
      estado: estado as string,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });

    logger.info(
      `${req.method} ${req.originalUrl} - Se encontraron ${result.total} productoras en ${result.totalPages} páginas.`
    );

    res.status(200).json(result);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener todas las productoras");
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
    handleGeneralError(err, req, res, next, 'Error al crear productora');
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
    handleGeneralError(err, req, res, next, 'Error al actualizar productora');
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
    handleGeneralError(err, req, res, next, 'Error al eliminar productora');
  }
};

// Obtener un documento puntual de una productora por IDs
export const getDocumentoById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, docId } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Obteniendo documento con ID: ${docId} para la productora con ID: ${id}.`);

    // Obtén los detalles del documento desde la base de datos
    const documento = await productoraService.getDocumentoById(id, docId);

    const rutaArchivo = documento.ruta_archivo_documento;

    // Verifica que el archivo existe antes de enviarlo
    if (!path.isAbsolute(rutaArchivo)) {
      throw new Error('La ruta del archivo no es válida o no es absoluta.');
    }

    logger.info(`${req.method} ${req.originalUrl} - Enviando archivo: ${rutaArchivo}`);
    res.sendFile(rutaArchivo, (err) => {
      if (err) {
        logger.error(
          `${req.method} ${req.originalUrl} - Error al enviar el archivo: ${err.message}`
        );
        next(new Error('Error al enviar el archivo.'));
      }
    });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al obtener documento');
  }
};

// Obtener todos los archivos de una productora por ID
export const getAllDocumentos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Obteniendo documentos para la productora con ID: ${id}.`);

    // Obtén los documentos de la base de datos
    const documentos = await productoraService.getAllDocumentos(id);

    // Configura el nombre del archivo ZIP
    const productora = await productoraService.findProductoraById(id);
    const zipFileName = `documentos_productora_${productora.cuit_cuil}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err: any) => next(err));
    archive.pipe(res);

    // Agrega cada documento al archivo ZIP
    documentos.forEach((doc) => {
      const filePath = doc.ruta_archivo_documento;
      if (fs.existsSync(filePath)) {
        const fileName = path.basename(filePath);
        archive.file(filePath, { name: fileName });
      } else {
        logger.warn(`Archivo no encontrado: ${filePath}`);
      }
    });

    // Finaliza el archivo ZIP
    archive.finalize();

    logger.info(`${req.method} ${req.originalUrl} - Archivos comprimidos y enviados exitosamente.`);
  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al obtener los documentos de la productora');
  }
};

// Obtener los metadatos de los archivos de una productora
export const getDocumentosMetadata = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Obteniendo metadatos de documentos para la productora con ID: ${id}.`);

    // Obtén los documentos de la base de datos
    const documentos = await productoraService.getDocumentosMetadata(id);

    if (!documentos.length) {
      logger.warn(`${req.method} ${req.originalUrl} - No se encontraron documentos para la productora con ID: ${id}.`);
    }

    res.status(200).json({
      message: "Metadatos de documentos obtenidos exitosamente.",
      documentos,
    });
  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener metadatos de documentos");
  }
};

// Cargar un documento nuevo a una productora por ID
export const createDocumentos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Creando documentos para la productora con ID: ${id}.`);

    // Validar que al menos se subió un archivo
    if (!req.files || Object.keys(req.files).length === 0) {
      throw new Error("Debe subir al menos un archivo.");
    }

    const archivos = req.files as Express.Multer.File[];

    // Validar que se haya recibido tipoDocumento en form-data
    if (!req.body.tipoDocumento) {
      throw new Error("Debe enviar el tipo de documento en form-data.");
    }

    // Convertir tipoDocumento en un array válido
    let tiposDocumento: string[] = [];

    if (Array.isArray(req.body.tipoDocumento)) {
      tiposDocumento = req.body.tipoDocumento;
    } else if (typeof req.body.tipoDocumento === "string") {
      tiposDocumento = req.body.tipoDocumento.split(",").map((item:any) => item.trim());
    }

    // Validar que el número de tipos de documentos coincida con el número de archivos
    if (tiposDocumento.length !== archivos.length) {
      throw new Error("El número de tipos de documentos debe coincidir con el número de archivos.");
    }

    // Verificar que solo haya un documento por tipo
    const archivosPorTipo: Record<string, boolean> = {};
    const documentosData = archivos.map((archivo, index) => {
      const tipoDocumento = tiposDocumento[index];

      if (!tipoDocumento) {
        throw new Error(`Falta el tipoDocumento para el archivo ${archivo.originalname}`);
      }

      if (archivosPorTipo[tipoDocumento]) {
        throw new Error(`Solo se permite un archivo por tipo de documento (${tipoDocumento})`);
      }

      archivosPorTipo[tipoDocumento] = true;

      return {
        id_productora: id,
        nombre_documento: tipoDocumento,
        ruta_archivo_documento: path.join(UPLOAD_DIR, "documents", archivo.filename),
      };
    });

    // Guardar los documentos en la base de datos
    const newDocumentos = await productoraService.createDocumentos(id, documentosData);

    logger.info(`${req.method} ${req.originalUrl} - Documentos creados exitosamente.`);
    res.status(201).json({
      message: "Documentos creados exitosamente.",
      documentos: newDocumentos,
    });

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al crear documento");
  }
};

// Actualizar un documento de una productora
export const updateDocumento = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, docId } = req.params;
    const documentoData = req.body;

    logger.info(`${req.method} ${req.originalUrl} - Actualizando documento con ID: ${docId} para la productora con ID: ${id}.`);

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    if (!authUser.rol) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario sin rol asignado.`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED));
    }

    const updatedDocumento = await productoraService.updateDocumento(id, docId, documentoData, authUser.rol.nombre_rol);

    logger.info(`${req.method} ${req.originalUrl} - Documento actualizado exitosamente: ${docId}`);

    res.status(200).json({ message: MESSAGES.SUCCESS.DOCUMENTO.UPDATED, documento: updatedDocumento });
  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al actualizar el documento');
  }
};

// Eliminar un documento de una productora
export const deleteDocumento = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, docId } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Eliminando documento con ID: ${docId} para la productora con ID: ${id}.`);

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    if (!authUser.rol) {
      logger.warn(`${req.method} ${req.originalUrl} - Usuario sin rol asignado.`);
      return next(new Err.NotFoundError(MESSAGES.ERROR.USER.ROLE_NOT_ASSIGNED));
    }

    await productoraService.deleteDocumento(id, docId, authUser.rol.nombre_rol);

    logger.info(`${req.method} ${req.originalUrl} - Documento eliminado exitosamente: ${docId}`);
    res.status(200).json({ message: MESSAGES.SUCCESS.DOCUMENTO.DELETED });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al eliminar documento');
  }
};

// Eliminar todos los documentos de una productora por ID
export const deleteAllDocumentos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    logger.info(`${req.method} ${req.originalUrl} - Eliminando todos los documentos para la productora con ID: ${id}.`);

    // Verifica el usuario autenticado
    const { user: authUser }: UsuarioResponse = await getAuthenticatedUser(req);

    await productoraService.deleteAllDocumentos(id);

    logger.info(`${req.method} ${req.originalUrl} - Todos los documentos eliminados exitosamente para la productora con ID: ${id}.`);
    res.status(200).json({ message: MESSAGES.SUCCESS.DOCUMENTO.ALL_DELETED });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al eliminar todos los documentos');
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
    handleGeneralError(err, req, res, next, 'Error al obtener el ISRC');
  }
};

// Obtener todos los ISRCs de las productoras
export const getAllISRCs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info(`${req.method} ${req.originalUrl} - Obteniendo todos los ISRC.`);

    const response = await productoraService.getAllISRCs(req.query);

    logger.info(`${req.method} ${req.originalUrl} - Total de ISRCs encontrados: ${response.total}.`);
    res.status(200).json(response);

  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener todos los ISRC");
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
    handleGeneralError(err, req, res, next, 'Error al crear el ISRC');
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
    handleGeneralError(err, req, res, next, 'Error al actualizar el ISRC');
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
    handleGeneralError(err, req, res, next, 'Error al eliminar los ISRC');
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
    handleGeneralError(err, req, res, next, 'Error al obtener las postulaciones');
  }
};

// Obtener todas las postulaciones y OPCIONAL entre fechas definidas
export const getAllPostulaciones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, productoraName, page, limit } = req.query;

    const start = startDate ? parseISO(startDate as string) : undefined;
    const end = endDate ? parseISO(endDate as string) : undefined;

    if (startDate && !isValid(start)) {
      return res.status(400).json({ error: "La fecha de inicio (startDate) no es válida." });
    }

    if (endDate && !isValid(end)) {
      return res.status(400).json({ error: "La fecha de fin (endDate) no es válida." });
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Obteniendo todas las postulaciones ${
        start || end || productoraName
          ? `con filtros ${start ? `desde ${start.toISOString()}` : ""} ${
              end ? `hasta ${end.toISOString()}` : ""
            } ${productoraName ? `por nombre de productora: ${productoraName}` : ""}`
          : "sin filtros"
      }.`
    );

    const response = await productoraService.getAllPostulaciones({
      startDate: start?.toISOString(),
      endDate: end?.toISOString(),
      productoraName: productoraName as string | undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
    });

    logger.info(`${req.method} ${req.originalUrl} - Total de postulaciones encontradas: ${response.total}.`);
    res.status(200).json(response);
  } catch (err) {
    handleGeneralError(err, req, res, next, "Error al obtener todas las postulaciones");
  }
};

// Crear postulaciones masivamente
export const createPostulaciones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Las fechas startDate y endDate son obligatorias.' });
    }

    const start = parseISO(startDate as string);
    const end = parseISO(endDate as string);

    if (!isValid(start) || !isValid(end)) {
      return res.status(400).json({ error: 'Las fechas proporcionadas no son válidas.' });
    }

    logger.info(
      `${req.method} ${req.originalUrl} - Creando postulaciones para productoras entre ${start.toISOString()} y ${end.toISOString()}.`
    );

    const createdPostulaciones = await productoraService.createPostulacionesMassively(start, end);

    logger.info(`${req.method} ${req.originalUrl} - Total de postulaciones creadas: ${createdPostulaciones.length}.`);
    res.status(201).json({ message: 'Postulaciones creadas exitosamente.', total: createdPostulaciones.length });

  } catch (err) {
    handleGeneralError(err, req, res, next, 'Error al crear postulaciones masivamente');
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
    handleGeneralError(err, req, res, next, 'Error al actualizar la postulación');
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
    handleGeneralError(err, req, res, next, 'Error al eliminar la postulación');
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
    handleGeneralError(err, req, res, next, 'Error al eliminar todas las postulaciones');
  }
};