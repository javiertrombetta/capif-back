// import express from "express";
// import { celebrate, Segments } from "celebrate";

// import { authenticate, authorizeRoles } from "../middlewares/auth";
// import { sendFiles } from "../middlewares/conflicto";

// import {
//   crearConflicto,
//   obtenerConflictos,
//   obtenerConflicto,
//   actualizarEstadoConflicto,
//   desistirConflicto,
//   eliminarConflicto,
//   actualizarPorResolucion,
//   otorgarProrroga,
//   confirmarPorcentaje,
//   enviarDocumentos,
//   generarReporteConflictos,
// } from "../controllers/conflictosController";

// import {
//   actualizarEstadoConflictoParamsSchema,
//   actualizarPorResolucionParamsSchema,
//   actualizarPorResolucionBodySchema,
//   confirmarPorcentajeParamsSchema,
//   confirmarPorcentajeBodySchema,
//   crearConflictoBodySchema,
//   desistirConflictoParamsSchema,
//   eliminarConflictoParamsSchema,
//   enviarDocumentosParamsSchema,
//   enviarDocumentosBodySchema,
//   generarReporteConflictosQuerySchema,
//   obtenerConflictoParamsSchema,
//   obtenerConflictosQuerySchema,
//   otorgarProrrogaParamsSchema,
// } from "../utils/validationSchemas";

// const router = express.Router();

// router.post(
//   "/:id/docs",
//   authenticate,
//   authorizeRoles(["productor_principal", "productor_secundario"]),
//   celebrate({
//     [Segments.PARAMS]: enviarDocumentosParamsSchema,
//     [Segments.BODY]: enviarDocumentosBodySchema,
//   }),
//   sendFiles,
//   enviarDocumentos
// );

// router.post(
//   "/:id/validate-porcentage",
//   authenticate,
//   authorizeRoles(["productor_principal", "productor_secundario"]),
//   celebrate({
//     [Segments.PARAMS]: confirmarPorcentajeParamsSchema,
//     [Segments.BODY]: confirmarPorcentajeBodySchema,
//   }),
//   confirmarPorcentaje
// );

// router.post(
//   "/",
//   authenticate,
//   authorizeRoles(["admin_principal", "admin_secundario"]),
//   celebrate({
//     [Segments.BODY]: crearConflictoBodySchema,
//   }),
//   crearConflicto
// );

// router.get(
//   "/reports",
//   authenticate,
//   authorizeRoles(["admin_principal", "admin_secundario"]),
//   celebrate({
//     [Segments.QUERY]: generarReporteConflictosQuerySchema,
//   }),
//   generarReporteConflictos
// );

// router.get(
//   "/:id",
//   authenticate,
//   authorizeRoles(["admin_principal", "admin_secundario", "productor_principal", "productor_secundario"]),
//   celebrate({
//     [Segments.PARAMS]: obtenerConflictoParamsSchema,
//   }),
//   obtenerConflicto
// );

// router.get(
//   "/",
//   authenticate,
//   authorizeRoles(["admin_principal", "admin_secundario"]),
//   celebrate({
//     [Segments.QUERY]: obtenerConflictosQuerySchema,
//   }),
//   obtenerConflictos
// );

// router.put(
//   "/:id/desist",
//   authenticate,
//   authorizeRoles(["productor_principal", "productor_secundario"]),
//   celebrate({
//     [Segments.PARAMS]: desistirConflictoParamsSchema,
//   }),
//   desistirConflicto
// );

// router.put(
//   "/:id/extension",
//   authenticate,
//   authorizeRoles(["admin_principal", "admin_secundario"]),
//   celebrate({
//     [Segments.PARAMS]: otorgarProrrogaParamsSchema,
//   }),
//   otorgarProrroga
// );

// router.put(
//   "/:id/status",
//   authenticate,
//   authorizeRoles(["admin_principal", "admin_secundario"]),
//   celebrate({
//     [Segments.PARAMS]: actualizarEstadoConflictoParamsSchema,
//   }),
//   actualizarEstadoConflicto
// );

// router.put(
//   "/:id",
//   authenticate,
//   authorizeRoles(["admin_principal"]),
//   celebrate({
//     [Segments.PARAMS]: actualizarPorResolucionParamsSchema,
//     [Segments.BODY]: actualizarPorResolucionBodySchema,
//   }),
//   actualizarPorResolucion
// );

// router.delete(
//   "/:id",
//   authenticate,
//   authorizeRoles(["admin_principal"]),
//   celebrate({
//     [Segments.PARAMS]: eliminarConflictoParamsSchema,
//   }),
//   eliminarConflicto
// );








// export default router;