<template>
	<div class="app">
		<h1>F‑1 Student Visa QnA</h1>
		<p class="subtitle">Local MEVN chatbot with official citations</p>
		<ChatPanel />
	</div>
</template>

<script setup lang="ts">
import ChatPanel from './components/ChatPanel.vue';
</script>

<style scoped>
.app { max-width: 900px; margin: 0 auto; padding: 24px; }
.subtitle { color: #666; margin-top: -8px; margin-bottom: 16px; }
</style>