import express from 'express';
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getUsuariosAsignados,
} from '../controllers/usersController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.put('/:id', authenticate, authorizeRoles(['admin']), updateUser);
router.get('/:id', authenticate, authorizeRoles(['admin']), getUserById);
router.delete('/:id', authenticate, authorizeRoles(['admin']), deleteUser);
router.get('/asignados', authenticate, authorizeRoles(['admin']), getUsuariosAsignados);
router.post('/', authenticate, authorizeRoles(['admin']), createUser);
router.get('/', authenticate, authorizeRoles(['admin']), getUsers);

export default router;
