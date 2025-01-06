import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import { celebrate, Segments } from 'celebrate';



const router = Router();

export default router;