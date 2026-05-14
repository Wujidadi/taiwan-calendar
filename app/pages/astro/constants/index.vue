<script setup lang="ts">
import {
  AU_KM,
  EARTH_EQUATORIAL_RADIUS_KM,
  EARTH_POLAR_EQ_RATIO,
  J2000,
  SPEED_OF_LIGHT_KM_S,
} from '#astro/constants'

const { t } = useI18n()

useHead({ title: () => t('constants.title') })

// ── 常數資料表 ──
interface ConstantRow {
  name: string
  value: string
  unit: string
}

const constantRows = computed((): ConstantRow[] => [
  {
    name: t('constants.astronomicalUnit') + ' (AU)',
    value: AU_KM.toLocaleString('zh-TW', { maximumFractionDigits: 3 }),
    unit: 'km',
  },
  {
    name: t('constants.lightSpeed'),
    value: SPEED_OF_LIGHT_KM_S.toLocaleString('zh-TW', { maximumFractionDigits: 3 }),
    unit: 'km/s',
  },
  {
    name: t('constants.earthRadius'),
    value: EARTH_EQUATORIAL_RADIUS_KM.toLocaleString('zh-TW', { maximumFractionDigits: 4 }),
    unit: 'km',
  },
  {
    name: '地球極半徑比',
    value: EARTH_POLAR_EQ_RATIO.toFixed(8),
    unit: '—',
  },
  {
    name: 'J2000 曆元',
    value: J2000.toLocaleString('zh-TW'),
    unit: 'JD',
  },
  {
    name: t('constants.synodicMonth'),
    value: '29.53059',
    unit: '天',
  },
  {
    name: t('constants.tropicalYear'),
    value: '365.24219',
    unit: '天',
  },
  {
    name: t('constants.siderealYear'),
    value: '365.25636',
    unit: '天',
  },
  {
    name: '太陽赤道半徑比',
    value: '109.122',
    unit: '（地球 = 1）',
  },
  {
    name: '月球半徑比',
    value: '0.27251',
    unit: '（地球 = 1）',
  },
])
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <!-- 頁首 -->
    <h1 class="codex-heading text-2xl mb-6">{{ t('constants.title') }}</h1>

    <!-- 常數表 -->
    <div class="overflow-hidden rounded-lg border border-paper-300 dark:border-ink-600">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-paper-100 dark:bg-ink-800 text-ink-500 dark:text-paper-400">
            <th class="px-4 py-2.5 text-left font-medium">名稱</th>
            <th class="px-4 py-2.5 text-right font-medium">{{ t('constants.value') }}</th>
            <th class="px-4 py-2.5 text-left font-medium w-28">{{ t('constants.unit') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in constantRows"
            :key="i"
            class="border-t border-paper-200 dark:border-ink-700 hover:bg-paper-50 dark:hover:bg-ink-800"
          >
            <td class="px-4 py-2.5 font-medium">{{ row.name }}</td>
            <td class="px-4 py-2.5 text-right font-mono text-gold-700 dark:text-gold-400">
              {{ row.value }}
            </td>
            <td class="px-4 py-2.5 text-ink-400 dark:text-paper-500 text-xs">{{ row.unit }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 注釋 -->
    <p class="mt-4 text-xs text-ink-400 dark:text-paper-500">
      AU 採用 IAU 2012 定義；光速採 CODATA 真空值；地球參數採 IERS 慣用值。
    </p>
  </div>
</template>
