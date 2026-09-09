<script setup lang="ts">
import { inlineTokens } from '~/utils/about-readme'
const props = defineProps<{ text: string }>()
const tokens = computed(() => inlineTokens(props.text))
</script>

<template>
  <template v-for="(token, index) in tokens" :key="index">
    <a v-if="token.kind === 'link'" :href="token.href">{{ token.text }}</a>
    <strong v-else-if="token.kind === 'strong'">{{ token.text }}</strong>
    <code v-else-if="token.kind === 'code'">{{ token.text }}</code>
    <template v-else>{{ token.text }}</template>
  </template>
</template>
