import express from "express";
import { celebrate, Segments } from "celebrate";

import { authenticate, authorizeRoles } from "../middlewares/auth";
import { uploadAudio } from '../middlewares/audio';
import uploadCSV from '../middlewares/csv';

import {
  createFonograma,
  getFonogramaById,
  updateFonograma,
  deleteFonograma,
  listFonogramas,
  addArchivoToFonograma,
  getArchivoByFonograma,
  enviarFonograma,
  getEnviosByFonograma,
  addParticipacionToFonograma,
  listParticipaciones,
  updateParticipacion,
  deleteParticipacion,
  addTerritorioToFonograma,
  listTerritorios,
  updateTerritorio,
  deleteTerritorio,
  cargarRepertoriosMasivo,
  validateISRC,
  getNovedadesFonograma,
  cambiarEstadoEnvioFonograma,
  cargarParticipacionesMasivo,
} from '../controllers/repertoriosController';

import { 
  addArchivoToFonogramaParamsSchema,
  addParticipacionToFonogramaBodySchema,
  addParticipacionToFonogramaParamsSchema,
  addTerritorioToFonogramaBodySchema,
  addTerritorioToFonogramaParamsSchema,
  createFonogramaBodySchema,
  deleteFonogramaParamsSchema,
  deleteParticipacionParamsSchema,
  deleteTerritorioParamsSchema,
  enviarFonogramaBodySchema,
  cambiarEstadoEnvioFonogramaParamsSchema,
  getArchivoByFonogramaParamsSchema,
  getEnviosByFonogramaParamsSchema,
  getFonogramaByIdParamsSchema,
  getNovedadesFonogramaQuerySchema,
  listFonogramasQuerySchema,
  listParticipacionesParamsSchema,
  listParticipacionesQuerySchema,
  listTerritoriosParamsSchema,
  updateFonogramaBodySchema,
  updateFonogramaParamsSchema,
  updateParticipacionBodySchema,
  updateParticipacionParamsSchema,
  updateTerritorioBodySchema,
  updateTerritorioParamsSchema,
  validateISRCBodySchema,
  cambiarEstadoEnvioFonogramaBodySchema
} from "../utils/validationSchemas";

const router = express.Router();

// Rutas para FonogramaEnvio
router.post(
  "/send",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.BODY]: enviarFonogramaBodySchema,
  }),
  enviarFonograma
);

router.put(
  '/:id/send/:sendId',
  authenticate,
  authorizeRoles(['admin_principal', 'admin_secundario']),
  celebrate({
    [Segments.PARAMS]: cambiarEstadoEnvioFonogramaParamsSchema,
    [Segments.BODY]: cambiarEstadoEnvioFonogramaBodySchema,
  }),
  cambiarEstadoEnvioFonograma
);

router.get(
  '/:id/send',
  authenticate,
  authorizeRoles(['admin_principal', 'admin_secundario']),
  celebrate({
    [Segments.PARAMS]: getEnviosByFonogramaParamsSchema,
  }),
  getEnviosByFonograma
);

router.get(
  "/send",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.QUERY]: getNovedadesFonogramaQuerySchema,
  }),
  getNovedadesFonograma
);

// Rutas para FonogramaArchivo
router.post(
  "/:id/file",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario", "productor_principal", "productor_secundario"]),
  celebrate({
    [Segments.PARAMS]: addArchivoToFonogramaParamsSchema,
  }),
  uploadAudio.single("audioFile"),
  addArchivoToFonograma
);

router.get(
  "/:id/file",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario", "productor_principal", "productor_secundario"]),
  celebrate({
    [Segments.PARAMS]: getArchivoByFonogramaParamsSchema,
  }),
  getArchivoByFonograma
);

// Rutas para FonogramaParticipacion
router.post(
  "/:id/shares",
  authenticate,
  authorizeRoles(["admin_principal"]),
  celebrate({
    [Segments.PARAMS]: addParticipacionToFonogramaParamsSchema,
    [Segments.BODY]: addParticipacionToFonogramaBodySchema,
  }),
  addParticipacionToFonograma
);

router.post(
  "/shares/massive",
  authenticate,
  authorizeRoles(["admin_principal"]),
  uploadCSV.single("sharesFile"),
  cargarParticipacionesMasivo
);

router.get(
  "/:id/shares",
  authenticate,
  authorizeRoles(["admin_principal"]),
  celebrate({
    [Segments.PARAMS]: listParticipacionesParamsSchema,
    [Segments.QUERY]: listParticipacionesQuerySchema,
  }),
  listParticipaciones
);

router.put(
  "/:id/shares/:shareId",
  authenticate,
  authorizeRoles(["admin_principal"]),
  celebrate({
    [Segments.PARAMS]: updateParticipacionParamsSchema,
    [Segments.BODY]: updateParticipacionBodySchema,
  }),
  updateParticipacion
);

router.delete(
  "/:id/shares/:shareId",
  authenticate,
  authorizeRoles(["admin_principal"]),
  celebrate({
    [Segments.PARAMS]: deleteParticipacionParamsSchema,
  }),
  deleteParticipacion
);

// Rutas para FonogramaTerritorio
router.post(
  "/:id/territories",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: addTerritorioToFonogramaParamsSchema,
    [Segments.BODY]: addTerritorioToFonogramaBodySchema,
  }),
  addTerritorioToFonograma
);

router.get(
  "/:id/territories",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario", "productor_principal", "productor_secundario"]),
  celebrate({
    [Segments.PARAMS]: listTerritoriosParamsSchema,
  }),
  listTerritorios
);

router.put(
  "/:id/territories/:territoryId/state",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: updateTerritorioParamsSchema,
    [Segments.BODY]: updateTerritorioBodySchema,
  }),
  updateTerritorio
);

router.delete(
  "/:id/territories/:territoryId",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: deleteTerritorioParamsSchema,
  }),
  deleteTerritorio
);

// Rutas para Fonograma
router.post(
  "/isrc/validate",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario", "productor_principal", "productor_secundario"]),
  celebrate({
    [Segments.BODY]: validateISRCBodySchema,
  }),
  validateISRC
);

router.post(
  "/massive",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  uploadCSV.single("repertoiresFile"),
  cargarRepertoriosMasivo
);

router.post(
  "/",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario", "productor_principal", "productor_secundario"]),
  celebrate({
    [Segments.BODY]: createFonogramaBodySchema,
  }),
  createFonograma
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario", "productor_principal", "productor_secundario"]),
  celebrate({
    [Segments.PARAMS]: getFonogramaByIdParamsSchema,
  }),
  getFonogramaById
);

router.get(
  "/",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario", "productor_principal", "productor_secundario"]),
  celebrate({
    [Segments.QUERY]: listFonogramasQuerySchema,
  }),
  listFonogramas
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario", "productor_principal", "productor_secundario"]),
  celebrate({
    [Segments.PARAMS]: updateFonogramaParamsSchema,
    [Segments.BODY]: updateFonogramaBodySchema,
  }),
  updateFonograma
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: deleteFonogramaParamsSchema,
  }),
  deleteFonograma
);

export default router;