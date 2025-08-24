import { MongoClient } from 'mongodb';
import { config } from './config.js';

let client;
let db;

export async function connectToDatabase() {
  if (db) return db;
  client = new MongoClient(config.mongodbUri, {
    maxPoolSize: 10,
  });
  await client.connect();
  db = client.db();
  await ensureIndexes();
  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not connected yet');
  return db;
}

export function getCollections() {
  const database = getDb();
  return {
    sources: database.collection('sources'),
    chunks: database.collection('chunks'),
  };
}

async function ensureIndexes() {
  const database = getDb();
  await database.collection('sources').createIndex({ url: 1 }, { unique: true });
  await database.collection('chunks').createIndex({ sourceId: 1, chunkIndex: 1 }, { unique: true });
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = undefined;
    db = undefined;
  }
}

