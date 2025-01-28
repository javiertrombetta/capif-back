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
} from '../controllers/repertoriosController';
import { uploadAudio } from '../middlewares/audio';
import uploadCSV from '../middlewares/csv';

const router = Router();

// Rutas para Fonograma
router.post('/repertorios/cargar-masivo', uploadCSV.single('csvFile'), cargarRepertoriosMasivo);
router.post("/repertorios", uploadAudio.single("archivo_audio"), createFonograma);
router.get('/repertorios', listFonogramas);
router.get('/repertorios/:id', getFonogramaById);
router.put('/repertorios/:id', updateFonograma);
router.delete('/repertorios/:id', deleteFonograma);

// Rutas para FonogramaArchivo
router.post('/repertorios/:id/archivos', addArchivoToFonograma);
router.get('/repertorios/:id/archivos', getArchivoByFonograma);

// Rutas para FonogramaEnvio
router.post('/repertorios/:id/envios', enviarFonograma);
router.get('/repertorios/:id/envios', getEnviosByFonograma);

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

export default router;