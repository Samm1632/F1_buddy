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
    url: 'https://studyinthestates.dhs.gov/sevis-help-hub/student-records/fm-student-visa/f-1-optional-practical-training-opt',
    title: 'F-1 Optional Practical Training (OPT) — DHS Study in the States',
  },
];

const OFFLINE_DOCS = [
  {
    url: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html',
    title: 'Student Visa (F and M) — travel.state.gov',
    text: `F-1 nonimmigrant students are admitted for duration of status (D/S). This means you may remain in the United States for the length of time required to complete your full course of study as indicated on your Form I-20, including any authorized practical training, and a 60-day grace period to prepare for departure, transfer, or change of status. Visa validity on the visa foil does not control how long you may stay in the United States; your admission and status are governed by U.S. Customs and Border Protection and DHS.`,
  },
  {
    url: 'https://studyinthestates.dhs.gov/students',
    title: 'Students — Study in the States (DHS)',
    text: `To maintain F-1 status, students must enroll full time, keep their Form I-20 accurate, and follow the rules for any employment authorization. Your stay in the United States is tied to maintaining status and the educational program listed in SEVIS. When you complete your program, you may be eligible for a 60-day grace period.`,
  },
  {
    url: 'https://studyinthestates.dhs.gov/sevis-help-hub/student-records/fm-student-visa/f-1-optional-practical-training-opt',
    title: 'F-1 Optional Practical Training (OPT) — DHS Study in the States',
    text: `Optional Practical Training (OPT) allows eligible F-1 students to gain practical experience directly related to their major area of study. Most students may receive up to 12 months of OPT. Certain STEM degree holders may be eligible for a 24‑month STEM OPT extension after completing regular OPT. OPT is part of the duration of status when properly authorized and reported.`,
  },
];

function chunkText(text, maxChars) {
  const chunks = [];
  const overlap = Math.min(Math.floor(maxChars * 0.1), Math.floor(maxChars / 2));
  const step = Math.max(1, maxChars - overlap);
  for (let start = 0; start < text.length; start += step) {
    const end = Math.min(text.length, start + maxChars);
    const slice = text.slice(start, end).trim();
    if (slice.length > 0) chunks.push(slice);
    if (end >= text.length) break;
  }
  return chunks.filter((c) => c.length > 50);
}

async function fetchAndExtract(url) {
  const res = await axios.get(url, {
    timeout: 30000,
    maxContentLength: 5 * 1024 * 1024,
    headers: { 'User-Agent': 'MEVN-F1-Assistant/0.1' },
  });
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

async function ingestOne({ url, title, text: presetText }) {
  const { sources, chunks } = getCollections();
  let extractedTitle = title;
  let text = presetText;
  if (!text) {
    const fetched = await fetchAndExtract(url);
    extractedTitle = fetched.title;
    text = fetched.text;
  }
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
  const list = config.offline ? OFFLINE_DOCS : SEED_SOURCES;
  for (const s of list) {
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

