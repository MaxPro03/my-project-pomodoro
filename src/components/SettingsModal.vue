<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" @click.self="$emit('close')">
      <section class="panel w-full max-w-sm p-5 text-white" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header class="mb-5 flex items-center justify-between">
          <h2 id="settings-title" class="tracking-widest text-orange-400">SETTINGS</h2>
          <button class="text-slate-400 hover:text-white" aria-label="Close" @click="$emit('close')">✕</button>
        </header>

        <p class="mb-2 text-xs text-slate-400">TIME (MINUTES)</p>
        <div class="mb-5 grid grid-cols-3 gap-3">
          <label v-for="field in DURATIONS" :key="field.key" class="flex flex-col gap-1 text-xs">
            {{ field.label }}
            <input
              type="number"
              min="1"
              max="180"
              class="field"
              :value="timer.settings[field.key]"
              @change="setNumber(field.key, $event, 1, 180)" />
          </label>
        </div>

        <label class="row">
          Auto start breaks
          <input type="checkbox" class="toggle" :checked="timer.settings.autoBreaks" @change="set('autoBreaks', $event.target.checked)" />
        </label>
        <label class="row">
          Auto start focus
          <input type="checkbox" class="toggle" :checked="timer.settings.autoFocus" @change="set('autoFocus', $event.target.checked)" />
        </label>
        <label class="row">
          Big rest interval
          <input
            type="number"
            min="1"
            max="12"
            class="field w-16"
            :value="timer.settings.longInterval"
            @change="setNumber('longInterval', $event, 1, 12)" />
        </label>

        <div class="mt-6 flex justify-end">
          <PixelButton @click="$emit('close')">OK</PixelButton>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useTimerStore } from '../stores/timerStore'
import PixelButton from './PixelButton.vue'

const emit = defineEmits(['close'])
const timer = useTimerStore()

const DURATIONS = [
  { key: 'focus', label: 'Focus' },
  { key: 'short', label: 'Break' },
  { key: 'long', label: 'Rest' },
]

const set = (key, value) => timer.updateSettings({ [key]: value })

const setNumber = (key, event, min, max) => {
  const value = Math.round(Number(event.target.value))
  const clamped = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : timer.settings[key]
  event.target.value = clamped
  set(key, clamped)
}

const onKey = (e) => e.key === 'Escape' && emit('close')
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.panel {
  background: #262b44;
  box-shadow:
    0 -4px 0 0 #1a1c2c,
    0 4px 0 0 #1a1c2c,
    -4px 0 0 0 #1a1c2c,
    4px 0 0 0 #1a1c2c,
    inset 0 0 0 4px #f7901e;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 0.875rem;
  border-top: 2px dashed #333c57;
}
.field {
  padding: 6px 8px;
  color: #fff;
  background: #1a1c2c;
  border: 0;
  box-shadow: inset 0 0 0 2px #566c86;
  outline: none;
}
.field:focus {
  box-shadow: inset 0 0 0 2px #f7901e;
}
/* pixel on/off switch */
.toggle {
  appearance: none;
  position: relative;
  width: 44px;
  height: 22px;
  background: #333c57;
  cursor: pointer;
}
.toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  background: #94a3b8;
  transition: transform 120ms steps(3);
}
.toggle:checked {
  background: #38b764;
}
.toggle:checked::after {
  background: #fff;
  transform: translateX(22px);
}
.toggle:focus-visible {
  outline: 2px dashed #fff;
  outline-offset: 3px;
}
</style>
