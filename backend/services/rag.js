import { openaiClient, hasOpenAI } from "./openai.js";
import VisaDoc from "../models/VisaDoc.js";

export async function embedText(text) {
  const input = text.replace(/\s+/g, " ").trim();
  if (!hasOpenAI) {
    // Simple deterministic local embedding fallback: hash to fixed-length vector
    const length = 1536;
    const vec = new Array(length).fill(0);
    for (let i = 0; i < input.length; i += 1) {
      const code = input.charCodeAt(i);
      const idx = code % length;
      vec[idx] += (code % 13) / 13;
    }
    return vec;
  }
  const response = await openaiClient.embeddings.create({
    model: "text-embedding-3-small",
    input,
  });
  return response.data[0].embedding;
}

export function cosineSimilarity(vectorA, vectorB) {
  if (!vectorA || !vectorB || vectorA.length !== vectorB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vectorA.length; i += 1) {
    const a = vectorA[i];
    const b = vectorB[i];
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function getRelevantDocs(queryText, topK = 5) {
  const queryEmbedding = await embedText(queryText);

  const queryNorm = Math.sqrt(queryEmbedding.reduce((acc, val) => acc + val * val, 0));
  if (!Number.isFinite(queryNorm) || queryNorm === 0) {
    return [];
  }

  // Perform cosine similarity inside MongoDB via aggregation
  const results = await VisaDoc.aggregate([
    {
      $addFields: {
        dot: {
          $sum: {
            $map: {
              input: { $range: [0, { $size: "$embedding" }] },
              as: "idx",
              in: {
                $multiply: [
                  { $arrayElemAt: ["$embedding", "$$idx"] },
                  { $arrayElemAt: [queryEmbedding, "$$idx"] },
                ],
              },
            },
          },
        },
        normA: {
          $sqrt: {
            $sum: {
              $map: {
                input: "$embedding",
                as: "v",
                in: { $multiply: ["$$v", "$$v"] },
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        score: {
          $cond: [
            { $eq: [{ $multiply: ["$normA", queryNorm] }, 0] },
            0,
            { $divide: ["$dot", { $multiply: ["$normA", queryNorm] }] },
          ],
        },
      },
    },
    { $project: { title: 1, category: 1, content: 1, embedding: 1, score: 1 } },
    { $sort: { score: -1 } },
    { $limit: topK },
  ]).exec();

  return results;
}

export async function generateAnswer(question, contextDocs) {
  const contextText = contextDocs
    .map((d, i) => `Source ${i + 1}: [${d.title} - ${d.category}]\n${d.content}`)
    .join("\n\n");

  const system = `You are USA Visa Buddy, a helpful private visa guidance assistant.
Answer concisely and accurately using ONLY the provided sources. If unsure or missing info, say so and suggest consulting an immigration attorney.
Always include a brief "Sources" list referencing the source numbers used.`;

  if (!hasOpenAI) {
    const bullets = contextDocs.map((d, i) => `${i + 1}. ${d.title} (${d.category})`).join("\n");
    const summary = contextDocs.map(d => d.content).join("\n\n");
    return `Draft (offline mode):\n\n${summary}\n\nSources:\n${bullets}`;
  }

  const messages = [
    { role: "system", content: system },
    { role: "user", content: `Question: ${question}\n\nSources:\n${contextText}` },
  ];

  const completion = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.2,
  });

  const answer = completion.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate an answer.";
  return answer;
}

