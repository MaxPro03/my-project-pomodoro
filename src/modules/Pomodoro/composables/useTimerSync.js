// DRAFT: keeps the timer in sync with the backend. Wired from app/integrations/backend.js.
// Auth and stats come in through options (IoC), so Pomodoro doesn't import other modules.
import { watch } from 'vue'
import { fetchTimerState, saveTimerState } from '../api/timerApi'
import { useTimerStore } from '../store/timerStore'

const PUSH_DELAY = 1500

/**
 * @param {{ isEnabled: () => boolean, onPhaseFinished?: (session: object) => void }} options
 */
export function useTimerSync({ isEnabled, onPhaseFinished }) {
  const timer = useTimerStore()
  let pushTimeout = null

  // newer of local and server wins
  async function pull() {
    const remote = await fetchTimerState()
    if (remote && remote.updatedAt > timer.updatedAt) timer.hydrate(remote)
    else push()
  }

  function push() {
    clearTimeout(pushTimeout)
    pushTimeout = setTimeout(async () => {
      try {
        await saveTimerState(timer.snapshot())
      } catch (e) {
        if (e.status === 409 && e.body?.state) timer.hydrate(e.body.state)
      }
    }, PUSH_DELAY)
  }

  watch(isEnabled, (enabled) => enabled && pull(), { immediate: true })
  watch(
    () => timer.updatedAt,
    () => isEnabled() && push()
  )
  watch(
    () => timer.lastFinished,
    (session) => session && isEnabled() && onPhaseFinished?.(session)
  )

  // pick up changes made on another device when the tab comes back
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isEnabled()) pull()
  })
}
