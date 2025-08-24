import { MongoClient } from 'mongodb';
import { config } from './config.js';

let client;
let db;
let memoryMode = false;
let memState = undefined;

export async function connectToDatabase() {
  if (db) return db;
  const useMemory = config.offline || (config.mongodbUri || '').includes('memory://');
  if (useMemory) {
    memoryMode = true;
    memState = createMemoryDb();
    db = memState;
    await ensureIndexes();
    console.log('Using in-process memory DB');
    return db;
  } else {
    client = new MongoClient(config.mongodbUri, { maxPoolSize: 10 });
    await client.connect();
    db = client.db();
    await ensureIndexes();
    return db;
  }
}

export function getDb() {
  if (!db) throw new Error('Database not connected yet');
  return db;
}

export function getCollections() {
  const database = getDb();
  if (memoryMode) return memState.collections;
  return {
    sources: database.collection('sources'),
    chunks: database.collection('chunks'),
  };
}

async function ensureIndexes() {
  if (memoryMode) return; // no-op
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
  memState = undefined;
}

// Simple in-process memory DB implementation sufficient for our code paths
function createMemoryDb() {
  let idCounter = 1;
  const sources = [];
  const chunks = [];

  function makeId() {
    return `${Date.now().toString(36)}_${idCounter++}`;
  }

  function match(doc, query) {
    return Object.entries(query).every(([k, v]) => doc[k] === v);
  }

  function project(doc, projection) {
    if (!projection) return { ...doc };
    const out = {};
    for (const [k, include] of Object.entries(projection)) {
      if (include && k in doc) out[k] = doc[k];
    }
    return out;
  }

  function collection(arr) {
    return {
      async findOneAndUpdate(filter, update, options) {
        const idx = arr.findIndex((d) => match(d, filter));
        const nowSet = update?.$set || {};
        let value;
        if (idx >= 0) {
          arr[idx] = { ...arr[idx], ...nowSet };
          value = arr[idx];
        } else if (options?.upsert) {
          const doc = { _id: makeId(), ...nowSet };
          arr.push(doc);
          value = doc;
        }
        return { value, lastErrorObject: { upserted: value?._id } };
      },
      async updateOne(filter, update, options) {
        const idx = arr.findIndex((d) => match(d, filter));
        const nowSet = update?.$set || {};
        if (idx >= 0) {
          arr[idx] = { ...arr[idx], ...nowSet };
          return { matchedCount: 1, modifiedCount: 1, upsertedId: null };
        } else if (options?.upsert) {
          const doc = { _id: makeId(), ...nowSet };
          arr.push(doc);
          return { matchedCount: 0, modifiedCount: 0, upsertedId: doc._id };
        }
        return { matchedCount: 0, modifiedCount: 0, upsertedId: null };
      },
      find(query, options) {
        const results = arr.filter((d) => match(d, query)).map((d) => project(d, options?.projection));
        return {
          async toArray() {
            return results;
          },
        };
      },
    };
  }

  return {
    collections: {
      sources: collection(sources),
      chunks: collection(chunks),
    },
  };
}

