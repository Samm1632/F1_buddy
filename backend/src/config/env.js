export const getEnv = () => ({
	NODE_ENV: process.env.NODE_ENV || 'development',
	PORT: Number(process.env.PORT || 3001),
	OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
	OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
	ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:5173',
});