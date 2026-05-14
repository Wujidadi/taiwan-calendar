<script setup lang="ts">
// 岱員時憲章 — 八字命盤頁
import { computeBazi } from '#lunar/chinese-base'
import { J2000 } from '#astro/constants'
import { gregorianToJulianDay } from '#astro/julian-day'
import { useEraYear } from '~/composables/useEraYear'

const { t } = useI18n()
const { eraYear } = useEraYear()

useHead({
  title: () => t('bazi.title'),
})

// ── 今日預設日期字串（YYYY-MM-DD） ──
const today = new Date()
const pad = (n: number) => String(n).padStart(2, '0')
const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

// ── 輸入狀態 ──
const dateStr = ref(todayStr)
const hourVal = ref(12)

// ── 計算結果 ──
interface BaziResult {
  baziYear:          string
  baziMonth:         string
  baziDay:           string
  baziHour:          string
  baziTrueSolarTime: string
  baziHoursAll:      string
}

const baziResult = ref<BaziResult | null>(null)
const eraLabelResult = ref('')

// 台北經度（弧度）
const TAIPEI_LON = 121.5645 * Math.PI / 180

// ── 計算八字 ──
function calculate() {
  const parts = dateStr.value.split('-').map(Number)
  const y = parts[0]!
  const m = parts[1]!
  const d = parts[2]!

  // 將日期＋時辰合成小數日（加入輸入小時，轉為 UT+0 — 台北為 UTC+8）
  // 公曆日期轉 J2000 起算之儒略日
  const dayFrac = d + hourVal.value / 24 - 8 / 24  // 轉為 UT
  const jd = (gregorianToJulianDay(y, m, dayFrac) as number) - J2000

  const ob: Record<string, unknown> = {}
  computeBazi(jd, TAIPEI_LON, ob)

  baziResult.value = {
    baziYear:          String(ob['baziYear']          ?? ''),
    baziMonth:         String(ob['baziMonth']         ?? ''),
    baziDay:           String(ob['baziDay']           ?? ''),
    baziHour:          String(ob['baziHour']          ?? ''),
    baziTrueSolarTime: String(ob['baziTrueSolarTime'] ?? ''),
    baziHoursAll:      String(ob['baziHoursAll']      ?? ''),
  }

  eraLabelResult.value = eraYear(y)
}

// 頁面載入時預先計算今日
calculate()

// ── 四柱結構（顯示用） ──
interface Pillar {
  label: string
  ganZhi: string
}

const pillars = computed((): Pillar[] => {
  if (!baziResult.value) return []
  return [
    { label: t('bazi.year'),  ganZhi: baziResult.value.baziYear  },
    { label: t('bazi.month'), ganZhi: baziResult.value.baziMonth },
    { label: t('bazi.day'),   ganZhi: baziResult.value.baziDay   },
    { label: t('bazi.hour'),  ganZhi: baziResult.value.baziHour  },
  ]
})
</script>

<template>
  <div class="max-w-3xl mx-auto">

    <!-- 頁標題 -->
    <h2 class="codex-heading text-3xl mb-6">
      {{ t('bazi.title') }}
    </h2>

    <!-- 輸入區 -->
    <div class="rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-ink-800 p-6 mb-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

        <!-- 日期輸入 -->
        <div class="flex flex-col gap-1">
          <label
            for="bazi-date"
            class="text-sm text-ink-500 dark:text-paper-400"
          >
            {{ t('bazi.dateLabel') }}
          </label>
          <input
            id="bazi-date"
            v-model="dateStr"
            type="date"
            class="w-full rounded border border-ink-300 dark:border-paper-600 bg-paper dark:bg-ink-700 text-ink dark:text-paper-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-crimson"
          >
        </div>

        <!-- 時辰輸入 -->
        <div class="flex flex-col gap-1">
          <label
            for="bazi-hour"
            class="text-sm text-ink-500 dark:text-paper-400"
          >
            {{ t('bazi.timeLabel') }}
          </label>
          <input
            id="bazi-hour"
            v-model.number="hourVal"
            type="number"
            min="0"
            max="23"
            class="w-full rounded border border-ink-300 dark:border-paper-600 bg-paper dark:bg-ink-700 text-ink dark:text-paper-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-crimson"
          >
        </div>
      </div>

      <button
        type="button"
        class="w-full sm:w-auto px-6 py-2 rounded bg-crimson hover:bg-crimson-600 text-paper-50 font-medium tracking-wider transition-colors"
        @click="calculate"
      >
        {{ t('bazi.calculate') }}
      </button>
    </div>

    <!-- 八字結果 -->
    <div
      v-if="baziResult"
      class="rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-ink-800 p-6"
    >
      <h3 class="codex-heading text-xl mb-1">
        {{ t('bazi.result') }}
      </h3>
      <p class="text-sm text-ink-500 dark:text-paper-400 mb-5">
        {{ eraLabelResult }}
        <template v-if="baziResult.baziTrueSolarTime">
          · 真太陽時 {{ baziResult.baziTrueSolarTime }}
        </template>
      </p>

      <!-- 四柱橫排顯示 -->
      <div class="grid grid-cols-4 gap-3 mb-6">
        <div
          v-for="pillar in pillars"
          :key="pillar.label"
          class="flex flex-col items-center gap-3 rounded-lg border border-paper-300 dark:border-paper-600 bg-paper dark:bg-ink-700 py-5 px-2"
        >
          <!-- 柱標題 -->
          <span class="text-xs text-ink-400 dark:text-paper-500 tracking-widest">
            {{ pillar.label }}
          </span>

          <!-- 天干 -->
          <span class="text-2xl font-semibold text-crimson dark:text-crimson-400 leading-none">
            {{ pillar.ganZhi.slice(0, 1) }}
          </span>

          <!-- 地支 -->
          <span class="text-2xl font-semibold text-gold dark:text-gold-400 leading-none">
            {{ pillar.ganZhi.slice(1, 2) }}
          </span>

          <!-- 干支合 -->
          <span class="text-xs text-ink-500 dark:text-paper-400 tracking-wider">
            {{ pillar.ganZhi }}
          </span>
        </div>
      </div>

      <div class="codex-divider mb-4" />

      <!-- 全天十三時辰 -->
      <div>
        <p class="text-xs text-ink-400 dark:text-paper-500 mb-2 tracking-widest">
          全天十三時辰
        </p>
        <!-- 將 baziHoursAll 以空格分割後顯示，去除 HTML 標籤（前端以 CSS 標出當前時辰） -->
        <div class="flex flex-wrap gap-1.5">
          <template
            v-for="(token, idx) in baziResult.baziHoursAll.replace(/<[^>]+>/g, '').split(' ')"
            :key="idx"
          >
            <span
              class="inline-block px-2 py-0.5 rounded text-xs font-mono"
              :class="token === baziResult.baziHour
                ? 'bg-crimson text-paper-50 font-semibold'
                : 'bg-paper-200 dark:bg-ink-700 text-ink-600 dark:text-paper-300'"
            >
              {{ token }}
            </span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
