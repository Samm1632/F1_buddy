<template>
	<div class="chat">
		<div class="messages card" ref="messagesRef">
			<div v-for="m in messages" :key="m.id" class="message" :class="m.role">
				<div class="bubble" v-html="m.content"></div>
				<ul v-if="m.citations?.length" class="citations">
					<li v-for="(c, i) in m.citations" :key="i"><a :href="c.url" target="_blank" rel="noopener">[{{ i + 1 }}] {{ c.title }}</a></li>
				</ul>
			</div>
			<div v-if="loading" class="message assistant"><div class="bubble">Thinking…</div></div>
		</div>

		<form class="composer card" @submit.prevent="submit">
			<input ref="inputRef" v-model="question" type="text" :placeholder="placeholder" :disabled="loading" />
			<button class="btn btn--primary" type="submit" :disabled="loading || !question.trim()">Ask</button>
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';

type Citation = { title: string; url: string; domain?: string };

type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string; citations?: Citation[] };

const question = ref('');
const loading = ref(false);
const messages = ref<ChatMessage[]>([]);
const messagesRef = ref<HTMLDivElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const placeholder = 'Ask about F‑1 visas (e.g., OPT, I‑20, SEVIS)';

function scrollBottom() {
	nextTick(() => messagesRef.value?.scrollTo({ top: messagesRef.value.scrollHeight, behavior: 'smooth' }));
}

async function submit() {
	const q = question.value.trim();
	if (!q) return;
	messages.value.push({ id: crypto.randomUUID(), role: 'user', content: q });
	question.value = '';
	loading.value = true;
	try {
		const resp = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q }) });
		const data = await resp.json();
		if (!resp.ok) throw new Error(data?.error || 'Request failed');
		messages.value.push({ id: crypto.randomUUID(), role: 'assistant', content: data.answer, citations: data.citations || [] });
	} catch (e) {
		messages.value.push({ id: crypto.randomUUID(), role: 'assistant', content: 'Sorry, I could not fetch an answer. Please try again once the backend is running.' });
	}
	loading.value = false;
	scrollBottom();
}

function prefill(text: string) {
	question.value = text;
	nextTick(() => inputRef.value?.focus());
}

defineExpose({ prefill });

onMounted(() => inputRef.value?.focus());
</script>

<style scoped>
.chat { display: flex; flex-direction: column; gap: 16px; }
.messages { padding: 12px; border-radius: 16px; background: rgba(255,255,255,0.85); border: 1px solid var(--border); max-height: 60vh; overflow-y: auto; }
.message { margin-bottom: 14px; display: flex; flex-direction: column; }
.message.user { align-items: flex-end; }
.message.assistant { align-items: flex-start; }
.bubble { max-width: 78%; padding: 12px 14px; border-radius: 14px; white-space: pre-wrap; line-height: 1.5; box-shadow: 0 2px 8px rgba(2,6,23,0.08); }
.message.user .bubble { background: #1e40af; color: #fff; border-top-right-radius: 4px; }
.message.assistant .bubble { background: #ffffff; color: var(--text); border: 1px solid var(--border); border-top-left-radius: 4px; }
.citations { margin: 6px 0 0 0; padding-left: 20px; font-size: 13px; color: var(--muted); }

.composer { display: flex; gap: 10px; padding: 12px; border-radius: 16px; background: rgba(255,255,255,0.9); border: 1px solid var(--border); }
.composer input { flex: 1; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--border); font-size: 14px; }
</style>