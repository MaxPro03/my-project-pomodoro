<template>
  <main class="crt min-h-screen bg-[#1a1c2c] px-4 text-white">
    <Timer />
  </main>
</template>

<script setup>
import Timer from './components/Timer.vue'
</script>

<style>
/* faint CRT scanlines over the whole game screen */
.crt::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(to bottom, rgb(0 0 0 / 0.12) 0 2px, transparent 2px 4px);
}

svg[shape-rendering='crispEdges'] {
  image-rendering: pixelated;
}
</style>
