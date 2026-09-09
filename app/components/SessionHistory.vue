<script setup lang="ts">
import type { VaultRecord } from '~/composables/useVault'
const { tx, locale } = useMessages()
const vault = useVault()
const emit = defineEmits<{ select: [] }>()
function select(row: VaultRecord) {
  emit('select')
  vault.pending.value = { ...row }
}
function time(value: number) {
  return new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(value)
}
</script>
<template>
  <section class="session-history" :aria-label="tx('本次会话')">
    <div class="session-heading">
      <strong
        >{{ tx('本次会话') }} <span>{{ vault.recent.value.length }}</span></strong
      >
      <button class="text-action" :disabled="!vault.recent.value.length" @click="vault.clearRecent">
        {{ tx('清空') }}
      </button>
    </div>
    <div
      class="session-body"
      :class="{ 'is-empty': !vault.recent.value.length }"
      :style="{ height: `${Math.min(vault.recent.value.length * 2.75, 10)}rem` }"
      :inert="!vault.recent.value.length"
      :aria-hidden="!vault.recent.value.length"
    >
      <div v-if="vault.recent.value.length" class="session-rows">
        <button
          v-for="row in vault.recent.value"
          :key="row.id"
          class="session-row"
          @click="select(row)"
        >
          <time>{{ time(row.usedAt) }}</time>
          <span class="session-label">{{ row.label || row.issuer || tx('未命名记录') }}</span>
          <code>{{ row.secret.slice(0, 4) }}••••{{ row.secret.slice(-4) }}</code>
          <UIcon name="i-lucide-arrow-up-right" />
        </button>
      </div>
    </div>
  </section>
</template>
<style scoped>
.session-history {
  flex-basis: 100%;
  min-width: 0;
  padding-top: 0.75rem;
  border-top: 1px solid var(--ui-border);
}
.session-heading {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: var(--text-label);
}
.session-heading strong {
  color: var(--ui-text-highlighted);
}
.session-heading span,
.session-history p {
  color: var(--ui-text-muted);
}
.session-heading button {
  margin-inline-start: auto;
}
.session-history p {
  margin: 0;
  min-height: 2.75rem;
  display: flex;
  align-items: center;
  font-size: var(--text-label);
}
.session-body {
  margin-top: 0.5rem;
  overflow: hidden;
  transition:
    height 240ms cubic-bezier(0.22, 1, 0.36, 1),
    margin-top 240ms cubic-bezier(0.22, 1, 0.36, 1);
}
.session-body.is-empty {
  margin-top: 0;
}
.session-rows {
  height: 100%;
  overflow-y: auto;
  scrollbar-gutter: stable;
  animation: session-appear 240ms ease-out;
}
.session-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  height: 2.75rem;
  padding: 0.625rem 0;
  border-top: 1px solid var(--ui-border);
  text-align: start;
  font-size: var(--text-label);
  cursor: pointer;
}
.session-row:hover {
  background: var(--wash);
}
.session-row time {
  color: var(--ui-text-muted);
}
@keyframes session-appear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .session-body {
    transition: none;
  }
  .session-rows {
    animation: none;
  }
}
.session-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 700px) {
  .session-history {
    padding-inline: 0;
  }
  .session-row {
    gap: 0.5rem;
  }
}
</style>
