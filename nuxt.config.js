// https://nuxt.com/docs/api/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  srcDir: 'src', // FEOD layers live in src/ (app, common, modules, pages); the API is in server/
  // client-only app: the timer lives in localStorage and the mascot in a canvas, nothing to render on the server
  ssr: false,

  modules: ['@pinia/nuxt', 'nuxt-auth-utils', '@vite-pwa/nuxt'],
  // FEOD: modules are consumed through their index.js, so nothing is auto-imported from our folders
  components: { dirs: [] },
  imports: { scan: false },
  plugins: ['@/app/integrations/pinia.js', '@/app/integrations/backend.client.js'],

  css: ['@/app/styles.css'],
  postcss: { plugins: { tailwindcss: {}, autoprefixer: {} } },

  app: {
    head: {
      title: 'Apelsini',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
        { name: 'description', content: 'Apelsini' },
        { name: 'theme-color', content: '#1a1c2c' },
      ],
      link: [
        { rel: 'preload', href: '/fonts/Monocraft.otf', as: 'font', type: 'font/otf', crossorigin: '' },
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/apelsini_icon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'mask-icon', href: '/mask-icon.svg', color: '#FFFFFF' },
      ],
    },
  },

  runtimeConfig: {
    // the sealed session cookie; its password comes from NUXT_SESSION_PASSWORD
    session: { maxAge: 60 * 60 * 24 * 30 },
  },

  // prerender the SPA shell so the service worker can precache it and the app opens offline
  nitro: { prerender: { routes: ['/'] } },

  pwa: {
    // no update prompt in the UI, so a new version must activate on its own
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,otf,png,svg,ico}'],
      cleanupOutdatedCaches: true,
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api\//],
    },
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'apelsini_icon.svg'],
    manifest: {
      name: 'my-project-pomodoro',
      short_name: 'Pomodoro',
      description: 'Apelsini',
      theme_color: '#1a1c2c',
      background_color: '#1a1c2c',
      icons: [
        { src: 'android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
  },
})
