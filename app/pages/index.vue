<script setup lang="ts">
// 岱員時憲章 — 首頁今日資訊看板
import { LunarMonth } from '#lunar/lunar-month'
import { sunRiseTransitSet } from '#astro/rise-set'
import { J2000 } from '#astro/constants'
import { formatTimeOfDay, gregorianToJulianDay } from '#astro/julian-day'
import { useEraYear } from '~/composables/useEraYear'

const { t } = useI18n()
const { eraYear } = useEraYear()

useHead({
  title: () => t('site.name'),
})

// ── 今日公曆資訊 ──
const today = new Date()
const todayYear  = today.getFullYear()
const todayMonth = today.getMonth() + 1
const todayDay   = today.getDate()

// ── 今日農曆資訊 ──
const lunarMonth = new LunarMonth()
lunarMonth.calcMonth(todayYear, todayMonth)

// 取出今日（第 todayDay - 1 個索引）農曆資訊
const todayLunar = lunarMonth.days[todayDay - 1] as Record<string, unknown>

const lunarDayName   = String(todayLunar['lunarDayName'] ?? '')
const lunarMonthName = String(todayLunar['lunarMonthName'] ?? '')
const lunarLeap      = String(todayLunar['lunarLeap'] ?? '')
// 干支紀年（以立春為界）
const yearGanZhi     = String(todayLunar['lunarYearGanZhi'] ?? lunarMonth.yearGanZhi)
const zodiacAnimal   = lunarMonth.zodiacAnimal
// 今日是否為節氣
const solarTermLabel = String(todayLunar['solarTermLabel'] ?? '')

// ── 日出日沒（台北，東經 121.5645°，北緯 25.0329°）──
// sunRiseTransitSet 的 jd 參數為 J2000 起算的儒略日
const todayJD = (gregorianToJulianDay(todayYear, todayMonth, todayDay + 0.5) as number) - J2000

const sunRTS = sunRiseTransitSet(todayJD, {
  longitude: 121.5645 * Math.PI / 180,
  latitude:  25.0329  * Math.PI / 180,
})

// 將 J2000 儒略日轉換成時間字串（加上台北時區偏移 +8h = 8/24 日）
const TZ_OFFSET = 8 / 24
const sunriseStr  = formatTimeOfDay((sunRTS.s + TZ_OFFSET) as never)
const noonStr     = formatTimeOfDay((sunRTS.z + TZ_OFFSET) as never)
const sunsetStr   = formatTimeOfDay((sunRTS.j + TZ_OFFSET) as never)

// ── 紀年標示 ──
const eraLabel = eraYear(todayYear)

// ── 月相名稱 ──
const moonPhaseName = String(todayLunar['moonPhaseName'] ?? '')
</script>

<template>
  <section class="max-w-4xl mx-auto py-8 px-4">

    <!-- 今日大標題 -->
    <div class="text-center mb-10">
      <h1 class="codex-heading text-4xl md:text-5xl mb-2 leading-snug">
        {{ todayYear }} 年 {{ todayMonth }} 月 {{ todayDay }} 日
      </h1>
      <p class="text-lg text-ink-500 dark:text-paper-400 mb-1">
        {{ eraLabel }}
      </p>
      <p class="text-base text-ink-600 dark:text-paper-300">
        {{ t('calendar.lunarLabel') }}
        <span class="font-medium">{{ lunarLeap }}{{ lunarMonthName }}月{{ lunarDayName }}</span>
        ·
        <span class="text-gold dark:text-gold-400">{{ yearGanZhi }}年（{{ zodiacAnimal }}）</span>
      </p>
      <!-- 節氣提示 -->
      <p
        v-if="solarTermLabel"
        class="mt-3 inline-block px-4 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium text-sm tracking-wider"
      >
        ☀ {{ t('calendar.solarTermLabel') }}：{{ solarTermLabel }}
      </p>
    </div>

    <div class="codex-divider mb-8" />

    <!-- 今日天文資訊（日出、日中、日沒、月相） -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">

      <!-- 日出 -->
      <div class="flex flex-col items-center gap-1 rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-ink-800 py-4 px-3">
        <span class="text-xs text-ink-400 dark:text-paper-500 tracking-widest uppercase">
          {{ t('riseSet.sunrise') }}
        </span>
        <span class="text-2xl font-mono font-semibold text-gold dark:text-gold-400">
          {{ sunriseStr.slice(0, 5) }}
        </span>
      </div>

      <!-- 日中 -->
      <div class="flex flex-col items-center gap-1 rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-ink-800 py-4 px-3">
        <span class="text-xs text-ink-400 dark:text-paper-500 tracking-widest uppercase">
          {{ t('riseSet.noon') }}
        </span>
        <span class="text-2xl font-mono font-semibold text-gold dark:text-gold-400">
          {{ noonStr.slice(0, 5) }}
        </span>
      </div>

      <!-- 日沒 -->
      <div class="flex flex-col items-center gap-1 rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-ink-800 py-4 px-3">
        <span class="text-xs text-ink-400 dark:text-paper-500 tracking-widest uppercase">
          {{ t('riseSet.sunset') }}
        </span>
        <span class="text-2xl font-mono font-semibold text-crimson dark:text-crimson-400">
          {{ sunsetStr.slice(0, 5) }}
        </span>
      </div>

      <!-- 月相 -->
      <div class="flex flex-col items-center gap-1 rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-ink-800 py-4 px-3">
        <span class="text-xs text-ink-400 dark:text-paper-500 tracking-widest uppercase">
          月相
        </span>
        <span class="text-2xl font-semibold text-ink-600 dark:text-paper-300">
          {{ moonPhaseName || '—' }}
        </span>
      </div>
    </div>

    <div class="codex-divider mb-8" />

    <!-- 快速導覽 -->
    <nav class="grid grid-cols-2 md:grid-cols-4 gap-3">

      <!-- 月曆 -->
      <NuxtLink
        :to="$localePath('/calendar')"
        class="group flex flex-col items-center gap-2 rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-ink-800 py-5 px-3 hover:border-crimson dark:hover:border-crimson transition-colors"
      >
        <span class="text-2xl">📅</span>
        <span class="text-sm font-medium group-hover:text-crimson codex-heading">
          {{ t('nav.calendar.month') }}
        </span>
      </NuxtLink>

      <!-- 年曆 -->
      <NuxtLink
        :to="$localePath('/calendar/year')"
        class="group flex flex-col items-center gap-2 rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-ink-800 py-5 px-3 hover:border-crimson dark:hover:border-crimson transition-colors"
      >
        <span class="text-2xl">🗓</span>
        <span class="text-sm font-medium group-hover:text-crimson codex-heading">
          {{ t('nav.calendar.year') }}
        </span>
      </NuxtLink>

      <!-- 八字 -->
      <NuxtLink
        :to="$localePath('/bazi')"
        class="group flex flex-col items-center gap-2 rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-ink-800 py-5 px-3 hover:border-crimson dark:hover:border-crimson transition-colors"
      >
        <span class="text-2xl">☯</span>
        <span class="text-sm font-medium group-hover:text-crimson codex-heading">
          {{ t('nav.bazi') }}
        </span>
      </NuxtLink>

      <!-- 朔氣 -->
      <NuxtLink
        :to="$localePath('/astro/solar-terms')"
        class="group flex flex-col items-center gap-2 rounded-lg border border-paper-300 dark:border-paper-700 bg-paper-50 dark:bg-ink-800 py-5 px-3 hover:border-crimson dark:hover:border-crimson transition-colors"
      >
        <span class="text-2xl">☀</span>
        <span class="text-sm font-medium group-hover:text-crimson codex-heading">
          {{ t('nav.astro.solarTerm') }}
        </span>
      </NuxtLink>
    </nav>
  </section>
</template>
