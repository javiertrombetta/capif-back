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
router.post('/send', enviarFonograma);
router.get('/:id/send', getEnviosByFonograma);
router.get('/send', getNovedadesFonograma);

// Rutas para FonogramaArchivo
router.post('/:id/file', uploadAudio.single("audioFile"), addArchivoToFonograma);
router.get('/:id/file', getArchivoByFonograma);

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
router.post("/isrc/validate", validateISRC);
router.post('/massive', uploadCSV.single('csvFile'), cargarRepertoriosMasivo);
router.post("/", createFonograma);
router.get('/:id', getFonogramaById);
router.get('/', listFonogramas);
router.put('/:id', updateFonograma);
router.delete('/:id', deleteFonograma);

export default router;