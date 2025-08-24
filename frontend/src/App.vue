<template>
	<div class="container">
		<div class="card">
			<div class="header">
				<div>
					<h1 class="header__title">F‑1 Visa Assistant</h1>
					<p class="header__subtitle">Professional guidance with citations to official sources</p>
				</div>
				<span class="badge">Local</span>
			</div>
			<div style="padding:16px 20px;">
				<div class="suggestions">
					<button class="suggestion" @click="prefill('What is the difference between CPT and OPT?')">CPT vs OPT</button>
					<button class="suggestion" @click="prefill('What documents do I need to reenter the US?')">Travel reentry docs</button>
					<button class="suggestion" @click="prefill('How do I qualify for the STEM OPT extension?')">STEM OPT</button>
				</div>
			</div>
		</div>

		<div class="card" style="margin-top:16px; padding: 16px 20px;">
			<ChatPanel ref="chatRef" />
		</div>
	</div>
</template>

<script setup lang="ts">
import ChatPanel from './components/ChatPanel.vue';
import { ref } from 'vue';

const chatRef = ref<InstanceType<typeof ChatPanel> | null>(null);

function prefill(text: string) {
	chatRef.value?.$emit('prefill', text);
}
</script>

<style scoped>
.app { max-width: 900px; margin: 0 auto; padding: 24px; font-family: Arial, Helvetica, sans-serif; }
</style>