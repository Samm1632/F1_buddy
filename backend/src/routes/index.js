import { Router } from 'express';
import askRoutes from './ask.routes.js';
import citationsRoutes from './citations.routes.js';

const router = Router();

router.use('/ask', askRoutes);
router.use('/citations', citationsRoutes);

export default router;