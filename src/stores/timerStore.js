import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTimerStore = defineStore('timerStore', () => {
  const timerStart = ref(false)
  const timerReset = ref(false)
  
  const times = ref([
    {
      id: 1,
      time: 1500,
      icon: '😓',
      title: '25 min'
    },
    {
      id: 2,
      time: 300,
      icon: '☕',
      title: '5 min'
    },
    {
      id: 3,
      time: 900,
      icon: '😴',
      title: '15 min'
    },
  ])
  let INTERVAL;
  const startTimerStore = (time) => {
    if (!timerReset.value) timerStart.value = true

    INTERVAL = setInterval(() => {
      if (time.time === 0) {
        clearInterval(INTERVAL)   
      }else {
        time.time--
        console.log(time);
      }
    }, 1000)
  }

  const stopTimerStore = (time) => {
    timerStart.value = false
    timerReset.value = true

    clearInterval(INTERVAL)
  }
  
  const resetTimerStore = () => {
    timerReset.value = false
  }

  return {
    timerStart,
    timerReset,
    times,
    startTimerStore,
    stopTimerStore,
    resetTimerStore
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
