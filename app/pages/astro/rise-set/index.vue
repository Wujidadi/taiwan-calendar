<script setup lang="ts">
import { multiDayRiseTransitSet } from '#astro/rise-set'
import { gregorianToJulianDay } from '#astro/julian-day'
import { J2000, DEG_TO_RAD } from '#astro/constants'
import type { Observer } from '#astro/rise-set'

const { t } = useI18n()

useHead({ title: () => t('riseSet.title') })

// ── 觀測地點：預設台北 ──
const lonDeg = ref(121.5645)
const latDeg = ref(25.0329)

// ── 月份選擇 ──
const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth() + 1)

function prevMonth() {
  if (viewMonth.value === 1) {
    viewYear.value--
    viewMonth.value = 12
  } else viewMonth.value--
}
function nextMonth() {
  if (viewMonth.value === 12) {
    viewYear.value++
    viewMonth.value = 1
  } else viewMonth.value++
}

/** 該月天數 */
const daysInMonth = computed(() => new Date(viewYear.value, viewMonth.value, 0).getDate())

/** 月份標題 */
const monthTitle = computed(() => {
  const months = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ]
  return `${months[viewMonth.value - 1]} ${viewYear.value}`
})

// ── 計算各日升降資料 ──
interface RiseSetRow {
  day: number
  isToday: boolean
  sunrise: string
  noon: string
  sunset: string
  moonrise: string
  moonTransit: string
  moonset: string
}

const TZ_OFFSET = 8 / 24 // UTC+8

const rows = computed((): RiseSetRow[] => {
  const observer: Observer = {
    longitude: lonDeg.value * DEG_TO_RAD,
    latitude: latDeg.value * DEG_TO_RAD,
  }
  const n = daysInMonth.value
  // 起始儒略日：當月 1 日中午（UTC），轉為 J2000 起算
  const startJd = (gregorianToJulianDay(viewYear.value, viewMonth.value, 1.5) as number) - J2000

  const data = multiDayRiseTransitSet(startJd, n, observer, TZ_OFFSET)

  return data.map((row, i) => ({
    day: i + 1,
    isToday:
      viewYear.value === today.getFullYear() &&
      viewMonth.value === today.getMonth() + 1 &&
      i + 1 === today.getDate(),
    sunrise: row.s === '--:--:--' ? '—' : row.s.slice(0, 5),
    noon: row.z === '--:--:--' ? '—' : row.z.slice(0, 5),
    sunset: row.j === '--:--:--' ? '—' : row.j.slice(0, 5),
    moonrise: row.Ms === '--:--:--' ? '—' : row.Ms.slice(0, 5),
    moonTransit: row.Mz === '--:--:--' ? '—' : row.Mz.slice(0, 5),
    moonset: row.Mj === '--:--:--' ? '—' : row.Mj.slice(0, 5),
  }))
})
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <!-- 頁首：標題 -->
    <div class="mb-6">
      <h1 class="codex-heading text-2xl mb-4">{{ t('riseSet.title') }}</h1>

      <!-- 觀測地點設定 -->
      <div
        class="flex flex-wrap gap-4 items-center mb-4 p-3 rounded-lg bg-paper-100 dark:bg-ink-800 border border-paper-300 dark:border-ink-600"
      >
        <span class="text-sm font-medium text-ink-600 dark:text-paper-300">{{
          t('riseSet.observer')
        }}</span>
        <label class="flex items-center gap-1.5 text-sm">
          <span class="text-ink-500 dark:text-paper-400">{{ t('riseSet.longitude') }}</span>
          <input
            v-model.number="lonDeg"
            type="number"
            step="0.0001"
            min="-180"
            max="180"
            class="w-24 px-2 py-0.5 border border-ink-300 dark:border-paper-600 rounded bg-paper-50 dark:bg-ink-700 text-sm font-mono"
          />
          <span class="text-ink-400 dark:text-paper-500">°</span>
        </label>
        <label class="flex items-center gap-1.5 text-sm">
          <span class="text-ink-500 dark:text-paper-400">{{ t('riseSet.latitude') }}</span>
          <input
            v-model.number="latDeg"
            type="number"
            step="0.0001"
            min="-90"
            max="90"
            class="w-24 px-2 py-0.5 border border-ink-300 dark:border-paper-600 rounded bg-paper-50 dark:bg-ink-700 text-sm font-mono"
          />
          <span class="text-ink-400 dark:text-paper-500">°</span>
        </label>
      </div>

      <!-- 月份導覽 -->
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="px-3 py-1 text-sm border border-ink-300 dark:border-paper-600 rounded hover:bg-ink-100 dark:hover:bg-paper-700"
          @click="prevMonth"
        >
          ← 上月
        </button>
        <span class="codex-heading text-lg">{{ monthTitle }}</span>
        <button
          type="button"
          class="px-3 py-1 text-sm border border-ink-300 dark:border-paper-600 rounded hover:bg-ink-100 dark:hover:bg-paper-700"
          @click="nextMonth"
        >
          下月 →
        </button>
      </div>
    </div>

    <!-- 升降時刻表 -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="bg-paper-100 dark:bg-ink-800 text-ink-500 dark:text-paper-400">
            <th class="px-2 py-2 text-left font-medium w-10">日</th>
            <th class="px-2 py-2 text-center font-medium">{{ t('riseSet.sunrise') }}</th>
            <th class="px-2 py-2 text-center font-medium">{{ t('riseSet.noon') }}</th>
            <th class="px-2 py-2 text-center font-medium">{{ t('riseSet.sunset') }}</th>
            <th
              class="px-2 py-2 text-center font-medium border-l border-paper-300 dark:border-ink-600"
            >
              {{ t('riseSet.moonrise') }}
            </th>
            <th class="px-2 py-2 text-center font-medium">{{ t('riseSet.moonTransit') }}</th>
            <th class="px-2 py-2 text-center font-medium">{{ t('riseSet.moonset') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.day"
            class="border-t border-paper-200 dark:border-ink-700 hover:bg-paper-100 dark:hover:bg-ink-800"
            :class="{ 'bg-crimson-50 dark:bg-crimson-900/10 font-semibold': row.isToday }"
          >
            <td class="px-2 py-1.5 text-left">
              <span
                :class="
                  row.isToday
                    ? 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-crimson text-paper-50 text-xs'
                    : ''
                "
                >{{ row.day }}</span
              >
            </td>
            <td class="px-2 py-1.5 text-center font-mono text-amber-700 dark:text-amber-400">
              {{ row.sunrise }}
            </td>
            <td class="px-2 py-1.5 text-center font-mono text-ink-500 dark:text-paper-400">
              {{ row.noon }}
            </td>
            <td class="px-2 py-1.5 text-center font-mono text-orange-700 dark:text-orange-400">
              {{ row.sunset }}
            </td>
            <td
              class="px-2 py-1.5 text-center font-mono text-blue-600 dark:text-blue-400 border-l border-paper-200 dark:border-ink-700"
            >
              {{ row.moonrise }}
            </td>
            <td class="px-2 py-1.5 text-center font-mono text-ink-400 dark:text-paper-500">
              {{ row.moonTransit }}
            </td>
            <td class="px-2 py-1.5 text-center font-mono text-indigo-600 dark:text-indigo-400">
              {{ row.moonset }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 圖例 -->
    <div class="mt-4 flex flex-wrap gap-4 text-xs text-ink-400 dark:text-paper-500">
      <span class="flex items-center gap-1">
        <span class="text-amber-700 dark:text-amber-400 font-medium">■</span>
        {{ t('riseSet.sunrise') }} / {{ t('riseSet.sunset') }}
      </span>
      <span class="flex items-center gap-1">
        <span class="text-blue-600 dark:text-blue-400">■</span>
        {{ t('riseSet.moonrise') }} / {{ t('riseSet.moonset') }}
      </span>
      <span class="text-ink-300 dark:text-paper-600">— = 無升降現象</span>
      <span class="text-ink-300 dark:text-paper-600">時間為 UTC+8（台灣標準時間）</span>
    </div>
  </div>
</template>
