<script setup lang="ts">
const { tx } = useMessages()
const paused = shallowRef(true)
const mobileMotion = shallowRef(false)
const cube = useTemplateRef<HTMLElement>('cube')
let frame = 0
let lastFrame = 0
let angle = 0
function stopFrame() {
  cancelAnimationFrame(frame)
  frame = 0
  lastFrame = 0
}
function rotateFrame(now: number) {
  if (!lastFrame) lastFrame = now
  const elapsed = now - lastFrame
  if (elapsed >= 1000 / 30) {
    angle = (angle + Math.min(elapsed, 100) / 500) % 360
    if (cube.value)
      cube.value.style.transform = `translateZ(calc(var(--face-size) / 2)) rotateX(-8deg) rotateY(${angle}deg)`
    lastFrame = now
  }
  frame = requestAnimationFrame(rotateFrame)
}
const animationPreferenceKey = '2fa-hot:background-animation'
let explicitPreference = false
function toggleAnimation() {
  paused.value = !paused.value
  explicitPreference = true
  try {
    localStorage.setItem(animationPreferenceKey, paused.value ? 'paused' : 'running')
  } catch {}
}
function restoreAnimation() {
  let saved: string | null = null
  try {
    saved = localStorage.getItem(animationPreferenceKey)
  } catch {}
  explicitPreference = saved === 'paused' || saved === 'running'
  paused.value = explicitPreference ? saved === 'paused' : !!mobile?.matches
}
function syncAnimation(event: StorageEvent) {
  if (event.key === animationPreferenceKey || event.key === null) restoreAnimation()
}
const hidden = shallowRef(false)
const ready = shallowRef(false)
let mobile: MediaQueryList | undefined
function updateMobile() {
  mobileMotion.value = !!mobile?.matches
  if (!explicitPreference) paused.value = !!mobile?.matches
}
const reduced = shallowRef(false)
let preference: MediaQueryList | undefined
function updateVisibility() {
  hidden.value = document.hidden
}
function updatePreference() {
  reduced.value = preference?.matches || false
}
onMounted(() => {
  mobile = window.matchMedia('(max-width: 700px), (max-height: 500px) and (pointer: coarse)')
  restoreAnimation()
  updateMobile()
  window.addEventListener('storage', syncAnimation)
  mobile.addEventListener('change', updateMobile)
  ready.value = true
  preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  updatePreference()
  updateVisibility()
  preference.addEventListener('change', updatePreference)
  document.addEventListener('visibilitychange', updateVisibility)
})
watch(
  () => ready.value && mobileMotion.value && !paused.value && !hidden.value && !reduced.value,
  (running) => {
    stopFrame()
    if (running) frame = requestAnimationFrame(rotateFrame)
    if (!mobileMotion.value && cube.value) cube.value.style.removeProperty('transform')
  },
  { flush: 'post' }
)
onBeforeUnmount(() => {
  stopFrame()
  window.removeEventListener('storage', syncAnimation)
  mobile?.removeEventListener('change', updateMobile)
  preference?.removeEventListener('change', updatePreference)
  document.removeEventListener('visibilitychange', updateVisibility)
})
</script>

<template>
  <div
    class="title-panorama"
    :class="{
      'mobile-motion': mobileMotion,
      paused: !ready || paused || hidden || reduced,
      'is-running': ready && !paused && !hidden && !reduced
    }"
    aria-hidden="true"
  >
    <div class="panorama-camera">
      <div ref="cube" class="panorama-cube">
        <div
          v-for="face in 6"
          :key="face"
          class="panorama-face"
          :class="`face-${face - 1}`"
          :style="{ backgroundImage: `url(/panorama/panorama_${face - 1}.png)` }"
        />
      </div>
    </div>
    <div class="panorama-light" />
    <div class="panorama-shade" />
  </div>
  <button
    v-if="ready && !reduced"
    class="panorama-control"
    :aria-label="tx(paused ? '继续' : '暂停')"
    :title="tx(paused ? '继续' : '暂停')"
    :aria-pressed="paused"
    @click="toggleAnimation"
  >
    <UIcon :name="paused ? 'i-lucide-play' : 'i-lucide-pause'" />
  </button>
</template>

<style scoped>
.title-panorama {
  isolation: isolate;
  --face-size: max(100vw, 100svh);
  position: fixed;
  inset: 0;
  width: 100vw;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: #667e80;
}
.panorama-camera {
  position: absolute;
  inset: 0;
  perspective: calc(var(--face-size) / 2);
  filter: saturate(0.95) contrast(1.02);
}
.panorama-cube {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--face-size);
  height: var(--face-size);
  margin-left: calc(var(--face-size) / -2);
  margin-top: calc(var(--face-size) / -2);
  transform-style: preserve-3d;
  transform: translateZ(calc(var(--face-size) / 2)) rotateX(-8deg) rotateY(0deg);
  animation: panorama-turn 180s linear infinite;
}
.panorama-face {
  position: absolute;
  inset: -1px;
  background-size: 100% 100%;
  backface-visibility: hidden;
}
.face-0 {
  transform: translateZ(calc(var(--face-size) / -2));
}
.face-1 {
  transform: rotateY(-90deg) translateZ(calc(var(--face-size) / -2));
}
.face-2 {
  transform: rotateY(-180deg) translateZ(calc(var(--face-size) / -2));
}
.face-3 {
  transform: rotateY(-270deg) translateZ(calc(var(--face-size) / -2));
}
.face-4 {
  transform: rotateX(-90deg) translateZ(calc(var(--face-size) / -2));
}
.face-5 {
  transform: rotateX(90deg) translateZ(calc(var(--face-size) / -2));
}
.panorama-light {
  position: absolute;
  /* Keep the moving light's edges outside the viewport for the entire cycle. */
  inset: -20%;
  background: radial-gradient(ellipse at 78% 8%, #fff3cb80, transparent 55%);
  mix-blend-mode: screen;
  opacity: 0.16;
  animation: panorama-daylight 36s ease-in-out infinite alternate;
}
.panorama-shade {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, #10141033, #1014104d 65%, #080c1080);
}
:global(.dark .title-panorama .panorama-camera) {
  filter: saturate(0.9) contrast(1.08);
}
:global(.dark .title-panorama .panorama-shade) {
  background: radial-gradient(ellipse at center, #10141099, #101410a3 65%, #080c10bf);
}
:global(.dark .title-panorama .panorama-light) {
  opacity: 0.12;
}
.paused .panorama-cube,
.paused .panorama-light {
  animation-play-state: paused;
}
.panorama-control {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--ui-border);
  background: var(--panel);
  color: var(--ui-text);
  font-size: 0.8125rem;
}
@keyframes panorama-turn {
  to {
    transform: translateZ(calc(var(--face-size) / 2)) rotateX(-8deg) rotateY(360deg);
  }
}
@keyframes panorama-daylight {
  to {
    transform: translateX(-8%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .panorama-cube,
  .panorama-light {
    animation: none;
  }
  .panorama-control {
    display: none;
  }
}
.mobile-motion .panorama-cube {
  animation: none;
}

.panorama-control {
  width: 2.25rem;
  min-height: 2.25rem;
  justify-content: center;
  padding: 0;
  opacity: 0.65;
}
.panorama-control:hover,
.panorama-control:focus-visible {
  opacity: 1;
}
@media (max-width: 700px), (max-height: 500px) and (pointer: coarse) {
  .title-panorama {
    height: 100lvh;
    bottom: auto;
    --face-size: max(100vw, 100lvh);
  }
  .panorama-control {
    position: absolute;
    right: 0.5rem;
    top: 5rem;
    bottom: auto;
    width: 2.75rem;
    min-height: 2.75rem;
    border: 0;
    background: transparent;
  }
}
</style>
