# 岱員時憲章 — Claude Code 工作指引

本檔提供 Claude Code 於此倉庫進行開發時所需的脈絡與規範。

## 專案定位

「岱員時憲章」是一部台灣本位的曆譜，涵蓋：

- 公元紀年、民國紀年、農曆等多種紀年系統
- 二十四節氣與傳統氣候事件
- 台灣國定假日、紀念日與民俗節日
- 朔氣、日月升降、日月食、地方食、行星位置、行星事件、恆星、天文常數等天文計算
- 八字推算與曆法工具

技術上採 **Nuxt 4 + Vue 3 + TypeScript + UnoCSS + Reka UI**，純前端 SPA 模式，輸出靜態檔部署至 GitHub Pages。

## 技術棧

- **框架**：Nuxt 4 + Vue 3 + Composition API + `<script setup>`
- **語言**：TypeScript（strict）
- **狀態管理**：Pinia（透過 `@pinia/nuxt`）
- **路由**：Nuxt 檔案路由（`app/pages/`）
- **i18n**：`@nuxtjs/i18n`，三語系：`zh-tw`（預設、無前綴）／`zh-cn`／`en`
- **樣式**：UnoCSS（`@unocss/nuxt`，preset：wind3 / typography / icons）
- **元件**：Reka UI（headless）+ 自製樣式
- **主題**：`@nuxtjs/color-mode`，三選一（亮／暗／跟隨系統）
- **字型**：Noto Serif TC 為主、Noto Sans TC 為輔
- **套件管理 + Runtime**：Bun 1.3+（`bun install`、`bun run dev` 等；`bun.lock` 為文字鎖檔）
- **測試**：Vitest（單元）+ Playwright（E2E，後期加入）
- **CI**：GitHub Actions（`oven-sh/setup-bun@v2`）

## 視覺方向

「傳統古典」：仿古紙、宋體標題、暖色調（宮黃／廟口紅／文房青），月相、節氣、年號排版偏向書冊感。

UnoCSS 主題色票見 `uno.config.ts`：

- `ink`：文房青（主要文字色）
- `paper`：仿古紙色（背景）
- `crimson`：廟口紅（強調色 1：節日、紀念）
- `gold`：宮黃（強調色 2：節氣、月相）
- `seal`：印章硃紅

## 程式碼規範

### 命名

- **變數、函式**：camelCase
- **類別、型別、Vue 元件**：PascalCase
- **常數、列舉**：SCREAMING_SNAKE_CASE
- **檔名、路由、CSS class**：kebab-case
- **所有識別字**：英文 ASCII，不使用中文識別字

### 註釋與內部文件

- 用 **繁體中文（台灣慣用語）** 為主
- 大量使用「台」而非「臺」（如「台北」、「台灣」）
- 兩岸用語差異須注意（如「雪梨」非「悉尼」、「韓國」非「韩国」、「烏茲別克」非「烏茲別克斯坦」）
- i18n 字典條目須以台灣慣用語為 baseline，不做機械繁簡轉換

### 紀年與時間

- 公元年作為基本紀年，於介面各處顯示
- 「國號／年號」欄位：1912 年起一律顯示「民國 N 年」（不與公元並列）；1911 年（含）以前顯示對應歷朝年號
- 預設時區：**台北時間（UTC+8）**
- 首次造訪非台灣時區的使用者，跳一次性切換提示

### 引用禁忌

- 本專案視作獨立、原生的曆法應用程式；程式碼、註釋、commit、文件、README、社群討論皆**不得**指涉、命名、或暗示任何其他既有的曆法計算實作來源或其衍生版本
- 不使用「移植」、「移轉」、「基於 X 改寫」、「fork 自 X」等敘述
- **允許**且**鼓勵**正常引用學術原典：VSOP87（Bretagnon & Francou 1988）、ELP-2000（Chapront-Touzé & Chapront 1983）、IAU2000B（Wallace & Capitaine 2006）、Meeus《Astronomical Algorithms》等，因其為天文學界公開算法與資料

## Git 規範

詳細規則見 [`.github/git-commit-instructions.md`](.github/git-commit-instructions.md)。摘要：

- 採 **Conventional Commits**（`feat:`、`fix:`、`docs:`、`refactor:`、`chore:` 等）
- commit message 一律使用繁體中文（台灣慣用語），不夾雜日語、韓語或其他非中文詞彙
- 變動較多或較複雜時，標題之外列 bullet point 說明異動摘要與各檔變動原因
- commitlint + simple-git-hooks 會強制驗證訊息格式
- 不使用 `--no-verify` 跳過 hook

## 常用指令

```bash
bun install          # 安裝依賴
bun run dev          # 啟動開發伺服器
bun run generate     # 產生靜態檔（GitHub Pages 部署用）
bun run lint         # ESLint 檢查
bun run lint:fix     # ESLint 自動修正
bun run format       # Prettier 格式化
bun run typecheck    # TypeScript 型別檢查
```

## 目錄結構（Nuxt 4 慣例）

```
taiwan-calendar/
├── app/                  # 主應用程式碼
│   ├── app.vue           # 根元件
│   ├── pages/            # 路由分頁
│   ├── layouts/          # 佈局元件
│   ├── components/       # 共用元件
│   ├── composables/      # 共用 composables
│   ├── stores/           # Pinia stores
│   ├── utils/            # 通用工具
│   └── assets/           # 樣式、圖像等需經建置的資源
├── astro/                # 天文計算核心（VSOP87、ELP、IAU2000B、Bessel 元素等）
├── lunar/                # 農曆與曆法核心（SSQ、八字、節氣等）
├── data/                 # 城市、時區、節日、年號等靜態資料表
├── i18n/                 # i18n 字典
│   └── locales/          # zh-tw.ts、zh-cn.ts、en.ts
├── public/               # 不經建置的靜態檔
├── tests/                # 單元測試與 fixtures
└── server/               # Nitro server（SPA 模式下用途有限）
```

## 路由與 i18n

- 預設語系 `zh-tw` 無前綴：`/`、`/calendar`、`/festival/qingming`
- 其他語系加前綴：`/zh-cn/calendar`、`/en/calendar`
- `<NuxtLink>` 應搭配 `$localePath('/path')` 確保跨語系正確
- `useI18n()` 取得 `t`、`locale`、`setLocale` 等

## 開發建議

- 變動前先讀檔
- 演算法層使用 branded types 標記儒略日／角度／座標／時區，避免單位混淆
- 大型數值表用 `readonly` 或 `as const` 鎖定
- 一次只做一件事；commit 切勿過大
