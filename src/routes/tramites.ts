import express from 'express';
import {
  getTramites,
  createTramite,
  updateTramite,
  deleteTramite,
} from '../controllers/tramitesController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.put('/:id', authenticate, authorizeRoles(['admin']), updateTramite);
router.delete('/:id', authenticate, authorizeRoles(['admin']), deleteTramite);
router.get('/', authenticate, authorizeRoles(['admin']), getTramites);
router.post('/', authenticate, authorizeRoles(['admin']), createTramite);

export default router;
