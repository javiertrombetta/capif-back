import { Router } from 'express';
import {
  getAllProductoras,
  getProductoraById,
  // createProductora,
  // updateProductora,
  // deleteProductora,
  // getAllDocumentos,
  // getDocumentoById,
  // createDocumento,
  // updateDocumento,
  // deleteDocumento,
  // getAllISRCs,
  // getISRCById,
  // createISRC,
  // updateISRC,
  // deleteISRC,
  // getAllPostulaciones,
  // getPostulacionById,
  // createPostulacion,
  // updatePostulacion,
  // deletePostulacion
} from '../controllers/productorasController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

// Roles permitidos
const viewRoles = ['productor_principal', 'productor_secundario', 'admin_principal', 'admin_secundario'];
const manageRoles = ['admin_principal', 'admin_secundario'];

// Rutas para Datos de Productoras
router.get('/productoras', authenticate, authorizeRoles(viewRoles), getAllProductoras);
router.get('/productoras/:id', authenticate, authorizeRoles(viewRoles), getProductoraById);
// router.post('/productoras', authenticate, authorizeRoles(manageRoles), createProductora);
// router.put('/productoras/:id', authenticate, authorizeRoles(manageRoles), updateProductora);
// router.delete('/productoras/:id', authenticate, authorizeRoles(manageRoles), deleteProductora);

// // Rutas para Documentos de Productoras
// router.get('/productoras/:id/documentos', authenticate, authorizeRoles(viewRoles), getAllDocumentos);
// router.get('/productoras/:id/documentos/:docId', authenticate, authorizeRoles(viewRoles), getDocumentoById);
// router.post('/productoras/:id/documentos', authenticate, authorizeRoles(manageRoles), createDocumento);
// router.put('/productoras/:id/documentos/:docId', authenticate, authorizeRoles(manageRoles), updateDocumento);
// router.delete('/productoras/:id/documentos/:docId', authenticate, authorizeRoles(manageRoles), deleteDocumento);

// // Rutas para ISRC de Productoras
// router.get('/productoras/:id/isrcs', authenticate, authorizeRoles(viewRoles), getAllISRCs);
// router.get('/productoras/:id/isrcs/:isrcId', authenticate, authorizeRoles(viewRoles), getISRCById);
// router.post('/productoras/:id/isrcs', authenticate, authorizeRoles(manageRoles), createISRC);
// router.put('/productoras/:id/isrcs/:isrcId', authenticate, authorizeRoles(manageRoles), updateISRC);
// router.delete('/productoras/:id/isrcs/:isrcId', authenticate, authorizeRoles(manageRoles), deleteISRC);

// // Rutas para Postulaciones de Premios
// router.get('/productoras/:id/postulaciones', authenticate, authorizeRoles(viewRoles), getAllPostulaciones);
// router.get('/productoras/:id/postulaciones/:postId', authenticate, authorizeRoles(viewRoles), getPostulacionById);
// router.post('/productoras/:id/postulaciones', authenticate, authorizeRoles(manageRoles), createPostulacion);
// router.put('/productoras/:id/postulaciones/:postId', authenticate, authorizeRoles(manageRoles), updatePostulacion);
// router.delete('/productoras/:id/postulaciones/:postId', authenticate, authorizeRoles(manageRoles), deletePostulacion);

export default router;