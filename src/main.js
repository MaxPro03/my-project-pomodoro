import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import { resetStore } from './stores/plugins/resetStore'
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

pinia.use(resetStore)
app.use(pinia)
app.mount('#app')

// reloads the page once a freshly deployed service worker takes control
registerSW({ immediate: true })
