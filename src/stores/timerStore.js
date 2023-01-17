import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useTimerStore = defineStore('timerStore', () => {
  const timerStart = ref(false)
  const timerReset = ref(false)
  
  const times = ref([
    {
      id: 1,
      time: 1500,
      icon: '😓',
      title: '25 min +1🍊'
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

  const apelsins = ['🍊']

  const timerOnLocalStorage = localStorage.getItem("timerStore")
  if (timerOnLocalStorage) {
    times.value = JSON.parse(timerOnLocalStorage)._value
  }

  let INTERVAL;
  const startTimerStore = (time) => {
    timerReset.value = false
    if (!timerReset.value) timerStart.value = true

    INTERVAL = setInterval(() => {
      if (time.time === 0) {
        clearInterval(INTERVAL)   
      }else {
        localStorage.setItem('timerStore', JSON.stringify(times))
        time.time--
      }
    }, 1000)
  }

  const stopTimerStore = () => {
    timerStart.value = !timerStart.value
    timerReset.value = true

    clearInterval(INTERVAL)
    localStorage.setItem('timerStore', JSON.stringify(times))
  }
  
  const resetTimerStore = () => {
    timerReset.value = false

    localStorage.removeItem('timerStore')
    window.location.reload()
  }

  // watch(() => times, (state) => {
  //   localStorage.setItem('timerStore', JSON.stringify(state))
  // }, {deep:true})

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
