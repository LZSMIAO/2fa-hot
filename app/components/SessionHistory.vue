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
    <p v-else>{{ tx('输入密钥后，最近使用的记录会出现在这里。') }}</p>
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
  margin: 0.375rem 0 0;
  font-size: var(--text-label);
}
.session-rows {
  max-height: 10rem;
  overflow-y: auto;
  margin-top: 0.5rem;
}
.session-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
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
