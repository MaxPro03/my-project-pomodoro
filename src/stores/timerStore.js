import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'apelsini:v1'
const ORANGES_PER_CRATE = 4

// ?fast in the URL shrinks every phase to a few seconds, handy for testing animations
const FAST = new URLSearchParams(window.location.search).has('fast')

export const PHASES = {
  focus: { id: 'focus', title: 'FOCUS', icon: '🍊', duration: FAST ? 5 : 25 * 60 },
  short: { id: 'short', title: 'BREAK', icon: '☕', duration: FAST ? 3 : 5 * 60 },
  long: { id: 'long', title: 'REST', icon: '😴', duration: FAST ? 4 : 15 * 60 },
}

const today = () => new Date().toLocaleDateString('sv') // local YYYY-MM-DD

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved) return saved
  } catch (e) {}

  // migrate the orange count from the old storage format
  let oranges = 0
  try {
    oranges = JSON.parse(localStorage.getItem('orangesStore'))?._value?.length ?? 0
  } catch (e) {}
  localStorage.removeItem('orangesStore')
  localStorage.removeItem('timerStore')
  return { oranges, day: today() }
}

export const useTimerStore = defineStore('timerStore', () => {
  const saved = loadState()

  const phase = ref(PHASES[saved.phase] ? saved.phase : 'focus')
  const remaining = ref(saved.remaining ?? PHASES[phase.value].duration)
  const endAt = ref(saved.endAt ?? null) // timestamp while running, null while paused
  const oranges = ref(saved.day === today() ? saved.oranges ?? 0 : 0)
  const streak = ref(saved.streak ?? 0) // finished focus sessions since the last long break
  const muted = ref(saved.muted ?? false)
  const day = ref(today())

  // bumps every time an orange is earned so the UI can play the harvest animation
  const harvestId = ref(0)
  const phaseEndId = ref(0)

  const now = ref(Date.now())
  let interval = null

  const running = computed(() => endAt.value !== null)
  const duration = computed(() => PHASES[phase.value].duration)
  const secondsLeft = computed(() =>
    running.value ? Math.max(0, Math.ceil((endAt.value - now.value) / 1000)) : remaining.value
  )
  const progress = computed(() => 1 - secondsLeft.value / duration.value)
  const touched = computed(() => running.value || remaining.value !== duration.value)
  const nextBreak = computed(() => ((streak.value + 1) % ORANGES_PER_CRATE === 0 ? 'long' : 'short'))

  const tick = () => {
    now.value = Date.now()
    if (day.value !== today()) {
      day.value = today()
      oranges.value = 0
    }
    if (running.value && secondsLeft.value <= 0) completePhase()
  }

  const startLoop = () => {
    if (!interval) interval = setInterval(tick, 250)
  }
  const stopLoop = () => {
    clearInterval(interval)
    interval = null
  }

  const setPhase = (id) => {
    stopLoop()
    phase.value = id
    endAt.value = null
    remaining.value = PHASES[id].duration
  }

  const start = () => {
    if (running.value) return
    now.value = Date.now()
    endAt.value = now.value + remaining.value * 1000
    startLoop()
  }

  const pause = () => {
    if (!running.value) return
    remaining.value = secondsLeft.value
    endAt.value = null
    stopLoop()
  }

  const toggle = () => (running.value ? pause() : start())

  const reset = () => setPhase(phase.value)

  function completePhase() {
    if (phase.value === 'focus') {
      oranges.value++
      harvestId.value++
      const next = nextBreak.value
      streak.value = next === 'long' ? 0 : streak.value + 1
      setPhase(next)
    } else {
      phaseEndId.value++
      setPhase('focus')
    }
  }

  // skipping a focus session doesn't earn an orange
  const skip = () => setPhase(phase.value === 'focus' ? nextBreak.value : 'focus')

  const clearOranges = () => {
    oranges.value = 0
    streak.value = 0
  }

  watch(
    [phase, remaining, endAt, oranges, streak, muted, day],
    () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          phase: phase.value,
          remaining: remaining.value,
          endAt: endAt.value,
          oranges: oranges.value,
          streak: streak.value,
          muted: muted.value,
          day: day.value,
        })
      )
    },
    { immediate: true }
  )

  // resume a timer that was running before the page was closed
  if (running.value) {
    startLoop()
    tick()
  }

  return {
    ORANGES_PER_CRATE,
    phase,
    oranges,
    streak,
    muted,
    harvestId,
    phaseEndId,
    running,
    duration,
    secondsLeft,
    progress,
    touched,
    nextBreak,
    setPhase,
    start,
    pause,
    toggle,
    reset,
    skip,
    clearOranges,
  }
})
