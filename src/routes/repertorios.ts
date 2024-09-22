import express from 'express';
import {
  getRepertorios,
  createRepertorio,
  createRepertorioByTema,
  createRepertorioByAlbum,
  getRepertorioById,
  updateRepertorio,
  deleteRepertorio,
  downloadRepertorio,
} from '../controllers/repertoriosController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.put('/:id', authenticate, authorizeRoles(['admin']), updateRepertorio);
router.get('/:id', authenticate, authorizeRoles(['admin', 'user']), getRepertorioById);
router.delete('/:id', authenticate, authorizeRoles(['admin']), deleteRepertorio);
router.post('/album', authenticate, authorizeRoles(['admin', 'user']), createRepertorioByAlbum);
router.get('/descargar', authenticate, authorizeRoles(['admin', 'user']), downloadRepertorio);
router.post('/tema', authenticate, authorizeRoles(['admin', 'user']), createRepertorioByTema);
router.post('/', authenticate, authorizeRoles(['admin', 'user']), createRepertorio);
router.get('/', authenticate, authorizeRoles(['admin', 'user']), getRepertorios);

export default router;
