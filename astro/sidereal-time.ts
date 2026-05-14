// 岱員時憲章 — 恆星時與時間方程式
//
// 平恆星時依 IAU 2006 / IERS 2010 conventions 之 P03 表達式。
// 不含赤經章動及其它非多項式修正項；如需「視恆星時」（apparent sidereal
// time）須另加章動黃經分量乘以 cos(ε)。
//
// `equationOfTime`（時間方程式）依賴 `precession.meanObliquityP03` 與
// `vsop87.evalVSOP87`，本檔暫不移植，待對應模組完成後補。

import { RAD_TO_ARCSEC, TWO_PI } from './constants'
import { deltaT } from './delta-t'

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
