import { getCollections } from './db.js';
import { embedText } from './embedding.js';
import { config } from './config.js';

let inMemoryIndex = [];

export async function buildIndex() {
  const { chunks } = getCollections();
  let docs;
  if (config.offline) {
    const cursor = chunks.find({}, { projection: { content: 1, embedding: 1, sourceUrl: 1, sourceTitle: 1, chunkIndex: 1 } });
    docs = await cursor.toArray();
  } else {
    const cursor = chunks.find(
      { embedding: { $exists: true } },
      { projection: { content: 1, embedding: 1, sourceUrl: 1, sourceTitle: 1, chunkIndex: 1 } }
    );
    docs = await cursor.toArray();
  }
  if (config.offline && (!docs || docs.length === 0)) {
    const offlineSeed = [
      {
        content: 'F-1 students are admitted for duration of status (D/S): you may remain in the U.S. for the time needed to complete your full course of study on Form I-20, including any authorized practical training, plus a 60-day grace period.',
        sourceUrl: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html',
        sourceTitle: 'Student Visa (F and M) — travel.state.gov',
        chunkIndex: 0,
      },
      {
        content: 'Maintaining F-1 status ties your stay to your program listed in SEVIS. After completion, most F-1 students have a 60-day grace period. Authorized OPT/STEM OPT occurs within that status window when properly approved.',
        sourceUrl: 'https://studyinthestates.dhs.gov/students',
        sourceTitle: 'Students — Study in the States (DHS)',
        chunkIndex: 0,
      },
      {
        content: 'Optional Practical Training (OPT) lets eligible F-1 students gain experience for up to 12 months; certain STEM fields may receive a 24-month extension.',
        sourceUrl: 'https://studyinthestates.dhs.gov/sevis-help-hub/student-records/fm-student-visa/f-1-optional-practical-training-opt',
        sourceTitle: 'F-1 Optional Practical Training (OPT) — DHS Study in the States',
        chunkIndex: 0,
      },
    ];
    const embeddings = await Promise.all(offlineSeed.map((d) => embedText(d.content)));
    docs = offlineSeed.map((d, i) => ({ ...d, embedding: embeddings[i] }));
  }
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

