<script setup lang="ts">
/**
 * T033: Page d'accueil — hero, démo chat, CTA Plan Pro
 */
import { useRouter } from 'vue-router'
import ChatWindow from '@/components/ChatWindow.vue'
import { useChat } from '@/composables/useChat'

const router = useRouter()
const { messages, loading, sendMessage } = useChat()

function handleSend(question: string) {
  sendMessage(question)
}

function goToChat() {
  router.push('/chat')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Header -->
    <header class="bg-gray-900 text-white">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <span class="text-xl font-bold tracking-tight">SST-QuickRef</span>
        </div>
        <nav class="flex items-center gap-4">
          <button
            type="button"
            class="min-h-[44px] min-w-[44px] px-5 py-2 rounded-lg bg-teal-600 text-white font-medium text-sm hover:bg-teal-700 transition-colors"
            @click="goToChat"
          >
            Ouvrir le chat
          </button>
        </nav>
      </div>
    </header>

    <!-- Hero -->
    <section class="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 text-white py-8 md:py-24">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 md:mb-4">
          SST-QuickRef
        </h1>
        <p class="text-lg md:text-2xl font-light text-teal-300 mb-2 md:mb-3">
          Assistant IA Réglementaire pour la Santé et Sécurité au Travail
        </p>
        <p class="text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed hidden md:block">
          Interrogez instantanément la législation suisse SST. Obtenez des réponses sourcées avec les articles de loi correspondants, directement depuis les textes officiels.
        </p>
      </div>
    </section>

    <!-- Demo chat section -->
    <section class="py-12 md:py-16 bg-gray-50">
      <div class="max-w-4xl mx-auto px-2 md:px-4">
        <h2 class="text-2xl font-bold text-gray-900 text-center mb-2">
          Essayez gratuitement
        </h2>
        <p class="text-sm text-gray-500 text-center mb-4 md:mb-8">
          Posez une question pour voir comment fonctionne l'assistant
        </p>
        <div class="h-[60vh] md:h-[520px]">
          <ChatWindow
            :messages="messages"
            :loading="loading"
            placeholder="Ex: hauteur garde-corps ? casque obligatoire ? échafaudage règles ?"
            @send="handleSend"
          />
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-12 md:py-16">
      <div class="max-w-5xl mx-auto px-4">
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Sources vérifiables</h3>
            <p class="text-sm text-gray-600">
              Chaque réponse cite les articles de loi avec un lien direct vers le texte officiel.
            </p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Réponse instantanée</h3>
            <p class="text-sm text-gray-600">
              Obtenez une réponse contextualisée en quelques secondes, sans parcourir des documents.
            </p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Réglementation suisse</h3>
            <p class="text-sm text-gray-600">
              OTConst, LTr, OLT, CFST et autres textes spécifiques au droit suisse SST.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA (masqué provisoirement — réactiver avec Stripe)
    <section class="py-12 md:py-16 bg-teal-600 text-white">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <h2 class="text-2xl md:text-3xl font-bold mb-3">
          Accès illimité pour les professionnels
        </h2>
        <p class="text-teal-100 mb-8 max-w-xl mx-auto">
          Le Plan Pro offre un nombre illimité de requêtes, un historique complet et un accès prioritaire aux mises à jour réglementaires.
        </p>
        <button
          type="button"
          class="min-h-[44px] min-w-[44px] inline-flex items-center px-8 py-3 rounded-xl bg-white text-teal-700 font-bold text-lg hover:bg-teal-50 transition-colors shadow-lg"
        >
          Plan Pro — CHF 29/mois
        </button>
      </div>
    </section>
    -->

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-8">
      <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded bg-teal-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-300">Securionis</span>
        </div>
        <p class="text-xs">
          &copy;{{ new Date().getFullYear() }} - Securionis
        </p>
      </div>
    </footer>
  </div>
</template>
