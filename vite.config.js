import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    VitePWA({
      // no update prompt in the UI, so a new version must activate on its own
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,otf,png,svg,ico}'],
        cleanupOutdatedCaches: true,
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'apelsini_icon.svg'],
      manifest: {
        name: 'my-project-pomodoro',
        short_name: 'Pomodoro',
        description: 'Apelsini',
        theme_color: '#1a1c2c',
        background_color: '#1a1c2c',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
