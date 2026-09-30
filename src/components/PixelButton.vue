<template>
  <button class="pixel-btn" :style="{ '--btn': color }">
    <slot />
  </button>
</template>

<script setup>
defineProps({ color: { type: String, default: '#f7901e' } })
</script>

<style scoped>
/* stepped corners and a hard drop shadow, pressed state moves the button down */
.pixel-btn {
  position: relative;
  padding: 10px 20px;
  color: #fff;
  text-transform: uppercase;
  background: var(--btn);
  box-shadow:
    0 -4px 0 0 #1a1c2c,
    0 4px 0 0 #1a1c2c,
    -4px 0 0 0 #1a1c2c,
    4px 0 0 0 #1a1c2c,
    inset 0 -4px 0 0 rgb(0 0 0 / 0.3),
    inset 0 4px 0 0 rgb(255 255 255 / 0.25),
    0 8px 0 0 #1a1c2c;
  transition: transform 60ms steps(1);
}
.pixel-btn:hover {
  filter: brightness(1.1);
}
.pixel-btn:active {
  transform: translateY(4px);
  box-shadow:
    0 -4px 0 0 #1a1c2c,
    0 4px 0 0 #1a1c2c,
    -4px 0 0 0 #1a1c2c,
    4px 0 0 0 #1a1c2c,
    inset 0 4px 0 0 rgb(0 0 0 / 0.3);
}
.pixel-btn:focus-visible {
  outline: 4px dashed #fff;
  outline-offset: 8px;
}
</style>
