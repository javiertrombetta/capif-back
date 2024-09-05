import { Request, Response } from 'express';
import Productor from '../models/Productor';

export const getProductores = async (req: Request, res: Response) => {
  try {
    const productores = await Productor.findAll();
    res.json(productores);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productores' });
  }
};
