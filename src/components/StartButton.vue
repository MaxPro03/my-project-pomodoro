<template>
  <div class="mt-auto grid px-4">
    <button
      v-if="timerStore.timerStart"
      class="relative z-10 mb-4 w-full bg-gray-500 px-4 py-2 uppercase text-white before:absolute before:inset-y-2.5 before:-inset-x-2.5 before:-z-10 before:block before:bg-gray-500 before:content-[''] after:absolute after:inset-y-1 after:-inset-x-1.5 after:-z-10 after:block after:bg-gray-500 after:content-[''] md:mx-auto md:w-40"
      @click="timerStore.stopTimerStore(time)"
    >
      Pause
    </button>
    <button
      v-if="!timerStore.timerStart || timerStore.timerReset"
      class="relative z-10 mb-4 w-full bg-orange-500 px-4 py-2 uppercase text-white before:absolute before:inset-y-2.5 before:-inset-x-2.5 before:-z-10 before:block before:bg-orange-500 before:content-[''] after:absolute after:inset-y-1 after:-inset-x-1.5 after:-z-10 after:block after:bg-orange-500 after:content-[''] md:mx-auto md:w-40"
      @click="timerStore.startTimerStore(time)"
    >
      Start
    </button>
    <button
      v-if="timerStore.timerReset"
      class="relative z-10 mb-4 w-full bg-red-500 px-4 py-2 uppercase text-white before:absolute before:inset-y-2.5 before:-inset-x-2.5 before:-z-10 before:block before:bg-red-500 before:content-[''] after:absolute after:inset-y-1 after:-inset-x-1.5 after:-z-10 after:block after:bg-red-500 after:content-[''] md:mx-auto md:w-40"
      @click="timerStore.resetTimerStore()"
    >
      Reset
    </button>
  </div>
</template>

<script setup>
import { useTimerStore } from '../stores/timerStore';

const timerStore = useTimerStore()

const props = defineProps(['time'])

// const timerStart = ref(false)
// const timerReset = ref(false)

// const startTimerStore = (time) => {
//   if (!timerReset.value) timerStart.value = true

//   let interval = setInterval(() => {
//     if (time === 0) {
//       clearInterval(interval)             
//     } else {
//       time--
//       console.log(time)
//     }
//   }, 1000)
// }

// const stopTimerStore = () => {
//   timerStart.value = false
//   timerReset.value = true
// }

// const resetTimerStore = () => {
//   timerReset.value = false
// }
</script>
