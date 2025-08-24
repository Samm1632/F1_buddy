import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { config } from '../config.js';

const client = new OpenAI({ apiKey: config.openaiApiKey });

async function main() {
  const datasetPath = path.resolve(process.cwd(), 'src/finetune/out/train.jsonl');
  if (!fs.existsSync(datasetPath)) {
    console.error('Dataset not found. Run: npm run finetune:build');
    process.exit(1);
  }

  // Upload file
  const file = await client.files.create({
    file: fs.createReadStream(datasetPath),
    purpose: 'fine-tune',
  });
  console.log('Uploaded dataset file id:', file.id);

  // Create job
  const job = await client.fineTuning.jobs.create({
    training_file: file.id,
    model: config.chatModel,
  });
  console.log('Fine-tune job started:', job.id);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

