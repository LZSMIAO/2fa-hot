<script setup lang="ts">
import { guides } from '~~/shared/seo/guides'
defineI18nRoute({ locales: ['en', 'zh-CN'] })
definePageMeta({ viewTransition: false })
const { locale, tx } = useMessages()
const localePath = useLocalePath()
const chinese = computed(() => locale.value === 'zh-CN')
const entries = computed(() => guides[chinese.value ? 'zh-CN' : 'en'])
</script>

<template>
  <article class="content-page">
    <NuxtLink :to="localePath('/')" class="back-link"
      ><UIcon name="i-lucide-arrow-left" />{{ tx('返回验证码工具') }}</NuxtLink
    >
    <h1>{{ chinese ? '2FA 与 TOTP 使用指南' : '2FA & TOTP guides' }}</h1>
    <p class="article-lead">
      {{
        chinese
          ? '从了解双重验证开始，到解决验证码错误和迁移验证器账号。'
          : 'Understand two-factor authentication, fix rejected codes and import your authenticator accounts.'
      }}
    </p>
    <section v-for="guide in entries" :key="guide.slug">
      <h2>
        <NuxtLink :to="localePath(`/guides/${guide.slug}`)">{{ guide.title }}</NuxtLink>
      </h2>
      <p>{{ guide.description }}</p>
    </section>
    <p class="guide-help">
      <NuxtLink :to="localePath('/help')">{{ tx('使用说明') }}</NuxtLink> ·
      <NuxtLink :to="localePath('/privacy')">{{ tx('隐私说明') }}</NuxtLink>
    </p>
  </article>
</template>
<style scoped>
.guide-help {
  margin-top: 2.5rem;
}
h1,
h2 {
  text-wrap: balance;
}
</style>
