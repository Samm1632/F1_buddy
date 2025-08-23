import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/us_embassy_f1';

const faqSchema = new mongoose.Schema({
	q: String,
	a: String,
	citations: [{ title: String, url: String, domain: String }],
});

const FAQ = mongoose.model('FAQ', faqSchema);

async function main() {
	await mongoose.connect(MONGODB_URI);
	const json = JSON.parse(await readFile(new URL('../data/seeds/faqs.json', import.meta.url)));
	await FAQ.deleteMany({});
	await FAQ.insertMany(json);
	console.log(`Inserted ${json.length} FAQs`);
	await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });