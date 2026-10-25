<template>
  <button
    class="account text-sm"
    :class="{ 'logged-in': auth.isLoggedIn }"
    :aria-label="auth.isLoggedIn ? `Account: ${auth.user.name}` : 'Log in'"
    @click="open = true">
    {{ auth.isLoggedIn ? initial : '👤' }}
  </button>

  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4" @click.self="close">
      <div class="relative w-full max-w-sm" role="dialog" aria-modal="true" aria-label="Account">
        <button class="absolute right-5 top-5 z-10 text-slate-400 hover:text-white" aria-label="Close" @click="close">
          ✕
        </button>

        <section v-if="auth.isLoggedIn" class="panel flex flex-col gap-4 p-5 text-white">
          <h2 class="tracking-widest text-orange-400">ACCOUNT</h2>
          <div class="text-sm">
            <p>{{ auth.user.name }}</p>
            <p class="text-xs text-slate-400">{{ auth.user.email }}</p>
          </div>
          <p class="text-xs text-slate-400">Your timer and oranges sync between devices.</p>
          <PixelButton color="#566c86" @click="logout">Log out</PixelButton>
        </section>

        <AuthForm v-else @success="close" />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PixelButton from '@/common/ui/PixelButton.vue'
import { useAuthStore } from '../store/authStore'
import AuthForm from './AuthForm.vue'

const auth = useAuthStore()
const open = ref(false)

const initial = computed(() => auth.user.name.trim().charAt(0).toUpperCase() || '?')

const close = () => (open.value = false)

async function logout() {
  await auth.logout()
  close()
}

const onKey = (e) => e.key === 'Escape' && close()

onMounted(() => {
  window.addEventListener('keydown', onKey)
  // the Google login redirects back with ?login=failed when something went wrong
  const url = new URL(window.location.href)
  if (url.searchParams.get('login') === 'failed') {
    auth.error = 'Google login failed, please try again'
    open.value = true
    url.searchParams.delete('login')
    window.history.replaceState(null, '', url)
  }
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.account {
  color: #94a3b8;
}
.account:hover {
  color: #fff;
}
/* the user's initial on an orange pixel tile */
.account.logged-in {
  width: 24px;
  height: 24px;
  color: #fff;
  background: #f7901e;
  box-shadow: inset 0 -3px 0 0 rgb(0 0 0 / 0.3);
}
.panel {
  background: #262b44;
  box-shadow:
    0 -4px 0 0 #1a1c2c,
    0 4px 0 0 #1a1c2c,
    -4px 0 0 0 #1a1c2c,
    4px 0 0 0 #1a1c2c,
    inset 0 0 0 4px #f7901e;
}
</style>
