import express from 'express';
import {
  getArchivos,
  uploadArchivo,
  getArchivoById,
  deleteArchivo,
} from '../controllers/archivosController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.get('/:id', authenticate, authorizeRoles(['admin']), getArchivoById);
router.delete('/:id', authenticate, authorizeRoles(['admin']), deleteArchivo);
router.post('/', authenticate, authorizeRoles(['admin']), uploadArchivo);
router.get('/', authenticate, authorizeRoles(['admin']), getArchivos);

export default router;
