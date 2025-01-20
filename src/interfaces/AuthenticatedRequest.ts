import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  userId?: string | JwtPayload;
  productoraId?: string;
  role?: string;
}
