import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

export const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

if (!hasOpenAI) {
  console.warn("OPENAI_API_KEY is not set. Falling back to local embeddings and template answers for development.");
}

export const openaiClient = hasOpenAI ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

