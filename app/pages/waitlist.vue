<script setup lang="ts">
import { waitlistLinks } from '~~/shared/waitlist'

definePageMeta({ viewTransition: false })
const localePath = useLocalePath()
const { tx } = useMessages()
</script>

<template>
  <article class="content-page waitlist-page">
    <NuxtLink :to="localePath('/')" class="back-link"
      ><UIcon name="i-lucide-arrow-left" />{{ tx('返回工具') }}</NuxtLink
    >
    <h1>{{ tx('功能许愿') }}</h1>
    <p class="article-lead">{{ tx('看看接下来想做什么，也告诉我们你想要的功能。') }}</p>
    <div class="waitlist-actions">
      <UButton
        :to="waitlistLinks.submit"
        external
        target="_blank"
        rel="noopener noreferrer"
        icon="i-lucide-plus"
        class="waitlist-action waitlist-submit primary-button"
        >{{ tx('我要许愿') }}</UButton
      >
      <UButton
        :to="waitlistLinks.browse"
        external
        target="_blank"
        rel="noopener noreferrer"
        color="neutral"
        variant="outline"
        class="waitlist-action"
        >{{ tx('查看大家的愿望') }}</UButton
      >
    </div>
    <p class="waitlist-note">
      {{ tx('将在新窗口打开 GitHub，提交需要登录，内容公开。请勿填写密钥、验证码或账号密码。') }}
    </p>
    <WaitlistSharing />
    <p>
      {{
        tx(
          '先看看是否已有相同建议，有的话可以点赞或补充。新愿望请说明使用场景、遇到的问题和期待的效果。'
        )
      }}
    </p>
    <p>{{ tx('清单会持续更新，收录不代表承诺上线日期。') }}</p>
    <p>
      <a :href="waitlistLinks.markdown" target="_blank" rel="noopener noreferrer">{{
        tx('查看 GitHub 清单')
      }}</a>
    </p>
  </article>
</template>

<style scoped>
.waitlist-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-block: 1.5rem;
}
.waitlist-page .waitlist-action {
  justify-content: center;
  min-height: 3rem;
  white-space: normal;
  text-align: center;
  text-decoration: none;
  color: var(--ui-text-highlighted);
}
.waitlist-page .waitlist-submit {
  color: white;
  background: var(--action);
}
.waitlist-page .waitlist-submit:hover {
  background: var(--action-hover);
}
.waitlist-page .waitlist-note {
  font-size: var(--text-label);
}
@media (max-width: 480px) {
  .waitlist-actions {
    flex-direction: column;
  }
}
</style>
