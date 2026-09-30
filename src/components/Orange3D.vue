<template>
  <canvas
    ref="canvas"
    class="orange-3d"
    :class="{ dragging }"
    aria-hidden="true"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp" />
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  // same palette keys as the pixel sprite: o body, w highlight, d shadow, b stem, L leaf
  palette: { type: Object, required: true },
  spinning: { type: Boolean, default: false },
  // css size is set by the parent, this only sets the render resolution
  size: { type: Number, default: 168 },
})

const PIXEL = 3 // each rendered pixel is upscaled 3x for the chunky retro look
const FPS = 12 // low frame rate so the rotation steps like an old console game
const RADIUS = 6
const TILT = 0.15 // resting tilt towards the camera
const DRAG_SPEED = 0.02 // radians per dragged css pixel
const MAX_FLING = 0.6 // radians per frame

const canvas = ref(null)

// deterministic noise so the peel dimples don't change between rebuilds
const hash = (x, y, z) => {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return n - Math.floor(n)
}

// build a hollow voxel sphere plus stem and leaf, each voxel tagged with a palette key
function buildVoxels() {
  const voxels = []
  const inside = (x, y, z) => x * x + (y * 1.1) ** 2 + z * z <= (RADIUS + 0.4) ** 2
  for (let x = -RADIUS; x <= RADIUS; x++) {
    for (let y = -RADIUS; y <= RADIUS; y++) {
      for (let z = -RADIUS; z <= RADIUS; z++) {
        if (!inside(x, y, z)) continue
        const surface = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].some(
          ([dx, dy, dz]) => !inside(x + dx, y + dy, z + dz)
        )
        if (!surface) continue
        const noise = hash(x, y, z)
        const key = y < -RADIUS * 0.7 && noise < 0.5 ? 'd' : noise < 0.07 ? 'd' : 'o'
        voxels.push({ x, y, z, key })
      }
    }
  }
  const top = Math.floor(RADIUS / 1.1)
  voxels.push({ x: 0, y: top + 1, z: 0, key: 'b' }, { x: 0, y: top + 2, z: 0, key: 'b' })
  for (const [x, y, z] of [[1, top + 2, 0], [2, top + 2, 0], [2, top + 3, 0], [3, top + 3, 0], [1, top + 2, 1], [2, top + 2, 1]]) {
    voxels.push({ x, y, z, key: 'L' })
  }
  return voxels
}

let renderer, scene, camera, mesh, voxels, frame, lastFrame = 0

const dragging = ref(false)
let pointer = null
let fling = 0 // spin left over after a drag, decays every frame

function paint() {
  const color = new THREE.Color()
  voxels.forEach((v, i) => mesh.setColorAt(i, color.set(props.palette[v.key])))
  mesh.instanceColor.needsUpdate = true
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

function onPointerDown(e) {
  pointer = { x: e.clientX, y: e.clientY, t: e.timeStamp }
  fling = 0
  dragging.value = true
  canvas.value.setPointerCapture(e.pointerId)
}

function onPointerMove(e) {
  if (!pointer) return
  const dy = (e.clientX - pointer.x) * DRAG_SPEED
  const dx = (e.clientY - pointer.y) * DRAG_SPEED
  mesh.rotation.y += dy
  mesh.rotation.x = clamp(mesh.rotation.x + dx, -1, 1.2)
  // convert to radians per animation frame so a quick flick keeps spinning
  const dt = Math.max(e.timeStamp - pointer.t, 1)
  fling = clamp((dy / dt) * (1000 / FPS), -MAX_FLING, MAX_FLING)
  pointer = { x: e.clientX, y: e.clientY, t: e.timeStamp }
}

function onPointerUp() {
  pointer = null
  dragging.value = false
}

function loop(time) {
  frame = requestAnimationFrame(loop)
  // follow the finger every frame while dragging, otherwise step at the retro frame rate
  if (!dragging.value) {
    if (time - lastFrame < 1000 / FPS) return
    mesh.rotation.y += (props.spinning ? Math.PI / 16 : Math.PI / 48) + fling
    mesh.rotation.x += (TILT - mesh.rotation.x) * 0.3
    fling *= 0.85
  }
  lastFrame = time
  renderer.render(scene, camera)
}

onMounted(() => {
  const res = Math.round(props.size / PIXEL)
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true, antialias: false })
  renderer.setPixelRatio(1)
  renderer.setSize(res, res, false)
  renderer.setClearColor(0x000000, 0)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(30, 1, 1, 100)
  camera.position.set(0, 9, 30)
  camera.lookAt(0, 0.5, 0)

  scene.add(new THREE.AmbientLight(0xffffff, 0.4))
  const sun = new THREE.DirectionalLight(0xffffff, 0.9)
  sun.position.set(-6, 10, 8)
  scene.add(sun)

  voxels = buildVoxels()
  mesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
    voxels.length
  )
  const matrix = new THREE.Matrix4()
  voxels.forEach((v, i) => mesh.setMatrixAt(i, matrix.makeTranslation(v.x, v.y, v.z)))
  mesh.rotation.x = TILT
  scene.add(mesh)
  paint()

  frame = requestAnimationFrame(loop)
})

watch(() => props.palette, () => mesh && paint())

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  mesh.geometry.dispose()
  mesh.material.dispose()
  renderer.dispose()
})
</script>

<style scoped>
.orange-3d {
  image-rendering: pixelated;
  cursor: grab;
  touch-action: none; /* let the finger rotate the orange instead of scrolling the page */
}
.orange-3d.dragging {
  cursor: grabbing;
}
</style>
