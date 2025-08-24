import express from 'express';
import { buildIndex } from '../vectorStore.js';

const router = express.Router();

router.post('/reload-index', async (_req, res) => {
  try {
    await buildIndex();
    res.json({ ok: true });
  } catch (err) {
    console.error('Error reloading index:', err);
    res.status(500).json({ error: 'Failed to rebuild index' });
  }
});

export default router;

