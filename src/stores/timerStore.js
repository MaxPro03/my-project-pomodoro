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
      title: '25 min',
      description: '+🍊',
    },
    {
      id: 3,
      time: 300,
      icon: '☕',
      title: '5 min',
      description: '',
    },
    {
      id: 3,
      time: 900,
      icon: '😴',
      title: '15 min',
      description: '',
    },
  ])

  const oranges = ref([])

  const timerOnLocalStorage = localStorage.getItem("timerStore")
  if (timerOnLocalStorage) {
    times.value = JSON.parse(timerOnLocalStorage)._value
  }

  const orangesOnLocalStorage = localStorage.getItem("orangesStore")
  if (orangesOnLocalStorage) {
    oranges.value = JSON.parse(orangesOnLocalStorage)._value
  }

  let INTERVAL;
  const startTimerStore = (timerData) => {
    timerReset.value = false
    if (!timerReset.value) timerStart.value = true

    INTERVAL = setInterval(() => {
      if (timerData.time === 0) {
        addNewOranges() 
        timerStart.value = false
        clearInterval(INTERVAL) 
      }else {
        localStorage.setItem('timerStore', JSON.stringify(times))
        timerData.time--
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

  const addNewOranges = () => {
    if (times.value[0].time === 0 && oranges.value.length < 8) {
      oranges.value.push('🍊')
      localStorage.setItem('orangesStore', JSON.stringify(oranges))
    }
  }

  return {
    timerStart,
    timerReset,
    times,
    oranges,
    startTimerStore,
    stopTimerStore,
    resetTimerStore
  }
})