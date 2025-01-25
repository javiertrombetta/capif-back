import { Request, Response, NextFunction } from 'express';
import { validate as isUuid } from 'uuid';

// Middleware para validar UUID
export const validateUUID = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (id && !isUuid(id)) {
    return res.status(400).json({ error: `El ID proporcionado (${id}) no es un UUID válido.` });
  }
  next();
};