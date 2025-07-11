import express from "express";
import { celebrate, Segments } from "celebrate";

import { authenticate, authorizeRoles } from "../middlewares/auth";
import verifyRecaptcha from "../middlewares/recaptcha";

import {
  registerSecondaryProductor,
  sendApplication,
  registerPrimaryProductor,
  rejectApplication,
  approveApplication,
  selectAuthProductora,
  logout,
  login,
  createSecondaryAdminUser,
  getRegistrosPendientes,
  validateEmail,
  resetPassword,
  requestPasswordReset,
  deleteApplication,
  validateCuitProductora,
} from "../controllers/authController";

import {
  registerSecondarySchema,
  sendApplicationSchema,
  registerPrimarySchema,
  rejectApplicationParamsSchema,
  rejectApplicationBodySchema,
  approveApplicationSchema,
  selectProductoraSchema,
  loginSchema,
  createAdminSchema,
  getRegistrosPendientesSchema,
  validateEmailSchema,
  resetPasswordSchema,
  requestPasswordSchema,
  deleteApplicationSchema,
  validateCuitSchema,
} from "../utils/validationSchemas";

const router = express.Router();

router.post(
  "/prods/secondary",
  authenticate,
  authorizeRoles(["productor_principal"]),
  celebrate({ [Segments.BODY]: registerSecondarySchema }),
  registerSecondaryProductor
);

router.post(
  "/prods/primary/step-two",
  authenticate,
  authorizeRoles(["productor_principal"]),
  celebrate({ [Segments.BODY]: sendApplicationSchema }),
  sendApplication
);

router.post(
  "/prods/primary/step-one",
  celebrate({ [Segments.BODY]: registerPrimarySchema }),
  registerPrimaryProductor
);

router.post(
  "/prods/primary/:usuarioId/reject",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: rejectApplicationParamsSchema,
    [Segments.BODY]: rejectApplicationBodySchema,
  }),
  rejectApplication
);

router.post(
  "/prods/primary/:usuarioId/authorize",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({ [Segments.PARAMS]: approveApplicationSchema }),
  approveApplication
);

router.post(
  "/me/:productoraId",
  authenticate,
  celebrate({ [Segments.PARAMS]: selectProductoraSchema }),
  selectAuthProductora
);

router.post("/logout", authenticate, logout);

router.post("/login", celebrate({ [Segments.BODY]: loginSchema }), verifyRecaptcha, login);
// router.post("/login", celebrate({ [Segments.BODY]: loginSchema }), login);

router.post(
  "/admins/secondary",
  authenticate,
  authorizeRoles(["admin_principal"]),
  celebrate({ [Segments.BODY]: createAdminSchema }),
  createSecondaryAdminUser
);

router.get(
  "/pending",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario", "productor_principal"]),
  celebrate({ [Segments.QUERY]: getRegistrosPendientesSchema }),
  getRegistrosPendientes
);

router.get(
  "/validate/:id",
  celebrate({ [Segments.PARAMS]: validateCuitSchema}),
  validateCuitProductora
);

router.put(
  "/validate/:id",
  celebrate({ [Segments.PARAMS]: validateEmailSchema }),
  validateEmail
);

router.put(
  "/password/reset",
  celebrate({ [Segments.BODY]: resetPasswordSchema }),
  resetPassword
);

router.put(
  "/password/request-reset",
  celebrate({ [Segments.BODY]: requestPasswordSchema }),
  requestPasswordReset
);

router.delete(
  "/pending/:usuarioId",
  authenticate,
  authorizeRoles(["admin_principal", "admin_secundario"]),
  celebrate({
    [Segments.PARAMS]: deleteApplicationSchema,
  }),
  deleteApplication
);

export default router;
