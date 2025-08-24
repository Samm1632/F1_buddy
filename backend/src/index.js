import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { connectToDatabase } from './db.js';
import askRouter from './routes/ask.js';
import adminRouter from './routes/admin.js';
import { buildIndex } from './vectorStore.js';

async function start() {
  await connectToDatabase();
  await buildIndex();

  const app = express();

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  app.use(express.json({ limit: '2mb' }));

  app.get('/healthz', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/ask', askRouter);
  app.use('/api/admin', adminRouter);

  app.listen(config.port, () => {
    console.log(`Backend listening on http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error('Fatal error starting server', err);
  process.exit(1);
});

