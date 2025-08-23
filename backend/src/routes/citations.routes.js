import { Router } from 'express';
import { citationsController } from '../controllers/citations.controller.js';

const router = Router();

router.get('/search', citationsController.search);

export default router;