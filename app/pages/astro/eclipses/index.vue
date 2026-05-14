<script setup lang="ts">
// 岱員時憲章 — 日月食頁（建置中）
const { t } = useI18n()

useHead({ title: () => t('eclipses.title') })
</script>

<template>
  <div class="max-w-2xl mx-auto py-12 text-center">
    <h1 class="codex-heading text-3xl mb-6">{{ t('eclipses.title') }}</h1>

    <div class="rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-ink-800 p-8 mb-6">
      <p class="text-lg text-ink-500 dark:text-paper-400">{{ t('eclipses.comingSoon') }}</p>
      <p class="mt-3 text-sm text-ink-400 dark:text-paper-500">
        計算未來日食與月食的發生時間、類型（偏食、全食、環食）與地理可見範圍。
      </p>
    </div>

    <NuxtLink :to="$localePath('/')" class="text-sm hover:text-crimson">← 返回首頁</NuxtLink>
  </div>
</template>
