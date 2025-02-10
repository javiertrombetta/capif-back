import express from "express";

import { authenticate, authorizeRoles } from '../middlewares/auth';

import { getTerritorios, getTiposDeDocumentos, getVistaPorRol, resetDatabase, testCommit, testRollback } from '../controllers/miscController';

const router = express.Router();

router.get('/base/documents', authenticate, getTiposDeDocumentos);
router.get('/base/territories', authenticate, getTerritorios);
router.get('/base/views', authenticate, getVistaPorRol);
router.post('/base/reset', authenticate, authorizeRoles(['admin_principal']), resetDatabase);

// Endpoint de prueba para commit (éxito)
router.post("/test-commit", authenticate, authorizeRoles(['admin_principal']), testCommit);
// Endpoint de prueba para rollback (falla)
router.post("/test-rollback", authenticate, authorizeRoles(['admin_principal']), testRollback);

export default router;