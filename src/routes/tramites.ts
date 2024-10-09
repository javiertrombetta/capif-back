import express from 'express';
import {
  getTramites,
  createTramite,
  updateTramite,
  deleteTramite,
} from '../controllers/tramitesController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.put('/:id', authenticate, authorizeRoles(['admin', 'productor']), updateTramite);
router.delete('/:id', authenticate, authorizeRoles(['admin']), deleteTramite);
router.get('/', authenticate, authorizeRoles(['admin', 'productor']), getTramites);
router.post('/', authenticate, authorizeRoles(['admin', 'productor']), createTramite);

export default router;
