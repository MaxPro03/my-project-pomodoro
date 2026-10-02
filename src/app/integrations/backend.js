// DRAFT: not imported anywhere yet. Wires the backend modules together once server/ is live:
//   entry.js -> if (config.backendEnabled) connectBackend()
import { configureHttp } from '@/common/utilities/http'
import { useAuthStore } from '@/modules/Auth'
import { useTimerSync } from '@/modules/Pomodoro'
import { useStatsStore } from '@/modules/Stats'
import { config } from '../config'

export async function connectBackend() {
  const auth = useAuthStore()
  const stats = useStatsStore()

  configureHttp({
    baseUrl: config.apiUrl,
    getToken: () => auth.token,
    onUnauthorized: () => auth.logout(),
  })

  // modules don't know about each other: auth and stats are passed in here
  useTimerSync({
    isEnabled: () => auth.isLoggedIn,
    onPhaseFinished: (session) => stats.recordSession(session),
  })

  await auth.restore()
}
