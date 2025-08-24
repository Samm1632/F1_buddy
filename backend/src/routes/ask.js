import express from 'express';
import { z } from 'zod';
import { answerQuestion } from '../rag.js';

const router = express.Router();

const AskSchema = z.object({
  question: z.string().min(3),
});

router.post('/', async (req, res) => {
  const parsed = AskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request body' });

  try {
    const { question } = parsed.data;
    const result = await answerQuestion(question);
    res.json(result);
  } catch (err) {
    console.error('Error in /api/ask:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;

