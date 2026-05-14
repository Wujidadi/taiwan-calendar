// 大氣折射採 Bennett 1982 之倒推公式（IAU 標準氣壓 / 溫度，誤差 < 0.1′）。
// 視差將天體之地心赤道座標換算為觀測站心赤道座標。

import { AU_KM, EARTH_EQUATORIAL_RADIUS_KM, EARTH_POLAR_EQ_RATIO } from './constants'
import type { Spherical } from './math'
import { cartesianToSpherical, sphericalToCartesian } from './math'

/**
 * 由真高度 h 算大氣折射量（rad）。
 * @param h 真高度（rad）
 */
export function refractionFromTrueAltitude(h: number): number {
  return 0.0002967 / Math.tan(h + 0.003138 / (h + 0.08919))
}

/**
 * 由視高度 ho 反推大氣折射量（rad，符號相反）。
 * @param ho 視高度（rad）
 */
export function refractionFromApparentAltitude(ho: number): number {
  return -0.0002909 / Math.tan(ho + 0.002227 / (ho + 0.07679))
}

/**
 * 視差修正：天體地心赤道座標 → 觀測站心赤道座標。
 *
 * 純函式設計，回傳新的 Spherical，不修改輸入。
 *
 * @param z 赤道座標 [赤經(rad), 赤緯(rad), 距離]
 * @param hourAngle 時角（rad）
 * @param latitude 觀測者地理緯度（rad）
 * @param elevationKm 觀測者海拔（km）
 *
 * @remarks 距離 `z[2] < 500` 視為以 AU 為單位，內部換算為 km；回傳距離仍以原單位呈現。
 */
export function applyParallax(
  z: Spherical,
  hourAngle: number,
  latitude: number,
  elevationKm: number,
): Spherical {
  const distUnit = z[2] < 500 ? AU_KM : 1
  const distanceKm = z[2] * distUnit
  const f = EARTH_POLAR_EQ_RATIO
  const u = Math.atan(f * Math.tan(latitude))
  const g = z[0] + hourAngle
  const r0 = EARTH_EQUATORIAL_RADIUS_KM * Math.cos(u) + elevationKm * Math.cos(latitude)
  const z0 = EARTH_EQUATORIAL_RADIUS_KM * Math.sin(u) * f + elevationKm * Math.sin(latitude)
  const x0 = r0 * Math.cos(g)
  const y0 = r0 * Math.sin(g)
  const s = sphericalToCartesian([z[0], z[1], distanceKm])
  const adjusted = cartesianToSpherical([s[0] - x0, s[1] - y0, s[2] - z0])
  return [adjusted[0], adjusted[1], adjusted[2] / distUnit]
}
