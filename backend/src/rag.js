import { searchSimilarChunks } from './vectorStore.js';
import { getOpenAIClient } from './embedding.js';
import { config } from './config.js';

function buildPrompt(question, topChunks) {
  const uniqueByUrl = [];
  const urlToId = new Map();
  let idCounter = 1;
  for (const chunk of topChunks) {
    if (!urlToId.has(chunk.sourceUrl)) {
      urlToId.set(chunk.sourceUrl, idCounter++);
      uniqueByUrl.push({
        id: urlToId.get(chunk.sourceUrl),
        title: chunk.sourceTitle || chunk.sourceUrl,
        url: chunk.sourceUrl,
      });
    }
  }

  const sourcesList = uniqueByUrl
    .map((s) => `[${s.id}] ${s.title} (${s.url})`)
    .join('\n');

  const excerpts = topChunks
    .map((c) => `From [${urlToId.get(c.sourceUrl)}] ${c.sourceTitle || c.sourceUrl}, excerpt:\n"""\n${c.content}\n"""`)
    .join('\n\n');

  const system = `You are a helpful assistant for international students about U.S. F-1 visa rules.
Answer ONLY using the provided excerpts. If the answer is not present, say you don't know.
Always include inline citations like [1], [2] that correspond to the Sources mapping.
Be accurate and concise. Do not invent content beyond the excerpts.`;

  const user = `Question: ${question}

Sources:
${sourcesList}

Excerpts:
${excerpts}`;

  return { system, user, citations: uniqueByUrl };
}

export async function answerQuestion(question) {
  const topChunks = await searchSimilarChunks(question);
  const { system, user, citations } = buildPrompt(question, topChunks);
  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: config.chatModel,
    temperature: 0.2,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  const answer = completion.choices?.[0]?.message?.content?.trim() || '';
  return { answer, citations };
}

