<template>
  <section class="flex w-full flex-col gap-4 text-white">
    <p v-if="stats.loading" class="text-xs text-slate-400">loading...</p>
    <p v-else-if="stats.error" class="text-xs text-red-400">{{ stats.error }}</p>
    <template v-else-if="summary">
      <div class="grid grid-cols-3 gap-3 text-center">
        <div class="tile"><b>{{ summary.oranges }}</b><span>oranges</span></div>
        <div class="tile"><b>{{ hours }}</b><span>focus h</span></div>
        <div class="tile"><b>{{ summary.currentStreak }}</b><span>day streak</span></div>
      </div>
      <!-- one stepped bar per day, height = oranges -->
      <div class="flex h-24 items-end gap-2">
        <div v-for="day in summary.days" :key="day.day" class="flex flex-1 flex-col items-center gap-1">
          <span class="bar w-full" :style="{ height: barHeight(day.oranges) }" :title="`${day.day}: ${day.oranges}`" />
          <span class="text-[10px] text-slate-400">{{ day.day.slice(8) }}</span>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStatsStore } from '../store/statsStore'

const stats = useStatsStore()
const summary = computed(() => stats.summary)
const hours = computed(() => (summary.value.focusMinutes / 60).toFixed(1))
const maxOranges = computed(() => Math.max(1, ...summary.value.days.map((d) => d.oranges)))
// snap to 8px steps for the blocky look
const barHeight = (oranges) => `${Math.round(((oranges / maxOranges.value) * 80) / 8) * 8}px`

onMounted(() => stats.loadSummary())
</script>

<style scoped>
.tile {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 4px;
  background: #262b44;
  box-shadow: inset 0 0 0 2px #333c57;
}
.tile b {
  font-size: 1.25rem;
  color: #f7901e;
}
.tile span {
  font-size: 10px;
  color: #94a3b8;
}
.bar {
  min-height: 4px;
  background: #f7901e;
  box-shadow: inset 0 -4px 0 0 #c8560f;
}
</style>
