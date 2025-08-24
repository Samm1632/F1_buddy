import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3001),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  OPENAI_API_KEY: z.string().optional(),
  EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  CHAT_MODEL: z.string().default('gpt-4o-mini'),
  ORIGINS: z.string().default('http://localhost:5173'),
  ENABLE_OFFLINE: z.coerce.boolean().default(false),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

export const config = {
  port: raw.PORT,
  mongodbUri: raw.MONGODB_URI,
  openaiApiKey: raw.OPENAI_API_KEY || '',
  embeddingModel: raw.EMBEDDING_MODEL,
  chatModel: raw.CHAT_MODEL,
  corsOrigins: raw.ORIGINS.split(',').map((s) => s.trim()).filter(Boolean),
  offline: raw.ENABLE_OFFLINE,
  rag: {
    topK: 6,
    maxChunkChars: 1200,
  },
};

if (!config.offline && !config.openaiApiKey) {
  console.error('OPENAI_API_KEY is required unless ENABLE_OFFLINE=true');
  process.exit(1);
}

