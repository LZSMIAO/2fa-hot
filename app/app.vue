<script setup lang="ts">
import { createVault, vaultKey } from '~/composables/useVault'
import { unlocalizedPath } from '~~/shared/seo/routes'
import TitlePanorama from '~/components/TitlePanorama.vue'
provide(vaultKey, createVault())
const uiLocale = useInterfaceLocale()
useSiteSeo()
</script>
<template>
  <UApp :locale="uiLocale" :toaster="null">
    <TitlePanorama />
    <div class="app-shell">
      <AppHeader />
      <main id="main-content" class="ore-theme">
        <NuxtPage :page-key="(route) => unlocalizedPath(route.path)" />
      </main>
      <AppFooter />
    </div>
  </UApp>
</template>
