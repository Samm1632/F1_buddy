<template>
	<div class="app">
		<header class="app__header">
			<h1>F‑1 Student Visa QnA</h1>
			<p class="subtitle">Local MEVN chatbot with official citations</p>
		</header>
		<main class="app__main">
			<ChatPanel />
		</main>
	</div>
</template>

<script setup lang="ts">
import ChatPanel from './components/ChatPanel.vue';
</script>

<style scoped>
.app { max-width: 900px; margin: 0 auto; padding: 24px; }
.app__header { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
.subtitle { color: #666; }
.app__main { background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 16px; }
</style>