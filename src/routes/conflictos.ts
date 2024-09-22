import express from 'express';
import {
  getConflictos,
  createConflicto,
  updateConflicto,
  getConflictoById,
  addComentarioConflicto,
} from '../controllers/conflictosController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.put('/:id', authenticate, authorizeRoles(['admin', 'user']), updateConflicto);
router.get('/:id', authenticate, authorizeRoles(['admin', 'user']), getConflictoById);
router.post('/comentario', authenticate, authorizeRoles(['admin', 'user']), addComentarioConflicto);
router.post('/', authenticate, authorizeRoles(['admin', 'user']), createConflicto);
router.get('/', authenticate, authorizeRoles(['admin', 'user']), getConflictos);

export default router;
