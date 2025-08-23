export const getEnv = () => {
	const env = {
		NODE_ENV: process.env.NODE_ENV || 'development',
		PORT: process.env.PORT || 3001,
		MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/us_embassy_f1',
		OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
		OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
		ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:5173',
		RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || '60000',
		RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || '60',
	};
	if (!env.OPENAI_API_KEY) {
		console.warn('Warning: OPENAI_API_KEY not set. QnA will be disabled.');
	}
	return env;
};