import OpenAI from 'openai';
import { getEnv } from '../config/env.js';

let client;

export function getOpenAI() {
	const { OPENAI_API_KEY } = getEnv();
	if (!OPENAI_API_KEY) return null;
	if (!client) client = new OpenAI({ apiKey: OPENAI_API_KEY });
	return client;
}

export async function answerWithOpenAI(question, context) {
	const env = getEnv();
	const api = getOpenAI();
	if (!api) return null;
	const completion = await api.chat.completions.create({
		model: env.OPENAI_MODEL,
		messages: [
			{ role: 'system', content: 'You are a helpful assistant answering F‑1 visa questions with official citations.' },
			{ role: 'user', content: `${question}\n\nHelpful context and sources:\n${context}` },
		],
		temperature: 0.2,
	});
	return completion.choices?.[0]?.message?.content?.trim() || null;
}