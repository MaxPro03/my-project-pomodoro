import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as statsApi from '../api/statsApi'

const localDay = (date = new Date()) => date.toLocaleDateString('sv')
const daysAgo = (n) => localDay(new Date(Date.now() - n * 86400000))

export const useStatsStore = defineStore('stats', () => {
  const summary = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function loadSummary({ from = daysAgo(6), to = localDay() } = {}) {
    loading.value = true
    error.value = null
    try {
      summary.value = await statsApi.fetchSummary({ from, to })
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // called with the timer store's lastFinished; failures are retried on the next app start
  async function recordSession({ phase, endedAt, seconds, completed }) {
    const session = {
      clientId: crypto.randomUUID(),
      phase,
      endedAt: new Date(endedAt).toISOString(),
      seconds,
      completed,
      day: localDay(new Date(endedAt)),
    }
    try {
      await statsApi.recordSession(session)
    } catch (e) {
      // TODO: queue in localStorage and resend when back online
    }
  }

  return { summary, loading, error, loadSummary, recordSession }
})
