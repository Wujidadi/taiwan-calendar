// 視覺方向：傳統古典（仿古紙、宋體、暖色調）
import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetTypography(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],

  transformers: [transformerDirectives(), transformerVariantGroup()],

  // 主題：傳統古典色票
  theme: {
    colors: {
      // 主色系：暖色為主，呼應「仿古紙、宋體、暖色」設計方向
      ink: {
        // 文房青 — 主要文字色
        50: '#f3f5f6',
        100: '#dde3e5',
        200: '#b5bfc3',
        300: '#8b989e',
        400: '#65747a',
        500: '#475358',
        600: '#363f43',
        700: '#262c2f',
        800: '#181c1e',
        900: '#0d0f10',
        DEFAULT: 'var(--color-ink, #363f43)',
      },
      paper: {
        // 仿古紙底色
        50: '#fbf8f1',
        100: '#f6f0e1',
        200: '#ede0c2',
        300: '#e2cf9d',
        400: '#d4b870',
        500: '#bf9b46',
        600: '#9a7a30',
        700: '#735a25',
        800: '#4d3c1a',
        900: '#291f0e',
        DEFAULT: 'var(--color-paper, #f6f0e1)',
      },
      crimson: {
        // 廟口紅 — 強調色（節日、紀念）
        50: '#fdf2f1',
        100: '#fadddc',
        200: '#f4b5b3',
        300: '#ec837e',
        400: '#df514a',
        500: '#c43028',
        600: '#9c241d',
        700: '#741b16',
        800: '#4e120f',
        900: '#2a0a08',
        DEFAULT: 'var(--color-crimson, #9c241d)',
      },
      gold: {
        // 宮黃 — 次要強調色（節氣、月相）
        50: '#fcf7e8',
        100: '#f7ebc1',
        200: '#eed684',
        300: '#e3bd47',
        400: '#cda01f',
        500: '#a37e16',
        600: '#7d5f10',
        700: '#5a440b',
        800: '#3a2c07',
        900: '#1d1604',
        DEFAULT: 'var(--color-gold, #a37e16)',
      },
      seal: {
        // 印章硃紅
        DEFAULT: 'var(--color-seal, #b1281f)',
      },
    },

    fontFamily: {
      // 配合「傳統古典」視覺：宋體為主
      serif: '"Noto Serif TC", "Noto Serif CJK TC", "Source Han Serif TC", serif',
      sans: '"Noto Sans TC", "Noto Sans CJK TC", "Source Han Sans TC", sans-serif',
      // 數字、英文用稍粗的等寬古典字
      mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
  },

  // 常用簡寫
  shortcuts: {
    'page-shell': 'min-h-screen bg-paper text-ink font-serif',
    'page-shell-dark': 'dark:bg-ink-900 dark:text-paper-100',
    'codex-heading': 'font-serif tracking-wider text-ink-700 dark:text-paper-200',
    'codex-divider': 'border-b border-paper-400/40 dark:border-paper-700/30',
  },

  // 啟用屬性化模式（attributify）— 部分情境可讀性更好
  // 預設關閉以保持類名簡潔
})
