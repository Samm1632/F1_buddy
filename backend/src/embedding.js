import OpenAI from 'openai';
import { config } from './config.js';

const client = config.offline
  ? null
  : new OpenAI({ apiKey: config.openaiApiKey });

export async function embedText(text) {
  if (config.offline) return pseudoEmbed(text);
  const input = text.length > 8000 ? text.slice(0, 8000) : text;
  const res = await client.embeddings.create({
    model: config.embeddingModel,
    input,
  });
  return res.data[0].embedding;
}

export async function embedBatch(texts) {
  if (config.offline) return texts.map((t) => pseudoEmbed(t));
  const inputs = texts.map((t) => (t.length > 8000 ? t.slice(0, 8000) : t));
  const res = await client.embeddings.create({
    model: config.embeddingModel,
    input: inputs,
  });
  return res.data.map((d) => d.embedding);
}

export function getOpenAIClient() {
  if (config.offline) return {
    chat: {
      completions: {
        create: async () => ({ choices: [{ message: { content: 'Offline mode: Unable to fetch live answer. Use citations shown.' } }] }),
      },
    },
  };
  return client;
}

function pseudoEmbed(text) {
  // Simple deterministic hashing to vector-like array for offline search demos
  const out = new Array(256).fill(0);
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    out[c % out.length] += 1;
  }
  const norm = Math.sqrt(out.reduce((s, v) => s + v * v, 0)) || 1;
  return out.map((v) => v / norm);
}

