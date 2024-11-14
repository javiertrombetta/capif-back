import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
  productora?: string;
  role?: string;
  maestro?: string;
}
