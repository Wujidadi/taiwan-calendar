// 岱員時憲章 — Vitest 設定
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['data/**/*.ts', 'astro/**/*.ts', 'lunar/**/*.ts', 'types/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '#types': fileURLToPath(new URL('./types', import.meta.url)),
      '#data': fileURLToPath(new URL('./data', import.meta.url)),
      '#astro': fileURLToPath(new URL('./astro', import.meta.url)),
      '#lunar': fileURLToPath(new URL('./lunar', import.meta.url)),
    },
  },
})
