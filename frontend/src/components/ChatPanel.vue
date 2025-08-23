<template>
	<div class="chat-panel">
		<div class="messages" ref="messagesRef">
			<div v-for="m in messages" :key="m.id" class="message" :class="m.role">
				<div class="bubble" v-html="m.content"></div>
				<div v-if="m.citations?.length" class="citations">
					<h4>Citations</h4>
					<ul>
						<li v-for="(c, idx) in m.citations" :key="idx">
							<a :href="c.url" target="_blank" rel="noopener noreferrer">[{{ idx + 1 }}] {{ c.title }}</a>
						</li>
					</ul>
				</div>
			</div>
			<div v-if="loading" class="message assistant"><div class="bubble">Thinking…</div></div>
		</div>
		<form class="input" @submit.prevent="submit">
			<input v-model="question" type="text" placeholder="Ask about F‑1 visas (e.g., OPT, I‑20, SEVIS)" :disabled="loading" />
			<button type="submit" :disabled="loading || !question.trim()">Ask</button>
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import axios from 'axios';

type Citation = { title: string; url: string; domain: string };

type ChatMessage = {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	citations?: Citation[];
};

const question = ref('');
const loading = ref(false);
const messages = ref<ChatMessage[]>([]);
const messagesRef = ref<HTMLDivElement | null>(null);

function scrollToBottom() {
	nextTick(() => {
		messagesRef.value?.scrollTo({ top: messagesRef.value.scrollHeight, behavior: 'smooth' });
	});
}

async function submit() {
	const q = question.value.trim();
	if (!q) return;
	messages.value.push({ id: crypto.randomUUID(), role: 'user', content: q });
	question.value = '';
	loading.value = true;
	try {
		const { data } = await axios.post('/api/ask', { question: q });
		messages.value.push({ id: crypto.randomUUID(), role: 'assistant', content: data.answer, citations: data.citations || [] });
	} catch (err: any) {
		messages.value.push({ id: crypto.randomUUID(), role: 'assistant', content: 'Error: failed to get an answer.' });
	} finally {
		loading.value = false;
		scrollToBottom();
	}
}
</script>

<style scoped>
.chat-panel { display: flex; flex-direction: column; gap: 12px; height: 70vh; }
.messages { flex: 1; overflow-y: auto; padding: 8px; border: 1px solid #eee; border-radius: 8px; background: #fafafa; }
.message { margin-bottom: 12px; display: flex; }
.message.user { justify-content: flex-end; }
.message.assistant { justify-content: flex-start; }
.bubble { max-width: 75%; padding: 10px 12px; border-radius: 12px; white-space: pre-wrap; line-height: 1.4; }
.message.user .bubble { background: #2563eb; color: #fff; border-top-right-radius: 2px; }
.message.assistant .bubble { background: #fff; border: 1px solid #eee; border-top-left-radius: 2px; }
.input { display: flex; gap: 8px; }
.input input { flex: 1; padding: 10px 12px; border-radius: 8px; border: 1px solid #ddd; }
.input button { padding: 10px 14px; border-radius: 8px; background: #16a34a; color: white; border: none; cursor: pointer; }
.citations { margin-top: 6px; font-size: 12px; }
.citations h4 { margin: 0 0 4px; font-size: 12px; color: #555; }
.citations ul { margin: 0; padding-left: 16px; }
</style>