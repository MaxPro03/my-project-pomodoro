import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { resetStore } from './stores/plugins/resetStore'
import { TroisJSVuePlugin } from 'troisjs';
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

pinia.use(resetStore)
app.use(pinia)
app.use(TroisJSVuePlugin)
app.mount('#app')
