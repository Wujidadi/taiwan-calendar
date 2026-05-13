// 岱員時憲章 — ESLint flat config
// 透過 @nuxt/eslint 整合 Nuxt + Vue + TypeScript 規則
// 末段以 eslint-config-prettier 關閉與 Prettier 衝突的格式規則
import prettierConfig from 'eslint-config-prettier/flat'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // 專案層額外規則
  {
    rules: {
      // 允許 console（暫時，正式上線前再收緊）
      'no-console': 'warn',
      // Vue 元件名稱用 PascalCase
      'vue/multi-word-component-names': 'off',
    },
  },
  // 必須放在最後：關閉與 Prettier 衝突的格式規則
  prettierConfig,
)
