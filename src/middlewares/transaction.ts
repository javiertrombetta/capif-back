import { Request, Response, NextFunction } from "express";
import sequelize from "../config/database/sequelize";

export const transactionMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const transaction = await sequelize.transaction();

  const rollbackTransaction = async () => {
    if (transaction) {
      await transaction.rollback();
    }
  };

  const commitTransaction = async () => {
    if (transaction) {
      await transaction.commit();
    }
  };

  // Escuchar eventos para manejar automáticamente el commit o rollback
  res.on("finish", async () => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      await commitTransaction();
    } else {
      await rollbackTransaction();
    }
  });

  res.on("close", async () => {
    if (!res.headersSent) {
      await rollbackTransaction();
    }
  });

  next();
};