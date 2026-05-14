<script setup lang="ts">
const { t } = useI18n()

useHead({ title: () => t('nav.astro.localEclipse') })
</script>

<template>
  <div class="max-w-2xl mx-auto py-12 text-center">
    <h1 class="codex-heading text-3xl mb-6">{{ t('nav.astro.localEclipse') }}</h1>

    <div
      class="rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-ink-800 p-8 mb-6"
    >
      <p class="text-lg text-ink-500 dark:text-paper-400">{{ t('eclipses.comingSoon') }}</p>
      <p class="mt-3 text-sm text-ink-400 dark:text-paper-500">
        輸入觀測地點，查詢特定日月食事件在當地的初虧、食甚、復圓時刻與食分。
      </p>
    </div>

    <NuxtLink :to="$localePath('/')" class="text-sm hover:text-crimson">← 返回首頁</NuxtLink>
  </div>
</template>
