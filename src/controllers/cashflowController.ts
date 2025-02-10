import { Request, Response } from 'express';

export const importMatchReport = (req: Request, res: Response) => res.sendStatus(200);
export const validateLiquidations = (req: Request, res: Response) => res.sendStatus(200);
export const generateLiquidations = (req: Request, res: Response) => res.sendStatus(200);
export const getAllSettlements = (req: Request, res: Response) => res.sendStatus(200);
export const getSettlementById = (req: Request, res: Response) => res.sendStatus(200);
export const deleteSettlement = (req: Request, res: Response) => res.sendStatus(200);

export const importPasadas = (req: Request, res: Response) => res.sendStatus(200);

export const createTraspaso = (req: Request, res: Response) => res.sendStatus(200);
export const validateTraspaso = (req: Request, res: Response) => res.sendStatus(200);
export const getAllTransfers = (req: Request, res: Response) => res.sendStatus(200);
export const getTransferById = (req: Request, res: Response) => res.sendStatus(200);
export const deleteTransfer = (req: Request, res: Response) => res.sendStatus(200);

export const processPayments = (req: Request, res: Response) => res.sendStatus(200);
export const validatePayments = (req: Request, res: Response) => res.sendStatus(200);
export const getAllPayments = (req: Request, res: Response) => res.sendStatus(200);
export const getPaymentById = (req: Request, res: Response) => res.sendStatus(200);
export const deletePayment = (req: Request, res: Response) => res.sendStatus(200);

export const processRejections = (req: Request, res: Response) => res.sendStatus(200);
export const approveRejection = (req: Request, res: Response) => res.sendStatus(200);
export const reverseRejection = (req: Request, res: Response) => res.sendStatus(200);
export const getAllRejections = (req: Request, res: Response) => res.sendStatus(200);
export const getRejectionById = (req: Request, res: Response) => res.sendStatus(200);
export const deleteRejection = (req: Request, res: Response) => res.sendStatus(200);