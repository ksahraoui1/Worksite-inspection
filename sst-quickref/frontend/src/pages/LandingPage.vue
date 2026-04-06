<script setup lang="ts">
/**
 * Landing page marketing — conversion-optimized
 * SST-QuickRef: Assistant IA Réglementaire Suisse SST
 */
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import ChatWindow from '@/components/ChatWindow.vue'
import { useChat } from '@/composables/useChat'
import { createCheckoutSession, setSubscriberEmail } from '@/services/quickref-api'

const router = useRouter()
const { messages, loading, sendMessage } = useChat()

// Header scroll state
const scrollY = ref(0)
const headerSolid = computed(() => scrollY.value > 60)

function handleScroll() {
  scrollY.value = window.scrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  startCounters()
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Smooth scroll
function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

// Demo
function handleSend(question: string) {
  sendMessage(question)
}

function askExample(q: string) {
  sendMessage(q)
  scrollTo('demo')
}

function goToChat() {
  router.push('/chat')
}

// Animated counters
const counterSources = ref(0)
const counterChunks = ref(0)
const counterSpeed = ref(0)

function animateCounter(target: number, setter: (v: number) => void, duration: number) {
  const start = performance.now()
  function tick(now: number) {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    setter(Math.round(target * eased))
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

function startCounters() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(39, (v) => (counterSources.value = v), 1800)
          animateCounter(4480, (v) => (counterChunks.value = v), 2200)
          animateCounter(5, (v) => (counterSpeed.value = v), 1200)
          observer.disconnect()
        }
      })
    },
    { threshold: 0.3 }
  )
  const el = document.getElementById('stats')
  if (el) observer.observe(el)
}

// FAQ
const faqItems = [
  {
    q: 'Quelle est la fiabilité des réponses ?',
    a: 'SST-QuickRef utilise exclusivement les textes officiels publiés sur Fedlex. Chaque réponse cite les articles précis avec un lien direct vers la source. L\'IA ne fabrique pas d\'information — elle extrait et synthétise uniquement à partir du corpus réglementaire indexé.',
  },
  {
    q: 'Quels textes réglementaires sont couverts ?',
    a: '39 textes suisses : OTConst, LAA, LTr, OLT 1-5, OPA, OChim, OPB, OICF, OIBT, OPair, OSPS, directives CFST (6508, 6501-6516), ESTI 407, et plus encore. Le corpus est régulièrement enrichi.',
  },
  {
    q: 'Mes données sont-elles protégées ?',
    a: 'Vos questions sont anonymisées avant tout traitement. Aucune donnée personnelle n\'est conservée. L\'infrastructure est hébergée en Suisse et respecte les exigences de la LPD.',
  },
  {
    q: 'L\'application fonctionne-t-elle hors ligne ?',
    a: 'Oui. Les 50 dernières réponses sont mises en cache localement. Vous pouvez les consulter sur chantier même sans connexion internet.',
  },
  {
    q: 'Comment annuler mon abonnement Pro ?',
    a: 'L\'annulation est immédiate et sans engagement. Un simple email suffit. Vous conservez l\'accès Pro jusqu\'à la fin de la période facturée.',
  },
]
const openFaq = ref<number | null>(null)
function toggleFaq(i: number) {
  openFaq.value = openFaq.value === i ? null : i
}

// Subscribe modal
const showSubscribeModal = ref(false)
const subscribeEmail = ref('')
const subscribeLoading = ref(false)
const subscribeError = ref('')

async function handleSubscribe() {
  if (!subscribeEmail.value || !subscribeEmail.value.includes('@')) {
    subscribeError.value = 'Veuillez entrer un email valide.'
    return
  }
  subscribeLoading.value = true
  subscribeError.value = ''
  try {
    const url = await createCheckoutSession(subscribeEmail.value)
    setSubscriberEmail(subscribeEmail.value)
    window.location.href = url
  } catch {
    subscribeError.value = 'Erreur lors de la création du paiement. Réessayez.'
    subscribeLoading.value = false
  }
}

// Scroll reveal
const revealed = ref(new Set<string>())

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          revealed.value.add(entry.target.id)
        }
      })
    },
    { threshold: 0.15 }
  )
  document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))
})
</script>

<template>
  <div class="min-h-screen" style="font-family: 'DM Sans', sans-serif">
    <!-- ===== STICKY HEADER ===== -->
    <header
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      :class="headerSolid ? 'bg-gray-950/95 backdrop-blur-md shadow-xl shadow-black/20' : 'bg-transparent'"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <!-- Shield logo -->
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <span class="text-lg font-bold text-white tracking-tight">SST-QuickRef</span>
        </div>
        <nav class="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <button class="hover:text-white transition-colors" @click="scrollTo('features')">Fonctions</button>
          <button class="hover:text-white transition-colors" @click="scrollTo('demo')">Démo</button>
          <button class="hover:text-white transition-colors" @click="scrollTo('pricing')">Tarifs</button>
          <button class="hover:text-white transition-colors" @click="scrollTo('faq')">FAQ</button>
        </nav>
        <button
          class="min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-400 transition-all hover:shadow-lg hover:shadow-teal-500/25"
          @click="goToChat"
        >
          Ouvrir le chat
        </button>
      </div>
    </header>

    <!-- ===== HERO ===== -->
    <section class="relative min-h-screen flex items-center overflow-hidden bg-gray-950">
      <!-- Animated background -->
      <div class="absolute inset-0">
        <!-- Gradient mesh -->
        <div class="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
        <!-- Teal glow orbs -->
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-1/4 right-1/6 w-80 h-80 bg-teal-400/6 rounded-full blur-3xl animate-pulse" style="animation-delay: 1.5s"></div>
        <div class="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 3s"></div>
        <!-- Grid pattern -->
        <div class="absolute inset-0 opacity-[0.03]" style="background-image: linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px); background-size: 60px 60px;"></div>
      </div>

      <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20 text-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium mb-8 tracking-wide uppercase">
          <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
          Propulsé par l'IA — 39 sources réglementaires suisses
        </div>

        <!-- Main headline -->
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6" style="font-family: 'DM Serif Display', serif">
          Ne cherchez plus.<br />
          <span class="bg-gradient-to-r from-teal-300 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Demandez.</span>
        </h1>

        <p class="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
          SST-QuickRef interroge instantanément la législation suisse SST et vous donne des
          <strong class="text-gray-200">réponses sourcées avec les articles de loi</strong>,
          directement depuis les textes officiels.
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            class="min-h-[52px] px-8 py-3.5 rounded-xl bg-teal-500 text-white font-semibold text-base hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20 hover:shadow-teal-400/30 hover:-translate-y-0.5"
            @click="scrollTo('demo')"
          >
            Essayer gratuitement
          </button>
          <button
            class="min-h-[52px] px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 font-semibold text-base hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-0.5"
            @click="scrollTo('pricing')"
          >
            Plan Pro — CHF 29/mois
          </button>
        </div>

        <!-- Stats -->
        <div id="stats" class="grid grid-cols-3 max-w-lg mx-auto gap-6">
          <div class="text-center">
            <div class="text-3xl sm:text-4xl font-bold text-white tabular-nums">{{ counterSources }}</div>
            <div class="text-xs sm:text-sm text-gray-500 mt-1">sources officielles</div>
          </div>
          <div class="text-center">
            <div class="text-3xl sm:text-4xl font-bold text-white tabular-nums">{{ counterChunks.toLocaleString('fr-CH') }}+</div>
            <div class="text-xs sm:text-sm text-gray-500 mt-1">articles indexés</div>
          </div>
          <div class="text-center">
            <div class="text-3xl sm:text-4xl font-bold text-white tabular-nums">&lt;{{ counterSpeed }}s</div>
            <div class="text-xs sm:text-sm text-gray-500 mt-1">par réponse</div>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </section>

    <!-- ===== PAIN POINTS ===== -->
    <section class="py-20 md:py-28 bg-gray-950 border-t border-white/5">
      <div
        id="pain"
        data-reveal
        class="max-w-5xl mx-auto px-4 sm:px-6 transition-all duration-1000"
        :class="revealed.has('pain') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <div class="text-center mb-14">
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4" style="font-family: 'DM Serif Display', serif">
            Le problème que vous connaissez
          </h2>
          <p class="text-gray-400 max-w-xl mx-auto">
            Chaque jour, des professionnels SST perdent un temps précieux à chercher la bonne réglementation.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <!-- Pain 1 -->
          <div class="relative group p-6 rounded-2xl bg-gradient-to-b from-red-500/5 to-transparent border border-red-500/10 hover:border-red-500/20 transition-all">
            <div class="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">Des heures de recherche</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              Parcourir 198+ pages de textes réglementaires pour trouver l'article pertinent. Le temps perdu ne revient jamais.
            </p>
          </div>

          <!-- Pain 2 -->
          <div class="relative group p-6 rounded-2xl bg-gradient-to-b from-amber-500/5 to-transparent border border-amber-500/10 hover:border-amber-500/20 transition-all">
            <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">Risque d'oubli</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              Une exigence manquée, un article méconnu — et c'est l'accident ou la sanction. La complexité réglementaire est un piège constant.
            </p>
          </div>

          <!-- Pain 3 -->
          <div class="relative group p-6 rounded-2xl bg-gradient-to-b from-rose-500/5 to-transparent border border-rose-500/10 hover:border-rose-500/20 transition-all">
            <div class="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">Amendes et responsabilité</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              Une non-conformité sur chantier peut coûter des dizaines de milliers de francs — sans compter la responsabilité pénale.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== LIVE DEMO ===== -->
    <section id="demo" class="py-20 md:py-28 bg-gray-900">
      <div
        id="demo-reveal"
        data-reveal
        class="max-w-4xl mx-auto px-4 sm:px-6 transition-all duration-1000"
        :class="revealed.has('demo-reveal') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-4 uppercase tracking-wide">
            Essai gratuit — 10 questions/jour
          </div>
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-3" style="font-family: 'DM Serif Display', serif">
            Voyez par vous-même
          </h2>
          <p class="text-gray-400 max-w-lg mx-auto">
            Posez une question réglementaire. L'IA fouille 39 textes officiels et vous répond avec les articles de loi exacts.
          </p>
        </div>

        <!-- Example question chips -->
        <div class="flex flex-wrap justify-center gap-2 mb-6">
          <button
            class="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-teal-500/10 hover:border-teal-500/20 hover:text-teal-300 transition-all"
            @click="askExample('Quelle est la hauteur minimale d\'un garde-corps sur un chantier ?')"
          >
            Hauteur garde-corps ?
          </button>
          <button
            class="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-teal-500/10 hover:border-teal-500/20 hover:text-teal-300 transition-all"
            @click="askExample('Le casque de protection est-il obligatoire sur tous les chantiers ?')"
          >
            Casque obligatoire ?
          </button>
          <button
            class="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-teal-500/10 hover:border-teal-500/20 hover:text-teal-300 transition-all"
            @click="askExample('Quelles sont les règles pour le stockage de substances chimiques dangereuses ?')"
          >
            Stockage chimique ?
          </button>
        </div>

        <!-- Chat window -->
        <div class="h-[60vh] md:h-[520px] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10">
          <ChatWindow
            :messages="messages"
            :loading="loading"
            placeholder="Ex: hauteur garde-corps ? casque obligatoire ? durée max de travail ?"
            @send="handleSend"
          />
        </div>
      </div>
    </section>

    <!-- ===== FEATURES ===== -->
    <section id="features" class="py-20 md:py-28 bg-gray-950">
      <div
        id="features-reveal"
        data-reveal
        class="max-w-5xl mx-auto px-4 sm:px-6 transition-all duration-1000"
        :class="revealed.has('features-reveal') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <div class="text-center mb-14">
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4" style="font-family: 'DM Serif Display', serif">
            Tout ce qu'il vous faut
          </h2>
          <p class="text-gray-400 max-w-xl mx-auto">
            Conçu par des professionnels SST, pour des professionnels SST.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <!-- Feature 1: Sources -->
          <div class="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 hover:bg-teal-500/[0.03] transition-all duration-300">
            <div class="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/15 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-white mb-2">Sources vérifiables</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              Chaque réponse cite les articles de loi avec lien direct vers Fedlex. Vérifiez en un clic.
            </p>
          </div>

          <!-- Feature 2: Speed -->
          <div class="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 hover:bg-teal-500/[0.03] transition-all duration-300">
            <div class="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/15 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-white mb-2">Réponse en &lt;5 secondes</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              L'IA parcourt 4'480+ articles en un instant. Fini les heures de recherche manuelle.
            </p>
          </div>

          <!-- Feature 3: Corpus -->
          <div class="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 hover:bg-teal-500/[0.03] transition-all duration-300">
            <div class="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/15 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-white mb-2">39 textes réglementaires</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              OTConst, LAA, LTr, OLT, OPA, OChim, directives CFST — le corpus SST suisse le plus complet.
            </p>
          </div>

          <!-- Feature 4: Mobile -->
          <div class="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 hover:bg-teal-500/[0.03] transition-all duration-300">
            <div class="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/15 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-white mb-2">Accès mobile</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              Application web progressive. Consultez la réglementation directement sur chantier, depuis votre smartphone.
            </p>
          </div>

          <!-- Feature 5: Offline -->
          <div class="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 hover:bg-teal-500/[0.03] transition-all duration-300">
            <div class="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/15 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-white mb-2">Cache hors-ligne</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              Les 50 dernières réponses restent accessibles sans connexion. Indispensable en zone blanche.
            </p>
          </div>

          <!-- Feature 6: Updates -->
          <div class="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 hover:bg-teal-500/[0.03] transition-all duration-300">
            <div class="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 group-hover:bg-teal-500/15 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-white mb-2">Mises à jour continues</h3>
            <p class="text-sm text-gray-400 leading-relaxed">
              Le corpus est enrichi régulièrement. Les abonnés Pro reçoivent les mises à jour en priorité.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== HOW IT WORKS ===== -->
    <section class="py-20 md:py-28 bg-gray-900 border-t border-white/5">
      <div
        id="how-reveal"
        data-reveal
        class="max-w-5xl mx-auto px-4 sm:px-6 transition-all duration-1000"
        :class="revealed.has('how-reveal') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <div class="text-center mb-14">
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4" style="font-family: 'DM Serif Display', serif">
            Simple comme bonjour
          </h2>
          <p class="text-gray-400 max-w-xl mx-auto">
            Trois étapes. Zéro friction. La réponse réglementaire en quelques secondes.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 md:gap-6">
          <!-- Step 1 -->
          <div class="relative text-center">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/20">
              <span class="text-2xl font-bold text-white">1</span>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">Posez votre question</h3>
            <p class="text-sm text-gray-400">
              En langage naturel, comme à un collègue expert. Pas besoin de connaître les références.
            </p>
            <!-- Arrow (hidden on mobile) -->
            <div class="hidden md:block absolute top-8 -right-3 w-6 text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="relative text-center">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/20">
              <span class="text-2xl font-bold text-white">2</span>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">L'IA fouille les textes</h3>
            <p class="text-sm text-gray-400">
              Recherche vectorielle dans 39 textes officiels. Les articles les plus pertinents sont identifiés en millisecondes.
            </p>
            <div class="hidden md:block absolute top-8 -right-3 w-6 text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="text-center">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/20">
              <span class="text-2xl font-bold text-white">3</span>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">Réponse sourcée</h3>
            <p class="text-sm text-gray-400">
              Synthèse claire avec les articles exacts, liens Fedlex et extraits pertinents. Prêt à utiliser.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== PRICING ===== -->
    <section id="pricing" class="py-20 md:py-28 bg-gray-950 border-t border-white/5">
      <div
        id="pricing-reveal"
        data-reveal
        class="max-w-4xl mx-auto px-4 sm:px-6 transition-all duration-1000"
        :class="revealed.has('pricing-reveal') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <div class="text-center mb-14">
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4" style="font-family: 'DM Serif Display', serif">
            Un investissement qui se rentabilise dès le premier jour
          </h2>
          <p class="text-gray-400 max-w-xl mx-auto">
            Combien vaut une heure de recherche réglementaire ? SST-QuickRef vous en économise des dizaines.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <!-- Free -->
          <div class="p-7 rounded-2xl bg-white/[0.02] border border-white/5">
            <div class="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Gratuit</div>
            <div class="flex items-baseline gap-1 mb-1">
              <span class="text-4xl font-bold text-white">CHF 0</span>
            </div>
            <p class="text-sm text-gray-500 mb-8">Pour découvrir l'outil</p>

            <ul class="space-y-3 mb-8">
              <li class="flex items-start gap-3 text-sm text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                10 questions par jour
              </li>
              <li class="flex items-start gap-3 text-sm text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                39 sources réglementaires
              </li>
              <li class="flex items-start gap-3 text-sm text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Citations sourcées
              </li>
              <li class="flex items-start gap-3 text-sm text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Cache hors-ligne
              </li>
            </ul>

            <button
              class="w-full min-h-[48px] py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium text-sm hover:bg-white/10 transition-all"
              @click="scrollTo('demo')"
            >
              Commencer gratuitement
            </button>
          </div>

          <!-- Pro -->
          <div class="relative p-7 rounded-2xl bg-gradient-to-b from-teal-500/10 to-teal-500/[0.02] border-2 border-teal-500/30 shadow-xl shadow-teal-500/5">
            <!-- Badge -->
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-teal-500 text-white text-xs font-bold uppercase tracking-wider">
              Recommandé
            </div>

            <div class="text-sm font-medium text-teal-400 uppercase tracking-wide mb-4">Pro</div>
            <div class="flex items-baseline gap-1 mb-1">
              <span class="text-4xl font-bold text-white">CHF 29</span>
              <span class="text-gray-400 text-sm">/mois</span>
            </div>
            <p class="text-sm text-gray-500 mb-8">Pour les professionnels SST</p>

            <ul class="space-y-3 mb-8">
              <li class="flex items-start gap-3 text-sm text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                <strong>Requêtes illimitées</strong>
              </li>
              <li class="flex items-start gap-3 text-sm text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                39 sources réglementaires
              </li>
              <li class="flex items-start gap-3 text-sm text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Mises à jour prioritaires
              </li>
              <li class="flex items-start gap-3 text-sm text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Support par email
              </li>
              <li class="flex items-start gap-3 text-sm text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Sans engagement, annulation libre
              </li>
            </ul>

            <button
              class="w-full min-h-[48px] py-3 rounded-xl bg-teal-500 text-white font-semibold text-sm hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30"
              @click="showSubscribeModal = true"
            >
              Démarrer le Plan Pro
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== FAQ ===== -->
    <section id="faq" class="py-20 md:py-28 bg-gray-900 border-t border-white/5">
      <div
        id="faq-reveal"
        data-reveal
        class="max-w-3xl mx-auto px-4 sm:px-6 transition-all duration-1000"
        :class="revealed.has('faq-reveal') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      >
        <div class="text-center mb-14">
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4" style="font-family: 'DM Serif Display', serif">
            Questions fréquentes
          </h2>
        </div>

        <div class="space-y-3">
          <div
            v-for="(item, i) in faqItems"
            :key="i"
            class="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden transition-colors"
            :class="openFaq === i ? 'border-teal-500/20 bg-teal-500/[0.03]' : 'hover:border-white/10'"
          >
            <button
              class="w-full flex items-center justify-between gap-4 px-6 py-5 text-left min-h-[44px]"
              @click="toggleFaq(i)"
            >
              <span class="text-sm font-medium text-white">{{ item.q }}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-500 shrink-0 transition-transform duration-300"
                :class="openFaq === i ? 'rotate-180' : ''"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div
              class="overflow-hidden transition-all duration-300"
              :class="openFaq === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'"
            >
              <p class="px-6 pb-5 text-sm text-gray-400 leading-relaxed">
                {{ item.a }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== FINAL CTA ===== -->
    <section class="py-20 md:py-28 bg-gray-950 border-t border-white/5">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4" style="font-family: 'DM Serif Display', serif">
          Prêt à gagner du temps ?
        </h2>
        <p class="text-gray-400 max-w-lg mx-auto mb-8">
          Rejoignez les professionnels SST qui font confiance à SST-QuickRef pour sécuriser leur conformité réglementaire.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            class="min-h-[52px] px-8 py-3.5 rounded-xl bg-teal-500 text-white font-semibold text-base hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20 hover:shadow-teal-400/30 hover:-translate-y-0.5"
            @click="scrollTo('demo')"
          >
            Essayer gratuitement
          </button>
          <button
            class="min-h-[52px] px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 font-semibold text-base hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-0.5"
            @click="showSubscribeModal = true"
          >
            Plan Pro — CHF 29/mois
          </button>
        </div>
      </div>
    </section>

    <!-- ===== FOOTER ===== -->
    <footer class="bg-gray-950 border-t border-white/5 py-10">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-gray-300">Securionis</span>
          </div>

          <p class="text-xs text-gray-600 max-w-lg text-center md:text-left">
            SST-QuickRef est un outil d'aide à la recherche. Les réponses sont générées par IA et ne constituent pas un avis juridique. Vérifiez toujours auprès des sources officielles.
          </p>

          <p class="text-xs text-gray-600">
            &copy;{{ new Date().getFullYear() }} Securionis
          </p>
        </div>
      </div>
    </footer>

    <!-- ===== SUBSCRIBE MODAL ===== -->
    <Teleport to="body">
      <div
        v-if="showSubscribeModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showSubscribeModal = false"
      >
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-7">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">Plan Pro</h3>
              <p class="text-sm text-gray-400">CHF 29/mois — sans engagement</p>
            </div>
          </div>

          <p class="text-sm text-gray-400 mb-5">
            Entrez votre email pour accéder au paiement sécurisé via Stripe. Vous recevrez un lien de connexion par email.
          </p>

          <input
            v-model="subscribeEmail"
            type="email"
            placeholder="votre@email.com"
            class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 mb-2"
            @keydown.enter="handleSubscribe"
          />
          <p v-if="subscribeError" class="text-sm text-red-400 mb-2">{{ subscribeError }}</p>

          <div class="flex gap-3 justify-end mt-5">
            <button
              class="min-h-[44px] px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
              @click="showSubscribeModal = false"
            >
              Annuler
            </button>
            <button
              :disabled="subscribeLoading"
              class="min-h-[44px] px-6 py-2.5 rounded-xl bg-teal-500 text-white font-semibold text-sm hover:bg-teal-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              @click="handleSubscribe"
            >
              {{ subscribeLoading ? 'Redirection...' : 'Payer avec Stripe' }}
            </button>
          </div>

          <p class="text-xs text-gray-600 mt-4 text-center">
            Paiement sécurisé Stripe. Annulation à tout moment.
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>
