import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getEnv } from './config/env.js';
import { getCitations } from './services/citations.js';
import { answerWithOpenAI } from './services/openai.js';

const app = express();
const env = getEnv();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: env.ALLOWED_ORIGINS.split(',') }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/ask', async (req, res) => {
	try {
		const question = String(req.body?.question || '').trim();
		if (!question) return res.status(400).json({ error: 'Missing question' });
		const citations = getCitations(question);
		const context = citations.map((c, i) => `[${i + 1}] ${c.title} - ${c.url}`).join('\n');
		let answer = await answerWithOpenAI(question, context);
		if (!answer) {
			answer = [
				'Here is a concise answer based on official guidance. ',
				'Please verify details on the cited sites or with your DSO.\n\n',
				context,
			].join('');
		}
		return res.json({ answer, citations });
	} catch (err) {
		console.error('ask error', err);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Serve built frontend in production
if (env.NODE_ENV === 'production') {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const distPath = path.resolve(__dirname, '../../frontend/dist');
	app.use(express.static(distPath));
	app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(env.PORT, '0.0.0.0', () => {
	console.log(`Server listening on http://localhost:${env.PORT}`);
});