<script setup lang="ts">
import { guides } from '~~/shared/seo/guides'
defineI18nRoute({ locales: ['en', 'zh-CN'] })
definePageMeta({ viewTransition: false })
const route = useRoute()
const { locale, tx } = useMessages()
const localePath = useLocalePath()
const chinese = computed(() => locale.value === 'zh-CN')
const entries = computed(() => guides[chinese.value ? 'zh-CN' : 'en'])
const guide = computed(() => entries.value.find((item) => item.slug === route.params.slug))
if (!guide.value) throw createError({ statusCode: 404, statusMessage: 'Guide not found' })
const related = computed(() => entries.value.filter((item) => item.slug !== guide.value?.slug))
</script>

<template>
  <article v-if="guide" class="content-page">
    <NuxtLink :to="localePath('/guides')" class="back-link"
      ><UIcon name="i-lucide-arrow-left" />{{ chinese ? '全部指南' : 'All guides' }}</NuxtLink
    >
    <h1>{{ guide.title }}</h1>
    <p class="article-lead">{{ guide.description }}</p>
    <p class="guide-byline">
      {{ chinese ? '作者：' : 'By ' }}<NuxtLink :to="localePath('/about')">2fa.hot</NuxtLink>
    </p>
    <nav class="article-nav" :aria-label="tx('本页目录')">
      <a v-for="section in guide.sections" :key="section.id" :href="`#${section.id}`">{{
        section.title
      }}</a>
    </nav>
    <section v-for="section in guide.sections" :key="section.id">
      <h2 :id="section.id">{{ section.title }}</h2>
      <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
      <ol v-if="section.steps">
        <li v-for="step in section.steps" :key="step">{{ step }}</li>
      </ol>
    </section>
    <h2>{{ chinese ? '参考资料' : 'Sources' }}</h2>
    <ul>
      <li v-for="source in guide.sources" :key="source.url">
        <a :href="source.url" rel="noopener noreferrer">{{ source.title }}</a>
      </li>
    </ul>
    <h2>{{ chinese ? '继续阅读' : 'Related guides' }}</h2>
    <ul>
      <li v-for="item in related" :key="item.slug">
        <NuxtLink :to="localePath(`/guides/${item.slug}`)">{{ item.title }}</NuxtLink>
      </li>
    </ul>
    <p>
      <NuxtLink :to="localePath('/')">{{ tx('返回验证码工具') }}</NuxtLink> ·
      <NuxtLink :to="localePath('/help')">{{ tx('使用说明') }}</NuxtLink>
    </p>
  </article>
</template>
<style scoped>
h1,
h2 {
  text-wrap: balance;
}
.guide-byline {
  font-size: var(--text-label);
}
p {
  text-wrap: pretty;
}
</style>
