import { JwtPayload } from 'jsonwebtoken';
import { Transaction } from "sequelize";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
      files?: { [fieldname: string]: Express.Multer.File[] };
      transaction?: Transaction;
    }
  }
}
