<script setup lang="ts">
// 岱員時憲章 — 朔氣頁（節氣與合朔一覽）
import { shuoQiCalculator } from '#lunar/ssq'
import { J2000 } from '#astro/constants'
import { gregorianToJulianDay, julianDayToGregorian } from '#astro/julian-day'
import { useEraYear } from '~/composables/useEraYear'

const { t } = useI18n()
const { eraYear } = useEraYear()

useHead({ title: () => t('solarTerms.title') })

// ── 節氣名稱（冬至起，共 24 個） ──
const SOLAR_TERM_NAMES: string[] = [
  '冬至',
  '小寒',
  '大寒',
  '立春',
  '雨水',
  '驚蟄',
  '春分',
  '清明',
  '穀雨',
  '立夏',
  '小滿',
  '芒種',
  '夏至',
  '小暑',
  '大暑',
  '立秋',
  '處暑',
  '白露',
  '秋分',
  '寒露',
  '霜降',
  '立冬',
  '小雪',
  '大雪',
]

// ── 年份選擇 ──
const viewYear = ref(new Date().getFullYear())

function prevYear() {
  viewYear.value--
}
function nextYear() {
  viewYear.value++
}

// ── 計算朔氣資料 ──
interface TermRow {
  name: string
  dateTime: string
}

interface MoonRow {
  name: string
  dateTime: string
}

/** 將 J2000 JD（含小數）格式化為「YYYY-MM-DD HH:MM」（UTC+8） */
function formatJ2000(jd: number): string {
  // shuoQiCalculator 傳回的 JD 已加 8/24（北京時間偏移）
  // 直接轉換即可，+J2000 還原為標準 JD
  const g = julianDayToGregorian((jd + J2000) as never)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${g.year}-${pad(g.month)}-${pad(g.day)} ${pad(g.hour)}:${pad(g.minute)}`
}

const solarTermRows = computed((): TermRow[] => {
  const year = viewYear.value
  // 以該年 3 月 1 日（J2000 基準）做為起算點
  const approxJD = (gregorianToJulianDay(year, 3, 1) as number) - J2000
  shuoQiCalculator.calcYear(approxJD)

  const rows: TermRow[] = []
  for (let i = 0; i < 25; i++) {
    const jd = shuoQiCalculator.centralQiList[i]
    if (jd === undefined) continue
    // 還原為標準 JD 後轉公曆，確認年份是否屬於目標年
    const g = julianDayToGregorian((jd + J2000) as never)
    if (g.year !== year) continue
    rows.push({
      name: SOLAR_TERM_NAMES[i % 24] ?? '',
      dateTime: formatJ2000(jd),
    })
  }
  return rows
})

const newMoonRows = computed((): MoonRow[] => {
  const year = viewYear.value
  const approxJD = (gregorianToJulianDay(year, 3, 1) as number) - J2000
  shuoQiCalculator.calcYear(approxJD)

  const rows: MoonRow[] = []
  for (let i = 0; i < 15; i++) {
    const jd = shuoQiCalculator.newMoonList[i]
    if (jd === undefined) continue
    const g = julianDayToGregorian((jd + J2000) as never)
    if (g.year !== year) continue
    const name = String(shuoQiCalculator.monthNames[i] ?? i)
    rows.push({
      name: `${name}月`,
      dateTime: formatJ2000(jd),
    })
  }
  return rows
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- 頁首：標題與年份導覽 -->
    <div class="flex items-center justify-between mb-6">
      <button
        type="button"
        class="px-3 py-1 text-sm border border-ink-300 dark:border-paper-600 rounded hover:bg-ink-100 dark:hover:bg-paper-700"
        @click="prevYear"
      >
        ← 上一年
      </button>

      <div class="text-center">
        <h1 class="codex-heading text-2xl">
          {{ t('solarTerms.title') }} · {{ eraYear(viewYear) }}
        </h1>
      </div>

      <button
        type="button"
        class="px-3 py-1 text-sm border border-ink-300 dark:border-paper-600 rounded hover:bg-ink-100 dark:hover:bg-paper-700"
        @click="nextYear"
      >
        下一年 →
      </button>
    </div>

    <!-- 雙欄：節氣 + 合朔 -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- 節氣表 -->
      <div>
        <h2 class="codex-heading text-lg mb-3 pb-1 codex-divider">
          {{ t('solarTerms.solarTerm') }}
        </h2>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-ink-500 dark:text-paper-400 text-left">
              <th class="pb-2 font-medium w-16">{{ t('solarTerms.solarTerm') }}</th>
              <th class="pb-2 font-medium">{{ t('solarTerms.dateTime') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in solarTermRows"
              :key="i"
              class="border-t border-paper-200 dark:border-ink-700 hover:bg-paper-100 dark:hover:bg-ink-800"
            >
              <td class="py-1.5 pr-3 font-medium text-gold-700 dark:text-gold-400">
                {{ row.name }}
              </td>
              <td class="py-1.5 font-mono text-xs">{{ row.dateTime }}</td>
            </tr>
            <tr v-if="solarTermRows.length === 0">
              <td colspan="2" class="py-4 text-center text-ink-400 dark:text-paper-500">
                {{ t('common.empty') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 合朔表 -->
      <div>
        <h2 class="codex-heading text-lg mb-3 pb-1 codex-divider">
          {{ t('solarTerms.newMoon') }}
        </h2>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-ink-500 dark:text-paper-400 text-left">
              <th class="pb-2 font-medium w-16">{{ t('solarTerms.newMoon') }}</th>
              <th class="pb-2 font-medium">{{ t('solarTerms.dateTime') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in newMoonRows"
              :key="i"
              class="border-t border-paper-200 dark:border-ink-700 hover:bg-paper-100 dark:hover:bg-ink-800"
            >
              <td class="py-1.5 pr-3 font-medium text-ink-600 dark:text-paper-300">
                {{ row.name }}
              </td>
              <td class="py-1.5 font-mono text-xs">{{ row.dateTime }}</td>
            </tr>
            <tr v-if="newMoonRows.length === 0">
              <td colspan="2" class="py-4 text-center text-ink-400 dark:text-paper-500">
                {{ t('common.empty') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
