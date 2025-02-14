import express from "express";

import { authenticate, authorizeRoles } from '../middlewares/auth';

import { getLogs, getTerritorios, getTiposDeDocumentos, getVistaPorRol, resetDatabase } from '../controllers/miscController';

const router = express.Router();

router.get('/base/documents', authenticate, getTiposDeDocumentos);
router.get('/base/territories', authenticate, getTerritorios);
router.get('/base/views', authenticate, getVistaPorRol);
router.post('/base/reset', authenticate, authorizeRoles(['admin_principal']), resetDatabase);
router.get('/logs', authenticate, authorizeRoles(['admin_principal']), getLogs);

export default router;