// 因觀測者運動所致，太陽與月球的視位置相對真位置存在小幅偏移。
// 此處給出黃經／黃緯方向的光行差量（弧度），由參數 t（J2000 起算之
// 儒略世紀數）算出。
//
// 學術依據：Meeus《Astronomical Algorithms》第 23 章；月球部分採用
// 簡化形式，誤差約 0.07″（黃經）、0.006″（黃緯）足供曆法用途。

import { RAD_TO_ARCSEC } from './constants'

/**
 * 太陽黃經光行差（rad）。
 * @param t 儒略世紀數（J2000 起）
 */
export function sunLongitudeAberration(t: number): number {
  const v = -0.043126 + 628.301955 * t - 0.000002732 * t * t // 平近點角
  const e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t
  return (-20.49552 * (1 + e * Math.cos(v))) / RAD_TO_ARCSEC
}

/**
 * 太陽黃緯光行差（rad）。理論上恆為 0。
 */
export function sunLatitudeAberration(_t: number): number {
  return 0
}

/**
 * 月球黃經光行差（rad）。簡化常數，誤差約 0.07″。
 */
export function moonLongitudeAberration(_t: number): number {
  return -3.4e-6
}

/**
 * 月球黃緯光行差（rad）。誤差約 0.006″。
 * @param t 儒略世紀數（J2000 起）
 */
export function moonLatitudeAberration(t: number): number {
  return (0.063 * Math.sin(0.057 + 8433.4662 * t + 0.000064 * t * t)) / RAD_TO_ARCSEC
}
