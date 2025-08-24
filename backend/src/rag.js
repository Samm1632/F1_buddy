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
  if (config.offline) {
    const answer = composeOfflineAnswer(question, topChunks, citations);
    return { answer, citations };
  }
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

function composeOfflineAnswer(question, chunks, citations) {
  const lc = question.toLowerCase();
  const durationLike = /duration|how long|stay|validity|grace/i.test(lc);
  if (durationLike) {
    // Search for key facts in chunks
    const text = chunks.map((c) => c.content).join('\n');
    const statements = [];
    if (/duration of status|D\/S/i.test(text)) statements.push('F-1 status is admitted for duration of status (D/S), tied to your program. [1]');
    if (/60[- ]day grace/i.test(text)) statements.push('You typically have a 60-day grace period after completing your program. [1][2]');
    if (/OPT/i.test(text)) statements.push('Authorized OPT (and eligible STEM OPT extension) occurs within that status window. [3]');
    if (statements.length) {
      return statements.join(' ');
    }
  }
  // Fallback generic concise answer using first citation
  const first = citations[0]?.id ? `[${citations[0].id}]` : '';
  return `Refer to official guidance for exact rules ${first}.`;
}

