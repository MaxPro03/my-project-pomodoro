<template>
  <svg
    :viewBox="`0 0 ${width} ${height}`"
    :width="width * px"
    :height="height * px"
    shape-rendering="crispEdges"
    aria-hidden="true">
    <rect v-for="(p, i) in pixels" :key="i" :x="p.x" :y="p.y" width="1" height="1" :fill="p.color" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rows: { type: Array, required: true },
  palette: { type: Object, required: true },
  px: { type: Number, default: 4 },
})

const width = computed(() => props.rows[0].length)
const height = computed(() => props.rows.length)

const pixels = computed(() =>
  props.rows.flatMap((row, y) =>
    [...row].flatMap((ch, x) => (props.palette[ch] ? [{ x, y, color: props.palette[ch] }] : []))
  )
)
</script>
