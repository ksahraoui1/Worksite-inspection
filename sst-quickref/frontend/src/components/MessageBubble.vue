<script setup lang="ts">
/**
 * T026: Bulle de message utilisateur / assistant
 * Utilisateur: droite, bleu. Assistant: gauche, gris.
 * Rendu markdown-like: **gras**, listes, sauts de ligne
 */
import { computed } from 'vue'
import type { ChatMessage } from '@/types'

const props = defineProps<{
  message: ChatMessage
}>()

const isUser = computed(() => props.message.role === 'user')

const formattedTime = computed(() => {
  return props.message.timestamp.toLocaleTimeString('fr-CH', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

/**
 * Minimal markdown rendering: bold, unordered lists, ordered lists, line breaks.
 * Output is safe — we escape HTML first then apply formatting.
 */
const renderedContent = computed(() => {
  let text = props.message.content

  // Escape HTML
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Bold: **text**
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Unordered list items: lines starting with "- "
  text = text.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')

  // Ordered list items: lines starting with "1. ", "2. " etc
  text = text.replace(/^\d+\.\s(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')

  // Line breaks
  text = text.replace(/\n/g, '<br />')

  // Clean up <br /> around <li> tags
  text = text.replace(/<br \/><li/g, '<li')
  text = text.replace(/<\/li><br \/>/g, '</li>')

  return text
})
</script>

<template>
  <div
    class="flex w-full mb-4"
    :class="isUser ? 'justify-end' : 'justify-start'"
  >
    <div :class="isUser ? 'max-w-[85%] md:max-w-[70%]' : 'max-w-full w-full'">
      <!-- Bubble -->
      <div
        class="rounded-2xl px-4 py-3 text-sm leading-relaxed"
        :class="
          isUser
            ? 'bg-teal-600 text-white rounded-br-md'
            : message.refused
              ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-bl-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
        "
      >
        <!-- Refused notice -->
        <p v-if="message.refused && message.refused_reason" class="text-xs font-medium text-amber-700 mb-2">
          Question hors sujet : {{ message.refused_reason }}
        </p>

        <!-- eslint-disable vue/no-v-html -->
        <div v-html="renderedContent" />
      </div>

      <!-- Timestamp -->
      <p
        class="mt-1 text-[11px] text-gray-400"
        :class="isUser ? 'text-right' : 'text-left'"
      >
        {{ formattedTime }}
      </p>

      <!-- Slot for feedback (assistant messages only) -->
      <div v-if="!isUser">
        <slot />
      </div>
    </div>
  </div>
</template>
