import axios from 'axios';
import { OFFICIAL_DOMAINS } from './sources.js';

function extractDomain(url) {
	try {
		const d = new URL(url);
		return d.hostname.replace('www.', '');
	} catch {
		return '';
	}
}

function normalizeHref(href) {
	try {
		const absolute = new URL(href, 'https://duckduckgo.com');
		if (absolute.hostname.includes('duckduckgo.com')) {
			const uddg = absolute.searchParams.get('uddg');
			if (uddg) return decodeURIComponent(uddg);
		}
		return absolute.toString();
	} catch {
		return href;
	}
}

export async function searchCitations(query) {
	// DuckDuckGo lite HTML (no JS) for demo; parse and filter official domains
	const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
	const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
	const regex = /<a[^>]*class="result__a"[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/g;
	const results = [];
	let m;
	while ((m = regex.exec(html)) && results.length < 10) {
		const resolved = normalizeHref(m[1]);
		const title = m[2].replace(/<[^>]*>/g, '');
		const domain = extractDomain(resolved);
		if (!domain) continue;
		const isOfficial = OFFICIAL_DOMAINS.some((allowed) => domain.endsWith(allowed));
		if (isOfficial) {
			results.push({ title, url: resolved, domain });
		}
	}
	return results.slice(0, 5);
}