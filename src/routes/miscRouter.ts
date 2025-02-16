import express from "express";
import { celebrate, Segments } from "celebrate";

import { authenticate, authorizeRoles } from '../middlewares/auth';

import { createTerritorio, deleteTerritorio, generateTerritorialityReport, getLogs, getTerritorios, getTiposDeDocumentos, getVistaPorRol, resetDatabase, updateStatus } from '../controllers/miscController';
import { createTerritorioSchema, deleteTerritorioSchema, territorialityReportSchema, updateIsHabilitadoSchema } from "../utils/validationSchemas";


const router = express.Router();

router.post('/reset', authenticate, authorizeRoles(['admin_principal']), resetDatabase);

router.post(
  "/territories",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.BODY]: createTerritorioSchema }),
  createTerritorio
);

router.get('/documents', authenticate, authorizeRoles(["admin_principal", "admin_secundario", "productor_principal", "productor_secundario"]), getTiposDeDocumentos);

router.get(
  "/territories/reports",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.QUERY]: territorialityReportSchema.query }),
  generateTerritorialityReport
);

router.get('/territories', authenticate, authorizeRoles(["admin_principal", "admin_secundario", "productor_principal", "productor_secundario"]), getTerritorios);

router.get('/views', authenticate, authorizeRoles(["admin_principal", "admin_secundario", "productor_principal", "productor_secundario"]), getVistaPorRol);

router.get('/logs', authenticate, authorizeRoles(['admin_principal']), getLogs);

router.put(
  "/territories/:territoryId/status",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: updateIsHabilitadoSchema.params,
    [Segments.BODY]: updateIsHabilitadoSchema.body,
  }),
  updateStatus
);

router.delete(
  "/territories/:territoryId",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.PARAMS]: deleteTerritorioSchema }),
  deleteTerritorio
);

export default router;