import { Request, Response, NextFunction } from 'express';

import { AuthenticatedRequest } from '../interfaces/AuthenticatedRequest';

import * as cashflowService from "../services/cashflowService";
import { handleGeneralError } from '../services/errorService';

export const processReproductions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await cashflowService.processReproductionsService(req) as { outputFilePath: string, errores: any[], cleanupFiles: () => void };

        return res.status(200).json({
            message: 'Procesamiento completado',
            errores: result.errores,
            downloadUrl: `/downloads/output_reproductions.csv`
        });

    } catch (err) {
        handleGeneralError(err, req, res, next, "Error al procesar las reproducciones");
    }
};

export const processSettlements = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result: { status: number; data: any } = await cashflowService.processSettlementsService(req);
        return res.status(result.status).json(result.data);
    } catch (err) {
        handleGeneralError(err, req, res, next, "Error al procesar liquidaciones");
    }
};

export const pendingSettlements = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result = await cashflowService.getPendingSettlementsService();
        return res.status(200).json(result);
    } catch (err) {
        handleGeneralError(err, req, res, next, "Error al obtener pendientes de liquidación");
    }
};

export const processPayments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result = await cashflowService.processPaymentsService(req);
        return res.status(result.status).json(result.data);
    } catch (err) {
        handleGeneralError(err, req, res, next, "Error al procesar pagos");
    }
};

export const processRejections = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result = await cashflowService.processRejectionsService(req);
        return res.status(result.status).json(result.data);
    } catch (err) {
        handleGeneralError(err, req, res, next, "Error al procesar rechazos");
    }
};

export const processTransfers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result = await cashflowService.processTransfersService(req);
        return res.status(result.status).json(result.data);
    } catch (err) {
        handleGeneralError(err, req, res, next, "Error al procesar traspasos");
    }
};

export const listTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result = await cashflowService.listTransactionsService(req);
        return res.status(result.status).json(result.data);
    } catch (err) {
        handleGeneralError(err, req, res, next, "Error obteniendo las transacciones");
    }
};

export const getCashflows = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result = await cashflowService.getCashflowsService(req);
        return res.status(result.status).json(result.data);
    } catch (err) {
        handleGeneralError(err, req, res, next, "Error obteniendo los cashflows");
    }
};

export const updateCashflow = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const result = await cashflowService.updateCashflowService(req);
        return res.status(result.status).json(result.data);
    } catch (err) {
        handleGeneralError(err, req, res, next, "Error actualizando el cashflow");
    }
};