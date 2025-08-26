<template>
  <div class="container">
    <div class="header">🇺🇸 USA Visa Buddy</div>
    <div class="chat" ref="chatRef">
      <div v-for="(m, i) in messages" :key="i" class="bubble" :class="m.role === 'user' ? 'user' : 'bot'">
        <div>{{ m.content }}</div>
        <div v-if="m.sources?.length" class="sources">Sources: {{ m.sources.map(s => s.title).join('; ') }}</div>
      </div>
      <div v-if="loading" class="bubble bot">Thinking...</div>
    </div>
    <form class="inputRow" @submit.prevent="ask">
      <input class="input" v-model="input" :disabled="loading" placeholder="Ask about any U.S. visa..." />
      <button class="btn" :disabled="loading || !trimmed" type="submit">Ask</button>
    </form>
  </div>
  </template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import axios from 'axios'

const input = ref('')
const messages = ref([
  { role: 'assistant', content: 'Hi! I am your USA Visa Buddy. How can I help you today?' }
])
const loading = ref(false)
const chatRef = ref(null)

const trimmed = computed(() => input.value.trim())

async function ask(){
  const q = trimmed.value
  if(!q) return
  messages.value.push({ role: 'user', content: q })
  input.value = ''
  loading.value = true
  await nextTick(); scrollToBottom()
  try {
    const { data } = await axios.post('/api/query', { question: q })
    messages.value.push({ role: 'assistant', content: data.answer, sources: data.sources })
  } catch (e) {
    messages.value.push({ role: 'assistant', content: 'Sorry, something went wrong while fetching the answer.' })
  } finally {
    loading.value = false
    await nextTick(); scrollToBottom()
  }
}

function scrollToBottom(){
  if(chatRef.value){
    chatRef.value.scrollTop = chatRef.value.scrollHeight
  }
}
</script>

<style scoped>
</style>

