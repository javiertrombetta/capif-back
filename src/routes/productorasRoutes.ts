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
router.get('/:id', authenticate, authorizeRoles(viewRoles), getProductoraById);
router.get('/', authenticate, authorizeRoles(viewRoles), getAllProductoras);
router.post('/', authenticate, authorizeRoles(manageRoles), createProductora);
router.put('/:id', authenticate, authorizeRoles(manageRoles), updateProductora);
router.delete('/:id', authenticate, authorizeRoles(manageRoles), deleteProductora);

// Rutas para Documentos de Productoras
router.get('/:id/documentos/:docId', authenticate, authorizeRoles(viewRoles), getDocumentoById);
router.get('/:id/documentos', authenticate, authorizeRoles(viewRoles), getAllDocumentos);
router.post('/:id/documentos', authenticate, authorizeRoles(manageRoles), createDocumento);
router.put('/:id/documentos/:docId', authenticate, authorizeRoles(manageRoles), updateDocumento);
router.delete('/:id/documentos/:docId', authenticate, authorizeRoles(manageRoles), deleteDocumento);
router.delete('/:id/documentos', authenticate, authorizeRoles(manageRoles), deleteAllDocumentos);

// Rutas para ISRC de Productoras
router.get('/:id/isrc', authenticate, authorizeRoles(viewRoles), getISRCById);
router.get('/isrc', authenticate, authorizeRoles(viewRoles), getAllISRCs);
router.post('/:id/isrc', authenticate, authorizeRoles(manageRoles), createISRC);
router.put('/:id/isrc', authenticate, authorizeRoles(manageRoles), updateISRC);
router.delete('/:id/isrc', authenticate, authorizeRoles(manageRoles), deleteISRC);

// Rutas para Postulaciones de Premios
router.get('/:id/postulaciones', authenticate, authorizeRoles(viewRoles), getPostulacionById);
router.get('/postulaciones', authenticate, authorizeRoles(viewRoles), getAllPostulaciones);
router.post('/:id/postulaciones', authenticate, authorizeRoles(manageRoles), createPostulacion);
router.put('/:id/postulaciones', authenticate, authorizeRoles(manageRoles), updatePostulacion);
router.delete('/:id/postulaciones', authenticate, authorizeRoles(manageRoles), deletePostulacion);
router.delete('/postulaciones', authenticate, authorizeRoles(manageRoles), deleteAllPostulaciones);

export default router;