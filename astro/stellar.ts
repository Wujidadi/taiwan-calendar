// 岱員時憲章 — 恆星修正與多顆恆星曆計算
//
// 提供引力偏轉、周年視差、光行差之嚴格改正，以及太陽 J2000 座標計算。
// `computeStarEphemeris` 計算多顆恆星的視位置、站心位置或平位置。
//
// 學術依據：Meeus《Astronomical Algorithms》第 21–24 章；
// IAU SOFA 2010 天球中間參考框架慣例。

import { AU_KM, J2000, RAD_TO_ARCSEC, SPEED_OF_LIGHT_KM_S } from './constants'
import type { JulianDay } from '#types/time'
import { formatJD } from './julian-day'
import type { Spherical } from './math'
import { normalizeAngle, rotateSpherical } from './math'
import { applyEquatorialNutation, nutation } from './nutation'
import { eclipticDateToJ2000, equatorialJ2000ToDate, meanObliquityP03 } from './precession'
import { refractionFromTrueAltitude } from './corrections'
import { formatRadianFull } from './angle-format'
import { earthCoord } from './vsop87'
import { meanSiderealTimeFromTD } from './sidereal-time'
import { earthSSBPosition, earthSSBVelocity } from './ssb'

/** 計算模式 */
export type EphemerisMode =
  | 0 // 視位置（含光行差、引力偏轉、章動）
  | 1 // 站心位置（同上 + 地平折射）
  | 2 // 平位置（僅歲差）

/**
 * 引力偏轉（廣義相對論，太陽近旁）。
 * @param z 天體赤道球面座標（J2000 赤道）
 * @param a 太陽赤道球面座標
 */
export function gravitationalDeflection(z: Spherical, a: Spherical): Spherical {
  const d = z[0] - a[0]
  let D = Math.sin(z[1]) * Math.sin(a[1]) + Math.cos(z[1]) * Math.cos(a[1]) * Math.cos(d)
  D = (0.00407 * (1 / (1 - D) + D / 2)) / RAD_TO_ARCSEC
  return [
    normalizeAngle(z[0] + D * ((Math.cos(a[1]) * Math.sin(d)) / Math.cos(z[1]))),
    z[1] + D * (Math.sin(z[1]) * Math.cos(a[1]) * Math.cos(d) - Math.sin(a[1]) * Math.cos(z[1])),
    z[2],
  ]
}

/**
 * 嚴格的恆星視差或光行差改正。
 *
 * @param z 天體赤道球面座標（含自行）
 * @param v 地球赤道直角座標（f=0 時為 SSB 速度；f=1 時為 SSB 位置）
 * @param mode 0 = 光行差（v 為速度，c = 光速）；1 = 周年視差（v 為位置，c = −r）
 */
export function rigorousStellarCorrection(
  z: Spherical,
  v: readonly [number, number, number],
  mode: 0 | 1,
): Spherical {
  // 光速（AU/儒略世紀）
  const cBase = (SPEED_OF_LIGHT_KM_S / AU_KM) * 86400 * 36525
  const c = mode ? -z[2] : cBase
  const sinJ = Math.sin(z[0])
  const cosJ = Math.cos(z[0])
  const sinW = Math.sin(z[1])
  const cosW = Math.cos(z[1])
  return [
    z[0] + normalizeAngle((v[1] * cosJ - v[0] * sinJ) / cosW / c),
    z[1] + (v[2] * cosW - (v[0] * cosJ + v[1] * sinJ) * sinW) / c,
    z[2],
  ]
}

/**
 * 太陽 J2000 黃道球面座標 → 赤道座標。
 * @param t 儒略世紀數
 * @param n 地球座標各分量取項數
 */
export function sunCoordJ2000(t: number, n: number): Spherical {
  const a = earthCoord(t, n, n, n)
  const sunEcliptic: Spherical = [a[0] + Math.PI, -a[1], a[2]]
  return eclipticDateToJ2000(t, sunEcliptic, 'P03')
}

/**
 * 多顆恆星曆計算。
 *
 * @param t 儒略世紀數（力學時，J2000 起）
 * @param starTable 星表陣列，每 8 個元素為一顆星：
 *   [α0, δ0, μα, μδ, parallax, spectral, name, id]
 *   - α0/δ0：J2000 赤道座標（rad）
 *   - μα/μδ：自行（rad/世紀）
 *   - parallax：視差（角秒；0 表無限遠）
 *   - spectral：光譜型字串
 *   - name：星名
 *   - id：識別字
 * @param minPeriodDays 章動週期門檻（天）；0 表不限
 * @param mode 計算模式（0=視位置, 1=站心, 2=平位置）
 * @param longitude 觀測者經度（rad；mode=1 時有效）
 * @param latitude 觀測者緯度（rad；mode=1 時有效）
 */
export function computeStarEphemeris(
  t: number,
  starTable: readonly (string | number)[],
  minPeriodDays: number,
  mode: EphemerisMode,
  longitude: number,
  latitude: number,
): string {
  const header: Record<EphemerisMode, string> = {
    0: 'Apparent RA  / Dec',
    1: 'Topocentric  (Alt/Az)',
    2: 'Mean RA  / Dec',
  }

  let dL: [number, number] | undefined
  let E: number | undefined
  let v: [number, number, number] | undefined
  let p: [number, number, number] | undefined
  let a: Spherical | undefined
  let gst: number | undefined

  if (mode === 0 || mode === 1) {
    dL = nutation(t, minPeriodDays)
    E = meanObliquityP03(t)
    v = earthSSBVelocity(t)
    p = earthSSBPosition(t)
    a = sunCoordJ2000(t, 20)
    a = rotateSpherical(a, 84381.406 / RAD_TO_ARCSEC) // 轉赤道
    const gstMean = meanSiderealTimeFromTD(t * 36525)
    gst = gstMean + dL[0] * Math.cos(E) // 真恆星時
  }

  let s = ''
  for (let i = 0; i < starTable.length; i += 8) {
    s += `${starTable[i + 6]} ${starTable[i + 7]} ${starTable[i + 5]} `

    let z: Spherical = [
      normalizeAngle((starTable[i + 0] as number) + (starTable[i + 2] as number) * t * 100),
      (starTable[i + 1] as number) + (starTable[i + 3] as number) * t * 100,
      (starTable[i + 4] as number) ? 1 / (starTable[i + 4] as number) : 1e11,
    ]

    if (mode === 0 || mode === 1) {
      z = gravitationalDeflection(z, a!)
      z = rigorousStellarCorrection(z, p!, 1)
      z = rigorousStellarCorrection(z, v!, 0)
      z = equatorialJ2000ToDate(t, z, 'P03')
      z = applyEquatorialNutation(z, E!, dL![0], dL![1])
      if (mode === 1) {
        const az: Spherical = [z[0] + Math.PI / 2 - gst! - longitude, z[1], z[2]]
        const alt = rotateSpherical(az, Math.PI / 2 - latitude)
        const altFinal = normalizeAngle(-Math.PI / 2 - alt[0])
        const altVal = alt[1] > 0 ? alt[1] + refractionFromTrueAltitude(alt[1]) : alt[1]
        z = [altFinal, altVal, z[2]]
      }
    }
    if (mode === 2) {
      z = equatorialJ2000ToDate(t, z, 'P03')
    }

    if (mode === 0 || mode === 2) {
      s += `${formatRadianFull(z[0], true, 3)} ${formatRadianFull(z[1], false, 2)}\r\n`
    } else {
      s += `${formatRadianFull(z[0], false, 2)} ${formatRadianFull(z[1], false, 2)}\r\n`
    }
  }

  const jd = (t * 36525 + J2000) as JulianDay
  return `${formatJD(jd)} TD ${header[mode]}\r\n${s}\r\n`
}
