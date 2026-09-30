<template>
  <div class="screen mx-auto flex h-full w-full max-w-md flex-col items-center justify-between gap-3 py-3" :class="{ shake }">
    <header class="flex w-full shrink-0 items-center justify-between">
      <h1 class="text-xl tracking-widest text-orange-400">APELSINI</h1>
      <div class="flex items-center gap-4">
        <span class="text-sm">🍊 x{{ timer.oranges }}</span>
        <button
          class="text-sm text-slate-400 hover:text-white"
          :aria-label="timer.muted ? 'Unmute' : 'Mute'"
          @click="timer.muted = !timer.muted">
          {{ timer.muted ? '🔇' : '🔊' }}
        </button>
        <button class="text-sm text-slate-400 hover:text-white" aria-label="Settings" @click="settingsOpen = true">
          ⚙️
        </button>
      </div>
    </header>

    <!-- like pomofocus: any mode can be picked at any time, which drops the current session -->
    <nav class="flex w-full shrink-0 justify-between gap-2">
      <button
        v-for="p in PHASES"
        :key="p.id"
        class="tab flex-1 py-2 text-xs"
        :class="{ active: timer.phase === p.id }"
        :style="{ '--accent': ACCENTS[p.id] }"
        :aria-pressed="timer.phase === p.id"
        @click="choosePhase(p.id)">
        {{ p.icon }} {{ p.title }}
      </button>
    </nav>

    <!-- the stage takes whatever height is left, the orange shrinks to fit it -->
    <section
      class="stage flex max-h-[28rem] min-h-0 w-full flex-1 flex-col items-center gap-4 p-6"
      :style="{ '--accent': accent }">
      <div class="flex min-h-0 w-full flex-1 items-center justify-center">
        <div ref="bigOrange" class="orange-box relative" :class="{ bob: timer.running, jump: jumping }">
          <Orange3D
            class="h-full w-full"
            :palette="bigPalette"
            :lively="timer.running"
            :expression="orangeMood"
            :style="{ opacity: flying ? 0.25 : 1 }" />
          <span v-if="timer.phase !== 'focus'" class="zzz absolute -right-6 -top-2 text-lg text-sky-300">z</span>
        </div>
      </div>

      <p class="clock tabular-nums tracking-wider" :style="{ color: accent }">{{ clock }}</p>

      <div class="bar flex w-full gap-1" role="progressbar" :aria-valuenow="Math.round(timer.progress * 100)">
        <span
          v-for="i in SEGMENTS"
          :key="i"
          class="h-4 flex-1"
          :style="{ background: i <= filledSegments ? accent : '#2b2f45' }" />
      </div>

      <p class="h-4 text-xs text-slate-400">{{ hint }}</p>
    </section>

    <!-- the skip slot keeps its width so the start button doesn't jump around -->
    <div class="flex shrink-0 items-center justify-center gap-6 pl-[4.5rem]">
      <PixelButton :color="timer.running ? '#566c86' : accent" class="w-40" @click="toggle">
        {{ timer.running ? 'Pause' : 'Start' }}
      </PixelButton>
      <div class="w-12">
        <PixelButton v-if="timer.running" color="#333c57" class="w-12 !px-0" aria-label="Finish this round" @click="skip">
          ⏭
        </PixelButton>
      </div>
    </div>

    <section class="flex w-full shrink-0 flex-col items-center gap-2">
      <h2 class="text-xs tracking-widest text-slate-400">
        TODAY'S HARVEST · {{ timer.roundsToLongBreak }} TO BIG REST
      </h2>
      <OrangeBasket ref="basket" :count="timer.oranges" :per-crate="timer.ORANGES_PER_CRATE" :pending="pending" />
      <button v-if="timer.oranges > 0" class="text-xs text-slate-500 hover:text-slate-300" @click="clearOranges">
        clear
      </button>
    </section>
  </div>

  <!-- harvest effects live above everything in fixed coordinates -->
  <Teleport to="body">
    <div v-if="flying" ref="flyer" class="pointer-events-none fixed left-0 top-0 z-50 opacity-0">
      <PixelSprite :rows="ORANGE" :palette="PALETTES.ripe" :px="12" />
    </div>
    <span
      v-for="p in particles"
      :key="p.id"
      class="particle pointer-events-none fixed z-50"
      :style="{ left: p.x + 'px', top: p.y + 'px', background: p.color, '--dx': p.dx + 'px', '--dy': p.dy + 'px' }" />
    <span
      v-for="f in floaters"
      :key="f.id"
      class="floater pointer-events-none fixed z-50 -translate-x-1/2 text-lg text-yellow-300"
      :style="{ left: f.x + 'px', top: f.y + 'px' }">
      {{ f.text }}
    </span>
    <div v-if="banner" class="pointer-events-none fixed inset-x-0 top-1/3 z-50 flex justify-center">
      <p class="banner px-6 py-3 text-lg" :style="{ background: banner.color }">{{ banner.text }}</p>
    </div>
  </Teleport>

  <SettingsModal v-if="settingsOpen" @close="settingsOpen = false" />
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { PHASES, useTimerStore } from '../stores/timerStore'
import { ORANGE, PALETTES, paletteForProgress } from '../game/sprites'
import { sfx } from '../game/sound'
import PixelSprite from './PixelSprite.vue'
import PixelButton from './PixelButton.vue'
import OrangeBasket from './OrangeBasket.vue'
import Orange3D from './Orange3D.vue'
import SettingsModal from './SettingsModal.vue'

const ACCENTS = { focus: '#f7901e', short: '#38b764', long: '#41a6f6' }
const PAGE_BG = { focus: '#1a1c2c', short: '#142420', long: '#141c2e' }
const SEGMENTS = 20
const PARTICLE_COLORS = ['#f7901e', '#ffcd75', '#ffe0a0', '#3fa535', '#fff']

const timer = useTimerStore()

const bigOrange = ref(null)
const basket = ref(null)
const flyer = ref(null)

const flying = ref(false)
const jumping = ref(false)
const shake = ref(false)
const pending = ref(0)
const particles = ref([])
const floaters = ref([])
const banner = ref(null)
const settingsOpen = ref(false)

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const accent = computed(() => ACCENTS[timer.phase])
const clock = computed(() => {
  const s = timer.secondsLeft
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})
const filledSegments = computed(() => Math.floor(timer.progress * SEGMENTS))
const bigPalette = computed(() => (timer.phase === 'focus' ? paletteForProgress(timer.progress) : PALETTES.ripe))
const orangeMood = computed(() => (jumping.value || flying.value ? 'happy' : timer.onBreak ? 'sleep' : 'open'))
const hint = computed(() => `#${timer.round} · ${timer.message}`)

const sound = (name) => !timer.muted && sfx[name]()

const toggle = () => {
  sound(timer.running ? 'pause' : 'blip')
  timer.toggle()
}
const skip = () => {
  sound('blip')
  timer.skip()
}
const choosePhase = (id) => {
  sound('blip')
  timer.selectPhase(id)
}
const clearOranges = () => {
  if (confirm('Clear today\'s oranges?')) timer.clearOranges()
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const center = (el) => {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }
}

let uid = 0
function burst(x, y, count = 14) {
  const items = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4
    const dist = 30 + Math.random() * 40
    return {
      id: uid++,
      x,
      y,
      dx: Math.round((Math.cos(angle) * dist) / 4) * 4, // snap to the pixel grid
      dy: Math.round((Math.sin(angle) * dist) / 4) * 4,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    }
  })
  particles.value.push(...items)
  setTimeout(() => {
    const ids = new Set(items.map((p) => p.id))
    particles.value = particles.value.filter((p) => !ids.has(p.id))
  }, 700)
}

function float(x, y, text) {
  const item = { id: uid++, x, y, text }
  floaters.value.push(item)
  setTimeout(() => (floaters.value = floaters.value.filter((f) => f !== item)), 1000)
}

async function showBanner(text, color, ms = 1600) {
  banner.value = { text, color }
  await wait(ms)
  banner.value = null
}

// ripe orange jumps off the stage, arcs across the screen and lands in its crate slot
async function playHarvest() {
  const index = timer.oranges - 1
  pending.value++

  jumping.value = true
  await wait(300)
  jumping.value = false

  flying.value = true
  await nextTick()
  const target = basket.value?.slotEl(index)
  if (target && flyer.value && bigOrange.value) {
    target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    const from = center(bigOrange.value)
    const to = center(target)
    const size = flyer.value.getBoundingClientRect().width
    const endScale = to.w / size
    const peak = Math.min(from.y, to.y) - 120
    const frames = 16
    const keyframes = Array.from({ length: frames + 1 }, (_, i) => {
      const t = i / frames
      const x = from.x + (to.x - from.x) * t - size / 2
      // quadratic bezier through the peak for a jump arc
      const y = (1 - t) ** 2 * from.y + 2 * (1 - t) * t * peak + t ** 2 * to.y - size / 2
      const scale = 1 + (endScale - 1) * t
      return { opacity: 1, transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${Math.round(t * 4) * 90}deg)` }
    })
    await flyer.value.animate(keyframes, {
      duration: reducedMotion ? 1 : 900,
      easing: 'steps(18, end)',
      fill: 'forwards',
    }).finished
  }
  flying.value = false
  pending.value--

  if (target) {
    const { x, y } = center(target)
    basket.value.pop(index)
    burst(x, y)
    float(x, y - 30, '+1 🍊')
  }
  shake.value = true
  setTimeout(() => (shake.value = false), 300)

  sound(timer.oranges % timer.ORANGES_PER_CRATE === 0 ? 'crate' : 'harvest')
  if (timer.phase === 'long') showBanner('+1 ORANGE! BIG REST', ACCENTS.long)
  else showBanner('+1 ORANGE! BREAK TIME', ACCENTS.short, 1200)
}

watch(() => timer.harvestId, playHarvest)
watch(
  () => timer.phaseEndId,
  () => {
    sound('breakOver')
    showBanner('BACK TO WORK!', ACCENTS.focus, 1200)
  }
)

watch(
  [clock, () => timer.phase, () => timer.running],
  () => {
    document.title = `${clock.value} - ${timer.message}`
    // tint the whole page per mode, the way pomofocus switches its background
    document.documentElement.style.setProperty('--page-bg', PAGE_BG[timer.phase])
  },
  { immediate: true }
)

const onKey = (e) => {
  if (settingsOpen.value || e.code !== 'Space' || e.target.closest('button, input, textarea')) return
  e.preventDefault()
  toggle()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.stage {
  background: #262b44;
  box-shadow:
    0 -4px 0 0 #1a1c2c,
    0 4px 0 0 #1a1c2c,
    -4px 0 0 0 #1a1c2c,
    4px 0 0 0 #1a1c2c,
    inset 0 0 0 4px var(--accent);
}

.tab {
  color: #94a3b8;
  background: #262b44;
  box-shadow: inset 0 -4px 0 0 #1a1c2c;
}
.tab.active {
  color: #fff;
  background: var(--accent);
  box-shadow: inset 0 -4px 0 0 rgb(0 0 0 / 0.3);
}
.tab:not(.active):hover {
  color: #fff;
}

.bob {
  animation: bob 1s steps(2) infinite;
}
.jump {
  animation: jump 300ms steps(5) both;
}
.zzz {
  animation: zzz 1.5s steps(3) infinite;
}
.shake {
  animation: shake 300ms steps(6);
}

.particle {
  width: 8px;
  height: 8px;
  animation: particle 650ms steps(7) forwards;
}
.floater {
  animation: floater 1s steps(10) forwards;
  text-shadow: 2px 2px 0 #1a1c2c;
}
.banner {
  color: #fff;
  text-shadow: 2px 2px 0 #1a1c2c;
  box-shadow:
    0 -4px 0 0 #1a1c2c,
    0 4px 0 0 #1a1c2c,
    -4px 0 0 0 #1a1c2c,
    4px 0 0 0 #1a1c2c;
  animation: banner 400ms steps(4) both;
}

@keyframes bob {
  50% { transform: translateY(-4px); }
}
@keyframes jump {
  0% { transform: scale(1.2, 0.8); filter: brightness(1.8); }
  40% { transform: translateY(-24px) scale(0.9, 1.1); }
  100% { transform: translateY(0); }
}
@keyframes zzz {
  0% { transform: translate(0, 0); opacity: 1; }
  100% { transform: translate(8px, -16px); opacity: 0; }
}
@keyframes shake {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-4px, 0); }
  40% { transform: translate(4px, -4px); }
  60% { transform: translate(-4px, 4px); }
  80% { transform: translate(4px, 0); }
}
@keyframes particle {
  from { transform: translate(-50%, -50%); opacity: 1; }
  to { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))); opacity: 0; }
}
@keyframes floater {
  from { transform: translate(-50%, 0); opacity: 1; }
  to { transform: translate(-50%, -48px); opacity: 0; }
}
@keyframes banner {
  0% { transform: scale(0); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.orange-box {
  height: 100%;
  max-height: 168px;
  aspect-ratio: 1;
}
.clock {
  font-size: clamp(2rem, 7dvh, 3rem);
  line-height: 1;
}

/* squeeze the stage on short phones so everything fits one screen */
@media (max-height: 720px) {
  .stage {
    gap: 8px;
    padding: 12px 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bob, .jump, .zzz, .shake, .particle, .floater, .banner {
    animation: none;
  }
}
</style>
