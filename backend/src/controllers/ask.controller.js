import Conversation from '../models/Conversation.js';
import { getEnv } from '../config/env.js';
import { getOpenAI } from '../services/openai/client.js';
import { searchCitations } from '../services/citations/search.service.js';

function buildSystemPrompt() {
	return [
		{
			role: 'system',
			content: [
				'You are a helpful assistant for F-1 student visa questions in the United States.',
				'Only provide information consistent with official sources (US State Dept, USCIS, CBP, SEVIS/ICE, EducationUSA).',
				'Always provide numbered citations with URLs to official sources at the end.',
				"If you are unsure or the information is out-of-date, say you don't know and suggest contacting the Designated School Official (DSO).",
			].join(' '),
		},
	];
}

export const askController = {
	async ask(req, res) {
		try {
			const { question, sessionId } = req.body || {};
			if (!question || typeof question !== 'string') {
				return res.status(400).json({ error: 'Invalid question' });
			}

			const env = getEnv();
			const openai = getOpenAI();

			const citations = await searchCitations(question);
			const citationText = citations
				.map((c, i) => `[${i + 1}] ${c.title} - ${c.url}`)
				.join('\n');

			const messages = [
				...buildSystemPrompt(),
				{ role: 'user', content: `${question}\n\nCitations (for reference, include relevant ones):\n${citationText}` },
			];

			const { OPENAI_MODEL } = env;
			const completion = await openai.chat.completions.create({
				model: OPENAI_MODEL,
				messages,
				temperature: 0.2,
			});
			const answer = completion.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate an answer.';

			const convo = new Conversation({
				sessionId: sessionId || undefined,
				messages: [
					{ role: 'user', content: question },
					{ role: 'assistant', content: answer, citations },
				],
			});
			await convo.save().catch(() => {});

			return res.json({ answer, citations });
		} catch (err) {
			console.error('ask error', err);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	},
};