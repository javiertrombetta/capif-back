import { Router } from 'express';
import { getProductores } from '../controllers/productor.controller';

const router = Router();

router.get('/', getProductores);

export default router;
