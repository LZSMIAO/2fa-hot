<script setup lang="ts">
import chineseReadme from '../../docs/readme/README.zh-CN.md?raw'
import traditionalReadme from '../../README.md?raw'
import englishReadme from '../../docs/readme/README.en.md?raw'
import { parseAboutReadme } from '~/utils/about-readme'

const localePath = useLocalePath()
defineI18nRoute({ locales: ['en', 'zh-CN', 'zh-TW'] })

definePageMeta({ viewTransition: false })
const { tx, locale } = useMessages()
const chinese = computed(() => locale.value.startsWith('zh'))
const readme = computed(() =>
  locale.value === 'zh-TW' ? traditionalReadme : chinese.value ? chineseReadme : englishReadme
)
const document = computed(() => parseAboutReadme(readme.value))
const introduction = computed(() => document.value.introduction)
const sections = computed(() => document.value.sections)
</script>

<template>
  <article class="content-page">
    <NuxtLink :to="localePath('/')" class="back-link"
      ><UIcon name="i-lucide-arrow-left" />{{ tx('返回工具') }}</NuxtLink
    >
    <h1>{{ tx('关于') }} 2fa.hot</h1>
    <p
      v-for="(paragraph, index) in introduction"
      :key="index"
      :class="{ 'article-lead': index === 0 }"
    >
      <AboutInline :text="paragraph" />
    </p>
    <section v-for="section in sections" :key="section.title">
      <h2>{{ section.title }}</h2>
      <template v-for="(block, index) in section.blocks" :key="index">
        <hr v-if="block.divider" />
        <AboutSpoiler
          v-else-if="block.spoiler"
          :label="block.spoiler.label"
          :text="block.spoiler.text"
        />
        <component :is="block.ordered ? 'ol' : 'ul'" v-else-if="block.list">
          <li v-for="line in block.lines" :key="line"><AboutInline :text="line" /></li>
        </component>
        <p v-else><AboutInline :text="block.lines[0] || ''" /></p>
      </template>
    </section>
    <p>
      <a href="https://github.com/LZSMIAO/2fa-hot" target="_blank" rel="noopener noreferrer"
        >GitHub ↗</a
      >
      · <a href="mailto:admin@2fa.hot">admin@2fa.hot</a>
    </p>
  </article>
</template>
