import { Request, Response, NextFunction } from "express";
import sequelize from "../config/database/sequelize";

export const transactionMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    req.transaction = transaction;
    await next();
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};