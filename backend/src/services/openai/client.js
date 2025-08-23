import OpenAI from 'openai';
import { getEnv } from '../../config/env.js';

let client;

export function getOpenAI() {
	if (client) return client;
	const env = getEnv();
	if (!env.OPENAI_API_KEY) {
		throw new Error('OPENAI_API_KEY not configured');
	}
	client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
	return client;
}