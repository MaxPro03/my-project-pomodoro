import { createPinia } from 'pinia'
import { resetStore } from './resetStore'

export function createStore() {
  const pinia = createPinia()
  pinia.use(resetStore)
  return pinia
}
