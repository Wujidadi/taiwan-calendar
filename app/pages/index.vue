<script setup lang="ts">
// 岱員時憲章 — 首頁
const { t } = useI18n()

useHead({
  title: () => t('site.name'),
})
</script>

<template>
  <section class="max-w-3xl mx-auto py-12 text-center">
    <h1 class="codex-heading text-5xl mb-4">
      {{ t('site.name') }}
    </h1>
    <p class="text-xl text-ink-600 dark:text-paper-300 mb-2">
      {{ t('site.subtitle') }}
    </p>
    <p class="text-base text-ink-500 dark:text-paper-400 leading-relaxed mt-8">
      {{ t('site.description') }}
    </p>
    <nav class="mt-10 flex flex-wrap justify-center gap-4">
      <NuxtLink
        :to="$localePath('/calendar')"
        class="px-5 py-2 border border-ink-400 dark:border-paper-500 rounded hover:text-crimson hover:border-crimson"
      >
        {{ t('nav.calendar.month') }}
      </NuxtLink>
    </nav>
  </section>
</template>
