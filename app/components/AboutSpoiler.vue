<script setup lang="ts">
defineProps<{ label: string; text: string }>()
const revealed = shallowRef(false)
const hovered = shallowRef(false)
function hover(event: PointerEvent, value: boolean) {
  if (event.pointerType === 'mouse') hovered.value = value
}
</script>

<template>
  <details
    class="about-spoiler"
    :open="hovered || revealed"
    @pointerenter="hover($event, true)"
    @pointerleave="hover($event, false)"
  >
    <summary @click.prevent="revealed = !revealed">{{ label }}</summary>
    <p><AboutInline :text="text" /></p>
  </details>
</template>

<style scoped>
.about-spoiler {
  border: 2px solid var(--ui-border);
  padding: 0.75rem 1rem;
  background: var(--panel);
}
summary {
  cursor: pointer;
}
summary:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 4px;
}
</style>
