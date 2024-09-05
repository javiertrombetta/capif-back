import { Router } from 'express';
import productorRoutes from './productor.routes';

const router = Router();

router.use('/productores', productorRoutes);

export default router;
