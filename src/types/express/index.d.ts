import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
      files?: { [fieldname: string]: Express.Multer.File[] };
    }
  }
}
