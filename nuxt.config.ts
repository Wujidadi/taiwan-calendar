// 岱員時憲章 — Nuxt 設定
// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@unocss/nuxt',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
  ],

  // SPA 模式：分頁殼客戶端 hydration、常綠主題頁可預渲染
  // 使用 routeRules 而非全域 ssr: false，以保留 dev 伺服器相容性
  ssr: true,
  devtools: { enabled: true },

  // 應用程式 metadata
  app: {
    head: {
      title: '岱員時憲章',
      htmlAttrs: { lang: 'zh-Hant-TW' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            '岱員時憲章 — 台灣本位曆譜，涵蓋公元紀年、民國紀年、農曆、二十四節氣、台灣國定假日、天文事件等。',
        },
      ],
    },
  },

  // CSS 入口
  css: ['~/assets/styles/main.css'],

  // 色彩模式：亮／暗／跟隨系統
  colorMode: {
    preference: 'system', // 預設跟隨系統
    fallback: 'light',
    classSuffix: '', // 用 .dark 而非 .dark-mode
    storageKey: 'taiwan-calendar-color-mode',
  },

  // 領域層 path alias：data / astro / lunar / types 與 app/ 同層
  alias: {
    '#types': fileURLToPath(new URL('./types', import.meta.url)),
    '#data': fileURLToPath(new URL('./data', import.meta.url)),
    '#astro': fileURLToPath(new URL('./astro', import.meta.url)),
    '#lunar': fileURLToPath(new URL('./lunar', import.meta.url)),
  },
  routeRules: {
    '/**': { ssr: false },
  },
  compatibilityDate: '2026-05-13',

  // Nitro：GitHub Pages 部署
  nitro: {
    preset: 'github-pages',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false, // 由 typecheck script 另外執行
  },

  // ESLint flat config（產生 eslint.config.mjs 工作流）
  eslint: {
    config: {
      stylistic: {
        indent: 2,
        quotes: 'single',
        semi: false,
      },
    },
  },

  // i18n：預設 zh-TW 無前綴，其他語系加前綴；含 hreflang
  // 每個語系拆成多檔（core / cities / timezones / festivals / reigns / solar-terms）
  i18n: {
    defaultLocale: 'zh-tw',
    strategy: 'prefix_except_default',
    locales: [
      {
        code: 'zh-tw',
        language: 'zh-Hant-TW',
        name: '繁體中文（台灣）',
        files: [
          'zh-tw/core.ts',
          'zh-tw/cities.ts',
          'zh-tw/timezones.ts',
          'zh-tw/festivals.ts',
          'zh-tw/reigns.ts',
          'zh-tw/solar-terms.ts',
        ],
      },
      {
        code: 'zh-cn',
        language: 'zh-Hans-CN',
        name: '简体中文',
        files: [
          'zh-cn/core.ts',
          'zh-cn/cities.ts',
          'zh-cn/timezones.ts',
          'zh-cn/festivals.ts',
          'zh-cn/reigns.ts',
          'zh-cn/solar-terms.ts',
        ],
      },
      {
        code: 'en',
        language: 'en-US',
        name: 'English',
        files: [
          'en/core.ts',
          'en/cities.ts',
          'en/timezones.ts',
          'en/festivals.ts',
          'en/reigns.ts',
          'en/solar-terms.ts',
        ],
      },
    ],
  },
})
