<template>
  <main class="bg-gray-200 px-4">
    <!-- <header>
      <div>
        <button>
          Инфо
        </button>
        <button>
          Настройки
        </button>
      </div>
    </header> -->
    <div class="relative flex h-screen min-h-screen flex-col">
      <Timer />
    </div>
  </main>
</template>

<script setup>
  import Timer from './components/Timer.vue'
</script>