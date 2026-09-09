<script setup lang="ts">
import scene from '~/assets/art/desert-interactive.svg?raw'
const { tx } = useMessages()
const active = shallowRef(false)
const month = shallowRef(0)
const line = computed(() => {
  if (month.value >= 3 && month.value <= 5) return '啊，天气好热啊，明明是春天。'
  if (month.value >= 6 && month.value <= 8) return '啊，天气好热啊，果然是夏天。'
  if (month.value >= 9 && month.value <= 11) return '啊，天气好热啊，明明是秋天。'
  return '啊，天气好热啊，明明是冬天。'
})
function greet() {
  month.value = new Date().getMonth() + 1
  active.value = true
}
function hoverGreet() {
  if (active.value || !matchMedia('(hover: hover) and (pointer: fine)').matches) return
  greet()
  window.dispatchEvent(new CustomEvent('2fa-ui-sound', { detail: 'character' }))
}
</script>
<template>
  <div class="desert-accent">
    <button
      type="button"
      class="desert-scene"
      :class="{ active }"
      :aria-label="tx('和丛雨打招呼')"
      @focus="greet"
      @blur="active = false"
      @click="greet"
      @keydown.esc="active = false"
    >
      <span
        class="desert-art"
        @pointerover="hoverGreet"
        @pointerleave="active = false"
        v-html="scene"
      />
      <span v-if="active" class="desert-tip" role="status">{{ tx(line) }}</span>
    </button>
  </div>
</template>
<style scoped>
.desert-accent {
  position: relative;
  height: 11rem;
  pointer-events: none;
}
.desert-scene {
  position: absolute;
  top: calc(50% - 0.5rem);
  left: 50%;
  width: 100%;
  height: 13.5rem;
  padding: 0;
  border: 0;
  background: transparent;
  transform: translate(-50%, -50%);
  pointer-events: none;
  cursor: default;
}
.desert-art {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.desert-art :deep(.desert-svg) {
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.desert-art :deep(.desert-hit polygon) {
  fill: transparent;
  pointer-events: all;
  cursor: default;
}
.desert-tip {
  position: absolute;
  bottom: 48%;
  right: 0;
  width: 43%;
  max-width: 12rem;
  text-align: start;
  padding: 0.375rem 0.625rem;
  border: 2px solid var(--ore-outline);
  background: var(--panel);
  color: var(--ui-text-highlighted);
  box-shadow: var(--ore-window-shadow);
  font-size: var(--text-label);
  line-height: 1.6;
  pointer-events: none;
}
.desert-scene:focus-visible {
  outline: 2px solid var(--ui-text-highlighted);
  outline-offset: 2px;
}
@media (max-width: 700px) {
  .desert-accent {
    height: 9rem;
  }
  .desert-scene {
    top: calc(50% - 0.25rem);
    height: 10.5rem;
  }
}
</style>
