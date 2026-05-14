// 組合 vsop87、elp-moon、aberration、nutation 等模組，提供高階的黃經計算、
// 從黃經反求時間（迭代）、月相、月球近遠點、月球交點、太陽升降等常用函式。

import {
  EARTH_EQUATORIAL_RADIUS_KM,
  MOON_RADIUS_FACTOR_PENUMBRA,
  RAD_TO_ARCSEC,
  TWO_PI,
} from './constants'
import { moonLongitudeAberration, sunLongitudeAberration } from './aberration'
import { nutationLongitudeMedium } from './nutation'
import { normalizeAngleSigned } from './math'
import { evalVSOP87 } from './vsop87'
import { evalELPMoon } from './elp-moon'

// ── 黃經 ──

/** 地球黃經（Date 分點，rad）。 */
export function earthLongitude(t: number, n: number): number {
  return evalVSOP87(0, 0, t, n)
}

/** 月球黃經（Date 分點，rad）。 */
export function moonLongitude(t: number, n: number): number {
  return evalELPMoon(0, t, n)
}

// ── 角速度（rad/世紀）──

/**
 * 地球角速度（rad/世紀），誤差 < 0.03%。
 */
export function earthAngularVelocity(t: number): number {
  const f = 628.307585 * t
  return (
    628.332 +
    21 * Math.sin(1.527 + f) +
    0.44 * Math.sin(1.48 + f * 2) +
    0.129 * Math.sin(5.82 + f) * t +
    0.00055 * Math.sin(4.21 + f) * t * t
  )
}

/**
 * 月球角速度（rad/世紀），誤差 < 5%。
 */
export function moonAngularVelocity(t: number): number {
  let v = 8399.71 - 914 * Math.sin(0.7848 + 8328.691425 * t + 0.0001523 * t * t)
  v -=
    179 * Math.sin(2.543 + 15542.7543 * t) +
    160 * Math.sin(0.1874 + 7214.0629 * t) +
    62 * Math.sin(3.14 + 16657.3828 * t) +
    34 * Math.sin(4.827 + 16866.9323 * t) +
    22 * Math.sin(4.9 + 23871.4457 * t) +
    12 * Math.sin(2.59 + 14914.4523 * t) +
    7 * Math.sin(0.23 + 6585.7609 * t) +
    5 * Math.sin(0.9 + 25195.624 * t) +
    5 * Math.sin(2.32 - 7700.3895 * t) +
    5 * Math.sin(3.88 + 8956.9934 * t) +
    5 * Math.sin(0.49 + 7771.3771 * t)
  return v
}

// ── 視黃經差與太陽視黃經 ──

/** 月日視黃經差（rad）。 */
export function moonSunApparentLongDiff(t: number, mn: number, sn: number): number {
  return (
    moonLongitude(t, mn) +
    moonLongitudeAberration(t) -
    (earthLongitude(t, sn) + sunLongitudeAberration(t) + Math.PI)
  )
}

/** 太陽視黃經（rad）。 */
export function sunApparentLongitude(t: number, n: number): number {
  return earthLongitude(t, n) + nutationLongitudeMedium(t) + sunLongitudeAberration(t) + Math.PI
}

// ── 已知黃經求時間（迭代） ──

/**
 * 由地球黃經 W 求儒略世紀數（J2000 起）。
 */
export function earthLongitudeToTime(W: number): number {
  let v = 628.3319653318
  let t = (W - 1.75347) / v
  v = earthAngularVelocity(t)
  t += (W - earthLongitude(t, 10)) / v
  v = earthAngularVelocity(t)
  t += (W - earthLongitude(t, -1)) / v
  return t
}

/**
 * 由月球黃經 W 求儒略世紀數。
 */
export function moonLongitudeToTime(W: number): number {
  let v = 8399.70911033384
  let t = (W - 3.81034) / v
  t += (W - moonLongitude(t, 3)) / v
  v = moonAngularVelocity(t)
  t += (W - moonLongitude(t, 20)) / v
  t += (W - moonLongitude(t, -1)) / v
  return t
}

/**
 * 由月日黃經差 W 求儒略世紀數（用於計算月相）。
 */
export function moonSunDiffToTime(W: number): number {
  let v = 7771.37714500204
  let t = (W + 1.08472) / v
  t += (W - moonSunApparentLongDiff(t, 3, 3)) / v
  v = moonAngularVelocity(t) - earthAngularVelocity(t)
  t += (W - moonSunApparentLongDiff(t, 20, 10)) / v
  t += (W - moonSunApparentLongDiff(t, -1, 60)) / v
  return t
}

/**
 * 由太陽視黃經 W 求儒略世紀數。
 */
export function sunApparentLongToTime(W: number): number {
  let v = 628.3319653318
  let t = (W - 1.75347 - Math.PI) / v
  v = earthAngularVelocity(t)
  t += (W - sunApparentLongitude(t, 10)) / v
  v = earthAngularVelocity(t)
  t += (W - sunApparentLongitude(t, -1)) / v
  return t
}

/**
 * 高速低精度月日黃經差求時（誤差 ≤ 600 秒）。
 */
export function moonSunDiffToTimeFaster(W: number): number {
  let v = 7771.37714500204
  let t = (W + 1.08472) / v
  const t2 = t * t
  t -=
    (-0.00003309 * t2 +
      0.10976 * Math.cos(0.784758 + 8328.6914246 * t + 0.000152292 * t2) +
      0.02224 * Math.cos(0.1874 + 7214.0628654 * t - 0.00021848 * t2) -
      0.03342 * Math.cos(4.669257 + 628.307585 * t)) /
    v
  const L =
    moonLongitude(t, 20) -
    (4.8950632 +
      628.3319653318 * t +
      0.000005297 * t * t +
      0.0334166 * Math.cos(4.669257 + 628.307585 * t) +
      0.0002061 * Math.cos(2.67823 + 628.307585 * t) * t +
      0.000349 * Math.cos(4.6261 + 1256.61517 * t) -
      20.5 / RAD_TO_ARCSEC)
  v =
    7771.38 -
    914 * Math.sin(0.7848 + 8328.691425 * t + 0.0001523 * t * t) -
    179 * Math.sin(2.543 + 15542.7543 * t) -
    160 * Math.sin(0.1874 + 7214.0629 * t)
  t += (W - L) / v
  return t
}

/**
 * 高速低精度太陽視黃經求時。
 */
export function sunApparentLongToTimeFaster(W: number): number {
  const v = 628.3319653318
  let t = (W - 1.75347 - Math.PI) / v
  t -=
    (0.000005297 * t * t +
      0.0334166 * Math.cos(4.669257 + 628.307585 * t) +
      0.0002061 * Math.cos(2.67823 + 628.307585 * t) * t) /
    v
  t +=
    (W -
      earthLongitude(t, 8) -
      Math.PI +
      (20.5 + 17.2 * Math.sin(2.1824 - 33.75705 * t)) / RAD_TO_ARCSEC) /
    v
  return t
}

// ── 月相、月球軌道事件 ──

/**
 * 月球被照面積比例（0–1，0 = 朔，1 = 望）。
 * @param t 儒略世紀數
 */
export function moonIlluminatedFraction(t: number): number {
  const dm = Math.PI / 180
  const t2 = t * t
  const t3 = t2 * t
  const t4 = t3 * t
  const D = (297.8502042 + 445267.1115168 * t - 0.00163 * t2 + t3 / 545868 - t4 / 113065000) * dm
  const M = (357.5291092 + 35999.0502909 * t - 0.0001536 * t2 + t3 / 24490000) * dm
  const m = (134.9634114 + 477198.8676313 * t + 0.008997 * t2 + t3 / 69699 - t4 / 14712000) * dm
  const a =
    Math.PI -
    D +
    (-6.289 * Math.sin(m) +
      2.1 * Math.sin(M) -
      1.274 * Math.sin(D * 2 - m) -
      0.658 * Math.sin(D * 2) -
      0.214 * Math.sin(m * 2) -
      0.11 * Math.sin(D)) *
      dm
  return (1 + Math.cos(a)) / 2
}

/**
 * 月球站心視半徑（arcsec）。
 * @param r 地月質心距離（km）
 * @param alt 地平緯度（rad）
 */
export function moonAngularRadius(r: number, alt: number): number {
  return (MOON_RADIUS_FACTOR_PENUMBRA / r) * (1 + (Math.sin(alt) * EARTH_EQUATORIAL_RADIUS_KM) / r)
}

/**
 * 月球近點／遠點時間與距離。
 * @param t 儒略世紀數（起始估計）
 * @param isPerigee true = 近點（Perigee）；false = 遠點（Apogee）
 * @returns `[t, r]`：儒略世紀數、質心距離（km）
 */
export function moonPerigeeApogee(t: number, isPerigee: boolean): [number, number] {
  const a = 27.55454988 / 36525
  const b = isPerigee ? -10.3302 / 36525 : 3.4471 / 36525
  t = b + a * Math.floor((t - b) / a + 0.5)

  let dt = 2 / 36525
  let r1 = evalELPMoon(2, t - dt, 10)
  let r2 = evalELPMoon(2, t, 10)
  let r3 = evalELPMoon(2, t + dt, 10)
  t += (((r1 - r3) / (r1 + r3 - 2 * r2)) * dt) / 2

  dt = 0.5 / 36525
  r1 = evalELPMoon(2, t - dt, 20)
  r2 = evalELPMoon(2, t, 20)
  r3 = evalELPMoon(2, t + dt, 20)
  t += (((r1 - r3) / (r1 + r3 - 2 * r2)) * dt) / 2

  dt = 1200 / 86400 / 36525
  r1 = evalELPMoon(2, t - dt, -1)
  r2 = evalELPMoon(2, t, -1)
  r3 = evalELPMoon(2, t + dt, -1)
  const frac = (r1 - r3) / (r1 + r3 - 2 * r2)
  t += (frac * dt) / 2
  r2 += (frac * (r3 - r1)) / 8
  return [t, r2]
}

/**
 * 月球升交點（Ascending）或降交點（Descending）時間與黃經。
 * @param t 儒略世紀數（起始估計）
 * @param ascending true = 升交點；false = 降交點
 * @returns `[t, L]`：儒略世紀數、月球黃經（rad）
 */
export function moonNode(t: number, ascending: boolean): [number, number] {
  const a = 27.21222082 / 36525
  const b = ascending ? 21 / 36525 : 35 / 36525
  t = b + a * Math.floor((t - b) / a + 0.5)

  let dt = 0.5 / 36525
  let w = evalELPMoon(1, t, 10)
  let w2 = evalELPMoon(1, t + dt, 10)
  let v = (w2 - w) / dt
  t -= w / v

  dt = 0.05 / 36525
  w = evalELPMoon(1, t, 40)
  w2 = evalELPMoon(1, t + dt, 40)
  v = (w2 - w) / dt
  t -= w / v

  w = evalELPMoon(1, t, -1)
  t -= w / v
  return [t, evalELPMoon(0, t, -1)]
}

/**
 * 地球近日點（Perihelion）或遠日點（Aphelion）時間與距離。
 * @param t 儒略世紀數（起始估計）
 * @param isPerihelion true = 近日點；false = 遠日點
 * @returns `[t, r]`：儒略世紀數、日地距離（AU）
 */
export function earthPerihelionAphelion(t: number, isPerihelion: boolean): [number, number] {
  const a = 365.25963586 / 36525
  const b = isPerihelion ? 1.7 / 36525 : 184.5 / 36525
  t = b + a * Math.floor((t - b) / a + 0.5)

  let dt = 3 / 36525
  let r1 = evalVSOP87(0, 2, t - dt, 10)
  let r2 = evalVSOP87(0, 2, t, 10)
  let r3 = evalVSOP87(0, 2, t + dt, 10)
  t += (((r1 - r3) / (r1 + r3 - 2 * r2)) * dt) / 2

  dt = 0.2 / 36525
  r1 = evalVSOP87(0, 2, t - dt, 80)
  r2 = evalVSOP87(0, 2, t, 80)
  r3 = evalVSOP87(0, 2, t + dt, 80)
  t += (((r1 - r3) / (r1 + r3 - 2 * r2)) * dt) / 2

  dt = 0.01 / 36525
  r1 = evalVSOP87(0, 2, t - dt, -1)
  r2 = evalVSOP87(0, 2, t, -1)
  r3 = evalVSOP87(0, 2, t + dt, -1)
  const frac = (r1 - r3) / (r1 + r3 - 2 * r2)
  t += (frac * dt) / 2
  r2 += (frac * (r3 - r1)) / 8
  return [t, r2]
}

// ── 朔日與太陽升降 ──

/**
 * 根據儒略日估算朔日序號（允許前後數天誤差）。
 */
export function newMoonOrdinal(jd: number): number {
  return Math.floor((jd + 8) / 29.5306)
}

/**
 * 太陽升／降時間（格林威治 UT）迭代細化。
 *
 * @param jd 儒略日（須接近 longitude 當地平午 UT）
 * @param longitude 觀測者經度（rad，東正）
 * @param latitude 觀測者緯度（rad）
 * @param direction -1 = 日出；+1 = 日落
 * @returns 格林威治 UT 儒略日；若極晝／夜回傳 0
 */
export function findSunRiseOrSet(
  jd: number,
  longitude: number,
  latitude: number,
  direction: -1 | 1,
): number {
  // eslint-disable-next-line no-loss-of-precision -- 保留來源文獻原始精度（IAU 2006）
  const earthRotationRate = 1.00273781191135448
  let t = Math.floor(jd + 0.5) - longitude / TWO_PI
  for (let i = 0; i < 2; i++) {
    const T = t / 36525
    const E = (84381.406 - 46.836769 * T) / RAD_TO_ARCSEC
    const tApprox = T + (32 * (T + 1.8) * (T + 1.8) - 20) / 86400 / 36525
    const J =
      (48950621.66 +
        6283319653.318 * tApprox +
        53 * tApprox * tApprox -
        994 +
        334166 * Math.cos(4.669257 + 628.307585 * tApprox) +
        3489 * Math.cos(4.6261 + 1256.61517 * tApprox) +
        2060.6 * Math.cos(2.67823 + 628.307585 * tApprox) * tApprox) /
      10000000
    const sinJ = Math.sin(J)
    const cosJ = Math.cos(J)
    const gst =
      (0.779057273264 + earthRotationRate * t) * TWO_PI +
      (0.014506 + 4612.15739966 * T + 1.39667721 * T * T) / RAD_TO_ARCSEC
    const A = Math.atan2(sinJ * Math.cos(E), cosJ)
    const D = Math.asin(Math.sin(E) * sinJ)
    const cosH0 =
      (Math.sin((-50 * 60) / RAD_TO_ARCSEC) - Math.sin(latitude) * Math.sin(D)) /
      (Math.cos(latitude) * Math.cos(D))
    if (Math.abs(cosH0) >= 1) return 0
    t += normalizeAngleSigned(direction * Math.acos(cosH0) - (gst + longitude - A)) / 6.28
  }
  return t
}
