<template>
  <form class="panel flex w-full max-w-sm flex-col gap-4 p-5 text-white" @submit.prevent="submit">
    <h2 class="tracking-widest text-orange-400">{{ mode === 'login' ? 'LOG IN' : 'SIGN UP' }}</h2>

    <!-- a full page navigation: the server redirects to Google and back, then sets the session cookie -->
    <a :href="GOOGLE_LOGIN_URL" class="google flex items-center justify-center gap-3 py-3 text-sm">
      <svg viewBox="0 0 48 48" class="h-5 w-5" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
      Continue with Google
    </a>
    <p class="divider text-center text-xs text-slate-500">or with email</p>

    <label v-if="mode === 'register'" class="flex flex-col gap-1 text-xs">
      Name
      <input v-model.trim="form.name" class="field" autocomplete="nickname" required maxlength="40" />
    </label>
    <label class="flex flex-col gap-1 text-xs">
      Email
      <input v-model.trim="form.email" class="field" type="email" autocomplete="email" required />
    </label>
    <label class="flex flex-col gap-1 text-xs">
      Password
      <input
        v-model="form.password"
        class="field"
        type="password"
        :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
        required
        minlength="8" />
    </label>

    <p v-if="auth.error" class="text-xs text-red-400">{{ auth.error }}</p>

    <PixelButton type="submit" :disabled="auth.loading">{{ mode === 'login' ? 'Log in' : 'Create account' }}</PixelButton>
    <button type="button" class="text-xs text-slate-400 hover:text-white" @click="toggleMode">
      {{ mode === 'login' ? 'No account? Sign up' : 'Have an account? Log in' }}
    </button>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import PixelButton from '@/common/ui/PixelButton.vue'
import { GOOGLE_LOGIN_URL } from '../api/authApi'
import { useAuthStore } from '../store/authStore'

const emit = defineEmits(['success'])
const auth = useAuthStore()

const mode = ref('login')
const form = reactive({ name: '', email: '', password: '' })

const toggleMode = () => (mode.value = mode.value === 'login' ? 'register' : 'login')

async function submit() {
  try {
    if (mode.value === 'login') await auth.login(form)
    else await auth.register(form)
    form.password = ''
    emit('success')
  } catch (e) {
    // the error is shown from the store
  }
}
</script>

<style scoped>
.panel {
  background: #262b44;
  box-shadow:
    0 -4px 0 0 #1a1c2c,
    0 4px 0 0 #1a1c2c,
    -4px 0 0 0 #1a1c2c,
    4px 0 0 0 #1a1c2c,
    inset 0 0 0 4px #f7901e;
}
.field {
  padding: 6px 8px;
  color: #fff;
  background: #1a1c2c;
  border: 0;
  box-shadow: inset 0 0 0 2px #566c86;
  outline: none;
}
.field:focus {
  box-shadow: inset 0 0 0 2px #f7901e;
}
.google {
  color: #1a1c2c;
  background: #fff;
  box-shadow: inset 0 -4px 0 0 rgb(0 0 0 / 0.15);
}
.google:hover {
  background: #f1f5f9;
}
.google:focus-visible {
  outline: 4px dashed #fff;
  outline-offset: 4px;
}
.divider {
  display: flex;
  align-items: center;
  gap: 8px;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-top: 2px dashed #333c57;
}
</style>
