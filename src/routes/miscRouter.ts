import express from "express";

import { authenticate, authorizeRoles } from '../middlewares/auth';

import { getTerritorios, getTiposDeDocumentos, getVistaPorRol } from '../controllers/miscController';

const router = express.Router();

router.get('/base/documents', authenticate, getTiposDeDocumentos);
router.get('/base/territories', authenticate, getTerritorios);
router.get('/base/views', authenticate, getVistaPorRol);

export default router;