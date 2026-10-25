import { defineNuxtPlugin } from '#app'
import { resetStore } from './resetStore'

// Pinia itself is installed by @pinia/nuxt; this adds $reset() to setup stores
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.$pinia.use(resetStore)
})
