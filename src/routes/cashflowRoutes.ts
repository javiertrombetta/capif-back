import { Router } from 'express';
import * as cashflowController from '../controllers/cashflowController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

// Liquidaciones (Settlements)
router.post('/settlements/import', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.importMatchReport);
router.post('/settlements/validate', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.validateLiquidations);
router.post('/settlements', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.generateLiquidations);
router.get('/settlements', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getAllSettlements);
router.get('/settlements/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getSettlementById);
router.delete('/settlements/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.deleteSettlement);

// Pasadas de repertorio (Reproductions)
router.post('/reproductions/import', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.importPasadas);

// Traspasos (Transfers)
router.post('/transfers', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.createTraspaso);
router.post('/transfers/validate', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.validateTraspaso);
router.get('/transfers', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getAllTransfers);
router.get('/transfers/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getTransferById);
router.delete('/transfers/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.deleteTransfer);

// Pagos (Payments)
router.post('/payments', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.processPayments);
router.post('/payments/validate', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.validatePayments);
router.get('/payments', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getAllPayments);
router.get('/payments/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getPaymentById);
router.delete('/payments/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.deletePayment);

// Rechazos (Rejections)
router.post('/rejections', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.processRejections);
router.put('/rejections/approve/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.approveRejection);
router.post('/rejections/revert/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.reverseRejection);
router.get('/rejections', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getAllRejections);
router.get('/rejections/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.getRejectionById);
router.delete('/rejections/:id', authenticate, authorizeRoles(['admin_principal', 'admin_secundario']), cashflowController.deleteRejection);

export default router;