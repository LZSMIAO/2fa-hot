<script setup lang="ts">
const localePath = useLocalePath()
useSeoMeta({ robots: 'noindex, nofollow' })
const { tx, locale } = useMessages()
const uiLocale = useInterfaceLocale()
defineProps<{ error: { statusCode?: number } }>()
</script>
<template>
  <UApp :locale="uiLocale" :toaster="null"
    ><div class="empty-state" style="padding-top: 20vh">
      <UIcon name="i-lucide-compass" />
      <h1 class="text-2xl mt-5">
        {{ tx(error.statusCode === 404 ? '这个页面不存在' : '页面暂时无法打开') }}
      </h1>
      <p class="mt-4">{{ tx('回到工具首页，继续获取验证码。') }}</p>
      <UButton class="primary-button" @click="clearError({ redirect: localePath('/') })">{{
        tx('返回首页')
      }}</UButton>
    </div></UApp
  >
</template>
