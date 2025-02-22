import { Router } from 'express';

import uploadCSV from '../middlewares/csvFromDisk';
import * as cashflowController from '../controllers/cashflowController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

// Pasadas de repertorio (Reproductions)
router.post('/reproductions',
  authenticate,
  authorizeRoles(['admin_principal', 'admin_secundario']),
  uploadCSV.single('file'),
  cashflowController.processReproductions
);

// Liquidaciones (Settlements)
router.post('/settlements', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.processSettlements);
router.get('/settlements/pending', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.pendingSettlements);

// Pagos (Payments)
router.post('/payments', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.processPayments);

// Rechazos (Rejections)
router.post('/rejections', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.processRejections);

// Traspasos (Transfers)
router.post('/transfers', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.processTransfers);

// General (Transacciones)
router.get('/', authenticate, authorizeRoles(['admin_principal', 'admin_secundario', 'productor_principal', 'productor_secundario']), cashflowController.listTransactions);
router.put('/', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.updateCashflow);

export default router;