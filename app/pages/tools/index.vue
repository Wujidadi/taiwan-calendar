<script setup lang="ts">
// 岱員時憲章 — 工具頁（建置中）
const { t } = useI18n()

useHead({ title: () => t('tools.title') })
</script>

<template>
  <div class="max-w-2xl mx-auto py-12 text-center">
    <h1 class="codex-heading text-3xl mb-6">{{ t('tools.title') }}</h1>

    <div
      class="rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-ink-800 p-8 mb-6"
    >
      <p class="text-lg text-ink-500 dark:text-paper-400">{{ t('tools.comingSoon') }}</p>
      <p class="mt-3 text-sm text-ink-400 dark:text-paper-500">
        日期換算（公曆↔儒略日↔干支↔回曆↔民國紀年）、角度格式轉換、時間差計算等常用工具。
      </p>
    </div>

    <NuxtLink :to="$localePath('/')" class="text-sm hover:text-crimson">← 返回首頁</NuxtLink>
  </div>
</template>
