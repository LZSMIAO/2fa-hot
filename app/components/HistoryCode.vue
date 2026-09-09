<script setup lang="ts">
import { groupCode, type OtpConfig } from '~/utils/otp'
const props = defineProps<{ config: OtpConfig }>()
const { tx } = useMessages()
const { code, error, remaining, current } = useOtp(computed(() => props.config))
const { copied, message, copy } = useCopy()
const working = shallowRef(false)
async function copyCode() {
  if (working.value) return
  working.value = true
  try {
    await copy(await current())
  } catch (cause) {
    message.value = (cause as Error).message
  } finally {
    working.value = false
  }
}
</script>
<template>
  <div class="history-code">
    <button
      class="text-action"
      :disabled="!code || !!error || working"
      :aria-label="tx('复制验证码')"
      @click="copyCode"
    >
      <span class="mono">{{ code ? groupCode(code) : '— — —' }}</span>
      <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" />
    </button>
    <small v-if="code">{{ remaining }}s</small>
    <span v-if="copied" class="sr-only" role="status">{{ tx('验证码已复制') }}</span>
    <small v-if="error || message" role="alert">{{ tx(error || message) }}</small>
  </div>
</template>
<style scoped>
.history-code {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.history-code button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 44px;
}
.history-code .mono {
  font-size: 1.5rem;
  white-space: nowrap;
}
.history-code small {
  color: var(--ui-text-muted);
}
</style>
