<template>
  <form class="panel flex w-full max-w-sm flex-col gap-4 p-5 text-white" @submit.prevent="submit">
    <h2 class="tracking-widest text-orange-400">{{ mode === 'login' ? 'LOG IN' : 'SIGN UP' }}</h2>

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
</style>
