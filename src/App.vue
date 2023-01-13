<template>
  <main class="bg-gray-200 px-4 -mt-6">
    <header>
      <div>
        <button>
          Инфо
        </button>
        <button>
          Настройки
        </button>
      </div>
    </header>
    <div class="relative flex h-screen min-h-screen flex-col">
      <Timer />
      <StartButton />
    </div>
  </main>
</template>

<script setup>
  import Timer from './components/Timer.vue'
  import StartButton from './components/StartButton.vue'
</script>