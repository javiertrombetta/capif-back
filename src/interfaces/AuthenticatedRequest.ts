import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: string | JwtPayload;
  maestroId?: string;
  productoraId?: string;
  roleId?: string;
}