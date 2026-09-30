import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'apelsini:v1'
const ORANGES_PER_CRATE = 4

// ?fast in the URL shrinks every phase to a few seconds, handy for testing animations
const FAST = new URLSearchParams(window.location.search).has('fast')
const FAST_SECONDS = { focus: 5, short: 3, long: 4 }

export const PHASES = {
  focus: { id: 'focus', title: 'FOCUS', icon: '🍊', message: 'Time to focus!' },
  short: { id: 'short', title: 'BREAK', icon: '☕', message: 'Time for a break!' },
  long: { id: 'long', title: 'REST', icon: '😴', message: 'Time for a break!' },
}

// same defaults as pomofocus.io, except breaks start on their own
export const DEFAULT_SETTINGS = {
  focus: 25, // minutes
  short: 5,
  long: 15,
  longInterval: 4, // every Nth round ends with a long break
  autoBreaks: true,
  autoFocus: false,
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
  const sameDay = saved.day === today()

  const settings = ref({ ...DEFAULT_SETTINGS, ...saved.settings })
  const durationOf = (id) => (FAST ? FAST_SECONDS[id] : settings.value[id] * 60)

  const phase = ref(PHASES[saved.phase] ? saved.phase : 'focus')
  const remaining = ref(saved.remaining ?? durationOf(phase.value))
  const endAt = ref(saved.endAt ?? null) // timestamp while running, null while paused
  const oranges = ref(sameDay ? saved.oranges ?? 0 : 0)
  // "#N" on pomofocus: the current pomodoro of the day, goes up when a break ends
  const round = ref(sameDay ? saved.round ?? (saved.streak ?? 0) + 1 : 1)
  const muted = ref(saved.muted ?? false)
  const day = ref(today())

  // bump every time an orange is earned / a break runs out so the UI can react
  const harvestId = ref(0)
  const phaseEndId = ref(0)

  const now = ref(Date.now())
  let interval = null

  const running = computed(() => endAt.value !== null)
  const duration = computed(() => durationOf(phase.value))
  const secondsLeft = computed(() =>
    running.value ? Math.max(0, Math.ceil((endAt.value - now.value) / 1000)) : remaining.value
  )
  const progress = computed(() => 1 - secondsLeft.value / duration.value)
  const touched = computed(() => running.value || remaining.value !== duration.value)
  const onBreak = computed(() => phase.value !== 'focus')
  const message = computed(() => PHASES[phase.value].message)
  // during a break the round it follows is already done
  const roundsToLongBreak = computed(() => {
    const n = settings.value.longInterval
    const done = round.value - (onBreak.value ? 0 : 1)
    return n - (done % n)
  })

  const tick = () => {
    now.value = Date.now()
    if (day.value !== today()) {
      day.value = today()
      oranges.value = 0
      round.value = 1
    }
    if (running.value && secondsLeft.value <= 0) finishPhase()
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
    remaining.value = durationOf(id)
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

  // auto start counts from when the previous phase really ended, so time spent
  // with the app closed isn't lost
  const autoStart = (from) => {
    const end = from + remaining.value * 1000
    if (end > Date.now()) {
      endAt.value = end
      startLoop()
    } else if (onBreak.value) {
      // the whole break ran out while the app was closed
      round.value++
      setPhase('focus')
    }
  }

  // tabs can be switched any time, like on pomofocus; the current session is dropped
  const selectPhase = (id) => setPhase(id)

  // skipping ends the round early: it still counts towards the long break, but gives no orange
  const skip = () => {
    if (running.value) finishPhase({ early: true })
  }

  function finishPhase({ early = false } = {}) {
    const endedAt = early ? Date.now() : endAt.value
    if (phase.value === 'focus') {
      if (!early) {
        oranges.value++
        harvestId.value++
      }
      setPhase(round.value % settings.value.longInterval === 0 ? 'long' : 'short')
      if (settings.value.autoBreaks) autoStart(endedAt)
    } else {
      if (!early) phaseEndId.value++
      round.value++
      setPhase('focus')
      if (settings.value.autoFocus) autoStart(endedAt)
    }
  }

  const updateSettings = (next) => {
    settings.value = { ...settings.value, ...next }
  }

  // a timer that hasn't been started picks up new durations right away
  watch(duration, (value, old) => {
    if (running.value) return
    remaining.value = remaining.value === old ? value : Math.min(remaining.value, value)
  })

  const clearOranges = () => {
    oranges.value = 0
    round.value = 1
  }

  watch(
    [phase, remaining, endAt, oranges, round, muted, day, settings],
    () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          phase: phase.value,
          remaining: remaining.value,
          endAt: endAt.value,
          oranges: oranges.value,
          round: round.value,
          muted: muted.value,
          day: day.value,
          settings: settings.value,
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
    round,
    muted,
    settings,
    harvestId,
    phaseEndId,
    running,
    duration,
    secondsLeft,
    progress,
    touched,
    onBreak,
    message,
    roundsToLongBreak,
    start,
    pause,
    toggle,
    selectPhase,
    skip,
    updateSettings,
    clearOranges,
  }
})
