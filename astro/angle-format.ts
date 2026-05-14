// 岱員時憲章 — 弧度⇄字串格式化工具
//
// 原版依賴 i18n 取單位字元；移植後改為接受 AngleUnits 參數，
// 使 astro 層保持純函式、無 i18n 依賴。
// UI 層呼叫時注入 i18n 字典對應的單位字串即可。

import { RAD_TO_ARCSEC } from './constants'

/** 角度與時間的單位字元集合 */
export interface AngleUnits {
  /** 度號（如 '°'） */
  deg: string
  /** 角分號（如 '′'） */
  arcmin: string
  /** 角秒號（如 '″'） */
  arcsec: string
  /** 時（如 'h'） */
  hour: string
  /** 時分（如 'm'） */
  min: string
  /** 時秒（如 's'） */
  sec: string
  /** 中文「分」 */
  cnMin: string
  /** 中文「秒」 */
  cnSec: string
}

/** 預設單位：常見天文慣例 ASCII 近似符號 */
export const DEFAULT_ANGLE_UNITS: AngleUnits = {
  deg: '°',
  arcmin: '′',
  arcsec: '″',
  hour: 'h',
  min: 'm',
  sec: 's',
  cnMin: '分',
  cnSec: '秒',
}

/**
 * 弧度 → 度分秒（或時分秒）字串，可指定小數位數。
 *
 * @param radian 弧度值
 * @param timeFormat true 時採時分秒（小時 × 12/π 換算），否則度分秒
 * @param decimalPlaces 秒以下小數位數
 * @param units 單位字元集（預設 {@link DEFAULT_ANGLE_UNITS}）
 */
export function formatRadianFull(
  radian: number,
  timeFormat: boolean,
  decimalPlaces: number,
  units: AngleUnits = DEFAULT_ANGLE_UNITS,
): string {
  let d = radian
  let s = ' '
  const { deg, arcmin, arcsec, hour, min, sec } = units
  let w1 = deg
  let w2 = arcmin
  let w3 = arcsec

  if (d < 0) {
    d = -d
    s = '-'
  }
  if (timeFormat) {
    d *= 12 / Math.PI
    w1 = hour
    w2 = min
    w3 = sec
  } else {
    d *= 180 / Math.PI
  }

  let a = Math.floor(d)
  d = (d - a) * 60
  let b = Math.floor(d)
  d = (d - b) * 60
  let c = Math.floor(d)
  const Q = 10 ** decimalPlaces
  let frac = Math.floor((d - c) * Q + 0.5)
  if (frac >= Q) {
    frac -= Q
    c++
  }
  if (c >= 60) {
    c -= 60
    b++
  }
  if (b >= 60) {
    b -= 60
    a++
  }

  const aStr = `   ${a}`
  const bStr = `0${b}`
  const cStr = `0${c}`
  const dStr = `00000${frac}`
  s += aStr.slice(-3) + w1
  s += bStr.slice(-2) + w2
  s += cStr.slice(-2)
  if (decimalPlaces) s += `.${dStr.slice(-decimalPlaces)}${w3}`
  return s
}

/**
 * 弧度 → 度分秒字串（小數 2 位）。
 */
export function formatRadian(
  radian: number,
  timeFormat: boolean,
  units: AngleUnits = DEFAULT_ANGLE_UNITS,
): string {
  return formatRadianFull(radian, timeFormat, 2, units)
}

/**
 * 弧度 → 度分字串（精確到分）。
 */
export function formatRadianToMinute(
  radian: number,
  units: AngleUnits = DEFAULT_ANGLE_UNITS,
): string {
  const { deg, arcmin } = units
  let d = radian
  let s = '+'
  if (d < 0) {
    d = -d
    s = '-'
  }
  d *= 180 / Math.PI
  let a = Math.floor(d)
  let b = Math.floor((d - a) * 60 + 0.5)
  if (b >= 60) {
    b -= 60
    a++
  }
  const aStr = `   ${a}`
  const bStr = `0${b}`
  return s + aStr.slice(-3) + deg + bStr.slice(-2) + arcmin
}

/**
 * 角秒 → 分秒字串。
 * @param arcsec 角秒值
 * @param decimalPlaces 秒以下小數位數
 * @param style 0 = 度分秒符號（′″）；1 = 中文分秒；2 = 英文 m/s
 */
export function formatArcSeconds(
  arcsec: number,
  decimalPlaces: number,
  style: 0 | 1 | 2 = 0,
  units: AngleUnits = DEFAULT_ANGLE_UNITS,
): string {
  let v = arcsec
  let gn = ''
  if (v < 0) {
    v = -v
    gn = '-'
  }
  const f = Math.floor(v / 60)
  const m = v - f * 60
  if (style === 0) return `${gn}${f}${units.arcmin}${m.toFixed(decimalPlaces)}${units.arcsec}`
  if (style === 1) return `${gn}${f}${units.cnMin}${m.toFixed(decimalPlaces)}${units.cnSec}`
  return `${gn}${f}m${m.toFixed(decimalPlaces)}s`
}

/**
 * 度分秒（或時分秒）字串 → 弧度。
 * @param str 字串（如 '30°15′22.5″' 或 '2h 30m 15s'）
 * @param timeFormat true 時輸入為時分秒，需乘 15 轉換為度
 */
export function parseAngleToRadian(str: string, timeFormat: boolean): number {
  let fh = 1
  const f = timeFormat ? 15 : 1
  if (str.includes('-')) fh = -1
  const cleaned = str
    .replace(/h|m|s|(-)|(°)|'|"/g, ' ')
    .replace(/ +/g, ' ')
    .trim()
  const parts = cleaned.split(' ')
  return (
    ((fh * (Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2]))) / RAD_TO_ARCSEC) *
    f
  )
}
