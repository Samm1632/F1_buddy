export const OFFICIAL_DOMAINS = [
	'travel.state.gov',
	'uscis.gov',
	'ice.gov',
	'cbp.gov',
	'educationusa.state.gov',
];

const CURATED = [
	{
		match: /\b(opt|optional practical training)\b/i,
		sources: [
			{ title: 'USCIS | OPT', url: 'https://www.uscis.gov/i-765', domain: 'uscis.gov' },
			{ title: 'SEVP | Practical Training', url: 'https://www.ice.gov/sevis/practical-training', domain: 'ice.gov' },
		],
	},
	{
		match: /\b(cpt|curricular practical training)\b/i,
		sources: [
			{ title: 'SEVP | CPT', url: 'https://www.ice.gov/sevis/curricular-practical-training', domain: 'ice.gov' },
		],
	},
	{
		match: /\b(sevis|i-901)\b/i,
		sources: [
			{ title: 'ICE | SEVIS', url: 'https://www.ice.gov/sevis', domain: 'ice.gov' },
		],
	},
	{
		match: /\b(travel|re[- ]?enter|visa interview|ds-160|consular)\b/i,
		sources: [
			{ title: 'Travel.State.gov | U.S. Visas', url: 'https://travel.state.gov/content/travel/en/us-visas.html', domain: 'travel.state.gov' },
			{ title: 'CBP | International Travel', url: 'https://www.cbp.gov/travel/international-visitors', domain: 'cbp.gov' },
		],
	},
];

export function getCitations(question) {
	for (const item of CURATED) {
		if (item.match.test(question)) return item.sources;
	}
	// default general sources
	return [
		{ title: 'SEVP | Students', url: 'https://www.ice.gov/sevis/students', domain: 'ice.gov' },
		{ title: 'USCIS | Students and Employment', url: 'https://www.uscis.gov/i-9-central/learn-about-verifying-employment-eligibility/student-employees', domain: 'uscis.gov' },
	];
}