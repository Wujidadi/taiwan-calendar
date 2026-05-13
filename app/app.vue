<script setup lang="ts">
// 岱員時憲章 — 應用程式根元件
const { t } = useI18n()

useHead({
  titleTemplate: (titleChunk?: string) => {
    const siteName = t('site.name')
    return titleChunk && titleChunk !== siteName ? `${titleChunk} | ${siteName}` : siteName
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
