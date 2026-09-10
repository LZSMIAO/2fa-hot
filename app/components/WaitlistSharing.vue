<script setup lang="ts">
import { waitlistLinks } from '~~/shared/waitlist'
const { tx } = useMessages()
</script>

<template>
  <section class="waitlist-sharing" aria-labelledby="sharing-title">
    <p class="sharing-status">{{ tx('探索中 · 尚未上线') }}</p>
    <h2 id="sharing-title">{{ tx('授权取码分享') }}</h2>
    <p>{{ tx('密钥留在本人设备，接收人经授权后只获取验证码。支持限时分享与撤销。') }}</p>
    <p>
      {{
        tx(
          '优先探索本人在线代算：分享者需保持在线；撤销后停止提供新码，已收到的有效验证码无法收回。'
        )
      }}
    </p>
    <a :href="waitlistLinks.sharing" target="_blank" rel="noopener noreferrer">{{
      tx('设计说明与备选方案（GitHub）')
    }}</a>
  </section>
</template>

<style scoped>
.waitlist-sharing {
  border-block: 1px solid var(--ui-border);
  padding-block: 1.75rem;
  margin-block: 2rem;
}
.waitlist-sharing .sharing-status {
  width: fit-content;
  margin: 0 0 0.75rem;
  padding: 0.25rem 0.625rem;
  border: 1px solid var(--ui-border);
  background: var(--wash);
  color: var(--ui-text-highlighted);
  font-size: var(--text-label);
}
.waitlist-sharing h2 {
  margin-top: 0;
}
</style>
