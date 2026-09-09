<script setup lang="ts">
const localePath = useLocalePath()
definePageMeta({ viewTransition: false })
const { tx } = useMessages()
</script>
<template>
  <div class="home">
    <div class="page-intro">
      <div>
        <h1>{{ tx('本地历史') }}</h1>
        <p>{{ tx('记录保存在当前浏览器，可选择密码保护。') }}</p>
      </div>
      <NuxtLink :to="localePath('/help#history')" class="intro-help"
        >{{ tx('保存与备份') }}<UIcon name="i-lucide-arrow-up-right"
      /></NuxtLink>
    </div>
    <HistoryWorkspace />
  </div>
</template>
