// Wires the backend modules together. The API is served by this same Nuxt app (server/api),
// auth is an httpOnly session cookie, so there is no base url or token to pass around.
import { defineNuxtPlugin } from '#app'
import { configureHttp } from '@/common/utilities/http'
import { useAuthStore } from '@/modules/Auth'
import { useTimerSync } from '@/modules/Pomodoro'
import { useStatsStore } from '@/modules/Stats'

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const stats = useStatsStore()

  configureHttp({ onUnauthorized: () => auth.forget() })

  // modules don't know about each other: auth and stats are passed in here
  useTimerSync({
    isEnabled: () => auth.isLoggedIn,
    onPhaseFinished: (session) => stats.recordSession(session),
  })

  auth.restore()
})
