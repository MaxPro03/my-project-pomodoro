import { createApp } from 'vue'
import { createPwa } from './integrations/pwa'
import { createStore } from './integrations/pinia'
import './styles.css'
import App from './App.vue'

const app = createApp(App)

app.use(createStore())
app.mount('#app')

createPwa()
