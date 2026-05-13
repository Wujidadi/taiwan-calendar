// 岱員時憲章 — 儒略日換算測試
//
// 已知對照（Meeus《Astronomical Algorithms》第 7 章）：
//   2000-01-01 12:00 TT = JD 2451545.0（J2000.0）
//   1970-01-01 00:00 UT = JD 2440587.5（Unix epoch）
//   1582-10-15 00:00 UT = JD 2299160.5（格里曆首日）
//   1582-10-04 00:00 UT = JD 2299159.5（儒略曆末日）
//   2026-05-13 00:00 UT = JD 2461173.5（當代日期）
import { J2000 } from '#astro/constants'
import {
  formatGregorian,
  gregorianToJulianDay,
  julianDayOfNthWeekday,
  julianDayToGregorian,
  julianDayToWeekday,
} from '#astro/julian-day'
import { describe, expect, it } from 'vitest'

describe('gregorianToJulianDay', () => {
  it('J2000 (2000-01-01 12:00) = 2451545.0', () => {
    expect(gregorianToJulianDay(2000, 1, 1.5)).toBe(J2000)
  })

  it('Unix epoch (1970-01-01 00:00) = 2440587.5', () => {
    expect(gregorianToJulianDay(1970, 1, 1)).toBe(2440587.5)
  })

  it('格里曆首日 (1582-10-15 00:00) = 2299160.5', () => {
    expect(gregorianToJulianDay(1582, 10, 15)).toBe(2299160.5)
  })

  it('儒略曆末日 (1582-10-04 00:00) = 2299159.5', () => {
    expect(gregorianToJulianDay(1582, 10, 4)).toBe(2299159.5)
  })

  it('小數天可表時分秒：1.5 = 中午', () => {
    const noon = gregorianToJulianDay(2026, 5, 13.5)
    const midnight = gregorianToJulianDay(2026, 5, 13)
    expect(noon - midnight).toBeCloseTo(0.5)
  })
})

describe('julianDayToGregorian', () => {
  it('JD 2451545.0 = 2000-01-01 12:00:00', () => {
    const g = julianDayToGregorian(2451545 as never)
    expect(g.year).toBe(2000)
    expect(g.month).toBe(1)
    expect(g.day).toBe(1)
    expect(g.hour).toBe(12)
    expect(g.minute).toBe(0)
  })

  it('JD 2440587.5 = 1970-01-01 00:00:00', () => {
    const g = julianDayToGregorian(2440587.5 as never)
    expect(g.year).toBe(1970)
    expect(g.month).toBe(1)
    expect(g.day).toBe(1)
    expect(g.hour).toBe(0)
  })

  it('JD 2299160.5 = 格里曆首日 1582-10-15', () => {
    const g = julianDayToGregorian(2299160.5 as never)
    expect(g.year).toBe(1582)
    expect(g.month).toBe(10)
    expect(g.day).toBe(15)
  })
})

describe('正反運算互為逆', () => {
  it.each([
    [2026, 5, 13, 8, 30, 15],
    [1900, 1, 1, 0, 0, 0],
    [1582, 10, 15, 12, 0, 0],
    [2100, 12, 31, 23, 59, 59],
  ])('%i-%i-%i %i:%i:%i 來回轉換無損', (y, m, d, h, mi, s) => {
    const day = d + h / 24 + mi / 1440 + s / 86400
    const jd = gregorianToJulianDay(y, m, day)
    const g = julianDayToGregorian(jd)
    expect(g.year).toBe(y)
    expect(g.month).toBe(m)
    expect(g.day).toBe(d)
    expect(g.hour).toBe(h)
    expect(g.minute).toBe(mi)
    expect(g.second).toBeCloseTo(s, 0)
  })
})

describe('julianDayToWeekday', () => {
  it('JD 2451545（2000-01-01 12:00）= 週六（6）', () => {
    expect(julianDayToWeekday(2451545 as never)).toBe(6)
  })

  it('JD 2461174（2026-05-14 00:00）= 週四（4）', () => {
    // 2026-05-14 (Thursday)
    expect(julianDayToWeekday(2461174.5 as never)).toBe(4)
  })
})

describe('julianDayOfNthWeekday', () => {
  it('2026 年 5 月第二個週日（母親節）= 5/10', () => {
    const jd = julianDayOfNthWeekday(2026, 5, 2, 0)
    const g = julianDayToGregorian(jd)
    expect(g.year).toBe(2026)
    expect(g.month).toBe(5)
    expect(g.day).toBe(10)
  })

  it('2026 年 6 月第三個週日（國際父親節）= 6/21', () => {
    const jd = julianDayOfNthWeekday(2026, 6, 3, 0)
    const g = julianDayToGregorian(jd)
    expect(g.month).toBe(6)
    expect(g.day).toBe(21)
  })
})

describe('formatGregorian', () => {
  it('格式為 YYYY-MM-DD HH:mm:ss', () => {
    const s = formatGregorian({
      year: 2026,
      month: 5,
      day: 13,
      hour: 8,
      minute: 30,
      second: 15,
    })
    expect(s).toMatch(/2026-05-13 08:30:15/)
  })
})
