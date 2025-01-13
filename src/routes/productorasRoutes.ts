import { Router } from 'express';
import {
  getAllProductoras,
  getProductoraById,
  createProductora,
  updateProductora,
  deleteProductora,
  getAllDocumentos,
  getDocumentoById,
  createDocumento,
  updateDocumento,
  deleteDocumento,
  deleteAllDocumentos,
  getAllISRCs,
  getISRCById,
  createISRC,
  updateISRC,
  deleteISRC,
  getAllPostulaciones,
  getPostulacionById,
  createPostulacion,
  updatePostulacion,
  deletePostulacion,
  deleteAllPostulaciones
} from '../controllers/productorasController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

// Roles permitidos
const viewRoles = ['productor_principal', 'productor_secundario', 'admin_principal', 'admin_secundario'];
const manageRoles = ['admin_principal', 'admin_secundario'];

// Rutas para Datos de Productoras
router.get('/productoras/:id', authenticate, authorizeRoles(viewRoles), getProductoraById);
router.get('/productoras', authenticate, authorizeRoles(viewRoles), getAllProductoras);
router.post('/productoras', authenticate, authorizeRoles(manageRoles), createProductora);
router.put('/productoras/:id', authenticate, authorizeRoles(manageRoles), updateProductora);
router.delete('/productoras/:id', authenticate, authorizeRoles(manageRoles), deleteProductora);

// Rutas para Documentos de Productoras
router.get('/productoras/:id/documentos/:docId', authenticate, authorizeRoles(viewRoles), getDocumentoById);
router.get('/productoras/:id/documentos', authenticate, authorizeRoles(viewRoles), getAllDocumentos);
router.post('/productoras/:id/documentos', authenticate, authorizeRoles(manageRoles), createDocumento);
router.put('/productoras/:id/documentos/:docId', authenticate, authorizeRoles(manageRoles), updateDocumento);
router.delete('/productoras/:id/documentos/:docId', authenticate, authorizeRoles(manageRoles), deleteDocumento);
router.delete('/productoras/:id/documentos', authenticate, authorizeRoles(manageRoles), deleteAllDocumentos);

// Rutas para ISRC de Productoras
router.get('/productoras/:id/isrc', authenticate, authorizeRoles(viewRoles), getISRCById);
router.get('/productoras/isrc', authenticate, authorizeRoles(viewRoles), getAllISRCs);
router.post('/productoras/:id/isrc', authenticate, authorizeRoles(manageRoles), createISRC);
router.put('/productoras/:id/isrc', authenticate, authorizeRoles(manageRoles), updateISRC);
router.delete('/productoras/:id/isrc', authenticate, authorizeRoles(manageRoles), deleteISRC);

// Rutas para Postulaciones de Premios
router.get('/productoras/:id/postulaciones', authenticate, authorizeRoles(viewRoles), getPostulacionById);
router.get('/productoras/postulaciones', authenticate, authorizeRoles(viewRoles), getAllPostulaciones);
router.post('/productoras/:id/postulaciones', authenticate, authorizeRoles(manageRoles), createPostulacion);
router.put('/productoras/:id/postulaciones', authenticate, authorizeRoles(manageRoles), updatePostulacion);
router.delete('/productoras/:id/postulaciones', authenticate, authorizeRoles(manageRoles), deletePostulacion);
router.delete('/productoras/postulaciones', authenticate, authorizeRoles(manageRoles), deleteAllPostulaciones);

export default router;