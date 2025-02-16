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
// router.post('/settlements/import', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.importSettlements);
// router.post('/settlements/validate', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.validateSettlements);
router.post('/settlements', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.processSettlements);
router.get('/settlements', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getAllSettlements);
router.get('/settlements/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getSettlementById);
router.delete('/settlements/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.deleteSettlement);

// Traspasos (Transfers)
// router.post('/transfers/validate', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.validateTraspaso);
router.post('/transfers', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.createTransfers);
router.get('/transfers', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getAllTransfers);
router.get('/transfers/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getTransferById);
router.delete('/transfers/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.deleteTransfer);

// Pagos (Payments)
// router.post('/payments/validate', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.validatePayments);
router.post('/payments', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.processPayments);
router.get('/payments', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getAllPayments);
router.get('/payments/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getPaymentById);
router.delete('/payments/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.deletePayment);

// Rechazos (Rejections)

// router.put('/rejections/approve/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.approveRejection);
// router.post('/rejections/revert/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.reverseRejection);
router.post('/rejections', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.processRejections);
router.get('/rejections', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getAllRejections);
router.get('/rejections/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getRejectionById);
router.delete('/rejections/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.deleteRejection);

export default router;