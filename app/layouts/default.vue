<script setup lang="ts">
// 預設佈局：頁首（站名 + 語系切換 + 主題切換）、主內容、頁尾
const { t, locale, locales, setLocale } = useI18n()
const colorMode = useColorMode()

// hreflang alternate 連結（SEO）
const head = useLocaleHead({ addDirAttribute: true, addSeoAttributes: true })
useHead(() => ({
  htmlAttrs: head.value.htmlAttrs,
  link: head.value.link,
  meta: head.value.meta,
}))

const availableLocales = computed(() =>
  (locales.value as Array<{ code: string; name: string }>).filter(l => l.code !== locale.value),
)

const themeOptions = [
  { value: 'light', labelKey: 'theme.light' },
  { value: 'dark', labelKey: 'theme.dark' },
  { value: 'system', labelKey: 'theme.system' },
] as const
</script>

<template>
  <div class="page-shell page-shell-dark">
    <header class="codex-divider px-6 py-4 flex items-center justify-between">
      <NuxtLink :to="$localePath('/')" class="codex-heading text-2xl">
        {{ t('site.name') }}
      </NuxtLink>

      <nav class="flex items-center gap-4 text-sm">
        <!-- 語系切換 -->
        <div class="flex items-center gap-2">
          <span class="text-ink-500 dark:text-paper-300">{{ t('locale.label') }}：</span>
          <button
            v-for="l in availableLocales"
            :key="l.code"
            type="button"
            class="hover:text-crimson"
            @click="setLocale(l.code as any)"
          >
            {{ l.name }}
          </button>
        </div>

        <!-- 主題切換 -->
        <div class="flex items-center gap-2">
          <span class="text-ink-500 dark:text-paper-300">{{ t('theme.toggle') }}：</span>
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            type="button"
            class="hover:text-crimson"
            :class="{ 'text-crimson font-semibold': colorMode.preference === opt.value }"
            @click="colorMode.preference = opt.value"
          >
            {{ t(opt.labelKey) }}
          </button>
        </div>
      </nav>
    </header>

    <main class="px-6 py-8">
      <slot />
    </main>

    <footer class="codex-divider px-6 py-4 text-sm text-ink-500 dark:text-paper-400">
      <p>{{ t('site.name') }} · {{ t('site.subtitle') }}</p>
    </footer>
  </div>
</template>
