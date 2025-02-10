import { Request, Response, NextFunction } from "express";
import sequelize from "../config/database/sequelize";
import logger from "../config/logger";

// Extender `Request` para incluir la transacción
declare module "express-serve-static-core" {
  interface Request {
    transaction?: any;
  }
}

export const transactionMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    req.transaction = await sequelize.transaction();
    logger.info(`[TRANSACTION] Nueva transacción iniciada para: ${req.method} ${req.originalUrl}`);

    res.on("finish", async () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        if (req.transaction) {
          logger.info(`[TRANSACTION] Commit ejecutado para: ${req.method} ${req.originalUrl}`);
          await req.transaction.commit();
        }
      } else {
        if (req.transaction) {
          logger.warn(`[TRANSACTION] Rollback ejecutado para: ${req.method} ${req.originalUrl}`);
          await req.transaction.rollback();
        }
      }
    });

    next();
  } catch (error) {
    logger.error(`[TRANSACTION] Error al iniciar la transacción: ${error}`);
    next(error);
  }
};