// 岱員時憲章 — 儒略日換算與日期工具
//
// 所有函式皆為純函式：
//   - `gregorianToJulianDay(y, m, d)`：公曆 → 儒略日；`d` 可帶小數天
//   - `julianDayToGregorian(jd)`：儒略日 → 公曆 { year, month, day, hour, minute, second }
//   - `julianDayToWeekday(jd)`：儒略日 → 星期（0 = 週日 … 6 = 週六）
//
// 1582-10-15 之前自動視為儒略曆，之後為格里曆。

import type { JulianDay } from '#types/time'

/** 公曆日期物件 */
export interface GregorianDateTime {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

/** 公曆改革日（格里曆首日，1582-10-15）的判定門檻：y*372 + m*31 + floor(d) */
const GREGORIAN_THRESHOLD = 588829

/**
 * 公曆日期 → 儒略日（含小數）。
 * @param year 公曆年（公元紀年；公元前 1 年 = 0，公元前 2 年 = -1 ……）
 * @param month 月（1–12）
 * @param day 日（可含小數天，1.5 表中午）
 */
export function gregorianToJulianDay(year: number, month: number, day: number): JulianDay {
  let y = year
  let m = month
  const d = day
  let n = 0
  const isGregorian = y * 372 + m * 31 + Math.floor(d) >= GREGORIAN_THRESHOLD
  if (m <= 2) {
    m += 12
    y -= 1
  }
  if (isGregorian) {
    const a = Math.floor(y / 100)
    n = 2 - a + Math.floor(a / 4)
  }
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + n - 1524.5
  return jd as JulianDay
}

/**
 * 儒略日 → 公曆日期物件。
 */
export function julianDayToGregorian(jd: JulianDay): GregorianDateTime {
  let d = Math.floor((jd as number) + 0.5)
  let f = (jd as number) + 0.5 - d
  if (d >= 2299161) {
    const c = Math.floor((d - 1867216.25) / 36524.25)
    d += 1 + c - Math.floor(c / 4)
  }
  d += 1524
  let year = Math.floor((d - 122.1) / 365.25)
  d -= Math.floor(365.25 * year)
  let month = Math.floor(d / 30.601)
  d -= Math.floor(30.601 * month)
  const day = d
  if (month > 13) {
    month -= 13
    year -= 4715
  } else {
    month -= 1
    year -= 4716
  }
  f *= 24
  const hour = Math.floor(f)
  f -= hour
  f *= 60
  const minute = Math.floor(f)
  f -= minute
  f *= 60
  const second = f
  return { year, month, day, hour, minute, second }
}

/**
 * 計算星期（0 = 週日 … 6 = 週六）。
 */
export function julianDayToWeekday(jd: JulianDay): number {
  return Math.floor((jd as number) + 1.5 + 7000000) % 7
}

/**
 * 求指定公曆年月的「第 n 個星期 weekday」之儒略日（用於計算如「5 月第二個週日」之母親節）。
 * @param year 公曆年
 * @param month 公曆月（1–12）
 * @param n 第幾個（1–5）；若該月不存在第 5 個則回傳該月最後一個
 * @param weekday 星期（0 = 週日 … 6 = 週六）
 */
export function julianDayOfNthWeekday(
  year: number,
  month: number,
  n: number,
  weekday: number,
): JulianDay {
  let y = year
  let m = month
  const jd = gregorianToJulianDay(y, m, 1.5) as number
  const w0 = (jd + 1 + 7000000) % 7
  let r = jd - w0 + 7 * n + weekday
  if (weekday >= w0) r -= 7
  if (n === 5) {
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
    if (r >= (gregorianToJulianDay(y, m, 1.5) as number)) r -= 7
  }
  return r as JulianDay
}

/**
 * 公曆日期物件 → 字串（秒精度）：'YYYY-MM-DD HH:mm:ss'。
 */
export function formatGregorian(g: GregorianDateTime): string {
  let h = g.hour
  let m = g.minute
  let s = Math.floor(g.second + 0.5)
  if (s >= 60) {
    s -= 60
    m += 1
  }
  if (m >= 60) {
    m -= 60
    h += 1
  }
  return (
    `${pad(g.year, 5)}-${pad(g.month, 2)}-${pad(g.day, 2)} ` +
    `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}`
  )
}

/**
 * 公曆日期物件 → 字串（毫秒精度）：'YYYY-MM-DD HH:mm:ss.sss'。
 */
export function formatGregorianPrecise(g: GregorianDateTime): string {
  let h = g.hour
  let m = g.minute
  let s = Math.floor(g.second)
  let ms = Math.round((g.second - s) * 1000)
  if (ms >= 1000) {
    ms -= 1000
    s += 1
  }
  if (s >= 60) {
    s -= 60
    m += 1
  }
  if (m >= 60) {
    m -= 60
    h += 1
  }
  if (h >= 24) h -= 24
  return (
    `${pad(g.year, 5)}-${pad(g.month, 2)}-${pad(g.day, 2)} ` +
    `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(ms, 3)}`
  )
}

/**
 * 取 JD 當日時間部分（HH:mm:ss）。
 */
export function formatTimeOfDay(jd: JulianDay): string {
  let f = (jd as number) + 0.5
  f = f - Math.floor(f)
  let total = Math.floor(f * 86400 + 0.5)
  const h = Math.floor(total / 3600)
  total -= h * 3600
  const mi = Math.floor(total / 60)
  total -= mi * 60
  return `${pad(h, 2)}:${pad(mi, 2)}:${pad(total, 2)}`
}

/**
 * 儒略日 → 字串（秒精度）：代理 `formatGregorian(julianDayToGregorian(jd))`。
 */
export function formatJD(jd: JulianDay): string {
  return formatGregorian(julianDayToGregorian(jd))
}

/** 內部 zero-pad helper */
function pad(n: number, width: number): string {
  const str = String(n)
  if (str.length >= width) return str
  return '0'.repeat(width - str.length) + str
}
