import OpenAI from 'openai';
import { config } from './config.js';

const client = new OpenAI({ apiKey: config.openaiApiKey });

export async function embedText(text) {
  const input = text.length > 8000 ? text.slice(0, 8000) : text;
  const res = await client.embeddings.create({
    model: config.embeddingModel,
    input,
  });
  return res.data[0].embedding;
}

export async function embedBatch(texts) {
  const inputs = texts.map((t) => (t.length > 8000 ? t.slice(0, 8000) : t));
  const res = await client.embeddings.create({
    model: config.embeddingModel,
    input: inputs,
  });
  return res.data.map((d) => d.embedding);
}

export function getOpenAIClient() {
  return client;
}

