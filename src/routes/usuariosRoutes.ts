import { Router } from "express";
import { celebrate, Segments } from "celebrate";

import { authenticate, authorizeRoles } from "../middlewares/auth";

import {
  getUser,
  getVistasByUsuario,
  getUsers,
  toggleUserViewStatus,
  updateUserViews,
  blockOrUnblockUser,
  availableDisableUser,
  changeUserPassword,
  updateUser,
  deleteUser,
} from "../controllers/usuariosController";

import {
  getVistasByUsuarioSchema,
  getUsuariosQuerySchema,
  toggleUserViewStatusParamsSchema,
  toggleUserViewStatusBodySchema,
  updateUserViewsParamsSchema,
  updateUserViewsBodySchema,
  blockOrUnblockParamsSchema,
  blockOrUnblockBodySchema,
  availableDisableSchema,
  changePasswordParamsSchema,
  changePasswordBodySchema,
  updateUserBodySchema,
  updateUserParamsSchema,
  deleteUserSchema,
} from "../utils/validationSchemas";

const router = Router();

router.get("/me", authenticate, getUser);

router.get(
  "/:usuarioId/views",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.PARAMS]: getVistasByUsuarioSchema }),
  getVistasByUsuario
);

router.get(
  "/",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.QUERY]: getUsuariosQuerySchema,
  }),
  getUsers
);

router.put(
  "/:usuarioId/views/status",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario", "productor_principal"]),
  celebrate({
    [Segments.PARAMS]: toggleUserViewStatusParamsSchema,
    [Segments.BODY]: toggleUserViewStatusBodySchema,
  }),
  toggleUserViewStatus
);

router.put(
  "/:usuarioId/views",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: updateUserViewsParamsSchema,
    [Segments.BODY]: updateUserViewsBodySchema,
  }),
  updateUserViews
);

router.put(
  "/:usuarioId/status/login",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: blockOrUnblockParamsSchema,
    [Segments.BODY]: blockOrUnblockBodySchema,
  }),
  blockOrUnblockUser
);

router.put(
  "/:usuarioId/status",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.PARAMS]: availableDisableSchema }),
  availableDisableUser
);

router.put(
  "/:usuarioId/password",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario", "productor"]),
  celebrate({
    [Segments.PARAMS]: changePasswordParamsSchema,
    [Segments.BODY]: changePasswordBodySchema,
  }),
  changeUserPassword
);

router.put(
  "/:usuarioId",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: updateUserParamsSchema,
    [Segments.BODY]: updateUserBodySchema,
  }),
  updateUser
);

router.delete(
  "/:usuarioId",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.PARAMS]: deleteUserSchema }),
  deleteUser
);

export default router;
