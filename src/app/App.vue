<template>
  <main class="crt app-screen overflow-y-auto px-4 text-white">
    <!-- single screen for now; swap for <RouterView /> once vue-router is added -->
    <HomePage />
  </main>
</template>

<script setup>
import HomePage from '@/pages/index.vue'
</script>

<style>
html,
body {
  height: 100%;
  background: var(--page-bg, #1a1c2c); /* no white strips on overscroll or behind the browser bars */
  transition: background-color 400ms steps(4);
}

/* exactly one screen tall; dvh follows the mobile browser bars, vh is the fallback */
.app-screen {
  height: 100vh;
  height: 100dvh;
  overscroll-behavior: none;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

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
