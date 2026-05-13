# 岱員時憲章

> 一部台灣本位的曆譜。

涵蓋公元紀年、民國紀年、農曆、二十四節氣、台灣國定假日、朔氣、日月升降、日月食、地方食、行星位置與事件、恆星、八字、天文常數及曆法工具。

## 技術棧

- Nuxt 4 + Vue 3 Composition API + `<script setup>`
- TypeScript（strict 模式）
- UnoCSS + Reka UI
- Pinia + `@nuxtjs/i18n` + `@nuxtjs/color-mode`
- Bun 1.3+（套件管理 + JavaScript runtime）

## 開發

需求：Bun 1.3 或以上。

```bash
bun install          # 安裝依賴
bun run dev          # 啟動開發伺服器（http://localhost:3000）
bun run generate     # 產生靜態檔（用於 GitHub Pages 部署）
bun run lint         # ESLint 檢查
bun run format       # Prettier 格式化
bun run typecheck    # TypeScript 型別檢查
```

## 部署

採 SPA 模式靜態化部署於 GitHub Pages。`main` 分支推送後 CI 自動執行 `bun run generate` 並部署。

## 學術參考

天文計算依據以下公開算法與資料：

- VSOP87（行星理論，Bretagnon & Francou 1988）
- ELP-2000（月球理論，Chapront-Touzé & Chapront 1983）
- IAU2000B（國際天文學聯合會 2000 章動模型，Wallace & Capitaine 2006）
- Meeus, J. _Astronomical Algorithms_（1998）

## 授權

待定。
