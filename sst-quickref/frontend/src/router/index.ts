/**
 * T035: Vue Router — routes de l'application
 */

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/pages/LandingPage.vue'),
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/pages/ChatPage.vue'),
    },
  ],
})

export default router
