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
} from '../controllers/repertoriosController';

const router = express.Router();

// Rutas para FonogramaEnvio
router.post('/send', enviarFonograma);
router.get('/:id/send', getEnviosByFonograma);
router.get('/send', getNovedadesFonograma);

// Rutas para FonogramaArchivo
router.post('/:id/file', uploadAudio.single("audioFile"), addArchivoToFonograma);
router.get('/:id/file', getArchivoByFonograma);

// Rutas para FonogramaParticipacion
router.post('/:id/shares', addParticipacionToFonograma);
router.get('/:id/shares', listParticipaciones);
router.put('/:id/shares/:shareId', updateParticipacion);
router.delete('/:id/shares/:shareId', deleteParticipacion);

// Rutas para FonogramaTerritorio
router.post('/:id/territories', addTerritorioToFonograma);
router.get('/:id/territories', listTerritorios);
router.put('/:id/territories/:territoryId/state', updateTerritorio);
router.delete('/:id/territories/:territoryId', deleteTerritorio);

// Rutas para Fonograma
router.post("/isrc/validate", validateISRC);
router.post('/massive', uploadCSV.single('csvFile'), cargarRepertoriosMasivo);
router.post("/", createFonograma);
router.get('/:id', getFonogramaById);
router.get('/', listFonogramas);
router.put('/:id', updateFonograma);
router.delete('/:id', deleteFonograma);

export default router;