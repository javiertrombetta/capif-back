import express from 'express';
import {
  crearConflicto,
  obtenerConflictos,
  obtenerConflicto,
  actualizarEstadoConflicto,
  desistirConflicto,
  eliminarConflicto,
  actualizarPorResolucion,
  otorgarProrroga,
  confirmarPorcentaje,
  enviarDocumentos,
  generarReporteConflictos,
} from '../controllers/conflictosController';

import { sendFiles } from '../middlewares/conflicto';

const router = express.Router();

router.post('/conflictos', crearConflicto);
router.get('/conflictos', obtenerConflictos);
router.get('/conflictos/:id', obtenerConflicto);
router.put('/conflictos/:id/estado', actualizarEstadoConflicto);
router.put('/conflictos/:id/desistir', desistirConflicto);
router.delete('/conflictos/:id', eliminarConflicto);

router.put('/conflictos/:id/prorroga', otorgarProrroga);
router.put('/conflictos/:id', actualizarPorResolucion);

router.post('/conflictos/:id/porcentaje', confirmarPorcentaje);
router.post('/conflictos/:id/documentos', sendFiles, enviarDocumentos);

router.get('/conflictos/reportes', generarReporteConflictos);

export default router;