# 岱員時憲章 — GitHub Copilot 指引

## 專案脈絡

「岱員時憲章」是一部台灣本位的曆譜，使用 Nuxt 4 + Vue 3 + TypeScript + UnoCSS + Reka UI 建構，純前端 SPA，部署 GitHub Pages。

## 語言與用語

- 註釋、文件、commit message、PR 描述一律使用 **繁體中文（台灣慣用語）**
- 不採機械繁簡轉換；地名與外來詞按台灣習慣用字（例：「雪梨」非「悉尼」）
- 「台」字統一使用而非「臺」（如「台北」、「台灣」、「台中」）
- 程式識別字一律英文 ASCII

## 技術約定

- **框架**：Nuxt 4 + Vue 3 Composition API + `<script setup>`
- **TypeScript** strict 模式；演算法層使用 branded types
- **樣式**：UnoCSS（不使用 Tailwind）
- **元件**：Reka UI（headless）+ 自製樣式
- **套件管理 + Runtime**：Bun（不使用 npm/pnpm/yarn）

## 紀年顯示規則

- 公元年於介面各處顯示為基本紀年
- 「國號／年號」欄位：1912 年起至今顯示「民國 N 年」；1911 年（含）以前顯示對應歷朝年號（清光緒、宣統、明萬曆等）

## 命名規範

- camelCase：變數、函式
- PascalCase：類別、型別、Vue 元件
- SCREAMING_SNAKE_CASE：常數、列舉
- kebab-case：檔名、路由、CSS class

## Commit 規範

詳見 [`git-commit-instructions.md`](git-commit-instructions.md)。摘要：

- 採 Conventional Commits：`feat:`、`fix:`、`docs:`、`refactor:`、`style:`、`test:`、`build:`、`ci:`、`chore:`、`revert:`
- 訊息一律使用繁體中文（台灣慣用語），不夾雜日語、韓語或其他非中文詞彙
- 變動較多或較複雜時，標題之外列 bullet point 說明異動摘要與各檔變動原因

## 引用禁忌

- 本專案視作獨立、原生實作；程式、註釋、commit、文件**不得**指涉、命名或暗示其他既有曆法計算實作來源或其衍生版本
- 不使用「移植」、「移轉」、「基於 X 改寫」、「fork 自 X」等敘述
- 允許且鼓勵引用學術原典：VSOP87、ELP-2000、IAU2000B、Meeus《Astronomical Algorithms》等
