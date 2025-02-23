import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import { celebrate, Segments } from 'celebrate';

import {
    getChanges,
    getRepertoireChanges,
    getSessions
} from '../controllers/auditoriasController';

import { getAuditChangesQuerySchema, getRepertoireChangesQuerySchema, getSessionAuditChangesQuerySchema } from '../utils/validationSchemas';

const router = Router();

router.get(
    "/",
    authenticate,
    authorizeRoles(["admin_principal", "admin_secundario"]),
    celebrate({
        [Segments.QUERY]: getAuditChangesQuerySchema,
    }),
    getChanges
);

router.get(
    "/repertoire",
    authenticate,
    authorizeRoles(["admin_principal", "admin_secundario"]),
    celebrate({
        [Segments.QUERY]: getRepertoireChangesQuerySchema,
    }),
    getRepertoireChanges
);

router.get(
    "/sessions",
    authenticate,
    authorizeRoles(["admin_principal", "admin_secundario"]),
    celebrate({
        [Segments.QUERY]: getSessionAuditChangesQuerySchema,
    }),
    getSessions
);

export default router;