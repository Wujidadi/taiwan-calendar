// 岱員時憲章 — 月食計算
//
// 原版為含可變狀態的單例物件 lunarEclipse；本移植改為純函式形式，
// 各計算結果以介面回傳，不使用全域可變狀態。

import {
  AU_KM,
  EARTH_MEAN_RADIUS_KM,
  J2000,
  MOON_RADIUS_FACTOR_PENUMBRA,
  RAD_TO_ARCSEC,
  TWO_PI,
} from './constants'
import {
  sunLongitudeAberration,
  sunLatitudeAberration,
  moonLongitudeAberration,
  moonLatitudeAberration,
} from './aberration'
import { applyParallax, refractionFromTrueAltitude } from './corrections'
import { deltaT } from './delta-t'
import { formatArcSeconds, formatRadian } from './angle-format'
import { formatJD, formatTimeOfDay } from './julian-day'
import type { JulianDay } from '#types/time'
import { normalizeAngle, normalizeAngleSigned, rotateSpherical } from './math'
import { meanObliquityP03 } from './precession'
import { nutationMedium } from './nutation'
import { earthCoord } from './vsop87'
import { moonCoord } from './elp-moon'
import { meanSiderealTimeFromUT } from './sidereal-time'
import {
  earthAngularVelocity,
  moonAngularVelocity,
  moonIlluminatedFraction,
  moonSunDiffToTimeFaster,
} from './ephemeris'
import { lineEarthIntersect } from './eclipse-geometry'

/** 月食點位狀態（calc 回傳） */
export interface LunarEclipseState {
  T: number
  L: number
  fa: number
  dt: number
  jd: number
  dL: number
  dE: number
  E: number
  gst: number
  // 月亮
  mHJ: number
  mHW: number
  mR: number
  mCJ: number
  mCW: number
  mShiJ: number
  mCJ2: number
  mCW2: number
  mR2: number
  mDJ: number
  mDW: number
  mPJ: number
  mPW: number
  // 太陽
  sHJ: number
  sHW: number
  sR: number
  sCJ: number
  sCW: number
  sShiJ: number
  sCJ2: number
  sCW2: number
  sR2: number
  sDJ: number
  sDW: number
  sPJ: number
  sPW: number
  // 其他
  sc: number
  pty: number
  zty: number
  mRad: number
  sRad: number
  e_mRad: number
  eShadow: number
  eShadow2: number
  mIll: number
  zx_J: number
  zx_W: number
}

/** 月食 lecXY 計算結果 */
interface EclipseXY {
  x: number
  y: number
  t: number
  mr: number
  er: number
  Er: number
  e_mRad: number
  eShadow: number
  eShadow2: number
}

/** 月食食況（lecMax 回傳） */
export interface LunarEclipseTimings {
  /** [食甚, 初虧, 復圓, 半影食始, 半影食終, 食既, 生光]（儒略日） */
  lT: readonly number[]
  /** 食分 */
  sf: number
  /** 類型（'偏'、'全'、''） */
  LX: string
}

/**
 * 月食主計算（地心視位置、站心位置、半徑、月相等）。
 *
 * @param T 力學時（J2000 起算儒略日）
 * @param longitude 觀測者經度（rad）
 * @param latitude 觀測者緯度（rad）
 * @param elevationKm 觀測者海拔（km）
 */
export function calcLunarEclipse(
  T: number,
  longitude: number,
  latitude: number,
  elevationKm: number,
): LunarEclipseState {
  const dt = deltaT(T)
  const jd = T - dt
  const Tcy = T / 36525
  const zd = nutationMedium(Tcy)
  const dL = zd[0]
  const dE = zd[1]
  const E = meanObliquityP03(Tcy) + dE
  const gst = meanSiderealTimeFromUT(jd, dt) + dL * Math.cos(E)

  // ── 月亮 ──
  let z = moonCoord(Tcy, -1, -1, -1)
  z = [
    normalizeAngle(z[0] + moonLongitudeAberration(Tcy) + dL),
    z[1] + moonLatitudeAberration(Tcy),
    z[2],
  ]
  const mHJ = z[0]
  const mHW = z[1]
  const mR = z[2]

  z = rotateSpherical(z, E)
  const mCJ = z[0]
  const mCW = z[1]

  let mShiJ = normalizeAngle(gst + longitude - z[0])
  if (mShiJ > Math.PI) mShiJ -= TWO_PI

  z = applyParallax(z, mShiJ, latitude, elevationKm)
  const mCJ2 = z[0]
  const mCW2 = z[1]
  const mR2 = z[2]

  z = [z[0] + Math.PI / 2 - gst - longitude, z[1], z[2]]
  z = rotateSpherical(z, Math.PI / 2 - latitude)
  z = [normalizeAngle(-Math.PI / 2 - z[0]), z[1], z[2]]
  const mDJ = z[0]
  const mDW = z[1]
  const mPJ = z[0]
  const mPW = z[1] > 0 ? z[1] + refractionFromTrueAltitude(z[1]) : z[1]

  // ── 太陽 ──
  let sz = earthCoord(Tcy, -1, -1, -1)
  sz = [
    normalizeAngle(sz[0] + Math.PI + sunLongitudeAberration(Tcy) + dL),
    -sz[1] + sunLatitudeAberration(Tcy),
    sz[2],
  ]
  const sHJ = sz[0]
  const sHW = sz[1]
  const sR = sz[2]

  sz = rotateSpherical(sz, E)
  const sCJ = sz[0]
  const sCW = sz[1]

  let sShiJ = normalizeAngle(gst + longitude - sz[0])
  if (sShiJ > Math.PI) sShiJ -= TWO_PI

  sz = applyParallax(sz, sShiJ, latitude, elevationKm)
  const sCJ2 = sz[0]
  const sCW2 = sz[1]
  const sR2 = sz[2]

  sz = [sz[0] + Math.PI / 2 - gst - longitude, sz[1], sz[2]]
  sz = rotateSpherical(sz, Math.PI / 2 - latitude)
  sz = [normalizeAngle(-Math.PI / 2 - sz[0]), sz[1], sz[2]]
  const sDJ = sz[0]
  const sDW = sz[1]
  const sPJ = sz[0]
  const sPW = sz[1] > 0 ? sz[1] + refractionFromTrueAltitude(sz[1]) : sz[1]

  // ── 時差、視半徑、月相 ──
  const tc = Tcy / 10
  const tc2 = tc * tc
  const tc3 = tc2 * tc
  const tc4 = tc3 * tc
  const tc5 = tc4 * tc
  let Lon =
    (1753470142 + 6283319653318 * tc + 529674 * tc2 + 432 * tc3 - 1124 * tc4 - 9 * tc5) /
      1000000000 +
    Math.PI -
    20.5 / RAD_TO_ARCSEC
  Lon = normalizeAngle(Lon - (sCJ - dL * Math.cos(E)))
  if (Lon > Math.PI) Lon -= TWO_PI
  const sc = Lon / TWO_PI

  const pty = jd + longitude / TWO_PI
  const zty = jd + longitude / TWO_PI + sc

  const mRad = MOON_RADIUS_FACTOR_PENUMBRA / mR2
  const sRad = 959.63 / sR2
  const e_mRad = MOON_RADIUS_FACTOR_PENUMBRA / mR
  const eShadow = (((EARTH_MEAN_RADIUS_KM / mR) * RAD_TO_ARCSEC - (959.63 - 8.794) / sR) * 51) / 50
  const eShadow2 = (((EARTH_MEAN_RADIUS_KM / mR) * RAD_TO_ARCSEC + (959.63 + 8.794) / sR) * 51) / 50
  const mIll = moonIlluminatedFraction(Tcy)

  // ── 中心食地點 ──
  let zx_J = 100
  let zx_W = 100
  if (Math.abs(normalizeAngleSigned(mCJ - sCJ)) < (50 / 180) * Math.PI) {
    const pp = lineEarthIntersect([mCJ, mCW, mR], [sCJ, sCW, sR * AU_KM], gst)
    zx_J = pp.J
    zx_W = pp.W
  }

  return {
    T,
    L: longitude,
    fa: latitude,
    dt,
    jd,
    dL,
    dE,
    E,
    gst,
    mHJ,
    mHW,
    mR,
    mCJ,
    mCW,
    mShiJ,
    mCJ2,
    mCW2,
    mR2,
    mDJ,
    mDW,
    mPJ,
    mPW,
    sHJ,
    sHW,
    sR,
    sCJ,
    sCW,
    sShiJ,
    sCJ2,
    sCW2,
    sR2,
    sDJ,
    sDW,
    sPJ,
    sPW,
    sc,
    pty,
    zty,
    mRad,
    sRad,
    e_mRad,
    eShadow,
    eShadow2,
    mIll,
    zx_J,
    zx_W,
  }
}

/**
 * 格式化月食計算結果為字串。
 * @param s 月食狀態（calcLunarEclipse 回傳）
 * @param detail true 時附力學時與章動細節
 */
export function formatLunarEclipse(s: LunarEclipseState, detail: boolean): string {
  let out = ''
  out += `平太陽 ${formatTimeOfDay(s.pty as JulianDay)} 真太陽 ${formatTimeOfDay(s.zty as JulianDay)}\n`
  out += `時差 ${formatArcSeconds(s.sc * 86400, 2, 1)} 月亮被照亮 ${(s.mIll * 100).toFixed(2)}%\n`

  out += '\n[月亮 / 太陽]\n'
  out += `視黃經 ${formatRadian(s.mHJ, false)}  ${formatRadian(s.sHJ, false)}\n`
  out += `視黃緯 ${formatRadian(s.mHW, false)}  ${formatRadian(s.sHW, false)}\n`
  out += `視赤經 ${formatRadian(s.mCJ, true)}  ${formatRadian(s.sCJ, true)}\n`
  out += `視赤緯 ${formatRadian(s.mCW, false)}  ${formatRadian(s.sCW, false)}\n`
  out += `距離   ${s.mR.toFixed(2)}km  ${s.sR.toFixed(8)}AU\n`
  out += `方位角 ${formatRadian(s.mPJ, false)}  ${formatRadian(s.sPJ, false)}\n`
  out += `高度角 ${formatRadian(s.mPW, false)}  ${formatRadian(s.sPW, false)}\n`
  out += `時角   ${formatRadian(s.mShiJ, false)}  ${formatRadian(s.sShiJ, false)}\n`
  out += `視半徑（站）${formatArcSeconds(s.mRad, 2, 0)}  ${formatArcSeconds(s.sRad, 2, 0)}\n`

  if (detail) {
    const jd = (s.T + J2000) as JulianDay
    out += `\n力學時 ${formatJD(jd)} ΔT=${(s.dt * 86400).toFixed(1)}s\n`
    out += `黃經章動 ${((s.dL / TWO_PI) * 360 * 3600).toFixed(2)}" 交角章動 ${((s.dE / TWO_PI) * 360 * 3600).toFixed(2)}" ε=${formatRadian(s.E, false)}\n`
  }
  return out
}

/** 日月黃經緯差轉為食分坐標系中的直角坐標（內部用） */
function lecXY(jd: number): EclipseXY {
  const T = jd / 36525
  let zs = earthCoord(T, -1, -1, -1)
  zs = [
    normalizeAngle(zs[0] + Math.PI + sunLongitudeAberration(T)),
    -zs[1] + sunLatitudeAberration(T),
    zs[2],
  ]
  let zm = moonCoord(T, -1, -1, -1)
  zm = [
    normalizeAngle(zm[0] + moonLongitudeAberration(T)),
    zm[1] + moonLatitudeAberration(T),
    zm[2],
  ]

  const e_mRad = MOON_RADIUS_FACTOR_PENUMBRA / zm[2]
  const eShadow =
    (((EARTH_MEAN_RADIUS_KM / zm[2]) * RAD_TO_ARCSEC - (959.63 - 8.794) / zs[2]) * 51) / 50
  const eShadow2 =
    (((EARTH_MEAN_RADIUS_KM / zm[2]) * RAD_TO_ARCSEC + (959.63 + 8.794) / zs[2]) * 51) / 50

  const x = normalizeAngleSigned(zm[0] + Math.PI - zs[0]) * Math.cos((zm[1] - zs[1]) / 2)
  const y = zm[1] + zs[1]
  return {
    x,
    y,
    t: jd,
    mr: e_mRad / RAD_TO_ARCSEC,
    er: eShadow / RAD_TO_ARCSEC,
    Er: eShadow2 / RAD_TO_ARCSEC,
    e_mRad,
    eShadow,
    eShadow2,
  }
}

/** 已知 t1 時刻直線方程，求直線到原點距離等於 r 的時刻（用於食相接觸時刻） */
function lineT(G: EclipseXY, v: number, u: number, r: number, n: boolean): number {
  const b = G.y * v - G.x * u
  const A = u * u + v * v
  const B = u * b
  const C = b * b - r * r * v * v
  let D = B * B - A * C
  if (D < 0) return 0
  D = Math.sqrt(D)
  if (!n) D = -D
  return G.t + ((-B + D) / A - G.x) / v
}

/**
 * 月食食甚計算。
 * @param jd 近朔的力學時（J2000 起算儒略日，誤差數天不影響）
 */
export function lecMax(jd: number): LunarEclipseTimings {
  const lT = new Array<number>(7).fill(0)
  let sf = 0
  let LX = ''

  jd = moonSunDiffToTimeFaster(Math.floor((jd - 4) / 29.5306) * Math.PI * 2 + Math.PI) * 36525

  // 粗略求極值
  const u0 = (-18461 * Math.sin(0.057109 + 0.23089571958 * jd) * 0.2309) / RAD_TO_ARCSEC
  const v0 = (moonAngularVelocity(jd / 36525) - earthAngularVelocity(jd / 36525)) / 36525
  let G = lecXY(jd)
  jd -= (G.y * u0 + G.x * v0) / (u0 * u0 + v0 * v0)

  // 精密求極值
  const dt = 60 / 86400
  G = lecXY(jd)
  const gNext = lecXY(jd + dt)
  const u = (gNext.y - G.y) / dt
  const v = (gNext.x - G.x) / dt
  const dtFinal = -(G.y * u + G.x * v) / (u * u + v * v)
  jd += dtFinal

  const xFinal = G.x + dtFinal * v
  const yFinal = G.y + dtFinal * u
  const rmin = Math.sqrt(xFinal * xFinal + yFinal * yFinal)

  G = lecXY(jd)
  lT[0] = jd // 食甚

  if (rmin <= G.mr + G.er) {
    // 偏食
    lT[1] = jd
    LX = '偏'
    sf = (G.mr + G.er - rmin) / G.mr / 2

    let t0 = lineT(G, v, u, G.mr + G.er, false)
    let g0 = lecXY(t0)
    lT[1] = lineT(g0, v, u, g0.mr + g0.er, false)

    t0 = lineT(G, v, u, G.mr + G.er, true)
    g0 = lecXY(t0)
    lT[2] = lineT(g0, v, u, g0.mr + g0.er, true)
  }
  if (rmin <= G.mr + G.Er) {
    // 半影食
    let t0 = lineT(G, v, u, G.mr + G.Er, false)
    let g0 = lecXY(t0)
    lT[3] = lineT(g0, v, u, g0.mr + g0.Er, false)

    t0 = lineT(G, v, u, G.mr + G.Er, true)
    g0 = lecXY(t0)
    lT[4] = lineT(g0, v, u, g0.mr + g0.Er, true)
  }
  if (rmin <= G.er - G.mr) {
    // 全食
    LX = '全'
    let t0 = lineT(G, v, u, G.er - G.mr, false)
    let g0 = lecXY(t0)
    lT[5] = lineT(g0, v, u, g0.er - g0.mr, false)

    t0 = lineT(G, v, u, G.er - G.mr, true)
    g0 = lecXY(t0)
    lT[6] = lineT(g0, v, u, g0.er - g0.mr, true)
  }

  return { lT, sf, LX }
}
