// 岱員時憲章 — 日食計算
//
// 原版為三個元件：fastSolarEclipseSearch（獨立函式）、solarEclipseBesselian（貝塞爾要素計算）、
// solarEclipseLocal（地方日食）。本移植以 TypeScript class 保留快取與狀態機設計。

import {
  AU_KM,
  EARTH_EQUATORIAL_RADIUS_KM,
  EARTH_POLAR_EQ_RATIO,
  EARTH_POLAR_EQ_RATIO_SQ,
  J2000,
  MOON_EARTH_RATIO_PENUMBRA,
  MOON_EARTH_RATIO_UMBRA,
  MOON_RADIUS_FACTOR_PENUMBRA,
  MOON_RADIUS_FACTOR_UMBRA,
  RAD_TO_ARCSEC,
  SUN_EARTH_RATIO,
  TWO_PI,
} from './constants'
import {
  moonLongitudeAberration,
  moonLatitudeAberration,
  sunLongitudeAberration,
  sunLatitudeAberration,
} from './aberration'
import { applyParallax } from './corrections'
import { deltaT } from './delta-t'
import { formatJD } from './julian-day'
import type { JulianDay } from '#types/time'
import {
  normalizeAngle,
  normalizeAngleSigned,
  sphericalToCartesian,
  cartesianToSpherical,
  rotateSpherical,
  equatorialToHorizon,
  parallacticAngle,
} from './math'
import type { Spherical } from './math'
import { meanObliquityP03 } from './precession'
import { nutationMedium } from './nutation'
import { earthCoord } from './vsop87'
import { moonCoord } from './elp-moon'
import { meanSiderealTimeFromUT, meanSiderealTimeFromTD } from './sidereal-time'
import {
  moonSunDiffToTimeFaster,
  findSunRiseOrSet,
  newMoonOrdinal,
} from './ephemeris'
import {
  lineEarthIntersectBessel,
  lineEllipseIntersect,
  ellipseCircleIntersect,
} from './eclipse-geometry'
import { formatRadianToMinute } from './angle-format'

/** 日食快速搜索結果 */
export interface FastEclipseResult {
  /** 朔時刻（J2000 起算儒略日） */
  jd: number
  /** 低精度朔時刻 */
  jdSuo: number
  /** 可信度（0 = 臨界，需高精度複驗） */
  ac: number
  /** 日食類型：N=無、P=偏、T=全、A=環、H=全環食 等 */
  lx: string
}

/**
 * 快速日食搜索。
 * @param jd 近朔的 J2000 起算儒略日（不必很精確）
 */
export function fastSolarEclipseSearch(jd: number): FastEclipseResult {
  const re: FastEclipseResult = { jd: 0, jdSuo: 0, ac: 1, lx: 'N' }
  let t: number
  let t2: number
  let t3: number

  const W = Math.floor((jd + 8) / 29.5306) * Math.PI * 2

  t = (W + 1.08472) / 7771.37714500204
  re.jd = re.jdSuo = t * 36525

  t2 = t * t; t3 = t2 * t; const t4 = t3 * t
  const L0
    = (93.2720993 + 483202.0175273 * t - 0.0034029 * t2 - t3 / 3526000 + t4 / 863310000)
      / 180
      * Math.PI
  re.ac = 1; re.lx = 'N'
  if (Math.abs(Math.sin(L0)) > 0.4) return re

  t -= (-0.0000331 * t * t + 0.10976 * Math.cos(0.785 + 8328.6914 * t)) / 7771
  t2 = t * t
  const L
    = -1.084719
      + 7771.377145013 * t
      - 0.0000331 * t2
      + (22640 * Math.cos(0.785 + 8328.6914 * t + 0.000152 * t2)
        + 4586 * Math.cos(0.19 + 7214.063 * t - 0.000218 * t2)
        + 2370 * Math.cos(2.54 + 15542.754 * t - 0.00007 * t2)
        + 769 * Math.cos(3.1 + 16657.383 * t)
        + 666 * Math.cos(1.5 + 628.302 * t)
        + 412 * Math.cos(4.8 + 16866.93 * t)
        + 212 * Math.cos(4.1 - 1114.63 * t)
        + 205 * Math.cos(0.2 + 6585.76 * t)
        + 192 * Math.cos(4.9 + 23871.45 * t)
        + 165 * Math.cos(2.6 + 14914.45 * t)
        + 147 * Math.cos(5.5 - 7700.39 * t)
        + 125 * Math.cos(0.5 + 7771.38 * t)
        + 109 * Math.cos(3.9 + 8956.99 * t)
        + 55 * Math.cos(5.6 - 1324.18 * t)
        + 45 * Math.cos(0.9 + 25195.62 * t)
        + 40 * Math.cos(3.8 - 8538.24 * t)
        + 38 * Math.cos(4.3 + 22756.82 * t)
        + 36 * Math.cos(5.5 + 24986.07 * t)
        - 6893 * Math.cos(4.669257 + 628.3076 * t)
        - 72 * Math.cos(4.6261 + 1256.62 * t)
        - 43 * Math.cos(2.67823 + 628.31 * t) * t
        + 21)
        / RAD_TO_ARCSEC
  t
    += (W - L)
      / (7771.38
        - 914 * Math.sin(0.7848 + 8328.691425 * t + 0.0001523 * t2)
        - 179 * Math.sin(2.543 + 15542.7543 * t)
        - 160 * Math.sin(0.1874 + 7214.0629 * t))
  re.jd = re.jdSuo = jd = t * 36525

  t2 = t * t / 10000; t3 = t2 * t / 10000
  const mB
    = (18461 * Math.cos(0.0571 + 8433.46616 * t - 0.64 * t2 - 1 * t3)
      + 1010 * Math.cos(2.413 + 16762.1576 * t + 0.88 * t2 + 25 * t3)
      + 1000 * Math.cos(5.44 - 104.7747 * t + 2.16 * t2 + 26 * t3)
      + 624 * Math.cos(0.915 + 7109.2881 * t + 0 * t2 + 7 * t3)
      + 199 * Math.cos(1.82 + 15647.529 * t - 2.8 * t2 - 19 * t3)
      + 167 * Math.cos(4.84 - 1219.403 * t - 1.5 * t2 - 18 * t3)
      + 117 * Math.cos(4.17 + 23976.22 * t - 1.3 * t2 + 6 * t3)
      + 62 * Math.cos(4.8 + 25090.849 * t + 2 * t2 + 50 * t3)
      + 33 * Math.cos(3.3 + 15437.98 * t + 2 * t2 + 32 * t3)
      + 32 * Math.cos(1.5 + 8223.917 * t + 4 * t2 + 51 * t3)
      + 30 * Math.cos(1.0 + 6480.986 * t + 0 * t2 + 7 * t3)
      + 16 * Math.cos(2.5 - 9548.095 * t - 3 * t2 - 43 * t3)
      + 15 * Math.cos(0.2 + 32304.912 * t + 0 * t2 + 31 * t3)
      + 12 * Math.cos(4.0 + 7737.59 * t)
      + 9 * Math.cos(1.9 + 15019.227 * t)
      + 8 * Math.cos(5.4 + 8399.709 * t)
      + 8 * Math.cos(4.2 + 23347.918 * t)
      + 7 * Math.cos(4.9 - 1847.705 * t)
      + 7 * Math.cos(3.8 - 16133.856 * t)
      + 7 * Math.cos(2.7 + 14323.351 * t))
      / RAD_TO_ARCSEC

  const tnorm = jd / 365250
  const tn2 = tnorm * tnorm; const tn3 = tn2 * tnorm
  const mR
    = (385001
      + 20905 * Math.cos(5.4971 + 8328.691425 * t + 1.52 * t2 + 25 * t3)
      + 3699 * Math.cos(4.9 + 7214.06287 * t - 2.18 * t2 - 19 * t3)
      + 2956 * Math.cos(0.972 + 15542.75429 * t - 0.66 * t2 + 6 * t3)
      + 570 * Math.cos(1.57 + 16657.3828 * t + 3.0 * t2 + 50 * t3)
      + 246 * Math.cos(5.69 - 1114.6286 * t - 3.7 * t2 - 44 * t3)
      + 205 * Math.cos(1.02 + 14914.4523 * t - 1 * t2 + 6 * t3)
      + 171 * Math.cos(3.33 + 23871.4457 * t + 1 * t2 + 31 * t3)
      + 152 * Math.cos(4.94 + 6585.761 * t - 2 * t2 - 19 * t3)
      + 130 * Math.cos(0.74 - 7700.389 * t - 2 * t2 - 25 * t3)
      + 109 * Math.cos(5.2 + 7771.377 * t)
      + 105 * Math.cos(2.31 + 8956.993 * t + 1 * t2 + 25 * t3)
      + 80 * Math.cos(5.38 - 8538.241 * t + 2.8 * t2 + 26 * t3)
      + 49 * Math.cos(6.24 + 628.302 * t)
      + 35 * Math.cos(2.7 + 22756.817 * t - 3 * t2 - 13 * t3)
      + 31 * Math.cos(4.1 + 16171.056 * t - 1 * t2 + 6 * t3)
      + 24 * Math.cos(1.7 + 7842.365 * t - 2 * t2 - 19 * t3)
      + 23 * Math.cos(3.9 + 24986.074 * t + 5 * t2 + 75 * t3)
      + 22 * Math.cos(0.4 + 14428.126 * t - 4 * t2 - 38 * t3)
      + 17 * Math.cos(2.0 + 8399.679 * t))
      / 6378.1366

  const sR
    = ((10001399
      + 167070 * Math.cos(3.098464 + 6283.07585 * tnorm)
      + 1396 * Math.cos(3.0552 + 12566.1517 * tnorm)
      + 10302 * Math.cos(1.10749 + 6283.07585 * tnorm) * tnorm
      + 172 * Math.cos(1.064 + 12566.152 * tnorm) * tnorm
      + 436 * Math.cos(5.785 + 6283.076 * tnorm) * tn2
      + 14 * Math.cos(4.27 + 6283.08 * tnorm) * tn3)
      * 1.49597870691)
      / 6378.1366
      * 10

  t = jd / 36525
  const vL
    = (7771
      - 914 * Math.sin(0.785 + 8328.6914 * t)
      - 179 * Math.sin(2.543 + 15542.7543 * t)
      - 160 * Math.sin(0.187 + 7214.0629 * t))
      / 36525
  const vB
    = (-755 * Math.sin(0.057 + 8433.4662 * t) - 82 * Math.sin(2.413 + 16762.1576 * t)) / 36525
  const vR
    = (-27299 * Math.sin(5.497 + 8328.691425 * t)
      - 4184 * Math.sin(4.9 + 7214.06287 * t)
      - 7204 * Math.sin(0.972 + 15542.75429 * t))
      / 36525

  const gm = (mR * Math.sin(mB) * vL) / Math.sqrt(vB * vB + vL * vL)
  const smR = sR - mR
  const mk = 0.2725076; const sk = 109.1222
  const f1 = (sk + mk) / smR; const r1 = mk + f1 * mR
  const f2 = (sk - mk) / smR; const r2 = mk - f2 * mR
  const b = 0.9972; const Agm = Math.abs(gm); const Ar2 = Math.abs(r2)
  const fh2 = mR - mk / f2; const h = Agm < 1 ? Math.sqrt(1 - gm * gm) : 0

  if (fh2 < h) re.lx = 'T'
  else re.lx = 'A'

  const ls1 = Agm - (b + r1); if (Math.abs(ls1) < 0.016) re.ac = 0
  const ls2 = Agm - (b + Ar2); if (Math.abs(ls2) < 0.016) re.ac = 0
  const ls3 = Agm - b; if (Math.abs(ls3) < 0.016) re.ac = 0
  const ls4 = Agm - (b - Ar2); if (Math.abs(ls4) < 0.016) re.ac = 0

  if (ls1 > 0) re.lx = 'N'
  else if (ls2 > 0) re.lx = 'P'
  else if (ls3 > 0) re.lx += '0'
  else if (ls4 > 0) re.lx += '1'
  else {
    if (Math.abs(fh2 - h) < 0.019) re.ac = 0
    if (Math.abs(fh2) < h) {
      const dr = (vR * h) / vL / mR
      const H1 = mR - dr - mk / f2
      const H2 = mR + dr - mk / f2
      if (H1 > 0) re.lx = 'H3'
      if (H2 > 0) re.lx = 'H2'
      if (H1 > 0 && H2 > 0) re.lx = 'H'
      if (Math.abs(H1) < 0.019) re.ac = 0
      if (Math.abs(H2) < 0.019) re.ac = 0
    }
  }
  return re
}

// ── 輔助介面 ──

interface ShadowRadii {
  r1: number   // 半影半徑
  r2: number   // 本影半徑（可負）
  ar2: number  // |r2|
  sf: number   // 食分
}

interface FeatureResult {
  jdSuo: number; dT: number; ds: number
  vx: number; vy: number; ax: number; ay: number; v: number; k: number
  jd: number; xc: number; yc: number; zc: number; D: number; d: number
  I: readonly number[]
  gk1: readonly number[]; gk2: readonly number[]
  gk3: readonly number[]; gk4: readonly number[]; gk5: readonly number[]
  zxJ: number; zxW: number; sf: number; lx: string
  Sdp: Spherical; dw: number; tt: number
  p1: number[]; p2: number[]; p3: number[]; p4: number[]
  q1: number[]; q2: number[]; q3: number[]; q4: number[]
  L0: number[]; L1: number[]; L2: number[]; L3: number[]; L4: number[]
  L5: number[]; L6: number[]
}

/** 日食貝塞爾要素計算器（含插值快取） */
export class SolarEclipseBesselian {
  private Zs: number[] = []
  private Zdt: number = 0.04
  private Zjd: number = 0

  dT: number = 0
  tanf1: number = 0.0046
  tanf2: number = 0.0045
  srad: number = 0.0046
  bba: number = 1
  bhc: number = 0
  dyj: number = 23500

  /** 初始化插值表（快取），n = 插值點數（2 / 3 / 7） */
  init(jd: number, n: number): void {
    if (newMoonOrdinal(jd) === newMoonOrdinal(this.Zjd) && this.Zs.length === n * 9) return
    this.Zs.length = 0
    this.Zjd = jd = moonSunDiffToTimeFaster(newMoonOrdinal(jd) * Math.PI * 2) * 36525
    this.dT = deltaT(jd)

    const zd = nutationMedium(jd / 36525)
    const E = meanObliquityP03(jd / 36525) + zd[1]
    const a = this.Zs

    for (let i = 0; i < n; i++) {
      const T = (this.Zjd + (i - n / 2 + 0.5) * this.Zdt) / 36525

      let S: Spherical
      let M: Spherical
      if (n === 7) {
        S = earthCoord(T, -1, -1, -1)
        M = moonCoord(T, -1, -1, -1)
      } else if (n === 3) {
        S = earthCoord(T, 65, 65, 65)
        M = moonCoord(T, -1, 150, 150)
      } else {
        S = earthCoord(T, 20, 20, 20)
        M = moonCoord(T, 30, 30, 30)
      }

      S = [S[0] + zd[0] + sunLongitudeAberration(T) + Math.PI, -S[1] + sunLatitudeAberration(T), S[2]]
      M = [M[0] + zd[0] + moonLongitudeAberration(T), M[1] + moonLatitudeAberration(T), M[2]]
      S = rotateSpherical(S, E)
      M = rotateSpherical(M, E)
      S = [S[0], S[1], S[2] * AU_KM]

      if (i && S[0] < a[0]!) S = [S[0] + TWO_PI, S[1], S[2]]
      if (i && M[0] < a[3]!) M = [M[0] + TWO_PI, M[1], M[2]]

      const k = i * 9
      a[k] = S[0]; a[k + 1] = S[1]; a[k + 2] = S[2]
      a[k + 3] = M[0]; a[k + 4] = M[1]; a[k + 5] = M[2]

      const Sc = sphericalToCartesian(S)
      const Mc = sphericalToCartesian(M)
      let B = cartesianToSpherical([Sc[0] - Mc[0], Sc[1] - Mc[1], Sc[2] - Mc[2]])
      B = [Math.PI / 2 + B[0], Math.PI / 2 - B[1], B[2]]
      if (i && B[0] < a[6]!) B = [B[0] + TWO_PI, B[1], B[2]]
      a[k + 6] = B[0]; a[k + 7] = B[1]
      a[k + 8] = meanSiderealTimeFromUT(T * 36525 - this.dT, this.dT) + zd[0] * Math.cos(E)
    }

    const p = a.length - 9
    this.dyj = ((a[2]! + a[p + 2]! - a[5]! - a[p + 5]!) / 2) / EARTH_EQUATORIAL_RADIUS_KM
    this.tanf1 = (SUN_EARTH_RATIO + MOON_EARTH_RATIO_PENUMBRA) / this.dyj
    this.tanf2 = (SUN_EARTH_RATIO - MOON_EARTH_RATIO_UMBRA) / this.dyj
    this.srad = SUN_EARTH_RATIO / ((a[2]! + a[p + 2]!) / 2 / EARTH_EQUATORIAL_RADIUS_KM)
    const sinLat = Math.sin((a[1]! + a[p + 1]!) / 2)
    this.bba = EARTH_POLAR_EQ_RATIO * (1 + ((1 - EARTH_POLAR_EQ_RATIO_SQ) * sinLat * sinLat) / 2)
    this.bhc = -Math.atan(Math.tan(E) * Math.sin((a[6]! + a[p + 6]!) / 2))
  }

  /** 貝賽爾插值 */
  private chazhi(jd: number, xt: number): readonly number[] {
    const p0 = xt * 3; const m = 3
    const N = this.Zs.length / 9; const B = this.Zs
    const w = B.length / N
    const t = (jd - this.Zjd) / this.Zdt + N / 2 - 0.5
    const z: number[] = []

    if (N === 2) {
      for (let i = 0; i < m; i++) z[i] = B[p0 + i]! + (B[p0 + i + w]! - B[p0 + i]!) * t
      return z
    }
    let c = Math.floor(t + 0.5)
    if (c <= 0) c = 1
    if (c > N - 2) c = N - 2
    const tAdj = t - c
    const base = p0 + c * w
    for (let i = 0; i < m; i++) {
      z[i]
        = B[base + i]!
          + (B[base + i + w]! - B[base + i - w]! + (B[base + i + w]! + B[base + i - w]! - B[base + i]! * 2) * tAdj)
            * tAdj
            / 2
    }
    return z
  }

  sun(jd: number): Spherical { return this.chazhi(jd, 0) as Spherical }
  moon(jd: number): Spherical { return this.chazhi(jd, 1) as Spherical }
  bse(jd: number): readonly number[] { return this.chazhi(jd, 2) }

  cd2bse(z: Spherical, I: readonly number[]): readonly [number, number, number] {
    const r: Spherical = [z[0] - I[0]!, z[1], z[2]]
    const rotated = rotateSpherical(r, -I[1]!)
    return sphericalToCartesian(rotated)
  }

  bse2cd(z: readonly [number, number, number], I: readonly number[]): Spherical {
    const r = cartesianToSpherical(z)
    const rotated = rotateSpherical(r, I[1]!)
    return [normalizeAngle(rotated[0] + I[0]!), rotated[1], rotated[2]]
  }

  bse2db(z: readonly [number, number, number], I: readonly number[], ellipsoid: boolean): readonly [number, number, number] {
    const r = cartesianToSpherical(z)
    const rotated = rotateSpherical(r, I[1]!)
    const lon = normalizeAngleSigned(rotated[0] + I[0]! - I[2]!)
    const lat = ellipsoid ? Math.atan(Math.tan(rotated[1]) / EARTH_POLAR_EQ_RATIO_SQ) : rotated[1]
    return [lon, lat, rotated[2]]
  }

  bseXY2db(x: number, y: number, I: readonly number[], ellipsoid: boolean): readonly [number, number] {
    const b = ellipsoid ? EARTH_POLAR_EQ_RATIO : 1
    const F = lineEarthIntersectBessel(x, y, 2, x, y, 0, b, 1, I as [number, number, number])
    return [F.J, F.W]
  }

  bseM(jd: number): readonly [number, number, number] {
    const a = this.cd2bse(this.chazhi(jd, 1) as Spherical, this.chazhi(jd, 2))
    return [a[0] / EARTH_EQUATORIAL_RADIUS_KM, a[1] / EARTH_EQUATORIAL_RADIUS_KM, a[2] / EARTH_EQUATORIAL_RADIUS_KM]
  }

  Vxy(x: number, y: number, s: number, vx: number, vy: number): { vx: number; vy: number; Vx: number; Vy: number; V: number } {
    let h = 1 - x * x - y * y
    if (h < 0) h = 0
    else h = Math.sqrt(h)
    const vx0 = TWO_PI * (Math.sin(s) * h - Math.cos(s) * y)
    const vy0 = TWO_PI * x * Math.cos(s)
    const Vx = vx - vx0; const Vy = vy - vy0
    return { vx: vx0, vy: vy0, Vx, Vy, V: Math.sqrt(Vx * Vx + Vy * Vy) }
  }

  rSM(mR: number): ShadowRadii {
    const r1 = MOON_EARTH_RATIO_PENUMBRA + this.tanf1 * mR
    const r2 = MOON_EARTH_RATIO_UMBRA - this.tanf2 * mR
    const sf = (MOON_EARTH_RATIO_UMBRA / mR / SUN_EARTH_RATIO) * (this.dyj + mR)
    return { r1, r2, ar2: Math.abs(r2), sf }
  }

  qrd(jd: number, dx: number, dy: number, fs: number): readonly [number, number, number] {
    const ba2 = this.bba * this.bba
    const M = this.bseM(jd)
    let x = M[0]; let y = M[1]
    const B = this.rSM(M[2])
    const r = fs === 1 ? B.r1 : 0
    const d = 1 - ((1 / ba2 - 1) * y * y) / (x * x + y * y) / 2 + r
    const tAdj = ((d * d - x * x - y * y) / (dx * x + dy * y)) / 2
    x += tAdj * dx; y += tAdj * dy; jd += tAdj
    const c = ((1 - ba2) * r * x * y) / (d * d * d)
    x += c * y; y -= c * x
    const re = this.bse2db([x / d, y / d, 0], this.bse(jd), true)
    return [re[0], re[1], jd]
  }

  feature(jd: number): FeatureResult {
    jd = this.Zjd
    const tg = 0.04
    const a = this.bseM(jd - tg)
    const b = this.bseM(jd)
    const c = this.bseM(jd + tg)
    const vx = (c[0] - a[0]) / tg / 2
    const vy = (c[1] - a[1]) / tg / 2
    const vz = (c[2] - a[2]) / tg / 2
    const ax = (c[0] + a[0] - 2 * b[0]) / tg / tg
    const ay = (c[1] + a[1] - 2 * b[1]) / tg / tg
    const v = Math.sqrt(vx * vx + vy * vy)
    const v2 = v * v

    const t0 = -(b[0] * vx + b[1] * vy) / v2
    const jdCenter = jd + t0
    const xc = b[0] + vx * t0
    const yc = b[1] + vy * t0
    const zc = b[2] + vz * t0 - 1.37 * t0 * t0
    const D = (vx * b[1] - vy * b[0]) / v
    const d = Math.abs(D)
    const I = this.bse(jdCenter)

    const F = lineEarthIntersectBessel(xc, yc, 2, xc, yc, 0, EARTH_POLAR_EQ_RATIO, 1, I as [number, number, number])
    const Bc = this.rSM(zc)
    let Bp = this.rSM(zc); let B2 = Bc; let B3 = Bc
    if (F.W !== 100) Bp = this.rSM(zc - (F.R2 ?? 0))
    if (d < 1) {
      const dt = Math.sqrt(1 - d * d) / v
      const t2 = t0 - dt; const t3 = t0 + dt
      B2 = this.rSM(t2 * vz + b[2] - 1.37 * t2 * t2)
      B3 = this.rSM(t3 * vz + b[2] - 1.37 * t3 * t3)
    }

    const ls1 = 1; let dt1 = 0; if (d < ls1) dt1 = Math.sqrt(ls1 * ls1 - d * d) / v
    const t2a = t0 - dt1; const t3a = t0 + dt1
    const ls2 = 1 + Bc.r1; let dt2 = 0; if (d < ls2) dt2 = Math.sqrt(ls2 * ls2 - d * d) / v
    const t4 = t0 - dt2; const t5 = t0 + dt2
    const t6 = -b[0] / vx

    const gk1 = d < 1 ? this.qrd(t2a + jd, vx, vy, 0) : [0, 0, 0] as const
    const gk2 = d < 1 ? this.qrd(t3a + jd, vx, vy, 0) : [0, 0, 0] as const
    const gk3 = this.qrd(t4 + jd, vx, vy, 1)
    const gk4 = this.qrd(t5 + jd, vx, vy, 1)
    const gk5xydb = this.bseXY2db(t6 * vx + b[0], t6 * vy + b[1], this.bse(t6 + jd), true)
    const gk5 = [gk5xydb[0], gk5xydb[1], t6 + jd] as const

    let zxJ: number; let zxW: number; let sf: number; let lx: string
    if (F.W === 100) {
      const ls = this.bse2db([xc, yc, 0], I, false); zxJ = ls[0]; zxW = ls[1]
      sf = (Bc.r1 - (d - 0.9972)) / (Bc.r1 - Bc.r2)
      if (d > 0.9972 + Bc.r1) lx = 'N'
      else if (d > 0.9972 + Bc.ar2) lx = 'P'
      else { lx = Bc.sf < 1 ? 'A0' : 'T0' }
    } else {
      zxJ = F.J; zxW = F.W
      sf = Bp.sf
      if (d > 0.9966 - Bp.ar2) { lx = Bp.sf < 1 ? 'A1' : 'T1' }
      else {
        if (Bp.sf >= 1) {
          lx = 'H'
          if (B2.sf > 1) lx = 'H2'
          if (B3.sf > 1) lx = 'H3'
          if (B2.sf > 1 && B3.sf > 1) lx = 'T'
        } else { lx = 'A' }
      }
    }
    const Sdp = equatorialToHorizon(this.sun(jdCenter), zxJ, zxW, I[2]!)
    let dw = 0; let tt = 0
    if (F.W !== 100) {
      dw = Math.abs(2 * Bp.r2 * EARTH_EQUATORIAL_RADIUS_KM) / Math.sin(Sdp[1])
      const lsV = this.Vxy(xc, yc, I[1]!, vx, vy)
      tt = (2 * Math.abs(Bp.r2)) / lsV.V
    }
    return {
      jdSuo: jd, dT: this.dT, ds: this.bhc,
      vx, vy, ax, ay, v, k: vy / vx,
      jd: jdCenter, xc, yc, zc, D, d, I,
      gk1, gk2, gk3, gk4, gk5,
      zxJ, zxW, sf, lx, Sdp, dw, tt,
      p1: [], p2: [], p3: [], p4: [],
      q1: [], q2: [], q3: [], q4: [],
      L0: [], L1: [], L2: [], L3: [], L4: [], L5: [], L6: [],
    }
  }

  private push(z: readonly [number, number], p: number[]): void {
    p.push(z[0], z[1])
  }

  private elmCpy(a: number[], n: number, b: number[], m: number): void {
    if (!b.length) return
    if (n === -2) n = a.length
    if (m === -2) m = b.length
    if (n === -1) n = a.length - 2
    if (m === -1) m = b.length - 2
    a[n] = b[m]!; a[n + 1] = b[m + 1]!
  }

  private nanbei(
    M: readonly [number, number, number],
    vx0: number, vy0: number,
    h: 1 | -1, r: number,
    I: readonly number[],
  ): readonly [number, number, number, number] {
    let x = M[0] - (vy0 / vx0) * r * h; let y = M[1] + h * r
    let vx = 0; let vy = 0; let v = 0; let sinA = 0; let cosA = 0; let js = 0
    for (let i = 0; i < 3; i++) {
      let z = 1 - x * x - y * y
      if (z < 0) { if (js) break; z = 0; js++ }
      else z = Math.sqrt(z)
      x -= ((x - M[0]) * z) / M[2]
      y -= ((y - M[1]) * z) / M[2]
      vx = vx0 - TWO_PI * (Math.sin(I[1]!) * z - Math.cos(I[1]!) * y)
      vy = vy0 - TWO_PI * Math.cos(I[1]!) * x
      v = Math.sqrt(vx * vx + vy * vy)
      sinA = (h * vy) / v; cosA = (h * vx) / v
      x = M[0] - r * sinA; y = M[1] + r * cosA
    }
    const X = M[0] - MOON_EARTH_RATIO_PENUMBRA * sinA
    const Y = M[1] + MOON_EARTH_RATIO_PENUMBRA * cosA
    const p = lineEarthIntersectBessel(X, Y, M[2], x, y, 0, EARTH_POLAR_EQ_RATIO, 1, I as [number, number, number])
    return [p.J, p.W, x, y]
  }

  private mQie(
    M: readonly [number, number, number],
    vx0: number, vy0: number,
    h: 1 | -1, r: number,
    I: readonly number[], A: number[],
  ): void {
    const p = this.nanbei(M, vx0, vy0, h, r, I)
    const fPrev = (A as unknown as { f2?: number }).f2 ?? 0
    const f = p[1] === 100 ? 0 : 1
    if (fPrev !== f) {
      const g = lineEllipseIntersect(p[2], p[3], vx0, vy0, 1, this.bba)
      if (g.n) {
        const dj = f ? g.R2! : g.R1!
        const F = (f ? g.B! : g.A!) as unknown as [number, number, number]
        F[2] = 0
        const I2 = [I[0]!, I[1]!, I[2]! - (dj / Math.sqrt(vx0 * vx0 + vy0 * vy0)) * 6.28] as const
        const dbF = this.bse2db(F as unknown as [number, number, number], I2, true); this.push([dbF[0], dbF[1]], A)
      }
    }
    (A as unknown as { f2: number }).f2 = f
    if (p[1] !== 100) this.push([p[0], p[1]], A)
  }

  private mDian(
    M: readonly [number, number, number],
    vx0: number, vy0: number,
    AB: boolean, r: number,
    I: readonly number[], A: number[],
  ): boolean {
    let a: readonly number[] = M
    let R = 0
    let p = { n: 0, A: undefined as unknown as [number, number], B: undefined as unknown as [number, number], R1: 0, R2: 0 }
    for (let i = 0; i < 2; i++) {
      const c = this.Vxy(a[0]!, a[1]!, I[1]!, vx0, vy0)
      p = lineEllipseIntersect(M[0], M[1], c.Vy, -c.Vx, 1, this.bba) as typeof p
      if (!p.n) break
      a = AB ? p.A : p.B
      R = AB ? p.R1 : p.R2
    }
    if (p.n && R <= r) {
      const aDb = this.bse2db([a[0]!, a[1]!, 0], I, true)
      this.push([aDb[0], aDb[1]], A)
      return true
    }
    return false
  }

  /** 計算界線（食帶掃描） */
  jieX(jd: number): FeatureResult {
    const re = this.feature(jd)
    re.p1.length = 0; re.p2.length = 0; re.p3.length = 0; re.p4.length = 0
    re.q1.length = 0; re.q2.length = 0; re.q3.length = 0; re.q4.length = 0
    re.L0.length = 0; re.L1.length = 0; re.L2.length = 0; re.L3.length = 0; re.L4.length = 0; re.L5.length = 0; re.L6.length = 0

    const T = Math.sqrt(Math.max(0, 1.7 * 1.7 - re.d * re.d)) / re.v + 0.01
    let t = re.jd - T; const N = 400; const dt = (2 * T) / N
    let n1 = 0; let n4 = 0
    let Ua = re.q1; let Ub = re.q2
    this.push([0, 0], re.q2); this.push([0, 0], re.q3); this.push([0, 0], re.q4)

    for (let i = 0; i <= N; i++, t += dt) {
      const vx = re.vx + re.ax * (t - re.jdSuo)
      const vy = re.vy + re.ay * (t - re.jdSuo)
      const M = this.bseM(t)
      const B = this.rSM(M[2])
      const r = B.r1
      const I = this.bse(t)

      const p = ellipseCircleIntersect(1, this.bba, r, M[0], M[1])
      if (n1 % 2) { if (!p.n) n1++ } else { if (p.n) n1++ }
      if (p.n) {
        const pAdb = this.bse2db([p.A![0], p.A![1], 0], I, true)
        const pBdb = this.bse2db([p.B![0], p.B![1], 0], I, true)
        if (n1 === 1) { this.push([pAdb[0], pAdb[1]], re.p1); this.push([pBdb[0], pBdb[1]], re.p2) }
        if (n1 === 3) { this.push([pAdb[0], pAdb[1]], re.p3); this.push([pBdb[0], pBdb[1]], re.p4) }
      }

      if (!this.mDian(M, vx, vy, false, r, I, Ua)) { if (Ua.length > 0) Ua = re.q3 }
      if (!this.mDian(M, vx, vy, true, r, I, Ub)) { if (Ub.length > 2) Ub = re.q4 }
      if (t > re.jd) {
        if (Ua.length === 0) Ua = re.q3
        if (Ub.length === 2) Ub = re.q4
      }

      const pCenter = this.bseXY2db(M[0], M[1], I, true)
      if ((pCenter[1] !== 100 && n4 === 0) || (pCenter[1] === 100 && n4 === 1)) {
        const ls = lineEllipseIntersect(M[0], M[1], vx, vy, 1, this.bba)
        const dj = n4 === 0 ? ls.R2! : ls.R1!
        const lsP = (n4 === 0 ? ls.B! : ls.A!) as unknown as [number, number, number]
        lsP[2] = 0
        const I2 = [I[0]!, I[1]!, I[2]! - (dj / Math.sqrt(vx * vx + vy * vy)) * 6.28] as const
        const dbLsP = this.bse2db(lsP, I2, true)
        this.push([dbLsP[0], dbLsP[1]], re.L0)
        n4++
      }
      if (pCenter[1] !== 100) this.push([pCenter[0], pCenter[1]], re.L0)

      this.mQie(M, vx, vy, +1, r, I, re.L1)
      this.mQie(M, vx, vy, -1, r, I, re.L2)
      this.mQie(M, vx, vy, +1, B.r2, I, re.L3)
      this.mQie(M, vx, vy, -1, B.r2, I, re.L4)
      this.mQie(M, vx, vy, +1, (r + B.r2) / 2, I, re.L5)
      this.mQie(M, vx, vy, -1, (r + B.r2) / 2, I, re.L6)
    }

    this.elmCpy(re.q3, 0, re.q1, -1)
    this.elmCpy(re.q4, 0, re.q2, -1)
    this.elmCpy(re.q1, -2, re.L1, 0)
    this.elmCpy(re.q2, -2, re.L2, 0)
    this.elmCpy(re.q3, 0, re.L1, -1)
    this.elmCpy(re.q4, 0, re.L2, -1)
    this.elmCpy(re.q2, 0, re.q1, 0)
    this.elmCpy(re.q3, -2, re.q4, -1)
    return re
  }

  /** 格式化界線表 */
  jieX3(jd: number): string {
    const re = this.feature(jd)
    let t = Math.floor(re.jd * 1440) / 1440 - 3 / 24
    const N = 360; const dt = 1 / 1440
    let s = ''
    for (let i = 0; i < N; i++, t += dt) {
      const vx = re.vx + re.ax * (t - re.jdSuo)
      const vy = re.vy + re.ay * (t - re.jdSuo)
      const M = this.bseM(t)
      const B = this.rSM(M[2])
      const r = B.r1
      const I = this.bse(t)
      let s2 = formatJD((t + J2000) as JulianDay) + ' '; let k = 0
      const nb = (h: 1 | -1, r0: number): string => {
        const p = this.nanbei(M, vx, vy, h, r0, I)
        if (p[1] !== 100) { k++; return formatRadianToMinute(p[0]) + ' ' + formatRadianToMinute(p[1]) + '|' }
        return '-------------------|'
      }
      s2 += nb(+1 as 1, r); s2 += nb(+1 as 1, B.r2)
      const pC = this.bseXY2db(M[0], M[1], I, true)
      if (pC[1] !== 100) { k++; s2 += formatRadianToMinute(pC[0]) + ' ' + formatRadianToMinute(pC[1]) + '|' }
      else s2 += '-------------------|'
      s2 += nb(-1 as -1, B.r2); s2 += nb(-1 as -1, r).replace('|', ' ')
      if (k) s += s2 + '\n'
    }
    return '時間（力學時） 半影北界 本影北界線 中心線 本影南界線 半影南界線\n' + s
  }
}

/** 地方日食計算結果 */
export interface LocalEclipseResult {
  /** 時刻表 [食甚, 初虧, 復圓, 食既, 生光]（J2000 起算儒略日；0 表無效） */
  sT: readonly number[]
  /** 食分 */
  sf: number
  /** 食分（日出後的食分） */
  sf2: number
  /** 食分（日沒後的食分） */
  sf3: number
  /** 食分符號標記 */
  sflx: string
  /** 月日半徑比 */
  b1: number
  /** 食甚總持續時間 */
  dur: number
  /** 初虧位置角（北點起算） */
  P1: number
  /** 初虧位置角（頂點起算） */
  V1: number
  /** 復圓位置角（北點起算） */
  P2: number
  /** 復圓位置角（頂點起算） */
  V2: number
  /** 日出（UT） */
  sun_s: number
  /** 日沒（UT） */
  sun_j: number
  /** 類型（'偏'、'全'、'環'、''） */
  LX: string
}

/** 地方日食計算器 */
export class SolarEclipseLocal {
  /** 為 true 時採用 NASA 視徑比 */
  nasaRadius: boolean = false

  constructor(private besselian: SolarEclipseBesselian = new SolarEclipseBesselian()) {}

  private secXY(
    jd: number,
    L: number,
    fa: number,
    high: number,
  ): {
    mCJ: number; mCW: number; mR: number
    mCJ2: number; mCW2: number; mR2: number
    sCJ: number; sCW: number; sR: number
    sCJ2: number; sCW2: number; sR2: number
    mr: number; sr: number; x: number; y: number; t: number
  } {
    const deltat = deltaT(jd)
    const zd = nutationMedium(jd / 36525)
    const E = meanObliquityP03(jd / 36525)
    const gst = meanSiderealTimeFromUT(jd - deltat, deltat) + zd[0] * Math.cos(E + zd[1])

    let mZ = this.besselian.moon(jd)
    const mCJ = mZ[0]; const mCW = mZ[1]; const mR = mZ[2]
    const mShiJ = normalizeAngleSigned(gst + L - mZ[0])
    mZ = applyParallax(mZ, mShiJ, fa, high)
    const mCJ2 = mZ[0]; const mCW2 = mZ[1]; const mR2 = mZ[2]

    let sZ = this.besselian.sun(jd)
    const sCJ = sZ[0]; const sCW = sZ[1]; const sR = sZ[2]
    const sShiJ = normalizeAngleSigned(gst + L - sZ[0])
    sZ = applyParallax(sZ, sShiJ, fa, high)
    const sCJ2 = sZ[0]; const sCW2 = sZ[1]; const sR2 = sZ[2]

    let mr = MOON_RADIUS_FACTOR_PENUMBRA / mR2 / RAD_TO_ARCSEC
    const sr = (959.63 / sR2 / RAD_TO_ARCSEC) * AU_KM
    if (this.nasaRadius) mr *= MOON_RADIUS_FACTOR_UMBRA / MOON_RADIUS_FACTOR_PENUMBRA

    const x = normalizeAngleSigned(mCJ2 - sCJ2) * Math.cos((mCW2 + sCW2) / 2)
    const y = mCW2 - sCW2
    return { mCJ, mCW, mR, mCJ2, mCW2, mR2, sCJ, sCW, sR, sCJ2, sCW2, sR2, mr, sr, x, y, t: jd }
  }

  private lineT(
    G: { x: number; y: number; mr: number; sr: number; t: number },
    v: number, u: number, r: number, n: boolean,
  ): number {
    const b = G.y * v - G.x * u
    const A = u * u + v * v; const B = u * b; const C = b * b - r * r * v * v
    let D = B * B - A * C
    if (D < 0) return 0
    D = Math.sqrt(D)
    if (!n) D = -D
    return G.t + ((-B + D) / A - G.x) / v
  }

  /**
   * 地方日食食甚計算。
   * @param jd 近朔力學時（J2000 起算儒略日，誤差幾天不影響）
   * @param L 觀測者經度（rad）
   * @param fa 觀測者緯度（rad）
   * @param high 觀測者海拔（km）
   */
  secMax(jd: number, L: number, fa: number, high: number): LocalEclipseResult {
    const sT: number[] = [0, 0, 0, 0, 0]
    let LX = ''; let sf = 0; let sf2 = 0; let sf3 = 0; let sflx = ' '
    let b1 = 1; let dur = 0; let P1 = 0; let V1 = 0; let P2 = 0; let V2 = 0
    let sun_s = 0; let sun_j = 0

    this.besselian.init(jd, 7)
    jd = this.besselian['Zjd']

    let G = this.secXY(jd, L, fa, high)
    jd -= G.x / 0.2128

    let u = 0; let v = 0; const dt = 60 / 86400
    for (let i = 0; i < 2; i++) {
      G = this.secXY(jd, L, fa, high)
      const g = this.secXY(jd + dt, L, fa, high)
      u = (g.y - G.y) / dt; v = (g.x - G.x) / dt
      jd -= (G.y * u + G.x * v) / (u * u + v * v)
    }

    let maxsf = 0; let maxjd = jd
    for (let i = -30; i < 30; i += 6) {
      const tt = jd + i / 86400
      const g = this.secXY(tt, L, fa, high)
      const ls = (g.mr + g.sr - Math.sqrt(g.x * g.x + g.y * g.y)) / g.sr / 2
      if (ls > maxsf) { maxsf = ls; maxjd = tt }
    }
    jd = maxjd
    for (let i = -5; i < 5; i += 1) {
      const tt = jd + i / 86400
      const g = this.secXY(tt, L, fa, high)
      const ls = (g.mr + g.sr - Math.sqrt(g.x * g.x + g.y * g.y)) / g.sr / 2
      if (ls > maxsf) { maxsf = ls; maxjd = tt }
    }
    jd = maxjd
    G = this.secXY(jd, L, fa, high)
    const rmin = Math.sqrt(G.x * G.x + G.y * G.y)

    sun_s = findSunRiseOrSet(jd - deltaT(jd) + L / TWO_PI, L, fa, -1) + deltaT(jd)
    sun_j = findSunRiseOrSet(jd - deltaT(jd) + L / TWO_PI, L, fa, 1) + deltaT(jd)

    if (rmin <= G.mr + G.sr) {
      sT[1] = jd; LX = '偏'; sf = (G.mr + G.sr - rmin) / G.sr / 2; b1 = G.mr / G.sr
      const gs = this.secXY(sun_s, L, fa, high)
      sf2 = Math.max(0, (gs.mr + gs.sr - Math.sqrt(gs.x * gs.x + gs.y * gs.y)) / gs.sr / 2)
      const gj = this.secXY(sun_j, L, fa, high)
      sf3 = Math.max(0, (gj.mr + gj.sr - Math.sqrt(gj.x * gj.x + gj.y * gj.y)) / gj.sr / 2)

      sT[0] = this.lineT(G, v, u, G.mr + G.sr, false)
      let g0 = this.secXY(sT[0]!, L, fa, high)
      for (let i = 0; i < 3; i++) {
        g0 = this.secXY(sT[0]!, L, fa, high)
        sT[0] = this.lineT(g0, v, u, g0.mr + g0.sr, false)
      }
      P1 = normalizeAngle(Math.atan2(g0.x, g0.y))
      V1 = normalizeAngle(P1 - parallacticAngle(meanSiderealTimeFromTD(sT[0]!), L, fa, g0.sCJ, g0.sCW))

      sT[2] = this.lineT(G, v, u, G.mr + G.sr, true)
      let g2 = this.secXY(sT[2]!, L, fa, high)
      for (let i = 0; i < 3; i++) {
        g2 = this.secXY(sT[2]!, L, fa, high)
        sT[2] = this.lineT(g2, v, u, g2.mr + g2.sr, true)
      }
      P2 = normalizeAngle(Math.atan2(g2.x, g2.y))
      V2 = normalizeAngle(P2 - parallacticAngle(meanSiderealTimeFromTD(sT[2]!), L, fa, g2.sCJ, g2.sCW))
    }
    if (rmin <= G.mr - G.sr) {
      LX = '全'
      sT[3] = this.lineT(G, v, u, G.mr - G.sr, false)
      const g3 = this.secXY(sT[3], L, fa, high)
      sT[3] = this.lineT(g3, v, u, g3.mr - g3.sr, false)
      sT[4] = this.lineT(G, v, u, G.mr - G.sr, true)
      const g4 = this.secXY(sT[4], L, fa, high)
      sT[4] = this.lineT(g4, v, u, g4.mr - g4.sr, true)
      dur = sT[4] - sT[3]
    }
    if (rmin <= G.sr - G.mr) {
      LX = '環'
      sT[3] = this.lineT(G, v, u, G.sr - G.mr, false)
      const g3 = this.secXY(sT[3], L, fa, high)
      sT[3] = this.lineT(g3, v, u, g3.sr - g3.mr, false)
      sT[4] = this.lineT(G, v, u, G.sr - G.mr, true)
      const g4 = this.secXY(sT[4], L, fa, high)
      sT[4] = this.lineT(g4, v, u, g4.sr - g4.mr, true)
      dur = sT[4] - sT[3]
    }
    if (sT[1]! < sun_s && sf2 > 0) { sf = sf2; sflx = '#' }
    if (sT[1]! > sun_j && sf3 > 0) { sf = sf3; sflx = '*' }
    for (let i = 0; i < 5; i++) {
      if (sT[i]! < sun_s || sT[i]! > sun_j) sT[i] = 0
    }
    sun_s -= deltaT(jd); sun_j -= deltaT(jd)
    return { sT, sf, sf2, sf3, sflx, b1, dur, P1, V1, P2, V2, sun_s, sun_j, LX }
  }
}

/** 全域預設單例（對應原版 solarEclipseBesselian / solarEclipseLocal） */
export const solarEclipseBesselian = new SolarEclipseBesselian()
export const solarEclipseLocal = new SolarEclipseLocal(solarEclipseBesselian)
