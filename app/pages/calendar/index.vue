<script setup lang="ts">
// 岱員時憲章 — 月曆頁
import { LunarMonth } from '#lunar/lunar-month'
import { J2000 } from '#astro/constants'

const { t, tm, locale } = useI18n()

useHead({
  title: () => t('nav.calendar.month'),
})

// ── 當前月份狀態 ──
const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth() + 1)

// ── 農曆月資料（依 viewYear/viewMonth 重算） ──
const lunarMonth = computed(() => {
  const m = new LunarMonth()
  m.calcMonth(viewYear.value, viewMonth.value)
  return m
})

// ── 年份顯示（依語系切換曆元） ──
const yearLabel = computed(() => {
  const y = viewYear.value
  if (locale.value === 'zh-tw') {
    if (y >= 1912) return `民國 ${y - 1911} 年`
    if (y > 0) return `公元前 ${1 - y} 年`
  }
  return `${y}`
})

// ── 月名 ──
const monthName = computed(() => {
  const months = tm('calendar.months') as string[]
  return months[viewMonth.value - 1] ?? ''
})

// ── 月曆格（含前補空格） ──
interface CalCell {
  day: number
  lunarDayName: string
  lunarMonthName: string
  lunarLeap: string
  solarTermLabel: string
  isNewMoon: boolean
  weekday: number
  isToday: boolean
  moonPhaseName: string
  holidayA: string
}

const cells = computed((): (CalCell | null)[] => {
  const lm = lunarMonth.value
  const firstWeekday = lm.firstWeekday as number
  const result: (CalCell | null)[] = Array(firstWeekday).fill(null)

  for (let i = 0; i < lm.monthLength; i++) {
    const d = lm.days[i] as Record<string, unknown>
    result.push({
      day: i + 1,
      lunarDayName: String(d.lunarDayName ?? ''),
      lunarMonthName: String(d.lunarMonthName ?? ''),
      lunarLeap: String(d.lunarLeap ?? ''),
      solarTermLabel: String(d.solarTermLabel ?? ''),
      isNewMoon: d.lunarDayName === '初一',
      weekday: Number(d.weekday ?? 0),
      isToday:
        viewYear.value === today.getFullYear() &&
        viewMonth.value === today.getMonth() + 1 &&
        i + 1 === today.getDate(),
      moonPhaseName: String(d.moonPhaseName ?? ''),
      holidayA: String(d.holidayA ?? '').trim(),
    })
  }
  return result
})

// ── 導覽 ──
function prevMonth() {
  if (viewMonth.value === 1) { viewYear.value--; viewMonth.value = 12 }
  else viewMonth.value--
}
function nextMonth() {
  if (viewMonth.value === 12) { viewYear.value++; viewMonth.value = 1 }
  else viewMonth.value++
}
function goToday() {
  viewYear.value = today.getFullYear()
  viewMonth.value = today.getMonth() + 1
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- 頁首：月份導覽 -->
    <div class="flex items-center justify-between mb-6">
      <button
        type="button"
        class="px-3 py-1 text-sm border border-ink-300 dark:border-paper-600 rounded hover:bg-ink-100 dark:hover:bg-paper-700"
        @click="prevMonth"
      >
        ← {{ t('calendar.prevMonth') }}
      </button>

      <div class="text-center">
        <h2 class="codex-heading text-2xl">
          {{ monthName }} · {{ yearLabel }}
        </h2>
        <button
          type="button"
          class="text-xs text-ink-500 dark:text-paper-400 hover:text-crimson mt-1"
          @click="goToday"
        >
          {{ t('common.todayLabel') }}
        </button>
      </div>

      <button
        type="button"
        class="px-3 py-1 text-sm border border-ink-300 dark:border-paper-600 rounded hover:bg-ink-100 dark:hover:bg-paper-700"
        @click="nextMonth"
      >
        {{ t('calendar.nextMonth') }} →
      </button>
    </div>

    <!-- 星期列頭 -->
    <div class="grid grid-cols-7 mb-1">
      <div
        v-for="(wd, i) in (tm('calendar.weekdays') as string[])"
        :key="i"
        class="py-2 text-center text-sm font-medium text-ink-500 dark:text-paper-400"
        :class="i === 0 || i === 6 ? 'text-crimson' : ''"
      >
        {{ wd }}
      </div>
    </div>

    <!-- 月曆格 -->
    <div class="grid grid-cols-7 gap-px bg-ink-200 dark:bg-paper-700">
      <div
        v-for="(cell, idx) in cells"
        :key="idx"
        class="min-h-[80px] bg-paper-50 dark:bg-ink-800 p-1.5 relative"
        :class="{
          'opacity-0 pointer-events-none': !cell,
          'ring-2 ring-crimson ring-inset': cell?.isToday,
        }"
      >
        <template v-if="cell">
          <!-- 公曆日 -->
          <span
            class="text-base font-semibold leading-none"
            :class="{
              'text-crimson': cell.weekday === 0 || cell.weekday === 6,
              'w-7 h-7 flex items-center justify-center rounded-full bg-crimson text-paper-50 dark:text-paper-50': cell.isToday,
            }"
          >{{ cell.day }}</span>

          <!-- 節氣 -->
          <span
            v-if="cell.solarTermLabel"
            class="block text-xs text-green-700 dark:text-green-400 font-medium mt-0.5 truncate"
          >{{ cell.solarTermLabel }}</span>

          <!-- 月相 -->
          <span
            v-if="cell.moonPhaseName && cell.moonPhaseName !== cell.solarTermLabel"
            class="block text-xs text-blue-600 dark:text-blue-400 mt-0.5 truncate"
          >{{ cell.moonPhaseName }}</span>

          <!-- 農曆（月名 or 日名） -->
          <span class="block text-xs text-ink-400 dark:text-paper-500 mt-0.5 truncate">
            <template v-if="cell.isNewMoon">
              {{ cell.lunarLeap }}{{ cell.lunarMonthName }}月
            </template>
            <template v-else>{{ cell.lunarDayName }}</template>
          </span>

          <!-- 節日 -->
          <span
            v-if="cell.holidayA"
            class="block text-xs text-amber-600 dark:text-amber-400 truncate"
          >{{ cell.holidayA }}</span>
        </template>
      </div>
    </div>

    <!-- 圖例 -->
    <div class="mt-4 flex flex-wrap gap-4 text-xs text-ink-400 dark:text-paper-500">
      <span class="flex items-center gap-1">
        <span class="text-green-700 dark:text-green-400 font-medium">■</span>
        {{ t('calendar.solarTermLabel') }}
      </span>
      <span class="flex items-center gap-1">
        <span class="text-blue-600 dark:text-blue-400">■</span>
        月相
      </span>
      <span class="flex items-center gap-1">
        <span class="text-amber-600 dark:text-amber-400">■</span>
        節日
      </span>
      <span class="flex items-center gap-1">
        <span class="text-ink-400 dark:text-paper-500">■</span>
        {{ t('calendar.lunarLabel') }}
      </span>
    </div>
  </div>
</template>
