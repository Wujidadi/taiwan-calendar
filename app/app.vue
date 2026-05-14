<script setup lang="ts">
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
