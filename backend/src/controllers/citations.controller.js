import { searchCitations } from '../services/citations/search.service.js';

export const citationsController = {
	async search(req, res) {
		try {
			const q = String(req.query.q || '').trim();
			if (!q) return res.status(400).json({ error: 'Missing q' });
			const results = await searchCitations(q);
			return res.json({ results });
		} catch (err) {
			console.error('citations search error', err);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	},
};