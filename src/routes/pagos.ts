 import express from 'express';
 import { getPagosManual } from '../controllers/pagosController';
 import { authenticate, authorizeRoles } from '../middlewares/auth';

 const router = express.Router();

 router.get('/manual', authenticate, authorizeRoles(['admin']), getPagosManual);

 export default router;