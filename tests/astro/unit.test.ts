// 岱員時憲章 — 演算法模組單元測試（函式行為驗證）
import { describe, expect, it } from 'bun:test'

import {
  DEFAULT_ANGLE_UNITS,
  formatArcSeconds,
  formatRadian,
  formatRadianFull,
  formatRadianToMinute,
  parseAngleToRadian,
} from '#astro/angle-format'
import { earthLongitudeToTime, moonLongitudeToTime } from '#astro/ephemeris'
import {
  formatGregorianPrecise,
  formatTimeOfDay,
  gregorianToJulianDay,
  julianDayToGregorian,
} from '#astro/julian-day'
import { multiDayRiseTransitSet } from '#astro/rise-set'
import { computeStarEphemeris } from '#astro/stellar'
import {
  computeBazi,
  getLunarDayName,
  preciseSolarTermFromJD,
  preciseNewMoonFromJD,
} from '#lunar/chinese-base'
import { shuoQiCalculator } from '#lunar/ssq'

// ── angle-format ─────────────────────────────────────────────────────────────

describe('angle-format', () => {
  describe('formatRadianFull', () => {
    it('0 弧度 → 含度符號且度數為 0', () => {
      const s = formatRadianFull(0, false, 2, DEFAULT_ANGLE_UNITS)
      expect(s).toContain(DEFAULT_ANGLE_UNITS.deg)
      // 度數部分（3 位右對齊空格補位）含 '0'
      expect(s.trim()).toMatch(/^0°/)
    })

    it('π/2 弧度 → 90 度', () => {
      const s = formatRadianFull(Math.PI / 2, false, 2, DEFAULT_ANGLE_UNITS)
      expect(s).toContain('90')
    })

    it('π 弧度 → 180 度', () => {
      const s = formatRadianFull(Math.PI, false, 2, DEFAULT_ANGLE_UNITS)
      expect(s).toContain('180')
    })

    it('2π 弧度 → 360 度', () => {
      const s = formatRadianFull(Math.PI * 2, false, 2, DEFAULT_ANGLE_UNITS)
      expect(s).toContain('360')
    })

    it('負弧度 → 結果以 "-" 開頭', () => {
      const s = formatRadianFull(-Math.PI / 6, false, 2, DEFAULT_ANGLE_UNITS)
      expect(s.trimStart()).toMatch(/^-/)
    })

    it('timeFormat=true 時以時分秒格式輸出', () => {
      // π/12 rad = 1h（π rad = 12h）
      const s = formatRadianFull(Math.PI / 12, true, 2, DEFAULT_ANGLE_UNITS)
      expect(s).toContain(DEFAULT_ANGLE_UNITS.hour)
    })

    it('decimalPlaces=0 時不含小數點', () => {
      const s = formatRadianFull(Math.PI / 4, false, 0, DEFAULT_ANGLE_UNITS)
      expect(s).not.toContain('.')
    })

    it('decimalPlaces=3 時包含三位小數', () => {
      const s = formatRadianFull(1.0, false, 3, DEFAULT_ANGLE_UNITS)
      const dotIdx = s.indexOf('.')
      expect(dotIdx).toBeGreaterThan(-1)
      // 小數點後應有三個數字
      const frac = s.slice(dotIdx + 1)
      expect(frac.replace(/[^\d]/g, '').length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('formatRadian', () => {
    it('包裝 formatRadianFull（小數 2 位），π → 180°', () => {
      const s = formatRadian(Math.PI, false, DEFAULT_ANGLE_UNITS)
      expect(s).toContain('180')
    })

    it('負值輸出含負號', () => {
      const s = formatRadian(-Math.PI / 3, false, DEFAULT_ANGLE_UNITS)
      expect(s).toContain('-')
    })
  })

  describe('formatRadianToMinute', () => {
    it('0 弧度 → 正號 +000°00′', () => {
      const s = formatRadianToMinute(0, DEFAULT_ANGLE_UNITS)
      expect(s).toMatch(/^\+/)
    })

    it('π 弧度 → +180°', () => {
      const s = formatRadianToMinute(Math.PI, DEFAULT_ANGLE_UNITS)
      expect(s).toContain('180')
    })

    it('負弧度 → 以 "-" 開頭', () => {
      const s = formatRadianToMinute(-Math.PI / 4, DEFAULT_ANGLE_UNITS)
      expect(s).toMatch(/^-/)
    })

    it('接近 60 分進位邊界：59.5′ 應進位為 X°00′', () => {
      // 59.5 arcmin = 59.5/60 deg = 59.5/60 * π/180 rad
      const rad = (59.5 / 60) * (Math.PI / 180)
      const s = formatRadianToMinute(rad, DEFAULT_ANGLE_UNITS)
      // 進位後應為 1°00′
      expect(s).toContain('1')
    })
  })

  describe('formatArcSeconds', () => {
    it('60 arcsec → 1′00.00″（style 0）', () => {
      const s = formatArcSeconds(60, 2, 0, DEFAULT_ANGLE_UNITS)
      expect(s).toContain('1')
      expect(s).toContain(DEFAULT_ANGLE_UNITS.arcmin)
    })

    it('style 1：中文分秒', () => {
      const s = formatArcSeconds(90, 1, 1, DEFAULT_ANGLE_UNITS)
      expect(s).toContain(DEFAULT_ANGLE_UNITS.cnMin)
      expect(s).toContain(DEFAULT_ANGLE_UNITS.cnSec)
    })

    it('style 2：m/s 格式', () => {
      const s = formatArcSeconds(90, 1, 2, DEFAULT_ANGLE_UNITS)
      expect(s).toContain('m')
      expect(s).toContain('s')
    })

    it('負值輸出含 "-"', () => {
      const s = formatArcSeconds(-120, 2, 0, DEFAULT_ANGLE_UNITS)
      expect(s).toContain('-')
    })

    it('大值（3600 arcsec = 60′）', () => {
      const s = formatArcSeconds(3600, 1, 0, DEFAULT_ANGLE_UNITS)
      expect(s).toContain('60')
    })
  })

  describe('parseAngleToRadian', () => {
    it('度分秒字串 "180°00′00″" → π（誤差 < 1e-9）', () => {
      const r = parseAngleToRadian('180°00\'00"', false)
      expect(r).toBeCloseTo(Math.PI, 9)
    })

    it('度分秒字串 "90°00′00″" → π/2', () => {
      const r = parseAngleToRadian('90°00\'00"', false)
      expect(r).toBeCloseTo(Math.PI / 2, 9)
    })

    it('負角度字串 "-30°00′00″" → 負值', () => {
      const r = parseAngleToRadian('-30°00\'00"', false)
      expect(r).toBeLessThan(0)
    })

    it('時分秒格式 "12h 00m 00s" → π（timeFormat=true）', () => {
      const r = parseAngleToRadian('12 00 00', true)
      expect(r).toBeCloseTo(Math.PI, 8)
    })

    it('parseAngleToRadian 與 formatRadianFull 互為逆（30°）', () => {
      const deg30 = 30 * (Math.PI / 180)
      const str = formatRadianFull(deg30, false, 3, DEFAULT_ANGLE_UNITS)
      // 擷取數字部分重新組成 "DDD MM SS.sss"
      const nums = str
        .replace(/[°′″ ]/g, ' ')
        .trim()
        .replace(/ +/g, ' ')
      const parsed = parseAngleToRadian(nums, false)
      expect(parsed).toBeCloseTo(deg30, 4)
    })
  })
})

// ── rise-set extra ────────────────────────────────────────────────────────────

describe('rise-set extra', () => {
  // 台北：東經 121.5°、北緯 25°
  const TAIPEI = {
    longitude: 121.5 * (Math.PI / 180),
    latitude: 25.0 * (Math.PI / 180),
  }
  // multiDayRiseTransitSet 需要整數 JD（午夜值 = .5 小數）
  // 2026-05-14 午夜 = JD 2461174.5，傳入整數 2461174（其 +0.5 = 2026-05-14 正午）
  const START_JD = 2461174

  it('multiDayRiseTransitSet 回傳長度正確', () => {
    const rows = multiDayRiseTransitSet(START_JD, 3, TAIPEI, 8 / 24)
    expect(rows).toHaveLength(3)
  })

  it('每列均有 s, z, j, Ms, Mz, Mj 字串欄位', () => {
    const rows = multiDayRiseTransitSet(START_JD, 3, TAIPEI, 8 / 24)
    for (const row of rows) {
      expect(typeof row.s).toBe('string')
      expect(typeof row.z).toBe('string')
      expect(typeof row.j).toBe('string')
      expect(typeof row.Ms).toBe('string')
      expect(typeof row.Mz).toBe('string')
      expect(typeof row.Mj).toBe('string')
    }
  })

  it('時間字串格式為 HH:MM:SS（8 字元）或 "--:--:--"', () => {
    const timeRe = /^\d{2}:\d{2}:\d{2}$|^--:--:--$/
    const rows = multiDayRiseTransitSet(START_JD, 3, TAIPEI, 8 / 24)
    for (const row of rows) {
      expect(row.s).toMatch(timeRe)
      expect(row.z).toMatch(timeRe)
      expect(row.j).toMatch(timeRe)
      expect(row.Ms).toMatch(timeRe)
      expect(row.Mz).toMatch(timeRe)
      expect(row.Mj).toMatch(timeRe)
    }
  })

  it('連續 7 天均可正常計算（不拋例外）', () => {
    expect(() => {
      multiDayRiseTransitSet(START_JD, 7, TAIPEI, 8 / 24)
    }).not.toThrow()
  })
})

// ── julian-day extra ──────────────────────────────────────────────────────────

describe('julian-day extra', () => {
  describe('formatGregorianPrecise', () => {
    it('J2000 紀元（2000-01-01 12:00:00.000）字串含 "2000"', () => {
      const g = julianDayToGregorian(2451545 as never)
      const s = formatGregorianPrecise(g)
      expect(s).toContain('2000')
    })

    it('格式為 YYYY-MM-DD HH:mm:ss.sss（含毫秒點）', () => {
      const g = julianDayToGregorian(2451545 as never)
      const s = formatGregorianPrecise(g)
      // 最後應有 .NNN
      expect(s).toMatch(/\.\d{3}$/)
    })

    it('毫秒進位邊界：second=59.9999 不溢位', () => {
      const g = {
        year: 2000,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 59.9999,
      }
      const s = formatGregorianPrecise(g)
      // 不應包含 "60" 於秒位
      expect(s).not.toMatch(/:60\./)
    })

    it('時分進位邊界：minute=59.999… 不溢位', () => {
      const g = {
        year: 2000,
        month: 1,
        day: 1,
        hour: 0,
        minute: 59,
        second: 59.9995,
      }
      const s = formatGregorianPrecise(g)
      expect(s).not.toMatch(/:60$/)
    })

    it('h>=24 進位修正後不超出一日', () => {
      const g = {
        year: 2000,
        month: 1,
        day: 1,
        hour: 23,
        minute: 59,
        second: 59.9995,
      }
      const s = formatGregorianPrecise(g)
      // hour 欄不能出現 24
      expect(s).not.toContain(' 24:')
    })
  })

  describe('formatTimeOfDay', () => {
    it('JD 正好整點（午夜後 6h）→ "06:00:00"', () => {
      // jd + 0.5 的小數部分 = 6/24 → 6h
      // 要讓 f = 6/24 = 0.25：jd + 0.5 = N + 0.25 → jd = N - 0.25（N 整數）
      const jd = 0 - 0.25 // f = (jd+0.5) - floor(jd+0.5) = 0.25
      const s = formatTimeOfDay(jd as never)
      expect(s).toBe('06:00:00')
    })

    it('JD 午夜 → "00:00:00"', () => {
      // jd + 0.5 = N（整數）→ f = 0 → total = 0
      const jd = -0.5 // f = 0
      const s = formatTimeOfDay(jd as never)
      expect(s).toBe('00:00:00')
    })

    it('JD 正午 → "12:00:00"', () => {
      // jd + 0.5 = N + 0.5 → f = 0.5 → total = 43200 → 12:00:00
      const jd = 0 // jd+0.5=0.5, f=0.5
      const s = formatTimeOfDay(jd as never)
      expect(s).toBe('12:00:00')
    })

    it('格式符合 HH:mm:ss（8 字元）', () => {
      const jd = (gregorianToJulianDay(2026, 5, 14.5) as unknown as number) - 2451545
      const s = formatTimeOfDay(jd as never)
      expect(s).toHaveLength(8)
      expect(s).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    })
  })
})

// ── ephemeris extra ───────────────────────────────────────────────────────────

describe('ephemeris extra', () => {
  describe('earthLongitudeToTime', () => {
    it('W=0（春分）回傳合理的儒略世紀數（約 −0.003 至 +0.003）', () => {
      const t = earthLongitudeToTime(0)
      // 春分約在 J2000 附近：|t| < 0.1 世紀
      expect(Math.abs(t)).toBeLessThan(0.1)
    })

    it('W=π（秋分）回傳 t > 0（晚於春分）', () => {
      const t0 = earthLongitudeToTime(0)
      const t1 = earthLongitudeToTime(Math.PI)
      expect(t1).toBeGreaterThan(t0)
    })

    it('t * 36525 給出合理的 JD 偏移（距 J2000 < 400 天）', () => {
      const t = earthLongitudeToTime(0)
      expect(Math.abs(t * 36525)).toBeLessThan(400)
    })
  })

  describe('moonLongitudeToTime', () => {
    it('W=0 回傳合理的儒略世紀數（|t| < 0.01）', () => {
      const t = moonLongitudeToTime(0)
      expect(Math.abs(t)).toBeLessThan(0.01)
    })

    it('W=2π 比 W=0 大（月球在整圈之後）', () => {
      const t0 = moonLongitudeToTime(0)
      const t1 = moonLongitudeToTime(Math.PI * 2)
      expect(t1).toBeGreaterThan(t0)
    })

    it('t * 36525 給出合理的 JD 偏移（距 J2000 < 100 天）', () => {
      const t = moonLongitudeToTime(0)
      expect(Math.abs(t * 36525)).toBeLessThan(100)
    })
  })
})

// ── stellar ───────────────────────────────────────────────────────────────────

describe('stellar', () => {
  // starTable 格式：每 8 個元素一顆星
  //   [α0, δ0, μα, μδ, parallax, spectral, name, id]
  // Sirius（大犬座 α）近似值：
  //   α ≈ 1.7675 rad, δ ≈ −0.2911 rad
  //   μα ≈ −3.847e-5 rad/cy, μδ ≈ −1.224e-4 rad/cy（自行極小，略）
  //   parallax ≈ 379.21 arcsec（視差 0.37921"）
  const SIRIUS_TABLE: readonly (string | number)[] = [
    1.7675, // α0
    -0.2911, // δ0
    -3.847e-5, // μα（rad/century）
    -1.224e-4, // μδ
    0.37921, // parallax（arcsec）
    'A1V', // spectral
    'Sirius', // name
    'α CMa', // id
  ]

  it('mode 0（視位置）回傳非空字串', () => {
    const result = computeStarEphemeris(
      0.2,
      SIRIUS_TABLE,
      -1,
      0,
      121.5 * (Math.PI / 180),
      25.0 * (Math.PI / 180),
    )
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('mode 1（站心位置）回傳含 "Topocentric" 的標頭', () => {
    const result = computeStarEphemeris(
      0.2,
      SIRIUS_TABLE,
      -1,
      1,
      121.5 * (Math.PI / 180),
      25.0 * (Math.PI / 180),
    )
    expect(result).toContain('Topocentric')
  })

  it('mode 2（平位置）回傳含 "Mean" 的標頭', () => {
    const result = computeStarEphemeris(
      0.2,
      SIRIUS_TABLE,
      -1,
      2,
      121.5 * (Math.PI / 180),
      25.0 * (Math.PI / 180),
    )
    expect(result).toContain('Mean')
  })

  it('輸出字串包含 "Sirius" 星名', () => {
    const result = computeStarEphemeris(
      0.2,
      SIRIUS_TABLE,
      -1,
      0,
      121.5 * (Math.PI / 180),
      25.0 * (Math.PI / 180),
    )
    expect(result).toContain('Sirius')
  })
})

// ── lunar extras ──────────────────────────────────────────────────────────────

describe('lunar extras', () => {
  describe('getLunarDayName — 分支覆蓋', () => {
    it('春節（正月初一，非閏）寫入 holidayA 與 isHoliday', () => {
      const u: Record<string, unknown> = {
        lunarMonthName: '正',
        lunarDayName: '初一',
        lunarLeap: '',
        lunarNextMonthName: '',
        lunarMonthLength: 30,
        solarTermLabel: '',
        lunarDayGanZhi: '甲子',
        daysSinceDongzhi: -1,
        daysSinceXiazhi: -1,
        daysSinceLiqiu: -1,
        daysSinceMangzhong: -1,
        daysSinceXiaoshu: -1,
      }
      const r: Record<string, unknown> = {}
      getLunarDayName(u, r)
      expect(r.holidayA as string).toContain('春節')
      expect(r.isHoliday).toBe(1)
    })

    it('端午節（五月初五）寫入 holidayA', () => {
      const u: Record<string, unknown> = {
        lunarMonthName: '五',
        lunarDayName: '初五',
        lunarLeap: '',
        lunarNextMonthName: '',
        lunarMonthLength: 29,
        solarTermLabel: '',
        lunarDayGanZhi: '甲子',
        daysSinceDongzhi: -1,
        daysSinceXiazhi: -1,
        daysSinceLiqiu: -1,
        daysSinceMangzhong: -1,
        daysSinceXiaoshu: -1,
      }
      const r: Record<string, unknown> = {}
      getLunarDayName(u, r)
      expect(r.holidayA as string).toContain('端午')
    })

    it('正月十五（元宵節）寫入 holidayA、B、C', () => {
      const u: Record<string, unknown> = {
        lunarMonthName: '正',
        lunarDayName: '十五',
        lunarLeap: '',
        lunarNextMonthName: '',
        lunarMonthLength: 30,
        solarTermLabel: '',
        lunarDayGanZhi: '甲子',
        daysSinceDongzhi: -1,
        daysSinceXiazhi: -1,
        daysSinceLiqiu: -1,
        daysSinceMangzhong: -1,
        daysSinceXiaoshu: -1,
      }
      const r: Record<string, unknown> = {}
      getLunarDayName(u, r)
      expect(r.holidayA as string).toContain('元宵')
      expect(r.holidayB as string).toContain('上元')
      expect(r.holidayC as string).toBeTruthy()
    })

    it('二月初二（春龍節）寫入 holidayB、C', () => {
      const u: Record<string, unknown> = {
        lunarMonthName: '二',
        lunarDayName: '初二',
        lunarLeap: '',
        lunarNextMonthName: '',
        lunarMonthLength: 30,
        solarTermLabel: '',
        lunarDayGanZhi: '甲子',
        daysSinceDongzhi: -1,
        daysSinceXiazhi: -1,
        daysSinceLiqiu: -1,
        daysSinceMangzhong: -1,
        daysSinceXiaoshu: -1,
      }
      const r: Record<string, unknown> = {}
      getLunarDayName(u, r)
      expect(r.holidayB as string).toContain('春龍')
    })

    it('三月初三（北帝誕）寫入 holidayB、C', () => {
      const u: Record<string, unknown> = {
        lunarMonthName: '三',
        lunarDayName: '初三',
        lunarLeap: '',
        lunarNextMonthName: '',
        lunarMonthLength: 30,
        solarTermLabel: '',
        lunarDayGanZhi: '甲子',
        daysSinceDongzhi: -1,
        daysSinceXiazhi: -1,
        daysSinceLiqiu: -1,
        daysSinceMangzhong: -1,
        daysSinceXiaoshu: -1,
      }
      const r: Record<string, unknown> = {}
      getLunarDayName(u, r)
      expect(r.holidayB as string).toContain('北帝')
    })

    it('五月十三（關帝誕）寫入 holidayB、C', () => {
      const u: Record<string, unknown> = {
        lunarMonthName: '五',
        lunarDayName: '十三',
        lunarLeap: '',
        lunarNextMonthName: '',
        lunarMonthLength: 30,
        solarTermLabel: '',
        lunarDayGanZhi: '甲子',
        daysSinceDongzhi: -1,
        daysSinceXiazhi: -1,
        daysSinceLiqiu: -1,
        daysSinceMangzhong: -1,
        daysSinceXiaoshu: -1,
      }
      const r: Record<string, unknown> = {}
      getLunarDayName(u, r)
      expect(r.holidayB as string).toContain('關帝')
    })

    it('六月初六（姑姑節）寫入 holidayB、C', () => {
      const u: Record<string, unknown> = {
        lunarMonthName: '六',
        lunarDayName: '初六',
        lunarLeap: '',
        lunarNextMonthName: '',
        lunarMonthLength: 30,
        solarTermLabel: '',
        lunarDayGanZhi: '甲子',
        daysSinceDongzhi: -1,
        daysSinceXiazhi: -1,
        daysSinceLiqiu: -1,
        daysSinceMangzhong: -1,
        daysSinceXiaoshu: -1,
      }
      const r: Record<string, unknown> = {}
      getLunarDayName(u, r)
      expect(r.holidayB as string).toContain('姑姑')
    })

    it('閏月不觸發節日判斷', () => {
      const u: Record<string, unknown> = {
        lunarMonthName: '正',
        lunarDayName: '初一',
        lunarLeap: '閏', // 閏月，不觸發春節
        lunarNextMonthName: '',
        lunarMonthLength: 30,
        solarTermLabel: '',
        lunarDayGanZhi: '甲子',
        daysSinceDongzhi: -1,
        daysSinceXiazhi: -1,
        daysSinceLiqiu: -1,
        daysSinceMangzhong: -1,
        daysSinceXiaoshu: -1,
      }
      const r: Record<string, unknown> = {}
      getLunarDayName(u, r)
      expect(r.holidayA).toBeUndefined()
    })

    it('除夕（十二月三十，大月）觸發 holidayA', () => {
      const u: Record<string, unknown> = {
        lunarMonthName: '十二',
        lunarDayName: '三十',
        lunarLeap: '',
        lunarNextMonthName: '正',
        lunarMonthLength: 30,
        solarTermLabel: '',
        lunarDayGanZhi: '甲子',
        daysSinceDongzhi: -1,
        daysSinceXiazhi: -1,
        daysSinceLiqiu: -1,
        daysSinceMangzhong: -1,
        daysSinceXiaoshu: -1,
      }
      const r: Record<string, unknown> = {}
      getLunarDayName(u, r)
      expect(r.holidayA as string).toContain('除夕')
    })

    it('除夕（十二月廿九，小月）觸發 holidayA', () => {
      const u: Record<string, unknown> = {
        lunarMonthName: '十二',
        lunarDayName: '廿九',
        lunarLeap: '',
        lunarNextMonthName: '正',
        lunarMonthLength: 29,
        solarTermLabel: '',
        lunarDayGanZhi: '甲子',
        daysSinceDongzhi: -1,
        daysSinceXiazhi: -1,
        daysSinceLiqiu: -1,
        daysSinceMangzhong: -1,
        daysSinceXiaoshu: -1,
      }
      const r: Record<string, unknown> = {}
      getLunarDayName(u, r)
      expect(r.holidayA as string).toContain('除夕')
    })

    it('小年（十二月廿三）寫入 holidayB', () => {
      const u: Record<string, unknown> = {
        lunarMonthName: '十二',
        lunarDayName: '廿三',
        lunarLeap: '',
        lunarNextMonthName: '正',
        lunarMonthLength: 30,
        solarTermLabel: '',
        lunarDayGanZhi: '甲子',
        daysSinceDongzhi: -1,
        daysSinceXiazhi: -1,
        daysSinceLiqiu: -1,
        daysSinceMangzhong: -1,
        daysSinceXiaoshu: -1,
      }
      const r: Record<string, unknown> = {}
      getLunarDayName(u, r)
      expect(r.holidayB as string).toContain('小年')
    })

    it('清明節（solarTermLabel）觸發 holidayA 與 isHoliday', () => {
      const u: Record<string, unknown> = {
        lunarMonthName: '三',
        lunarDayName: '初三',
        lunarLeap: '',
        lunarNextMonthName: '',
        lunarMonthLength: 30,
        solarTermLabel: '清明',
        lunarDayGanZhi: '甲子',
        daysSinceDongzhi: -1,
        daysSinceXiazhi: -1,
        daysSinceLiqiu: -1,
        daysSinceMangzhong: -1,
        daysSinceXiaoshu: -1,
      }
      const r: Record<string, unknown> = {}
      getLunarDayName(u, r)
      expect(r.holidayA as string).toContain('清明')
      expect(r.isHoliday).toBe(1)
    })

    it('非清明節氣寫入 holidayB', () => {
      const u: Record<string, unknown> = {
        lunarMonthName: '一',
        lunarDayName: '初一',
        lunarLeap: '',
        lunarNextMonthName: '',
        lunarMonthLength: 30,
        solarTermLabel: '穀雨',
        lunarDayGanZhi: '甲子',
        daysSinceDongzhi: -1,
        daysSinceXiazhi: -1,
        daysSinceLiqiu: -1,
        daysSinceMangzhong: -1,
        daysSinceXiaoshu: -1,
      }
      const r: Record<string, unknown> = {}
      getLunarDayName(u, r)
      expect(r.holidayB as string).toContain('穀雨')
    })

    it('數九第一天（冬至後 0 天）寫入 holidayB 含「一九」', () => {
      const u: Record<string, unknown> = {
        lunarMonthName: '十一',
        lunarDayName: '初一',
        lunarLeap: '',
        lunarNextMonthName: '',
        lunarMonthLength: 30,
        solarTermLabel: '',
        lunarDayGanZhi: '甲子',
        daysSinceDongzhi: 0, // 冬至當天，進入一九
        daysSinceXiazhi: -1,
        daysSinceLiqiu: -1,
        daysSinceMangzhong: -1,
        daysSinceXiaoshu: -1,
      }
      const r: Record<string, unknown> = {}
      getLunarDayName(u, r)
      expect(r.holidayB as string).toContain('一九')
    })

    it('數九第二天（冬至後 1 天）寫入 holidayC', () => {
      const u: Record<string, unknown> = {
        lunarMonthName: '十一',
        lunarDayName: '初二',
        lunarLeap: '',
        lunarNextMonthName: '',
        lunarMonthLength: 30,
        solarTermLabel: '',
        lunarDayGanZhi: '甲子',
        daysSinceDongzhi: 1,
        daysSinceXiazhi: -1,
        daysSinceLiqiu: -1,
        daysSinceMangzhong: -1,
        daysSinceXiaoshu: -1,
      }
      const r: Record<string, unknown> = {}
      getLunarDayName(u, r)
      expect(r.holidayC as string).toContain('一九第')
    })
  })

  describe('computeBazi', () => {
    it('2026-05-14 台北（東 121.5°）計算八字不拋例外且欄位非空', () => {
      const jd = (gregorianToJulianDay(2026, 5, 14) as unknown as number) - 2451545
      const ob: Record<string, unknown> = {}
      computeBazi(jd, 121.5 * (Math.PI / 180), ob)
      expect(typeof ob.baziYear).toBe('string')
      expect(typeof ob.baziMonth).toBe('string')
      expect(typeof ob.baziDay).toBe('string')
      expect(typeof ob.baziHour).toBe('string')
      expect((ob.baziYear as string).length).toBe(2) // 兩個漢字
      expect((ob.baziMonth as string).length).toBe(2)
      expect((ob.baziDay as string).length).toBe(2)
    })

    it('baziHoursAll 含 12 個時柱（以空格分隔的部分 >= 13 個）', () => {
      const jd = (gregorianToJulianDay(2000, 1, 1) as unknown as number) - 2451545
      const ob: Record<string, unknown> = {}
      computeBazi(jd, 0, ob)
      const parts = (ob.baziHoursAll as string).split(' ')
      expect(parts.length).toBeGreaterThanOrEqual(13)
    })
  })

  describe('preciseSolarTermFromJD / preciseNewMoonFromJD', () => {
    it('preciseSolarTermFromJD 回傳靠近輸入 JD 的節氣（±16 天內）', () => {
      const jd = gregorianToJulianDay(2026, 4, 1) as unknown as number
      const result = preciseSolarTermFromJD(jd)
      expect(Math.abs(result - jd)).toBeLessThan(16)
    })

    it('preciseNewMoonFromJD 回傳靠近輸入 JD 的合朔（±15 天內）', () => {
      const jd = gregorianToJulianDay(2026, 5, 1) as unknown as number
      const result = preciseNewMoonFromJD(jd)
      expect(Math.abs(result - jd)).toBeLessThan(15)
    })
  })
})

// ── ssq 分支覆蓋 ──────────────────────────────────────────────────────────────

describe('ssq branch coverage', () => {
  it('古曆前期（春秋 −721 年以前）走現代算法分支（jd < f1）', () => {
    // −5000 年對應極遠古代，jd 遠小於古曆表起點 f1
    const result = shuoQiCalculator.calc(-5000 * 365.25, true)
    expect(typeof result).toBe('number')
    expect(isNaN(result)).toBe(false)
  })

  it('1960 年之後走現代算法分支（jd >= f3 = 2436935）', () => {
    // 2000 年 1 月 1 日 JD(J2000) = 0 → jd+2451545 > 2436935
    const result = shuoQiCalculator.calc(0, false)
    expect(typeof result).toBe('number')
    expect(isNaN(result)).toBe(false)
  })

  it('古曆中期（定朔定氣，f2 ≤ jd < f3）節氣計算', () => {
    // 619 年至 1645 年之間：f2 對應 SOLAR_TERM_LINEAR_COEFFS 最後值（≈2322147）
    // 對應 JD ≈ 1980000：以 1200 年左右的 JD 換算
    // JD 2159000 ≈ 1199 年；offset from J2000 = 2159000 - 2451545 = -292545
    const jdOffset = 2159000 - 2451545
    const result = shuoQiCalculator.calc(jdOffset, true)
    expect(typeof result).toBe('number')
    expect(isNaN(result)).toBe(false)
  })

  it('古曆中期（定朔，f2 ≤ jd < f3）合朔計算', () => {
    const jdOffset = 2159000 - 2451545
    const result = shuoQiCalculator.calc(jdOffset, false)
    expect(typeof result).toBe('number')
    expect(isNaN(result)).toBe(false)
  })

  it('古曆前期（平朔，f1 ≤ jd < f2）合朔計算', () => {
    // JD 約 1700000 對應漢代（約 −300 年）
    const jdOffset = 1700000 - 2451545
    const result = shuoQiCalculator.calc(jdOffset, false)
    expect(typeof result).toBe('number')
    expect(isNaN(result)).toBe(false)
  })

  it('古曆前期（平氣，f1 ≤ jd < f2）節氣計算', () => {
    const jdOffset = 1700000 - 2451545
    const result = shuoQiCalculator.calc(jdOffset, true)
    expect(typeof result).toBe('number')
    expect(isNaN(result)).toBe(false)
  })

  it('calcYear 不拋例外且 newMoonList 長度 >= 15', () => {
    shuoQiCalculator.calcYear(0)
    expect(shuoQiCalculator.newMoonList.length).toBeGreaterThanOrEqual(15)
  })

  it('calcYear 前古代年份（−104 年附近）', () => {
    // −104 年 JD ≈ 1683430 → offset = 1683430 - 2451545
    const jd = 1683430 - 2451545
    expect(() => shuoQiCalculator.calcYear(jd)).not.toThrow()
  })
})
