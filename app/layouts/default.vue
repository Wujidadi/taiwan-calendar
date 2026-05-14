<script setup lang="ts">
// 預設佈局：頁首（站名 + 導覽列 + 語系切換 + 主題切換）、主內容、頁尾
const { t, locale, locales, setLocale } = useI18n()
const colorMode = useColorMode()
const route = useRoute()

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

// 導覽列項目
const navItems = computed(() => [
  { labelKey: 'nav.home', path: '/' },
  { labelKey: 'nav.calendar.month', path: '/calendar' },
  { labelKey: 'nav.calendar.year', path: '/calendar/year' },
  { labelKey: 'nav.bazi', path: '/bazi' },
  { labelKey: 'nav.astro.solarTerm', path: '/astro/solar-terms' },
  { labelKey: 'nav.astro.riseSet', path: '/astro/rise-set' },
  { labelKey: 'nav.astro.eclipses', path: '/astro/eclipses' },
  { labelKey: 'nav.astro.localEclipse', path: '/astro/local-eclipse' },
  { labelKey: 'nav.astro.ephemeris', path: '/astro/ephemeris' },
  { labelKey: 'nav.astro.phenomena', path: '/astro/phenomena' },
  { labelKey: 'nav.astro.stars', path: '/astro/stars' },
  { labelKey: 'nav.astro.constants', path: '/astro/constants' },
  { labelKey: 'nav.tools', path: '/tools' },
])

// 判斷是否為當前路由（首頁精確比對，其餘前綴比對）
function isActive(path: string): boolean {
  const localePath = useLocalePath()
  const resolved = localePath(path)
  if (path === '/') return route.path === resolved
  return route.path.startsWith(resolved)
}

// 行動版選單開關
const mobileMenuOpen = ref(false)
</script>

<template>
  <div class="page-shell page-shell-dark">
    <header class="codex-divider px-6 py-4">
      <!-- 頁首上列：站名 + 右側控制項 -->
      <div class="flex items-center justify-between">
        <NuxtLink :to="$localePath('/')" class="codex-heading text-2xl">
          {{ t('site.name') }}
        </NuxtLink>

        <div class="flex items-center gap-4 text-sm">
          <!-- 語系切換 -->
          <div class="flex items-center gap-2">
            <span class="text-ink-500 dark:text-paper-300">{{ t('locale.label') }}：</span>
            <button
              v-for="l in availableLocales"
              :key="l.code"
              type="button"
              class="hover:text-crimson transition-colors"
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
              class="hover:text-crimson transition-colors"
              :class="{ 'text-crimson font-semibold': colorMode.preference === opt.value }"
              @click="colorMode.preference = opt.value"
            >
              {{ t(opt.labelKey) }}
            </button>
          </div>

          <!-- 行動版漢堡鈕（md 以下顯示） -->
          <button
            type="button"
            class="md:hidden hover:text-crimson transition-colors"
            :aria-expanded="mobileMenuOpen"
            aria-label="Toggle navigation"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <span v-if="!mobileMenuOpen">☰</span>
            <span v-else>✕</span>
          </button>
        </div>
      </div>

      <!-- 桌機版導覽列（md 以上顯示） -->
      <nav class="hidden md:flex flex-wrap gap-3 text-sm mt-3">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="$localePath(item.path)"
          class="hover:text-crimson transition-colors"
          :class="{ 'text-crimson font-semibold': isActive(item.path) }"
        >
          {{ t(item.labelKey) }}
        </NuxtLink>
      </nav>

      <!-- 行動版導覽列（mobileMenuOpen 為 true 時顯示） -->
      <nav v-if="mobileMenuOpen" class="md:hidden flex flex-col gap-3 text-sm mt-3">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="$localePath(item.path)"
          class="hover:text-crimson transition-colors"
          :class="{ 'text-crimson font-semibold': isActive(item.path) }"
          @click="mobileMenuOpen = false"
        >
          {{ t(item.labelKey) }}
        </NuxtLink>
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
