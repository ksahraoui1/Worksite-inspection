<script setup lang="ts">
/**
 * T025: Fenêtre de chat — conteneur messages, champ de saisie, envoi
 * Auto-scroll, spinner de chargement, touch targets 44px min
 */
import { ref, nextTick, watch, onMounted } from 'vue'
import type { ChatMessage } from '@/types'
import MessageBubble from './MessageBubble.vue'
import FeedbackButton from './FeedbackButton.vue'

const props = withDefaults(
  defineProps<{
    messages: ChatMessage[]
    loading?: boolean
    disabled?: boolean
    placeholder?: string
  }>(),
  {
    loading: false,
    disabled: false,
    placeholder: 'Posez votre question réglementaire SST...',
  }
)

const emit = defineEmits<{
  send: [question: string]
}>()

const inputText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function handleSend() {
  const question = inputText.value.trim()
  if (!question || props.loading || props.disabled) return
  emit('send', question)
  inputText.value = ''

  // Reset textarea height
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  })
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function autoResize(event: Event) {
  const target = event.target as HTMLTextAreaElement
  target.style.height = 'auto'
  target.style.height = Math.min(target.scrollHeight, 160) + 'px'
}

// Auto-scroll on new messages
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(
  () => props.messages.length,
  () => scrollToBottom()
)

watch(
  () => props.loading,
  () => scrollToBottom()
)

onMounted(() => scrollToBottom())
</script>

<template>
  <div class="flex flex-col h-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
    <!-- Messages area -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-4 py-6 space-y-1"
    >
      <!-- Empty state -->
      <div
        v-if="messages.length === 0 && !loading"
        class="flex flex-col items-center justify-center h-full text-center px-6"
      >
        <div class="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-1">
          Assistant IA Réglementaire
        </h3>
        <p class="text-sm text-gray-500 max-w-md">
          Posez vos questions sur la réglementation SST suisse. Je cite mes sources avec les articles de loi correspondants.
        </p>
      </div>

      <!-- Message list -->
      <MessageBubble
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
      >
        <FeedbackButton
          v-if="msg.role === 'assistant' && msg.query_id && !msg.refused"
          :query-id="msg.query_id"
        />
      </MessageBubble>

      <!-- Loading indicator -->
      <div v-if="loading" class="flex justify-start mb-4">
        <div class="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style="animation-delay: 0ms" />
            <span class="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style="animation-delay: 150ms" />
            <span class="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style="animation-delay: 300ms" />
          </div>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="border-t border-gray-200 bg-gray-50 p-3">
      <div class="flex items-end gap-2 max-w-4xl mx-auto">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          :placeholder="placeholder"
          :disabled="disabled || loading"
          rows="1"
          class="flex-1 resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          @keydown="handleKeydown"
          @input="autoResize"
        />
        <button
          type="button"
          :disabled="!inputText.trim() || loading || disabled"
          class="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Envoyer"
          @click="handleSend"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
