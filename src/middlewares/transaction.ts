import { Request, Response, NextFunction } from "express";
import sequelize from "../config/database/sequelize";
import { namespace } from "../config/database/sequelize";
import logger from "../config/logger";

export const transactionMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  if (req.method === "GET") {
    return next();
  }

  namespace.run(async () => {
    const transaction = await sequelize.transaction();
    namespace.set("transaction", transaction);
    let transactionCompleted = false;

    try {
      logger.info(`[TRANSACTION] Nueva transacción iniciada para: ${req.method} ${req.originalUrl}`);

      res.on("error", async (err) => {
        if (!transactionCompleted) {
          transactionCompleted = true;
          logger.error(`[TRANSACTION] Error en la respuesta para: ${req.method} ${req.originalUrl} - ${err.message}`);
          await transaction.rollback();
        }
        next(err);
      });

      res.on("finish", async () => {
        if (!transactionCompleted) {
          transactionCompleted = true;

          try {
            if (res.statusCode >= 200 && res.statusCode < 400) {
              logger.info(`[TRANSACTION] Commit ejecutado para: ${req.method} ${req.originalUrl}`);
              await transaction.commit();
            } else {
              logger.warn(`[TRANSACTION] Rollback ejecutado para: ${req.method} ${req.originalUrl} con código HTTP ${res.statusCode}`);
              await transaction.rollback();
            }
          } catch (error: any) {
            logger.error(`[TRANSACTION] Error al ejecutar commit/rollback: ${error.message}`);
          }
        }
      });

      next();
    } catch (error: any) {
      logger.error(`[TRANSACTION] Error al iniciar la transacción: ${error.message}`);
      if (!transactionCompleted) {
        transactionCompleted = true;
        await transaction.rollback();
      }
      next(error);
    }
  });
};