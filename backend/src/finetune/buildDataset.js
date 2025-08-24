import fs from 'fs';
import path from 'path';

// Minimal stub: prepares a few Q/A examples for fine-tuning chat models
// Output: backend/src/finetune/out/train.jsonl

const OUT_DIR = path.resolve(process.cwd(), 'src/finetune/out');
const OUT_FILE = path.join(OUT_DIR, 'train.jsonl');

const examples = [
  {
    messages: [
      { role: 'system', content: 'You are a helpful assistant for U.S. F-1 visa questions.' },
      { role: 'user', content: 'What is OPT for F-1 students?' },
      { role: 'assistant', content: 'Optional Practical Training (OPT) allows eligible F-1 students to get practical training related to their major for up to 12 months after completing their program. [1]' },
    ],
  },
  {
    messages: [
      { role: 'system', content: 'You are a helpful assistant for U.S. F-1 visa questions.' },
      { role: 'user', content: 'Do I need an I-20 to apply for an F-1 visa?' },
      { role: 'assistant', content: 'Yes. An I-20 issued by a SEVP-certified school is required to apply for an F-1 visa. [2]' },
    ],
  },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeJsonl(file, rows) {
  const fd = fs.openSync(file, 'w');
  try {
    for (const row of rows) {
      fs.writeSync(fd, JSON.stringify(row) + '\n');
    }
  } finally {
    fs.closeSync(fd);
  }
}

function main() {
  ensureDir(OUT_DIR);
  writeJsonl(OUT_FILE, examples);
  console.log('Wrote fine-tune dataset to', OUT_FILE);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

