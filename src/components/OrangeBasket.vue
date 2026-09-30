<template>
  <!-- one row of crates that scrolls sideways, so the basket never grows taller -->
  <div ref="row" class="mx-auto flex w-max max-w-full gap-4 overflow-x-auto p-3">
    <div
      v-for="crate in crates"
      :key="crate"
      class="crate"
      :class="{ full: crate * perCrate <= visible, 'crate-pop': crate === poppedCrate }">
      <div
        v-for="slot in perCrate"
        :key="slot"
        :ref="(el) => (slots[(crate - 1) * perCrate + slot - 1] = el)"
        class="slot"
        :class="{ 'slot-pop': (crate - 1) * perCrate + slot - 1 === popped }">
        <PixelSprite :rows="ORANGE" :palette="isFilled(crate, slot) ? PALETTES.ripe : PALETTES.ghost" :px="3" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import PixelSprite from './PixelSprite.vue'
import { ORANGE, PALETTES } from '../game/sprites'

const props = defineProps({
  count: { type: Number, required: true },
  perCrate: { type: Number, default: 4 },
  // oranges still flying towards the basket, their slots stay empty until they land
  pending: { type: Number, default: 0 },
})

const slots = [] // plain array: filled by template refs, must not trigger re-renders
const popped = ref(-1)
const poppedCrate = ref(-1)

const visible = computed(() => props.count - props.pending)
// always show one crate with room for the next orange
const crates = computed(() => Math.floor(props.count / props.perCrate) + 1)

// keep the newest crate in view
const row = ref(null)
const scrollToEnd = () => nextTick(() => row.value && (row.value.scrollLeft = row.value.scrollWidth))
onMounted(scrollToEnd)
watch(crates, scrollToEnd)

const isFilled = (crate, slot) => (crate - 1) * props.perCrate + slot - 1 < visible.value

const pop = (index) => {
  popped.value = -1
  poppedCrate.value = -1
  requestAnimationFrame(() => {
    popped.value = index
    if ((index + 1) % props.perCrate === 0) poppedCrate.value = (index + 1) / props.perCrate
  })
  setTimeout(() => {
    popped.value = -1
    poppedCrate.value = -1
  }, 700)
}

defineExpose({ slotEl: (index) => slots[index], pop })
</script>

<style scoped>
.crate {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 6px;
  padding: 8px;
  background: #5d3a1a;
  box-shadow:
    0 -4px 0 0 #1a1c2c,
    0 4px 0 0 #1a1c2c,
    -4px 0 0 0 #1a1c2c,
    4px 0 0 0 #1a1c2c,
    inset 0 -4px 0 0 #3e2510,
    inset 0 4px 0 0 #8a5a2b;
}
.crate.full {
  background: #7a4d22;
}
.slot {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  background: #3e2510;
}
.slot-pop {
  animation: slot-pop 480ms steps(6) both;
}
.crate-pop {
  animation: crate-pop 600ms steps(8) both;
}

@keyframes slot-pop {
  0% { transform: scale(1.5, 0.6); }
  30% { transform: scale(0.8, 1.3) translateY(-6px); }
  60% { transform: scale(1.15, 0.9); }
  100% { transform: scale(1); }
}
@keyframes crate-pop {
  0%, 100% { transform: translateY(0); filter: none; }
  25% { transform: translateY(-8px); filter: brightness(1.6); }
  50% { transform: translateY(0); filter: brightness(1); }
  75% { transform: translateY(-4px); filter: brightness(1.4); }
}
</style>
