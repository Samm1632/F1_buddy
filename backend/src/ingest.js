import axios from 'axios';
import { htmlToText } from 'html-to-text';
import { connectToDatabase, getCollections } from './db.js';
import { embedBatch } from './embedding.js';
import { buildIndex } from './vectorStore.js';
import { config } from './config.js';

const SEED_SOURCES = [
  {
    url: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html',
    title: 'Student Visa (F and M) — travel.state.gov',
  },
  {
    url: 'https://studyinthestates.dhs.gov/students',
    title: 'Students — Study in the States (DHS)',
  },
  {
    url: 'https://studyinthestates.dhs.gov/students/students-and-the-form-i-20',
    title: 'Students and the Form I-20 — DHS Study in the States',
  },
  {
    url: 'https://studyinthestates.dhs.gov/sevis-help-hub/student-records/fm-student-visa/f-1-optional-practical-training-opt',
    title: 'F-1 Optional Practical Training (OPT) — DHS Study in the States',
  },
  {
    url: 'https://www.ice.gov/sevis/practical-training',
    title: 'SEVIS Practical Training — ICE.gov',
  },
];

function chunkText(text, maxChars) {
  const chunks = [];
  let start = 0;
  const overlap = Math.floor(maxChars * 0.1);
  while (start < text.length) {
    const end = Math.min(text.length, start + maxChars);
    const slice = text.slice(start, end);
    chunks.push(slice.trim());
    start = end - overlap;
    if (start < 0) start = 0;
    if (start >= text.length) break;
  }
  return chunks.filter((c) => c.length > 50);
}

async function fetchAndExtract(url) {
  const res = await axios.get(url, { timeout: 30000, headers: { 'User-Agent': 'MEVN-F1-Assistant/0.1' } });
  const html = res.data;
  const text = htmlToText(html, {
    wordwrap: false,
    selectors: [
      { selector: 'script', format: 'skip' },
      { selector: 'style', format: 'skip' },
      { selector: 'nav', format: 'skip' },
      { selector: 'footer', format: 'skip' },
    ],
  });
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : url;
  return { title, text };
}

async function ingestOne({ url, title }) {
  const { sources, chunks } = getCollections();
  const { title: extractedTitle, text } = await fetchAndExtract(url);
  const finalTitle = title || extractedTitle;
  const textChunks = chunkText(text, config.rag.maxChunkChars);
  const embeddings = await embedBatch(textChunks);

  const now = new Date();
  const sourceRes = await sources.findOneAndUpdate(
    { url },
    { $set: { url, title: finalTitle, fetchedAt: now } },
    { upsert: true, returnDocument: 'after' }
  );
  const sourceId = sourceRes.value?._id || sourceRes.lastErrorObject?.upserted;

  const bulk = chunks.initializeUnorderedBulkOp();
  for (let i = 0; i < textChunks.length; i++) {
    bulk.find({ sourceId, chunkIndex: i }).upsert().updateOne({
      $set: {
        sourceId,
        sourceUrl: url,
        sourceTitle: finalTitle,
        chunkIndex: i,
        content: textChunks[i],
        embedding: embeddings[i],
        updatedAt: now,
      },
    });
  }
  if (bulk.s.currentBatch && bulk.s.currentBatch.operations.length > 0) {
    await bulk.execute();
  }
}

async function main() {
  await connectToDatabase();
  for (const s of SEED_SOURCES) {
    console.log('Ingesting', s.url);
    try {
      await ingestOne(s);
    } catch (err) {
      console.error('Failed to ingest', s.url, err.message);
    }
  }
  await buildIndex();
  console.log('Ingestion complete');
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

