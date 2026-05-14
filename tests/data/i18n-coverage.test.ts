// 岱員時憲章 — i18n 字典涵蓋率測試
// 驗證所有資料層 ID 在三語系字典中都有對應條目
import { allCities, regions } from '#data/cities'
import { festivals } from '#data/festivals'
import { reigns } from '#data/reigns'
import { solarTerms } from '#data/solar-terms'
import { timezones } from '#data/timezones'

import enCities from '../../i18n/locales/en/cities'
import enFestivals from '../../i18n/locales/en/festivals'
import enReigns from '../../i18n/locales/en/reigns'
import enSolarTerms from '../../i18n/locales/en/solar-terms'
import enTimezones from '../../i18n/locales/en/timezones'

import zhCnCities from '../../i18n/locales/zh-cn/cities'
import zhCnFestivals from '../../i18n/locales/zh-cn/festivals'
import zhCnReigns from '../../i18n/locales/zh-cn/reigns'
import zhCnSolarTerms from '../../i18n/locales/zh-cn/solar-terms'
import zhCnTimezones from '../../i18n/locales/zh-cn/timezones'

import zhTwCities from '../../i18n/locales/zh-tw/cities'
import zhTwFestivals from '../../i18n/locales/zh-tw/festivals'
import zhTwReigns from '../../i18n/locales/zh-tw/reigns'
import zhTwSolarTerms from '../../i18n/locales/zh-tw/solar-terms'
import zhTwTimezones from '../../i18n/locales/zh-tw/timezones'
import { describe, expect, it } from 'bun:test'

const locales = [
  {
    name: 'zh-tw',
    cities: zhTwCities,
    timezones: zhTwTimezones,
    festivals: zhTwFestivals,
    reigns: zhTwReigns,
    solarTerms: zhTwSolarTerms,
  },
  {
    name: 'zh-cn',
    cities: zhCnCities,
    timezones: zhCnTimezones,
    festivals: zhCnFestivals,
    reigns: zhCnReigns,
    solarTerms: zhCnSolarTerms,
  },
  {
    name: 'en',
    cities: enCities,
    timezones: enTimezones,
    festivals: enFestivals,
    reigns: enReigns,
    solarTerms: enSolarTerms,
  },
]

describe.each(locales)('i18n 語系 $name', l => {
  it('涵蓋所有城市 ID', () => {
    for (const c of allCities) {
      expect(l.cities.cities[c.id as keyof typeof l.cities.cities], `缺少城市 ${c.id}`).toBeTruthy()
    }
  })

  it('涵蓋所有區域 key', () => {
    for (const r of regions) {
      expect(
        l.cities.regions[r.key as keyof typeof l.cities.regions],
        `缺少區域 ${r.key}`,
      ).toBeTruthy()
    }
  })

  it('涵蓋所有時區 ID', () => {
    for (const t of timezones) {
      expect(
        l.timezones.timezones[t.id as keyof typeof l.timezones.timezones],
        `缺少時區 ${t.id}`,
      ).toBeTruthy()
    }
  })

  it('涵蓋所有節日 ID', () => {
    for (const f of festivals) {
      expect(
        l.festivals.festivals[f.id as keyof typeof l.festivals.festivals],
        `缺少節日 ${f.id}`,
      ).toBeTruthy()
    }
  })

  it('涵蓋所有年號 ID', () => {
    for (const r of reigns) {
      expect(l.reigns.reigns[r.id as keyof typeof l.reigns.reigns], `缺少年號 ${r.id}`).toBeTruthy()
    }
  })

  it('涵蓋所有節氣 ID', () => {
    for (const t of solarTerms) {
      expect(
        l.solarTerms.solarTerms[t.id as keyof typeof l.solarTerms.solarTerms],
        `缺少節氣 ${t.id}`,
      ).toBeTruthy()
    }
  })
})
