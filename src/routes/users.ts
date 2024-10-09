import { Router } from 'express';
import {
  getUsers,
  getRegistrosPendientes,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/usuariosController';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import { celebrate, Segments } from 'celebrate';
import { userCreateSchema, userUpdateSchema, userIdSchema } from '../services/validationSchemas';

const router = Router();

router.post(
  '/',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.BODY]: userCreateSchema }),
  createUser
);

router.get(
  '/:id',
  authenticate,
  authorizeRoles(['admin', 'productor']),
  celebrate({ [Segments.PARAMS]: userIdSchema }),
  getUserById
);

router.get(
  '/pending',
  authenticate,
  authorizeRoles(['admin']),
  getRegistrosPendientes
);

router.get('/', authenticate, authorizeRoles(['admin']), getUsers);

router.put(
  '/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: userIdSchema, [Segments.BODY]: userUpdateSchema }),
  updateUser
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles(['admin']),
  celebrate({ [Segments.PARAMS]: userIdSchema }),
  deleteUser
);

export default router;
