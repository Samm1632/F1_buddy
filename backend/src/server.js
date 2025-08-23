import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectMongo } from './db/index.js';
import { getEnv } from './config/env.js';
import askRoutes from './routes/ask.routes.js';
import citationsRoutes from './routes/citations.routes.js';

const app = express();
const env = getEnv();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.ALLOWED_ORIGINS.split(',') }));
app.use(morgan('dev'));

const limiter = rateLimit({
	windowMs: Number(env.RATE_LIMIT_WINDOW_MS) || 60_000,
	max: Number(env.RATE_LIMIT_MAX) || 60,
	standardHeaders: true,
	legacyHeaders: false,
});
app.use(limiter);

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.use('/api/ask', askRoutes);
app.use('/api/citations', citationsRoutes);

const start = async () => {
	try {
		await connectMongo(env.MONGODB_URI);
	} catch (err) {
		console.warn('Mongo connection failed, continuing without DB:', err?.message || err);
	}
	app.listen(env.PORT, () => {
		console.log(`backend listening on http://localhost:${env.PORT}`);
	});
};

start().catch((err) => {
	console.error('Fatal startup error:', err);
	process.exit(1);
});