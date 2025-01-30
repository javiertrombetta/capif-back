import express, { Request, Response, NextFunction } from "express";

export const parseFormData = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.productoraData) {
    return res.status(400).json({ error: "El campo 'productoraData' es obligatorio." });
  }

  try {
    req.body.productoraData = JSON.parse(req.body.productoraData);
  } catch (error) {
    return res.status(400).json({ error: "El campo 'productoraData' no es un JSON válido." });
  }

  next();
};