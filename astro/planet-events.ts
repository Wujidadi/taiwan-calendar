// 岱員時憲章 — 行星天象計算
//
// 提供行星距角、大距（水金專用）、留、合月、合日／衝及行星星曆等高階計算。
// 行星編號：0=地球、1=水星、2=金星、3=火星、4=木星、5=土星、6=天王星、7=海王星
// 8=冥王星（plutoCoord）、9=太陽（零向量）；月球用 xt=10 處理。

import {
  AU_KM,
  LIGHT_TIME_PER_AU_JCY,
  SPEED_OF_LIGHT_KM_S,
  SYNODIC_PERIODS,
  TWO_PI,
} from './constants'
import { applyParallax, refractionFromTrueAltitude } from './corrections'
import { evalVSOP87, earthCoord, planetCoord } from './vsop87'
import { moonCoord as elpMoonCoord } from './elp-moon'
import { formatRadian } from './angle-format'
import { normalizeAngle, normalizeAngleSigned, rotateSpherical, angularSeparation, heliocentricToGeocentric } from './math'
import type { Spherical } from './math'
import { meanObliquityP03 } from './precession'
import { nutationMedium } from './nutation'
import { meanSiderealTimeFromTD } from './sidereal-time'

/**
 * 行星（xt）的距角（rad）。
 * @param xt 行星編號（1–8）
 * @param t 儒略世紀數（J2000 起）
 * @param precision 精度等級：0 低、1 中、≥ 2 高（補光行時）
 */
export function planetElongation(xt: number, t: number, precision: number): number {
  let a = planetCoord(0, t, 10, 10, 10)
  let z = planetCoord(xt, t, 10, 10, 10)
  z = heliocentricToGeocentric(z, a)
  if (precision === 1) {
    a = planetCoord(0, t, 60, 60, 60)
    z = planetCoord(xt, t, 60, 60, 60)
    z = heliocentricToGeocentric(z, a)
  }
  if (precision >= 2) {
    a = planetCoord(0, t - a[2] * LIGHT_TIME_PER_AU_JCY, -1, -1, -1)
    z = planetCoord(xt, t - z[2] * LIGHT_TIME_PER_AU_JCY, -1, -1, -1)
    z = heliocentricToGeocentric(z, a)
  }
  const sun: Spherical = [a[0] + Math.PI, -a[1], a[2]]
  return angularSeparation(z[0], z[1], sun[0], sun[1])
}

/**
 * 大距（最大距角）時刻與距角值。僅適用水星（xt=1）或金星（xt=2）。
 * @param xt 行星編號（1 或 2）
 * @param t 儒略世紀數（起始估計）
 * @param eastElongation true = 東大距；false = 西大距
 * @returns `[t, elongation]`：儒略世紀數、距角（rad）
 */
export function greatestElongation(
  xt: 1 | 2,
  t: number,
  eastElongation: boolean,
): [number, number] {
  let a: number
  let c: [number, number, number, number, number]
  if (xt === 1) {
    a = 115.8774777586 / 36525
    c = [2, 0.2, 0.01, 46, 87]
  } else {
    a = 583.9213708245 / 36525
    c = [4, 0.2, 0.01, 382, 521]
  }
  const b = eastElongation ? c[3] / 36525 : c[4] / 36525
  t = b + a * Math.floor((t - b) / a + 0.5)

  let r1 = 0
  let r2 = 0
  let r3 = 0
  for (let i = 0; i < 3; i++) {
    const dt = c[i]! / 36525
    r1 = planetElongation(xt, t - dt, i)
    r2 = planetElongation(xt, t, i)
    r3 = planetElongation(xt, t + dt, i)
    t += ((r1 - r3) / (r1 + r3 - 2 * r2)) * dt / 2
  }
  r2 += ((r1 - r3) / (r1 + r3 - 2 * r2)) * (r3 - r1) / 8
  return [t, r2]
}

/**
 * 行星視赤道座標（可選含章動修正）。
 * @param xt 行星編號（0–9）
 * @param t 儒略世紀數
 * @param n 取項數
 * @param lightTimeCy 光行時（儒略世紀數）；非零時加章動
 */
export function planetApparentCoord(
  xt: number,
  t: number,
  n: number,
  lightTimeCy: number,
): Spherical {
  const a = planetCoord(0, t - lightTimeCy, n, n, n)
  let z = planetCoord(xt, t - lightTimeCy, n, n, n)
  z = heliocentricToGeocentric(z, a)
  let E = meanObliquityP03(t)
  if (lightTimeCy) {
    const zd = nutationMedium(t)
    z = [z[0] + zd[0], z[1], z[2]]
    E += zd[1]
  }
  return rotateSpherical(z, E)
}

/**
 * 行星留（留逆 direct=false；順留 direct=true）。
 * @returns 儒略世紀數
 */
export function planetStation(xt: number, t: number, direct: boolean): number {
  const hh = (SYNODIC_PERIODS[xt - 1]! / 36525)
  let v = TWO_PI / hh
  if (xt > 2) v = -v
  for (let i = 0; i < 6; i++) {
    t -= normalizeAngleSigned(evalVSOP87(xt, 0, t, 8) - evalVSOP87(0, 0, t, 8)) / v
  }
  const tt = [5 / 36525, 1 / 36525, 0.5 / 36525, 2e-6, 2e-6] as const
  const tcArr = [17.4, 28, 52, 82, 86, 88, 89, 90] as const
  const tc = tcArr[xt - 1]! / 36525
  if (direct) {
    if (xt > 2) t -= tc
    else t += tc
  } else {
    if (xt > 2) t += tc
    else t -= tc
  }

  let y1: Spherical = [0, 0, 0]
  let y2: Spherical = [0, 0, 0]
  let y3: Spherical = [0, 0, 0]
  for (let i = 0; i < 4; i++) {
    const dt = tt[i]!
    const n = i >= 3 ? -1 : 8
    const g = i >= 3 ? y2[2] * LIGHT_TIME_PER_AU_JCY : 0
    y1 = planetApparentCoord(xt, t - dt, n, g)
    y2 = planetApparentCoord(xt, t, n, g)
    y3 = planetApparentCoord(xt, t + dt, n, g)
    t += ((y1[0] - y3[0]) / (y1[0] + y3[0] - 2 * y2[0])) * dt / 2
  }
  return t
}

/**
 * 月亮與行星的視赤經差及相關參數。
 * @param g 光行時修正向量 `[gxsMoon, gxsPlanet, dL, dE]`
 */
function moonPlanetRADiff(
  xt: number,
  t: number,
  n: number,
  E: number,
  g: readonly [number, number, number, number],
): readonly [number, number, number, number] {
  const a = planetCoord(0, t - g[1], n, n, n)
  let p = planetCoord(xt, t - g[1], n, n, n)
  let m = elpMoonCoord(t - g[0], n, n, n)
  p = heliocentricToGeocentric(p, a)
  m = [m[0] + g[2], m[1], m[2]]
  p = [p[0] + g[2], p[1], p[2]]
  m = rotateSpherical(m, E + g[3])
  p = rotateSpherical(p, E + g[3])
  return [
    normalizeAngleSigned(m[0] - p[0]),
    m[1] - p[1],
    m[2] / SPEED_OF_LIGHT_KM_S / 86400 / 36525,
    (p[2] / SPEED_OF_LIGHT_KM_S / 86400 / 36525) * AU_KM,
  ]
}

/**
 * 行星合月時刻與黃緯差。
 * @returns `[t, latDiff]`：儒略世紀數、黃緯差（rad）
 */
export function planetMoonConjunction(xt: number, t: number): [number, number] {
  let d: readonly [number, number, number, number] = [0, 0, 0, 0]
  let g: [number, number, number, number] = [0, 0, 0, 0]
  for (let i = 0; i < 3; i++) {
    d = moonPlanetRADiff(xt, t, 8, 0.4091, g)
    t -= d[0] / 8192
  }
  const E = meanObliquityP03(t)
  const zd = nutationMedium(t)
  g = [d[2], d[3], zd[0], zd[1]]

  d = moonPlanetRADiff(xt, t, 8, E, g)
  const d2 = moonPlanetRADiff(xt, t + 1e-6, 8, E, g)
  const v = (d2[0] - d[0]) / 1e-6

  d = moonPlanetRADiff(xt, t, 30, E, g)
  t -= d[0] / v
  d = moonPlanetRADiff(xt, t, -1, E, g)
  t -= d[0] / v
  return [t, d[1]]
}

/** 行星與太陽視黃經差加偏移量之結果 */
function planetSunLongDiffOffset(
  xt: number,
  t: number,
  n: number,
  w0: number,
  ts: number,
  tp: number,
): readonly [number, number, number, number] {
  const a = planetCoord(0, t - tp, n, n, n)
  let p = planetCoord(xt, t - tp, n, n, n)
  const s = planetCoord(0, t - ts, n, n, n)
  const sun: Spherical = [s[0] + Math.PI, -s[1], s[2]]
  p = heliocentricToGeocentric(p, a)
  return [
    normalizeAngleSigned(p[0] - sun[0] - w0),
    p[1] - sun[1],
    s[2] * LIGHT_TIME_PER_AU_JCY,
    p[2] * LIGHT_TIME_PER_AU_JCY,
  ]
}

/** 合日／衝通用內部實作 */
function planetSunAspectInternal(
  xt: number,
  t: number,
  opposition: boolean,
): [number, number] {
  let w0 = Math.PI
  let w1 = 0
  if (opposition) {
    w0 = 0
    if (xt > 2) w1 = Math.PI
  }
  let v = (TWO_PI / SYNODIC_PERIODS[xt - 1]!) * 36525
  if (xt > 2) v = -v
  for (let i = 0; i < 6; i++) {
    t -= normalizeAngleSigned(evalVSOP87(xt, 0, t, 8) - evalVSOP87(0, 0, t, 8) - w0) / v
  }
  const dt = 2e-5
  let a = planetSunLongDiffOffset(xt, t, 8, w1, 0, 0)
  const b = planetSunLongDiffOffset(xt, t + dt, 8, w1, 0, 0)
  v = (b[0] - a[0]) / dt
  a = planetSunLongDiffOffset(xt, t, 40, w1, a[2], a[3])
  t -= a[0] / v
  a = planetSunLongDiffOffset(xt, t, -1, w1, a[2], a[3])
  t -= a[0] / v
  return [t, a[1]]
}

/**
 * 行星合日（或上合）時刻與黃緯差。
 */
export function planetSunConjunction(xt: number, t: number): [number, number] {
  return planetSunAspectInternal(xt, t, false)
}

/**
 * 行星衝（或下合）時刻與黃緯差。
 */
export function planetSunOpposition(xt: number, t: number): [number, number] {
  return planetSunAspectInternal(xt, t, true)
}

/**
 * 行星星曆（格式化輸出字串）。
 * @param xt 行星編號（< 10 = 行星或太陽；10 = 月亮）
 * @param jd 力學時儒略日（J2000 起算）
 * @param longitude 觀測者經度（rad）
 * @param latitude 觀測者緯度（rad）
 */
export function planetEphemeris(
  xt: number,
  jd: number,
  longitude: number,
  latitude: number,
): string {
  const T = jd / 36525
  const zd = nutationMedium(T)
  const dL = zd[0]
  const dE = zd[1]
  const E = meanObliquityP03(T) + dE
  const gstMean = meanSiderealTimeFromTD(jd)
  const gst = gstMean + dL * Math.cos(E)

  let z: Spherical = [0, 0, 0]
  let s = ''
  const rfn = xt === 10 ? 2 : 8

  let rc = 0

  if (xt === 10) {
    const a = earthCoord(T, 15, 15, 15)
    const moonZ = elpMoonCoord(T, 1, 1, -1)
    const ra = moonZ[2]
    const T1 = T - ra * LIGHT_TIME_PER_AU_JCY / AU_KM
    const a2 = earthCoord(T1, 15, 15, 15)
    const moonZ1 = elpMoonCoord(T1, -1, -1, -1)
    rc = moonZ1[2]

    const a2geo: Spherical = [heliocentricToGeocentric(a, a2)[0], heliocentricToGeocentric(a, a2)[1], heliocentricToGeocentric(a, a2)[2] * AU_KM]
    const zMoon = heliocentricToGeocentric(moonZ1, a2geo)
    const rb = zMoon[2]

    z = [normalizeAngle(moonZ[0] + dL), moonZ[1], moonZ[2]]
    s += `視黃經 ${formatRadian(z[0], false)} 視黃緯 ${formatRadian(z[1], false)} 地心距 ${ra.toFixed(rfn)}\r\n`
    z = rotateSpherical(z, E)
    s += `視赤經 ${formatRadian(z[0], true)} 視赤緯 ${formatRadian(z[1], false)} 光行距 ${rb.toFixed(rfn)}\r\n`
  }
  if (xt < 10) {
    const a = planetCoord(0, T, -1, -1, -1)
    const zPlan = planetCoord(xt, T, -1, -1, -1)
    s += `黃經一 ${formatRadian(normalizeAngle(zPlan[0]), false)} 黃緯一 ${formatRadian(zPlan[1], false)} 向徑一 ${zPlan[2].toFixed(rfn)}\r\n`

    const zGeo = heliocentricToGeocentric(zPlan, a)
    const ra = zGeo[2]
    const T1 = T - ra * LIGHT_TIME_PER_AU_JCY

    const a2 = planetCoord(0, T1, -1, -1, -1)
    const zPlan1 = planetCoord(xt, T1, -1, -1, -1)
    const zGeo2 = heliocentricToGeocentric(zPlan1, a)
    const rb = zGeo2[2]
    const zGeo3 = heliocentricToGeocentric(zPlan1, a2)
    rc = zGeo3[2]

    z = [normalizeAngle(zGeo3[0] + dL), zGeo3[1], zGeo3[2]]
    s += `視黃經 ${formatRadian(z[0], false)} 視黃緯 ${formatRadian(z[1], false)} 地心距 ${ra.toFixed(rfn)}\r\n`
    z = rotateSpherical(z, E)
    s += `視赤經 ${formatRadian(z[0], true)} 視赤緯 ${formatRadian(z[1], false)} 光行距 ${rb.toFixed(rfn)}\r\n`
  }

  const sj = normalizeAngleSigned(gst + longitude - z[0])
  z = applyParallax(z, sj, latitude, 0)
  s += `站赤經 ${formatRadian(z[0], true)} 站赤緯 ${formatRadian(z[1], false)} 視距離 ${rc.toFixed(rfn)}\r\n`

  z = [z[0] + Math.PI / 2 - gst - longitude, z[1], z[2]]
  z = rotateSpherical(z, Math.PI / 2 - latitude)
  z = [normalizeAngle(-Math.PI / 2 - z[0]), z[1], z[2]]
  if (z[1] > 0) z = [z[0], z[1] + refractionFromTrueAltitude(z[1]), z[2]]
  s += `方位角 ${formatRadian(z[0], false)} 高度角 ${formatRadian(z[1], false)}\r\n`
  s += `恆星時 ${formatRadian(normalizeAngle(gstMean), true)}（平）${formatRadian(normalizeAngle(gst), true)}（真）\r\n`

  return s
}
