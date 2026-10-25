import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as authApi from '../api/authApi'

// the session itself is an httpOnly cookie set by the server, the store only keeps the user
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => Boolean(user.value))

  async function run(action) {
    loading.value = true
    error.value = null
    try {
      return await action()
    } catch (e) {
      error.value = e.data?.message || e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const register = (form) => run(async () => (user.value = await authApi.register(form)))
  const login = (form) => run(async () => (user.value = await authApi.login(form)))

  // drop the user locally, e.g. when the server answered 401
  const forget = () => (user.value = null)

  async function logout() {
    forget()
    await authApi.logout().catch(() => {})
  }

  // pick the user back up from the session cookie after a reload
  async function restore() {
    try {
      user.value = (await authApi.fetchSession()).user ?? null
    } catch (e) {
      // offline or no server: stay logged out, the timer works locally anyway
    }
  }

  const updateProfile = (changes) => run(async () => (user.value = await authApi.updateMe(changes)))

  return { user, loading, error, isLoggedIn, register, login, logout, forget, restore, updateProfile }
})
