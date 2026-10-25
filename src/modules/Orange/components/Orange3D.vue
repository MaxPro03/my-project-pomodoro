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
  pose: { type: String, default: 'stand' }, // stand | run | computer | read | work | sit | cheer | lie
  expression: { type: String, default: 'open' }, // open | sleep | happy
  pace: { type: Number, default: 1 }, // animation speed multiplier, e.g. run faster as the timer runs out
  // css size is set by the parent, this only sets the render resolution (times devicePixelRatio)
  size: { type: Number, default: 168 },
})

const STEP = 1000 / 12 // easing and fling speeds below are tuned per 12 fps step, scaled to the real frame time
const BLINK_MS = 160
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
// arm: how far the arms are raised sideways, armRun: forward/back arm swing opposite to the legs,
// reach: arms turned forward (towards a held prop), pitch: forward arms raised,
// leg: forward kick, legSwing: forward/back leg swing, armSwing: sideways arm wobble,
// bounce: hop on every step, lean: forward tilt, turn: yaw towards a 3/4 view, speed: ms per cycle radian
const POSE = { arm: 0, armSwing: 0, armRun: 0, reach: 0, pitch: 0, leg: 0, legSwing: 0, bounce: 0, lean: 0, turn: 0, sway: 0, speed: 1000, sit: 0, lie: 0 }
const POSES = {
  stand: { ...POSE, arm: 0.25, armSwing: 0.06, sway: 0.25, speed: 1400 },
  run: { ...POSE, arm: 0.35, armRun: 1, legSwing: 0.9, bounce: 0.8, lean: 0.2, turn: 0.5, sway: 0.05, speed: 260 },
  // typing on a laptop on the lap, peeking over the lid
  computer: { ...POSE, armRun: 0.12, reach: 1.6, pitch: 0.1, leg: -1.4, legSwing: 0.04, turn: 0.35, sway: 0.04, speed: 150, sit: 1 },
  // holding an open book under the chin, slowly swaying while reading
  read: { ...POSE, armRun: 0.02, reach: 1.75, pitch: -0.5, leg: -1.4, legSwing: 0.04, lean: 0.1, sway: 0.12, speed: 1600, sit: 1 },
  work: { ...POSE, arm: 0.4, armSwing: 0.3, legSwing: 0.2, sway: 0.15, speed: 650 },
  sit: { ...POSE, arm: 0.1, armSwing: 0.04, leg: -1.4, legSwing: 0.06, sway: 0.1, speed: 1800, sit: 1 },
  cheer: { ...POSE, arm: 2.5, armSwing: 0.3, legSwing: 0.2, sway: 0.25, speed: 280 },
  lie: { ...POSE, arm: -0.9, armSwing: 0.03, leg: -0.3, legSwing: 0.04, speed: 2000, lie: 1 },
}

// props the orange holds in some poses; colors that are not in the orange palette
const GEAR_COLORS = {
  P: '#a7b0c8', // laptop shell
  K: '#3a3f55', // keys
  S: '#7fd8ff', // glowing screen
  O: '#f7901e', // logo
  R: '#d9473f', // book cover
  W: '#fff4e0', // pages
}

const canvas = ref(null)
const dragging = ref(false)

// deterministic noise so the peel dimples don't change between rebuilds
const hash = (x, y, z) => {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return n - Math.floor(n)
}

// Cube World look: only exposed voxel faces are meshed, each corner darkened by
// its neighbours (voxel ambient occlusion) and each voxel slightly tinted
const AO = [0.7, 0.82, 0.92, 1] // corner brightness by number of free neighbours
const JITTER = 0.06 // per-voxel brightness variation
// normal, then two tangents with u x v = normal so quads wind counter-clockwise
const FACES = [
  [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
  [[0, 1, 0], [0, 0, 1], [1, 0, 0]],
  [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
  [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
  [[0, 0, -1], [0, 1, 0], [1, 0, 0]],
]
const CORNERS = [[-1, -1], [1, -1], [1, 1], [-1, 1]]

function voxelGeometry(voxels) {
  const solid = new Set(voxels.map(([x, y, z]) => `${x},${y},${z}`))
  const has = (x, y, z) => solid.has(`${x},${y},${z}`)
  const positions = []
  const normals = []
  const index = []
  const owner = [] // voxel index per vertex, for repainting
  const shade = [] // ao * jitter per vertex
  voxels.forEach(([x, y, z], i) => {
    const tint = 1 - JITTER + hash(x + 0.5, y, z) * JITTER * 2
    for (const [n, u, v] of FACES) {
      const [nx, ny, nz] = [x + n[0], y + n[1], z + n[2]]
      if (has(nx, ny, nz)) continue
      const base = positions.length / 3
      const ao = CORNERS.map(([su, sv]) => {
        const side1 = has(nx + su * u[0], ny + su * u[1], nz + su * u[2])
        const side2 = has(nx + sv * v[0], ny + sv * v[1], nz + sv * v[2])
        const corner = has(nx + su * u[0] + sv * v[0], ny + su * u[1] + sv * v[1], nz + su * u[2] + sv * v[2])
        const level = side1 && side2 ? 0 : 3 - side1 - side2 - corner
        positions.push(
          x + (n[0] + su * u[0] + sv * v[0]) / 2,
          y + (n[1] + su * u[1] + sv * v[1]) / 2,
          z + (n[2] + su * u[2] + sv * v[2]) / 2
        )
        normals.push(...n)
        owner.push(i)
        shade.push(AO[level] * tint)
        return level
      })
      // split the quad along the brighter diagonal so the occlusion gradient stays symmetric
      if (ao[0] + ao[2] > ao[1] + ao[3]) index.push(base, base + 1, base + 2, base, base + 2, base + 3)
      else index.push(base + 1, base + 2, base + 3, base + 1, base + 3, base)
    }
  })
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(positions.length), 3))
  geometry.setIndex(index)
  return { geometry, owner, shade }
}

// hollow voxel sphere plus stem and leaf, each voxel tagged with a palette key
function bodyVoxels() {
  const voxels = []
  // the front is cut flat so the face sits on a clean plane instead of a stepped bulge
  const inside = (x, y, z) => z <= RADIUS - 2 && x * x + (y * 1.1) ** 2 + z * z <= (RADIUS + 0.4) ** 2
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

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
const grid = (xs, ys, zs, key) => xs.flatMap((x) => ys.flatMap((y) => zs.map((z) => [x, y, z, key])))

// laptop on the lap: base with a keyboard, and the lid hinged at the far edge, logo facing the camera
const laptopBase = () => [
  ...grid(range(-4, 4), [-5], [3, 7], 'P'),
  ...grid([-4, 4], [-5], range(4, 6), 'P'),
  ...grid(range(-3, 3), [-5], range(4, 6), 'K'),
]
const laptopLid = () => [
  ...grid(range(-4, 4), range(0, 4), [0], 'S'),
  ...grid(range(-4, 4), range(0, 4), [1], 'P').map((v) => (Math.abs(v[0]) + Math.abs(v[1] - 2) <= 1 ? [v[0], v[1], 1, 'O'] : v)),
]
// one half of an open book: pages towards the orange, cover towards the camera
const bookHalf = (s) => [...grid(range(1, 4).map((x) => x * s), range(-2, 2), [0], 'W'), ...grid(range(1, 4).map((x) => x * s), range(-2, 2), [1], 'R')]

// short leg with a chunky shoe pointing forward
const legVoxels = (s) => [
  [0, -1, 0, 'l'],
  [0, -2, 0, 'l'],
  ...[0, s].flatMap((x) => [0, 1, 2].map((z) => [x, -3, z, 'f'])),
]

let renderer, scene, camera, root, frame
let lastFrame = 0
let parts = [] // { mesh, voxels, owner, shade } for repainting
let body, front, armL, armR, legL, legR, shadow
let gear = {} // pose name -> prop group shown only in that pose
let blinkUntil = 0
let nextBlink = 0
let pointer = null
let fling = 0 // spin left over after a drag, decays every frame
let cycle = 0 // accumulated animation phase, so changing speed or pace never makes the limbs jump
const cur = { ...POSES.stand }

const material = new THREE.MeshLambertMaterial({ vertexColors: true })

function voxelMesh(voxels, parent) {
  const { geometry, owner, shade } = voxelGeometry(voxels)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true // only the ground receives, self-shadowing speckles the stepped sphere
  parent.add(mesh)
  parts.push({ mesh, voxels, owner, shade })
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
  draw(EYES[blinkUntil ? 'closed' : eyes])
  draw(MOUTHS[mouth], 'm')

  const color = new THREE.Color()
  for (const { mesh, voxels, owner, shade } of parts) {
    const faceKeys = mesh === body ? face : null
    const colors = voxels.map(([, , , key], i) => {
      const k = faceKeys?.get(i) ?? key
      return new THREE.Color(props.palette[k] ?? GEAR_COLORS[k])
    })
    const attr = mesh.geometry.attributes.color
    owner.forEach((i, v) => {
      color.copy(colors[i]).multiplyScalar(shade[v])
      attr.setXYZ(v, color.r, color.g, color.b)
    })
    attr.needsUpdate = true
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
  // convert to radians per animation step so a quick flick keeps spinning
  const dt = Math.max(e.timeStamp - pointer.t, 1)
  fling = clamp((dy / dt) * STEP, -MAX_FLING, MAX_FLING)
  pointer = { x: e.clientX, y: e.clientY, t: e.timeStamp }
}

function onPointerUp() {
  pointer = null
  dragging.value = false
}

// blink every few seconds while awake
function blink(time) {
  if (blinkUntil && time >= blinkUntil) {
    blinkUntil = 0
    paint()
  }
  if (props.expression !== 'open' || time < nextBlink) return
  nextBlink = time + 2500 + Math.random() * 3000
  blinkUntil = time + BLINK_MS
  paint()
}

function animate(time, steps) {
  // frame-rate independent version of "move k of the way there every step"
  const ease = (k) => 1 - (1 - k) ** steps
  const target = POSES[props.pose] ?? POSES.stand
  for (const key in target) cur[key] += (target[key] - cur[key]) * ease(0.35)

  cycle += (steps * STEP * props.pace) / cur.speed
  const wave = Math.sin(cycle * 2)
  armL.rotation.z = -(cur.arm + wave * cur.armSwing)
  armR.rotation.z = cur.arm - wave * cur.armSwing
  armL.rotation.x = cur.pitch - wave * cur.armRun
  armR.rotation.x = cur.pitch + wave * cur.armRun
  armL.rotation.y = cur.reach
  armR.rotation.y = -cur.reach
  legL.rotation.x = cur.leg + wave * cur.legSwing
  legR.rotation.x = cur.leg - wave * cur.legSwing
  // arms are tucked in while lying down, they only stick out awkwardly
  armL.visible = armR.visible = cur.lie < 0.5
  for (const pose in gear) gear[pose].visible = props.pose === pose

  // sitting drops the body onto the ground, lying leans it back onto its side
  root.rotation.z = cur.lie * 1.25
  // highest when the legs pass each other, back on the ground at full stride
  const hop = Math.abs(Math.cos(cycle * 2)) * cur.bounce
  root.position.set(cur.lie * -1, cur.sit * -2.6 + cur.lie * -2.2 + hop, 0)
  body.scale.setScalar(1 + Math.sin(time / 700) * 0.03 * cur.lie) // sleepy breathing
  shadow.scale.set(13 + cur.lie * 9 - hop * 2, 7 - hop, 1)

  root.rotation.y += fling * steps
  fling *= 0.85 ** steps
  // once a fling dies down, turn back to face the viewer and sway
  if (Math.abs(fling) < 0.05) {
    const sway = cur.turn + Math.sin(cycle) * cur.sway
    root.rotation.y += wrapAngle(sway - root.rotation.y) * ease(0.35)
  }
  root.rotation.x += (TILT + cur.lean - root.rotation.x) * ease(0.3)
}

function loop(time) {
  frame = requestAnimationFrame(loop)
  const steps = Math.min(time - (lastFrame || time), 250) / STEP
  lastFrame = time
  // while dragging the finger drives the rotation directly
  if (!dragging.value) {
    animate(time, steps)
    blink(time)
  }
  renderer.render(scene, camera)
}

// soft round contact shadow under the feet
function blobTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(0,0,0,0.45)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

onMounted(() => {
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(props.size, props.size, false)
  renderer.setClearColor(0x000000, 0)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(30, 1, 1, 100)
  camera.position.set(0, 4, 42)
  camera.lookAt(0, -0.5, 0)

  // bright sky from above, warm bounce from the ground, a warm sun and a cool rim
  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0xa0703c, 0.6))
  const sun = new THREE.DirectionalLight(0xfff0d8, 0.7)
  sun.position.set(-8, 14, 10)
  sun.castShadow = true
  sun.shadow.mapSize.set(512, 512)
  sun.shadow.camera.left = sun.shadow.camera.bottom = -14
  sun.shadow.camera.right = sun.shadow.camera.top = 14
  sun.shadow.normalBias = 0.05
  sun.shadow.radius = 3
  scene.add(sun)
  const rim = new THREE.DirectionalLight(0x9fc4ff, 0.3)
  rim.position.set(8, 4, -10)
  scene.add(rim)

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.18 }))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = GROUND
  ground.receiveShadow = true
  scene.add(ground)

  shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false })
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = GROUND + 0.01
  scene.add(shadow)
  scene.userData.disposables = [ground.geometry, ground.material, shadow.material.map]

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

  const laptop = new THREE.Group()
  voxelMesh(laptopBase(), laptop)
  const lid = new THREE.Group()
  lid.position.set(0, -4.5, 7.5) // hinge on the far edge of the base
  lid.rotation.x = 0.2 // tilted back, away from the orange
  voxelMesh(laptopLid(), lid)
  laptop.add(lid)
  const book = new THREE.Group()
  book.position.set(0, -3, 5)
  for (const s of [-1, 1]) {
    const half = new THREE.Group()
    half.rotation.y = s * 0.35 // pages fold towards the reader
    voxelMesh(bookHalf(s), half)
    book.add(half)
  }
  gear = { computer: laptop, read: book }
  for (const group of Object.values(gear)) root.add(group)

  paint()
  frame = requestAnimationFrame(loop)
})

watch([() => props.palette, () => props.expression], () => body && paint())

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  parts.forEach(({ mesh }) => mesh.geometry.dispose())
  scene.userData.disposables.forEach((d) => d.dispose())
  material.dispose()
  shadow.geometry.dispose()
  shadow.material.dispose()
  renderer.dispose()
})
</script>

<style scoped>
.orange-3d {
  cursor: grab;
  touch-action: none; /* let the finger rotate the orange instead of scrolling the page */
}
.orange-3d.dragging {
  cursor: grabbing;
}
</style>
