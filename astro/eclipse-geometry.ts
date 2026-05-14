// 提供日食、月食計算所需的幾何運算：空間直線與地球橢球的交點、
// 線與圓的交點、橢圓與圓的交點等。

import {
  EARTH_EQUATORIAL_RADIUS_KM,
  EARTH_POLAR_EQ_RATIO,
  EARTH_POLAR_EQ_RATIO_SQ,
} from './constants'
import type { Spherical } from './math'
import { normalizeAngleSigned, sphericalToCartesian } from './math'

/** 直線—橢球交點結果 */
export interface LineEllipsoidResult {
  /** 判別式；< 0 表無交點 */
  D: number
  x?: number
  y?: number
  z?: number
  /** 起點 (x1,y1,z1) 到交點之距離 */
  R1?: number
  /** 終點 (x2,y2,z2) 到交點之距離 */
  R2?: number
}

/** 含貝塞爾經緯（J、W）的交點結果 */
export interface LineEarthBesselResult extends LineEllipsoidResult {
  /** 經度（rad）；無解時設為 100 */
  J: number
  /** 緯度（rad）；無解時設為 100 */
  W: number
}

/** 與線交點之回傳；亦含貝塞爾經緯 */
export type LineEarthResult = LineEarthBesselResult

/** 兩個交點集合（橢圓—圓 / 直線—橢圓） */
export interface TwoIntersectionResult {
  /** 交點數（0 或 2，或對切線為 1） */
  n: number
  A?: [number, number]
  B?: [number, number]
  R1?: number
  R2?: number
}

/**
 * 空間兩點連線與地球橢球的交點，回傳靠近 (x1, y1, z1) 之一。
 *
 * @param e 短長軸比（地球扁率相關）
 * @param r 長半徑（km）
 */
export function lineEllipsoidIntersect(
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number,
  e: number,
  r: number,
): LineEllipsoidResult {
  const dx = x2 - x1
  const dy = y2 - y1
  const dz = z2 - z1
  const e2 = e * e
  const A = dx * dx + dy * dy + (dz * dz) / e2
  const B = x1 * dx + y1 * dy + (z1 * dz) / e2
  const C = x1 * x1 + y1 * y1 + (z1 * z1) / e2 - r * r
  const result: LineEllipsoidResult = { D: B * B - A * C }
  if (result.D < 0) return result
  let D = Math.sqrt(result.D)
  if (B < 0) D = -D
  const t = (-B + D) / A
  result.x = x1 + dx * t
  result.y = y1 + dy * t
  result.z = z1 + dz * t
  const R = Math.sqrt(dx * dx + dy * dy + dz * dz)
  result.R1 = R * Math.abs(t)
  result.R2 = R * Math.abs(t - 1)
  return result
}

/**
 * 貝塞爾座標下的線—地球交點。
 * @param besselParams 貝塞爾要素 `[μ, d, GHA]`（rad）
 */
export function lineEarthIntersectBessel(
  x1: number,
  y1: number,
  z1: number,
  x2: number,
  y2: number,
  z2: number,
  e: number,
  r: number,
  besselParams: readonly [number, number, number],
): LineEarthBesselResult {
  const P = Math.cos(besselParams[1])
  const Q = Math.sin(besselParams[1])
  const X1 = x1
  const Y1 = P * y1 - Q * z1
  const Z1 = Q * y1 + P * z1
  const X2 = x2
  const Y2 = P * y2 - Q * z2
  const Z2 = Q * y2 + P * z2
  const ip = lineEllipsoidIntersect(X1, Y1, Z1, X2, Y2, Z2, e, r)
  const result: LineEarthBesselResult = { ...ip, J: 100, W: 100 }
  if (ip.D < 0) return result
  result.J = normalizeAngleSigned(Math.atan2(ip.y!, ip.x!) + besselParams[0] - besselParams[2])
  result.W = Math.atan(ip.z! / e / e / Math.sqrt(ip.x! * ip.x! + ip.y! * ip.y!))
  return result
}

/**
 * 分點座標下的線—地球交點，回傳地面經緯。
 * @param P 起點球面座標
 * @param Q 終點球面座標
 * @param gst 格林尼治恆星時（rad）
 */
export function lineEarthIntersect(P: Spherical, Q: Spherical, gst: number): LineEarthResult {
  const pc = sphericalToCartesian(P)
  const qc = sphericalToCartesian(Q)
  const ip = lineEllipsoidIntersect(
    pc[0],
    pc[1],
    pc[2],
    qc[0],
    qc[1],
    qc[2],
    EARTH_POLAR_EQ_RATIO,
    EARTH_EQUATORIAL_RADIUS_KM,
  )
  const result: LineEarthResult = { ...ip, J: 100, W: 100 }
  if (ip.D < 0) return result
  result.W = Math.atan(ip.z! / EARTH_POLAR_EQ_RATIO_SQ / Math.sqrt(ip.x! * ip.x! + ip.y! * ip.y!))
  result.J = normalizeAngleSigned(Math.atan2(ip.y!, ip.x!) - gst)
  return result
}

/**
 * 橢圓與圓的交點。
 * @param R 橢圓長半徑
 * @param ba 短長軸比
 * @param r2 圓的半徑
 * @param x0 圓心 x
 * @param y0 圓心 y
 */
export function ellipseCircleIntersect(
  R: number,
  ba: number,
  r2: number,
  x0: number,
  y0: number,
): TwoIntersectionResult {
  const result: TwoIntersectionResult = { n: 0 }
  const d = Math.sqrt(x0 * x0 + y0 * y0)
  const sinB = y0 / d
  const cosB = x0 / d
  let cosA = (R * R + d * d - r2 * r2) / (2 * d * R)
  if (Math.abs(cosA) > 1) {
    result.n = 0
    return result
  }
  let sinA = Math.sqrt(1 - cosA * cosA)

  const ba2 = ba * ba
  for (let k = -1; k < 2; k += 2) {
    let S = cosA * sinB + sinA * cosB * k
    const g = R - (S * S * (1 / ba2 - 1)) / 2
    cosA = (g * g + d * d - r2 * r2) / (2 * d * g)
    if (Math.abs(cosA) > 1) {
      result.n = 0
      return result
    }
    sinA = Math.sqrt(1 - cosA * cosA)
    const C = cosA * cosB - sinA * sinB * k
    S = cosA * sinB + sinA * cosB * k
    if (k === 1) result.A = [g * C, g * S]
    else result.B = [g * C, g * S]
  }
  result.n = 2
  return result
}

/**
 * 線與橢圓的交點（2D 平面）。
 * @param r 橢圓長半徑
 * @param ba 短長軸比
 */
export function lineEllipseIntersect(
  x1: number,
  y1: number,
  dx: number,
  dy: number,
  r: number,
  ba: number,
): TwoIntersectionResult {
  const f = ba * ba
  const A = dx * dx + (dy * dy) / f
  const B = x1 * dx + (y1 * dy) / f
  const C = x1 * x1 + (y1 * y1) / f - r * r
  let D = B * B - A * C
  if (D < 0) return { n: 0 }
  const result: TwoIntersectionResult = { n: D ? 2 : 1 }
  D = Math.sqrt(D)
  const t1 = (-B + D) / A
  const t2 = (-B - D) / A
  result.A = [x1 + dx * t1, y1 + dy * t1]
  result.B = [x1 + dx * t2, y1 + dy * t2]
  const L = Math.sqrt(dx * dx + dy * dy)
  result.R1 = L * Math.abs(t1)
  result.R2 = L * Math.abs(t2)
  return result
}
