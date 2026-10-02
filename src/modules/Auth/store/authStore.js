import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as authApi from '../api/authApi'

const TOKEN_KEY = 'apelsini:token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY))
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => Boolean(token.value && user.value))

  const setSession = ({ token: nextToken, user: nextUser }) => {
    token.value = nextToken
    user.value = nextUser
    localStorage.setItem(TOKEN_KEY, nextToken)
  }

  async function run(action) {
    loading.value = true
    error.value = null
    try {
      return await action()
    } catch (e) {
      error.value = e.body?.message || e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const register = (form) => run(async () => setSession(await authApi.register(form)))
  const login = (form) => run(async () => setSession(await authApi.login(form)))

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  // pick the user back up from a saved token after a reload
  async function restore() {
    if (!token.value) return
    try {
      user.value = await authApi.fetchMe()
    } catch (e) {
      logout()
    }
  }

  const updateProfile = (changes) => run(async () => (user.value = await authApi.updateMe(changes)))

  return { token, user, loading, error, isLoggedIn, register, login, logout, restore, updateProfile }
})
