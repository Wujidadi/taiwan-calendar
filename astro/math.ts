// 所有角度以「弧度」為單位（除非另外標示）。
// 為避免單位混淆，可在呼叫端透過 #types/time 之 Radian / Degree branded type 標記。

import { TWO_PI } from './constants'

/** 球面座標：[黃經（rad）, 黃緯（rad）, 距離] */
export type Spherical = readonly [number, number, number]

/** 直角座標：[x, y, z] */
export type Cartesian = readonly [number, number, number]

/**
 * 將角度正規化到 [0, 2π)。
 * 即使輸入為負或超過一周，結果一律落在此區間。
 */
export function normalizeAngle(v: number): number {
  const m = v % TWO_PI
  return m < 0 ? m + TWO_PI : m
}

/**
 * 將角度正規化到 (−π, π]（帶符號）。
 * 適用於計算兩角度差或最近差距的情境。
 */
export function normalizeAngleSigned(v: number): number {
  let m = v % TWO_PI
  if (m <= -Math.PI) m += TWO_PI
  else if (m > Math.PI) m -= TWO_PI
  return m
}

/**
 * 平衡餘數：a 與最近 b 整倍數之差，結果範圍 [−b/2, b/2]。
 * 用於把任意實數對應到「最近的 b 倍數」的偏差。
 */
export function balancedMod(a: number, b: number): number {
  let c = (a + b) % b
  if (c > b / 2) c -= b
  return c
}

/**
 * 球面座標 [黃經 J、黃緯 W、距離 R] → 直角座標 (x, y, z)。
 */
export function sphericalToCartesian(jwr: Spherical): Cartesian {
  const [j, w, r] = jwr
  const cosW = Math.cos(w)
  return [r * cosW * Math.cos(j), r * cosW * Math.sin(j), r * Math.sin(w)]
}

/**
 * 直角座標 (x, y, z) → 球面座標 [J, W, R]。
 */
export function cartesianToSpherical(xyz: Cartesian): Spherical {
  const [x, y, z] = xyz
  const r = Math.sqrt(x * x + y * y + z * z)
  const w = Math.asin(z / r)
  const j = normalizeAngle(Math.atan2(y, x))
  return [j, w, r]
}

/**
 * 球面座標的旋轉變換：以 E 為旋轉角度（黃道↔赤道時，E 為黃赤交角）。
 * 從赤道到黃道時 E 取負值。
 */
export function rotateSpherical(jwr: Spherical, e: number): Spherical {
  const [j, w, r] = jwr
  const newJ = Math.atan2(Math.sin(j) * Math.cos(e) - Math.tan(w) * Math.sin(e), Math.cos(j))
  const newW = Math.asin(Math.cos(e) * Math.sin(w) + Math.sin(e) * Math.cos(w) * Math.sin(j))
  return [normalizeAngle(newJ), newW, r]
}

/**
 * 赤道座標 → 地平座標。
 * @param eq 赤道座標 [赤經, 赤緯, 距離]（rad）
 * @param longitude 觀測者經度（rad，東正）
 * @param latitude 觀測者緯度（rad，北正）
 * @param gst 格林威治恆星時（rad）
 */
export function equatorialToHorizon(
  eq: Spherical,
  longitude: number,
  latitude: number,
  gst: number,
): Spherical {
  let a: Spherical = [eq[0] + Math.PI / 2 - gst - longitude, eq[1], eq[2]]
  a = rotateSpherical(a, Math.PI / 2 - latitude)
  return [normalizeAngle(-Math.PI / 2 - a[0]), a[1], a[2]]
}

/**
 * 球面上兩點之角距（rad）。
 * 小角度（< 0.001 rad ≈ 3.4 弧分）走平面近似避免 acos 接近 1 時的精度損失。
 */
export function angularSeparation(j1: number, w1: number, j2: number, w2: number): number {
  const dJ = normalizeAngleSigned(j1 - j2)
  const dW = w1 - w2
  if (Math.abs(dJ) < 1 / 1000 && Math.abs(dW) < 1 / 1000) {
    const adj = dJ * Math.cos((w1 + w2) / 2)
    return Math.sqrt(adj * adj + dW * dW)
  }
  return Math.acos(Math.sin(w1) * Math.sin(w2) + Math.cos(w1) * Math.cos(w2) * Math.cos(dJ))
}

/**
 * 日心球面座標 → 地心球面座標（通用平移）。
 * @param target 目標星體日心座標
 * @param earth 地球日心座標
 */
export function heliocentricToGeocentric(target: Spherical, earth: Spherical): Spherical {
  const earthCart = sphericalToCartesian(earth)
  const targetCart = sphericalToCartesian(target)
  return cartesianToSpherical([
    targetCart[0] - earthCart[0],
    targetCart[1] - earthCart[1],
    targetCart[2] - earthCart[2],
  ])
}

/**
 * 視差角（不是視差本身）：地平視差幾何。
 * @param gst 格林威治恆星時（rad）
 * @param longitude 觀測者經度（rad）
 * @param latitude 觀測者緯度（rad）
 * @param ra 赤經（rad）
 * @param dec 赤緯（rad）
 */
export function parallacticAngle(
  gst: number,
  longitude: number,
  latitude: number,
  ra: number,
  dec: number,
): number {
  const h = gst + longitude - ra
  return normalizeAngle(
    Math.atan2(Math.sin(h), Math.tan(latitude) * Math.cos(dec) - Math.sin(dec) * Math.cos(h)),
  )
}
