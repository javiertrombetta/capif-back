import express from "express";
import { celebrate, Segments } from "celebrate";

import { authenticate, authorizeRoles } from '../middlewares/auth';
import { uploadDocuments } from '../middlewares/documents';

import {
  getAllProductoras,
  getProductoraById,
  createProductora,
  updateProductora,
  deleteProductora,
  getAllDocumentos,
  getDocumentoById,
  createDocumento,
  updateDocumento,
  deleteDocumento,
  deleteAllDocumentos,
  getAllISRCs,
  getISRCById,
  createISRC,
  updateISRC,
  deleteISRC,
  getAllPostulaciones,
  getPostulacionById,
  createPostulaciones,
  updatePostulacion,
  deletePostulacion,
  deleteAllPostulaciones,
  getDocumentosMetadata
} from '../controllers/productorasController';

import { createDocumentoSchema, createISRCBodySchema, createISRCParamsSchema, createPostulacionesQuerySchema, createProductoraBodySchema, deleteAllDocumentosSchema, deleteISRCParamsSchema, deletePostulacionParamsSchema, deleteProductoraParamsSchema, documentoParamsSchema, getAllDocumentosSchema, getAllPostulacionesQuerySchema, getDocumentoByIdSchema, getDocumentosMetadataSchema, getISRCByIdSchema, getPostulacionesByIdSchema, getProductoraByIdParamsSchema, updateDocumentoSchema, updateISRCBodySchema, updateISRCParamsSchema, updatePostulacionBodySchema, updatePostulacionParamsSchema, updateProductoraBodySchema, updateProductoraParamsSchema } from "../utils/validationSchemas";

const router = express.Router();

// Rutas para Documentos de Productoras
router.get(
  "/:id/documentos/:docId",
  authenticate,
  authorizeRoles(["productor_principal", "admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: getDocumentoByIdSchema,
  }),
  getDocumentoById
);

router.get(
  "/:id/documentos/zip",
  authenticate,
  authorizeRoles(["productor_principal", "admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: getAllDocumentosSchema,
  }),
  getAllDocumentos
);

router.get(
  "/:id/documentos",
  authenticate,
  authorizeRoles(["productor_principal", "admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: getDocumentosMetadataSchema,
  }),
  getDocumentosMetadata
);

router.post(
  "/:id/documentos",
  authenticate,
  authorizeRoles(["productor_principal", "admin_principal", "admin_secundario"]),
  uploadDocuments.single("documento"),
  celebrate({
    [Segments.BODY]: createDocumentoSchema,
  }),
  createDocumento
);

router.put(
  "/:id/documentos/:docId",
  authenticate,
  authorizeRoles(["productor_principal", "admin_principal"]),
  celebrate({
    [Segments.PARAMS]: documentoParamsSchema,
    [Segments.BODY]: updateDocumentoSchema,
  }),
  updateDocumento
);

router.delete(
  "/:id/documentos/:docId",
  authenticate,
  authorizeRoles(["productor_principal", "admin_principal"]),
  celebrate({
    [Segments.PARAMS]: documentoParamsSchema,
  }),
  deleteDocumento
);

router.delete(
  "/:id/documentos",
  authenticate,
  authorizeRoles(["productor_principal", "admin_principal"]),
  celebrate({
    [Segments.PARAMS]: deleteAllDocumentosSchema,
  }),
  deleteAllDocumentos
);

// Rutas para ISRC de Productoras
router.get(
  "/:id/isrc",
  authenticate,
  authorizeRoles(['productor_principal', 'productor_secundario', 'admin_principal', 'admin_secundario']),
  celebrate({
    [Segments.PARAMS]: getISRCByIdSchema,
  }),
  getISRCById
);

router.get(
  "/isrc",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  getAllISRCs
);

router.post(
  "/:id/isrc",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: createISRCParamsSchema,
    [Segments.BODY]: createISRCBodySchema,
  }),
  createISRC
);

router.put(
  "/:id/isrc",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: updateISRCParamsSchema,
    [Segments.BODY]: updateISRCBodySchema,
  }),
  updateISRC
);

router.delete(
  "/:id/isrc",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: deleteISRCParamsSchema,
  }),
  deleteISRC
);

// Rutas para Postulaciones de Premios
router.get(
  "/:id/postulaciones",
  authenticate,
  authorizeRoles(["productor_principal", "productor_secundario", "admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: getPostulacionesByIdSchema,
  }),
  getPostulacionById
);

router.get(
  "/postulaciones",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.QUERY]: getAllPostulacionesQuerySchema,
  }),
  getAllPostulaciones
);

router.post(
  "/postulaciones",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.QUERY]: createPostulacionesQuerySchema,
  }),
  createPostulaciones
);

router.put(
  "/:id/postulaciones",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: updatePostulacionParamsSchema,
    [Segments.BODY]: updatePostulacionBodySchema,
  }),
  updatePostulacion
);

router.delete(
  "/:id/postulaciones",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: deletePostulacionParamsSchema,
  }),
  deletePostulacion
);

router.delete(
  "/postulaciones",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  deleteAllPostulaciones
);

// Rutas para Datos de Productoras
router.get(
  "/:id",
  authenticate,
  authorizeRoles(["productor_principal", "productor_secundario", "admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: getProductoraByIdParamsSchema,
  }),
  getProductoraById
);

router.get(
  "/",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  getAllProductoras
);

router.post(
  "/",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.BODY]: createProductoraBodySchema,
  }),
  createProductora
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: updateProductoraParamsSchema,
    [Segments.BODY]: updateProductoraBodySchema,
  }),
  updateProductora
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: deleteProductoraParamsSchema,
  }),
  deleteProductora
);

export default router;