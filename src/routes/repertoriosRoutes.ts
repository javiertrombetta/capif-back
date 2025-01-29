import { Router } from 'express';
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
import { uploadAudio } from '../middlewares/audio';
import uploadCSV from '../middlewares/csv';

const router = Router();

// Rutas para FonogramaEnvio
router.post('/repertorios/envio', enviarFonograma);
router.get('/repertorios/novedades', getNovedadesFonograma);
router.get('/repertorios/:id/envios', getEnviosByFonograma);

// Rutas para FonogramaArchivo
router.post('/repertorios/:id/audio', uploadAudio.single("archivo_audio"), addArchivoToFonograma);
router.get('/repertorios/:id/audio', getArchivoByFonograma);

// Rutas para FonogramaParticipacion
router.post('/repertorios/:id/participaciones', addParticipacionToFonograma);
router.get('/repertorios/:id/participaciones', listParticipaciones);
router.put('/repertorios/:id/participaciones/:participacionId', updateParticipacion);
router.delete('/repertorios/:id/participaciones/:participacionId', deleteParticipacion);

// Rutas para FonogramaTerritorio
router.post('/repertorios/:id/territorios', addTerritorioToFonograma);
router.get('/repertorios/:id/territorios', listTerritorios);
router.put('/repertorios/:id/territorios/:territorioId', updateTerritorio);
router.delete('/repertorios/:id/territorios/:territorioId', deleteTerritorio);

// Rutas para Fonograma
router.post("/repertorio/isrc/validate", validateISRC);
router.post('/repertorios/cargar-masivo', uploadCSV.single('csvFile'), cargarRepertoriosMasivo);
router.post("/repertorios", uploadAudio.single("archivo_audio"), createFonograma);
router.get('/repertorios/:id', getFonogramaById);
router.get('/repertorios', listFonogramas);
router.put('/repertorios/:id', updateFonograma);
router.delete('/repertorios/:id', deleteFonograma);

export default router;