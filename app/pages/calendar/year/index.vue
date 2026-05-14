<script setup lang="ts">
import { LunarMonth } from '#lunar/lunar-month'
import { useEraYear } from '~/composables/useEraYear'

const { t, tm } = useI18n()
const { eraYear } = useEraYear()

useHead({
  title: () => t('yearCalendar.title'),
})

// ── 年份狀態 ──
const year = ref(new Date().getFullYear())

// ── 年份標示 ──
const yearLabel = computed(() => eraYear(year.value))

// ── 月份簡要資訊 ──
interface MonthSummary {
  /** 月份 1–12 */
  month: number
  /** 月份名稱 */
  name: string
  /** 該月天數 */
  days: number
  /** 月中各節氣標籤（最多 2 個） */
  solarTerms: { day: number; label: string }[]
  /** 月中月相 */
  moonPhases: { day: number; name: string }[]
}

// ── 計算十二個月的簡要資訊 ──
const months = computed((): MonthSummary[] => {
  const monthNames = tm('calendar.months') as string[]
  const result: MonthSummary[] = []

  for (let m = 1; m <= 12; m++) {
    const lm = new LunarMonth()
    lm.calcMonth(year.value, m)

    const solarTerms: { day: number; label: string }[] = []
    const moonPhases: { day: number; name: string }[] = []

    for (let i = 0; i < lm.monthLength; i++) {
      const d = lm.days[i] as Record<string, unknown>
      const label = String(d['solarTermLabel'] ?? '')
      if (label) {
        solarTerms.push({ day: i + 1, label })
      }
      const phase = String(d['moonPhaseName'] ?? '')
      if (phase) {
        moonPhases.push({ day: i + 1, name: phase })
      }
    }

    result.push({
      month: m,
      name: monthNames[m - 1] ?? `${m}月`,
      days: lm.monthLength,
      solarTerms,
      moonPhases,
    })
  }
  return result
})

// ── 導覽 ──
function prevYear() {
  year.value--
}
function nextYear() {
  year.value++
}
function goThisYear() {
  year.value = new Date().getFullYear()
}
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <!-- 頁首：年份導覽 -->
    <div class="flex items-center justify-between mb-8">
      <button
        type="button"
        class="px-3 py-1 text-sm border border-ink-300 dark:border-paper-600 rounded hover:bg-ink-100 dark:hover:bg-paper-700"
        @click="prevYear"
      >
        ← {{ year - 1 }}
      </button>

      <div class="text-center">
        <h2 class="codex-heading text-3xl">
          {{ yearLabel }}
        </h2>
        <button
          type="button"
          class="text-xs text-ink-500 dark:text-paper-400 hover:text-crimson mt-1"
          @click="goThisYear"
        >
          {{ t('common.todayLabel') }}
        </button>
      </div>

      <button
        type="button"
        class="px-3 py-1 text-sm border border-ink-300 dark:border-paper-600 rounded hover:bg-ink-100 dark:hover:bg-paper-700"
        @click="nextYear"
      >
        {{ year + 1 }} →
      </button>
    </div>

    <!-- 十二個月格（3×4） -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="ms in months"
        :key="ms.month"
        class="rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-ink-800 p-4"
      >
        <!-- 月份標題 -->
        <div class="flex items-baseline justify-between mb-3">
          <h3 class="codex-heading text-lg font-semibold">
            {{ ms.name }}
          </h3>
          <span class="text-xs text-ink-400 dark:text-paper-500"> {{ ms.days }} 日 </span>
        </div>

        <div class="codex-divider mb-3" />

        <!-- 節氣列表 -->
        <div class="mb-2">
          <span class="text-xs text-ink-400 dark:text-paper-500 block mb-1">
            {{ t('calendar.solarTermLabel') }}
          </span>
          <div v-if="ms.solarTerms.length" class="flex flex-wrap gap-1">
            <span
              v-for="st in ms.solarTerms"
              :key="st.day"
              class="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded px-1.5 py-0.5"
            >
              <span class="text-ink-400 dark:text-paper-600">{{ st.day }}日</span>
              {{ st.label }}
            </span>
          </div>
          <span v-else class="text-xs text-ink-300 dark:text-paper-600">—</span>
        </div>

        <!-- 月相列表 -->
        <div>
          <span class="text-xs text-ink-400 dark:text-paper-500 block mb-1"> 月相 </span>
          <div v-if="ms.moonPhases.length" class="flex flex-wrap gap-1">
            <span
              v-for="mp in ms.moonPhases"
              :key="mp.day"
              class="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded px-1.5 py-0.5"
            >
              <span class="text-ink-400 dark:text-paper-600">{{ mp.day }}日</span>
              {{ mp.name }}
            </span>
          </div>
          <span v-else class="text-xs text-ink-300 dark:text-paper-600">—</span>
        </div>
      </div>
    </div>
  </div>
</template>
