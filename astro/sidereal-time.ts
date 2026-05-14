// 岱員時憲章 — 恆星時與時間方程式
//
// 平恆星時依 IAU 2006 / IERS 2010 conventions 之 P03 表達式。
// 不含赤經章動及其它非多項式修正項；如需「視恆星時」（apparent sidereal
// time）須另加章動黃經分量乘以 cos(ε)。
//
// 時間方程式（equationOfTime / equationOfTimeFast）依太陽地心視位置與
// 平太陽位置之差計算；前者為高精度版本，後者為簡化快速版。

import { sunLongitudeAberration } from './aberration'
import { RAD_TO_ARCSEC, TWO_PI } from './constants'
import { deltaT } from './delta-t'
import { normalizeAngleSigned, rotateSpherical } from './math'
import { meanObliquityP03 } from './precession'
import { evalVSOP87 } from './vsop87'

/**
 * 從世界時 UT 計算平恆星時（rad）。
 * 回傳值為格林尼治平春分點起算之赤經，未含章動。
 *
 * @param ut J2000 起算之 UT 儒略日數（即 JD_UT − 2451545）
 * @param dt ΔT 力學時差（日），可從 `deltaT(ut)` 取得
 */
export function meanSiderealTimeFromUT(ut: number, dt: number): number {
  const t = (ut + dt) / 36525
  const t2 = t * t
  const t3 = t2 * t
  const t4 = t3 * t
  // eslint-disable-next-line no-loss-of-precision -- 保留來源文獻原始精度（IAU 2006）
  const earthRotationRate = 1.00273781191135448
  return (
    TWO_PI * (0.779057273264 + earthRotationRate * ut) +
    (0.014506 + 4612.15739966 * t + 1.39667721 * t2 - 0.00009344 * t3 + 0.00001882 * t4) /
      RAD_TO_ARCSEC
  )
}

/**
 * 從力學時 TD 計算平恆星時（rad）。
 *
 * 內部以 ΔT 從 TD 反推 UT 再呼叫 {@link meanSiderealTimeFromUT}。
 *
 * @param td J2000 起算之 TD 儒略日數
 */
export function meanSiderealTimeFromTD(td: number): number {
  const dt = deltaT(td)
  return meanSiderealTimeFromUT(td - dt, dt)
}

/**
 * 時間方程式（高精度）。
 *
 * 回傳「平太陽時 − 視太陽時」之差，單位為「日」（即天的一個比例）；
 * 換算成秒乘以 86400。
 *
 * @param t 儒略世紀數（力學時，J2000 起）
 */
export function equationOfTime(t: number): number {
  const t2 = t * t
  const t3 = t2 * t
  const t4 = t3 * t
  const t5 = t4 * t
  let L =
    (1753470142 + 628331965331.8 * t + 5296.74 * t2 + 0.432 * t3 - 0.1124 * t4 - 0.00009 * t5) /
      1000000000 +
    Math.PI -
    20.5 / RAD_TO_ARCSEC

  const dL = (-17.2 * Math.sin(2.1824 - 33.75705 * t)) / RAD_TO_ARCSEC // 黃經章動
  const dE = (9.2 * Math.cos(2.1824 - 33.75705 * t)) / RAD_TO_ARCSEC // 交角章動
  const E = meanObliquityP03(t) + dE // 真黃赤交角

  // 地球座標 → 太陽地心座標
  const sunLon = evalVSOP87(0, 0, t, 50) + Math.PI + sunLongitudeAberration(t) + dL
  const sunLat =
    -(
      2796 * Math.cos(3.1987 + 8433.46616 * t) +
      1016 * Math.cos(5.4225 + 550.75532 * t) +
      804 * Math.cos(3.88 + 522.3694 * t)
    ) / 1000000000
  const rotated = rotateSpherical([sunLon, sunLat, 1], E)
  const apparentRA = rotated[0] - dL * Math.cos(E)

  L = normalizeAngleSigned(L - apparentRA)
  return L / TWO_PI
}

/**
 * 時間方程式（低精度，誤差 ~1 秒以內）。
 * @param t 儒略世紀數
 */
export function equationOfTimeFast(t: number): number {
  let L = (1753470142 + 628331965331.8 * t + 5296.74 * t * t) / 1000000000 + Math.PI
  const E = (84381.4088 - 46.836051 * t) / RAD_TO_ARCSEC
  const sunLon = evalVSOP87(0, 0, t, 5) + Math.PI
  const rotated = rotateSpherical([sunLon, 0, 1], E)
  L = normalizeAngleSigned(L - rotated[0])
  return L / TWO_PI
}
