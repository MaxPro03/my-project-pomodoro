import { registerSW } from 'virtual:pwa-register'

// reloads the page once a freshly deployed service worker takes control
export function createPwa() {
  registerSW({ immediate: true })
}
