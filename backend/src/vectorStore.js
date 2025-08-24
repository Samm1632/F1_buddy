import { getCollections } from './db.js';
import { embedText } from './embedding.js';
import { config } from './config.js';

let inMemoryIndex = [];

export async function buildIndex() {
  const { chunks } = getCollections();
  const cursor = chunks.find(
    { embedding: { $exists: true } },
    { projection: { content: 1, embedding: 1, sourceUrl: 1, sourceTitle: 1, chunkIndex: 1 } }
  );
  const docs = await cursor.toArray();
  inMemoryIndex = docs.map((d) => ({
    content: d.content,
    embedding: d.embedding,
    sourceUrl: d.sourceUrl,
    sourceTitle: d.sourceTitle,
    chunkIndex: d.chunkIndex,
  }));
  console.log(`Vector index loaded with ${inMemoryIndex.length} chunks`);
}

export async function searchSimilarChunks(queryText, topK = config.rag.topK) {
  if (inMemoryIndex.length === 0) await buildIndex();
  const queryEmbedding = await embedText(queryText);
  const scored = inMemoryIndex.map((d) => ({ d, score: cosineSimilarity(queryEmbedding, d.embedding) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => ({ ...s.d, score: s.score }));
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

