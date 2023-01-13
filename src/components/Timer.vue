<template>
  <div
    class="mx-auto mt-12 h-40 w-40 rounded-full bg-orange-500 shadow-2xl md:h-52 md:w-52"
  >
    <span class="flex h-full items-center justify-center text-lg text-white">
      {{ timerStore.workTime }}
    </span>
    <span class="flex h-full items-center justify-center text-lg text-white">
      {{ timerStore.minRelaxTime }}
    </span>
    <span class="flex h-full items-center justify-center text-lg text-white">
      {{ timerStore.maxRelaxTime }}
    </span>
  </div>
</template>
<script setup>
import { useTimerStore } from '../stores/timerStore'

const timerStore = useTimerStore()
</script>
