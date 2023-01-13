import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTimerStore = defineStore('timerStore', () => {
  const timerStart = ref(false)
  const timerReset = ref(false)
  const workTime = ref(1500)
  const minRelaxTime = ref(300)
  const maxRelaxTime = ref(900)

  const startTimerStore = () => {
    if (!timerReset.value) timerStart.value = true
  }
  const stopTimerStore = () => {
    timerStart.value = false
    timerReset.value = true
  }
  const resetTimerStore = () => {
    timerReset.value = false
  }

  return {
    timerStart,
    timerReset,
    workTime,
    minRelaxTime,
    maxRelaxTime,
    startTimerStore,
    stopTimerStore,
    resetTimerStore,
  }
})

// export const useTimerStore = defineStore('timerStore', {
//   state: () => ({
//     timerStart: false,
//     timerReset: false,
//     workTime: 1500,
//     minRelaxTime: 300,
//     maxRelaxTime: 900,
//   }),
//   actions: {
//     startTimerStore() {
//       if (!this.timerReset) this.timerStart = true
//     },
//     stopTimerStore() {
//       this.timerStart = false
//       this.timerReset = true
//     },
//     resetTimerStore() {
//       this.timerReset = false
//     },
//   },
// })
