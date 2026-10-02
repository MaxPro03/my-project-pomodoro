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
  // same palette keys as the pixel sprite, see ../sprites.js
  palette: { type: Object, required: true },
  pose: { type: String, default: 'stand' }, // stand | work | sit | cheer | lie
  expression: { type: String, default: 'open' }, // open | sleep | happy
  // css size is set by the parent, this only sets the render resolution
  size: { type: Number, default: 168 },
})

const PIXEL = 3 // each rendered pixel is upscaled 3x for the chunky retro look
const FPS = 12 // low frame rate so everything steps like an old console game
const RADIUS = 6
const GROUND = -8.6 // y of the soles
const TILT = 0.12 // resting tilt towards the camera
const DRAG_SPEED = 0.02 // radians per dragged css pixel
const MAX_FLING = 0.6 // radians per frame

// face drawn on the front of the body, as [x, y] of the voxel column facing the camera
const EYES = {
  // 2x2 eyes with a white sparkle in the top left corner
  open: [[-3, 3, 'h'], [-2, 3, 'e'], [-3, 2, 'e'], [-2, 2, 'e'], [2, 3, 'h'], [3, 3, 'e'], [2, 2, 'e'], [3, 2, 'e']],
  closed: [[-3, 2, 'e'], [-2, 2, 'e'], [2, 2, 'e'], [3, 2, 'e']],
  happy: [[-4, 2, 'e'], [-3, 3, 'e'], [-2, 2, 'e'], [2, 2, 'e'], [3, 3, 'e'], [4, 2, 'e']], // ^ ^
}
const MOUTHS = {
  smile: [[-1, 1], [0, 0], [1, 1]],
  small: [[0, 0]],
  grin: [[-1, 1], [0, 1], [1, 1], [0, 0]],
}
const CHEEKS = [[-5, 1], [-4, 1], [-5, 0], [-4, 0], [4, 1], [5, 1], [4, 0], [5, 0]]
const EXPRESSIONS = {
  open: { eyes: 'open', mouth: 'smile' },
  sleep: { eyes: 'closed', mouth: 'small' },
  happy: { eyes: 'happy', mouth: 'grin' },
}

// target angles per pose; the model eases towards them every frame
// arm: how far the arms are raised, leg: forward kick, swing: how much they move back and forth
const POSES = {
  stand: { arm: 0.25, armSwing: 0.08, leg: 0, legSwing: 0, sway: 0.35, speed: 900, sit: 0, lie: 0 },
  work: { arm: 0.4, armSwing: 0.5, leg: 0, legSwing: 0.35, sway: 0.2, speed: 280, sit: 0, lie: 0 },
  sit: { arm: 0.1, armSwing: 0.04, leg: -1.4, legSwing: 0.06, sway: 0.12, speed: 1400, sit: 1, lie: 0 },
  cheer: { arm: 2.5, armSwing: 0.35, leg: 0, legSwing: 0.25, sway: 0.3, speed: 160, sit: 0, lie: 0 },
  lie: { arm: -0.9, armSwing: 0.03, leg: -0.3, legSwing: 0.04, sway: 0, speed: 1500, sit: 0, lie: 1 },
}

const canvas = ref(null)
const dragging = ref(false)

// deterministic noise so the peel dimples don't change between rebuilds
const hash = (x, y, z) => {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return n - Math.floor(n)
}

// hollow voxel sphere plus stem and leaf, each voxel tagged with a palette key
function bodyVoxels() {
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
        // keep the face area clean so dimples don't look like extra eyes
        const onFace = z >= 2 && Math.abs(x) <= 5 && y >= -2 && y <= 4
        const key = onFace ? 'o' : y < -RADIUS * 0.7 && noise < 0.5 ? 'd' : noise < 0.07 ? 'd' : 'o'
        voxels.push([x, y, z, key])
      }
    }
  }
  const top = Math.floor(RADIUS / 1.1)
  voxels.push([0, top + 1, 0, 'b'], [0, top + 2, 0, 'b'])
  for (const [x, y, z] of [[1, top + 2, 0], [2, top + 2, 0], [2, top + 3, 0], [3, top + 3, 0], [1, top + 2, 1], [2, top + 2, 1]]) {
    voxels.push([x, y, z, 'L'])
  }
  return voxels
}

// thin arm hanging down and out from the shoulder, ending in a round glove
const armVoxels = (s) => [
  [s, 0, 0, 'l'],
  [s * 2, -1, 0, 'l'],
  ...[3, 4].flatMap((x) => [-2, -3].flatMap((y) => [0, 1].map((z) => [s * x, y, z, 'g']))),
]

// short leg with a chunky shoe pointing forward
const legVoxels = (s) => [
  [0, -1, 0, 'l'],
  [0, -2, 0, 'l'],
  ...[0, s].flatMap((x) => [0, 1, 2].map((z) => [x, -3, z, 'f'])),
]

let renderer, scene, camera, root, frame
let lastFrame = 0
let parts = [] // { mesh, voxels } for repainting
let body, front, armL, armR, legL, legR, shadow
let blinkFrames = 0
let nextBlink = 0
let pointer = null
let fling = 0 // spin left over after a drag, decays every frame
const cur = { ...POSES.stand }

const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshLambertMaterial({ color: 0xffffff })

function voxelMesh(voxels, parent) {
  const mesh = new THREE.InstancedMesh(geometry, material, voxels.length)
  const matrix = new THREE.Matrix4()
  voxels.forEach(([x, y, z], i) => mesh.setMatrixAt(i, matrix.makeTranslation(x, y, z)))
  parent.add(mesh)
  parts.push({ mesh, voxels })
  return mesh
}

function limb(voxels, x, y) {
  const pivot = new THREE.Group()
  pivot.position.set(x, y, 0)
  voxelMesh(voxels, pivot)
  root.add(pivot)
  return pivot
}

function paint() {
  const { eyes, mouth } = EXPRESSIONS[props.expression] ?? EXPRESSIONS.open
  const face = new Map()
  const draw = (points, key) => points.forEach(([x, y, k]) => face.set(front.get(`${x},${y}`), k ?? key))
  draw(CHEEKS, 'c')
  draw(EYES[blinkFrames > 0 ? 'closed' : eyes])
  draw(MOUTHS[mouth], 'm')

  const color = new THREE.Color()
  for (const { mesh, voxels } of parts) {
    const faceKeys = mesh === body ? face : null
    voxels.forEach(([, , , key], i) => mesh.setColorAt(i, color.set(props.palette[faceKeys?.get(i) ?? key])))
    mesh.instanceColor.needsUpdate = true
  }
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const wrapAngle = (a) => a - Math.PI * 2 * Math.round(a / (Math.PI * 2))

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
  root.rotation.y += dy
  root.rotation.x = clamp(root.rotation.x + dx, -1, 1.2)
  // convert to radians per animation frame so a quick flick keeps spinning
  const dt = Math.max(e.timeStamp - pointer.t, 1)
  fling = clamp((dy / dt) * (1000 / FPS), -MAX_FLING, MAX_FLING)
  pointer = { x: e.clientX, y: e.clientY, t: e.timeStamp }
}

function onPointerUp() {
  pointer = null
  dragging.value = false
}

// blink every few seconds while awake
function blink(time) {
  if (blinkFrames > 0 && --blinkFrames === 0) paint()
  if (props.expression !== 'open' || time < nextBlink) return
  nextBlink = time + 2500 + Math.random() * 3000
  blinkFrames = 2
  paint()
}

function animate(time) {
  const target = POSES[props.pose] ?? POSES.stand
  for (const key in target) cur[key] += (target[key] - cur[key]) * 0.35

  const wave = Math.sin(time / cur.speed * 2)
  armL.rotation.z = -(cur.arm + wave * cur.armSwing)
  armR.rotation.z = cur.arm - wave * cur.armSwing
  legL.rotation.x = cur.leg + wave * cur.legSwing
  legR.rotation.x = cur.leg - wave * cur.legSwing
  // arms are tucked in while lying down, they only stick out awkwardly
  armL.visible = armR.visible = cur.lie < 0.5

  // sitting drops the body onto the ground, lying leans it back onto its side
  root.rotation.z = cur.lie * 1.25
  root.position.set(cur.lie * -1, cur.sit * -2.6 + cur.lie * -2.2, 0)
  body.scale.setScalar(1 + Math.sin(time / 700) * 0.03 * cur.lie) // sleepy breathing
  shadow.scale.set(5.5 + cur.lie * 4.5, 3, 1)

  root.rotation.y += fling
  fling *= 0.85
  // once a fling dies down, turn back to face the viewer and sway
  if (Math.abs(fling) < 0.05) {
    const sway = Math.sin(time / cur.speed) * cur.sway
    root.rotation.y += wrapAngle(sway - root.rotation.y) * 0.35
  }
  root.rotation.x += (TILT - root.rotation.x) * 0.3
}

function loop(time) {
  frame = requestAnimationFrame(loop)
  // follow the finger every frame while dragging, otherwise step at the retro frame rate
  if (!dragging.value) {
    if (time - lastFrame < 1000 / FPS) return
    animate(time)
    blink(time)
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
  camera.position.set(0, 4, 42)
  camera.lookAt(0, -0.5, 0)

  scene.add(new THREE.AmbientLight(0xffffff, 0.45))
  const sun = new THREE.DirectionalLight(0xffffff, 0.85)
  sun.position.set(-6, 10, 8)
  scene.add(sun)

  shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1, 12),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = GROUND
  scene.add(shadow)

  root = new THREE.Group()
  root.rotation.x = TILT
  scene.add(root)

  const voxels = bodyVoxels()
  body = voxelMesh(voxels, root)
  front = new Map()
  voxels.forEach(([x, y, z], i) => {
    const key = `${x},${y}`
    if (!front.has(key) || z > voxels[front.get(key)][2]) front.set(key, i)
  })
  armL = limb(armVoxels(-1), -RADIUS, -1)
  armR = limb(armVoxels(1), RADIUS, -1)
  legL = limb(legVoxels(-1), -2, -5)
  legR = limb(legVoxels(1), 2, -5)

  paint()
  frame = requestAnimationFrame(loop)
})

watch([() => props.palette, () => props.expression], () => body && paint())

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  geometry.dispose()
  material.dispose()
  shadow.geometry.dispose()
  shadow.material.dispose()
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
