// 純函式設計；觀測者位置透過不可變 Observer 參數傳入，
// deltaT 與 obliquity 在函式內依 jd 動態計算。
// 不考慮氣溫與氣壓的大氣折射修正；若需高精度折射請改用 corrections.ts。

import { EARTH_EQUATORIAL_RADIUS_KM, RAD_TO_ARCSEC, TWO_PI } from './constants'
import { deltaT } from './delta-t'
import { formatTimeOfDay } from './julian-day'
import { balancedMod, normalizeAngleSigned, rotateSpherical } from './math'
import { moonCoord as elp_moonCoord } from './elp-moon'
import { earthLongitude } from './ephemeris'
import { meanObliquityP03 } from './precession'
import { meanSiderealTimeFromUT } from './sidereal-time'

/** 觀測者位置（不可變） */
export interface Observer {
  /** 地理經度（rad，東正） */
  readonly longitude: number
  /** 地理緯度（rad，北正） */
  readonly latitude: number
}

// ── 升降時刻計算結果 ──

/** 月球升中降結果（均為儒略日） */
export interface MoonRTSResult {
  /** 升 (rise) */
  s: number
  /** 降 (set) */
  j: number
  /** 上中天 (upper transit) */
  z: number
  /** 下中天 (lower transit) */
  x: number
  /** 月亮過子午圈（用於計算用途） */
  c: number
  h: number
}

/** 太陽升中降結果（均為儒略日） */
export interface SunRTSResult extends MoonRTSResult {
  /** 民用晨光（Civil twilight, rise） */
  c: number
  /** 民用昏光（Civil twilight, set） */
  h: number
  /** 航海晨光（Nautical twilight, rise） */
  c2: number
  /** 航海昏光（Nautical twilight, set） */
  h2: number
  /** 天文晨光（Astronomical twilight, rise） */
  c3: number
  /** 天文昏光（Astronomical twilight, set） */
  h3: number
  /** 特殊情況訊息（極晝／極夜） */
  sm: string
}

/** 多日升中降一列 */
export interface DailyRow {
  /** 日出 (HH:mm:ss) */
  s: string
  /** 日上中天 */
  z: string
  /** 日落 */
  j: string
  /** 民用晨光起（c） */
  c: string
  /** 民用昏光末（h） */
  h: string
  /** 晨昏光持續時間（ch = h − c − 0.5 天） */
  ch: string
  /** 白晝持續時間（sj = j − s − 0.5 天） */
  sj: string
  /** 月出 */
  Ms: string
  /** 月上中天 */
  Mz: string
  /** 月落 */
  Mj: string
}

// ── 內部工具 ──

/**
 * 由地平緯度 h 與天體赤緯 dec 求時角。
 * 若天體不升降（永晝或永夜），回傳 π。
 */
function getHourAngle(h: number, dec: number, latRad: number): number {
  const c = (Math.sin(h) - Math.sin(latRad) * Math.sin(dec)) / Math.cos(latRad) / Math.cos(dec)
  if (Math.abs(c) > 1) return Math.PI
  return Math.acos(c)
}

/** moonCoord 內部計算結果 */
interface MoonCoordResult {
  H: number
  H0: number
}

/** sunCoord 內部計算結果 */
interface SunCoordResult {
  H: number
  H1: number
  H2: number
  H3: number
  H4: number
}

/** 月球座標（黃道 → 赤道）並計算時角。章動不計。 */
function computeMoonCoord(
  jd: number,
  dtDays: number,
  obliquity: number,
  observer: Observer,
  computeH0: boolean,
): MoonCoordResult {
  const z0 = elp_moonCoord((jd + dtDays) / 36525, 40, 30, 8)
  const z = rotateSpherical(z0, obliquity)
  const H = normalizeAngleSigned(meanSiderealTimeFromUT(jd, dtDays) + observer.longitude - z[0])
  const H0 = computeH0
    ? getHourAngle(
        (0.7275 * EARTH_EQUATORIAL_RADIUS_KM) / z[2] - (34 * 60) / RAD_TO_ARCSEC,
        z[1],
        observer.latitude,
      )
    : 0
  return { H, H0 }
}

/** 太陽座標（地球黃道 → 赤道）並計算時角。 */
function computeSunCoord(
  jd: number,
  dtDays: number,
  obliquity: number,
  observer: Observer,
  mode: 0 | 1 | 2 | 3 | 4 | 10,
): SunCoordResult {
  const z0 = [earthLongitude((jd + dtDays) / 36525, 5) + Math.PI - 20.5 / RAD_TO_ARCSEC, 0, 1] as [
    number,
    number,
    number,
  ]
  const z = rotateSpherical(z0, obliquity)
  const H = normalizeAngleSigned(meanSiderealTimeFromUT(jd, dtDays) + observer.longitude - z[0])
  const H1 =
    mode === 10 || mode === 1
      ? getHourAngle((-50 * 60) / RAD_TO_ARCSEC, z[1], observer.latitude)
      : 0
  const H2 =
    mode === 10 || mode === 2
      ? getHourAngle((-6 * 3600) / RAD_TO_ARCSEC, z[1], observer.latitude)
      : 0
  const H3 =
    mode === 10 || mode === 3
      ? getHourAngle((-12 * 3600) / RAD_TO_ARCSEC, z[1], observer.latitude)
      : 0
  const H4 =
    mode === 10 || mode === 4
      ? getHourAngle((-18 * 3600) / RAD_TO_ARCSEC, z[1], observer.latitude)
      : 0
  return { H, H1, H2, H3, H4 }
}

// ── 公開 API ──

/**
 * 月球升中天降時刻。
 * @param jd J2000 起算之儒略日（當地平午 UT）
 * @param observer 觀測者位置
 */
export function moonRiseTransitSet(jd: number, observer: Observer): MoonRTSResult {
  const dtDays = deltaT(jd)
  const obliquity = meanObliquityP03(jd / 36525)
  // 找最靠近當日中午的月上中天
  jd -= balancedMod(
    0.1726222 + 0.966136808032357 * jd - 0.0366 * dtDays + observer.longitude / TWO_PI,
    1,
  )

  const sv = TWO_PI * 0.966
  let s = jd
  let j = jd
  let z = jd
  let x = jd
  const c = jd
  const h = jd

  const r0 = computeMoonCoord(jd, dtDays, obliquity, observer, true)
  s += (-r0.H0 - r0.H) / sv
  j += (r0.H0 - r0.H) / sv
  z += (0 - r0.H) / sv
  x += (Math.PI - r0.H) / sv
  // c 與 h 在整個迭代過程中保持初始 jd 值不變

  const rs = computeMoonCoord(s, dtDays, obliquity, observer, true)
  s += normalizeAngleSigned(-rs.H0 - rs.H) / sv

  const rj = computeMoonCoord(j, dtDays, obliquity, observer, true)
  j += normalizeAngleSigned(rj.H0 - rj.H) / sv

  const rz = computeMoonCoord(z, dtDays, obliquity, observer, false)
  z += normalizeAngleSigned(0 - rz.H) / sv

  const rx = computeMoonCoord(x, dtDays, obliquity, observer, false)
  x += normalizeAngleSigned(Math.PI - rx.H) / sv

  return { s, j, z, x, c, h }
}

/**
 * 太陽升中天降時刻（含民用／航海／天文晨昏蒙影）。
 * @param jd J2000 起算之儒略日（當地平午 UT）
 * @param observer 觀測者位置
 */
export function sunRiseTransitSet(jd: number, observer: Observer): SunRTSResult {
  const dtDays = deltaT(jd)
  const obliquity = meanObliquityP03(jd / 36525)
  // 找最靠近當日中午的日上中天
  jd -= balancedMod(jd + observer.longitude / TWO_PI, 1)

  const sv = TWO_PI
  let s = jd
  let j = jd
  let z = jd
  let x = jd
  let c = jd
  let h = jd
  let c2 = jd
  let h2 = jd
  let c3 = jd
  let h3 = jd
  let sm = ''

  const r0 = computeSunCoord(jd, dtDays, obliquity, observer, 10)
  s += (-r0.H1 - r0.H) / sv
  j += (r0.H1 - r0.H) / sv
  c += (-r0.H2 - r0.H) / sv
  h += (r0.H2 - r0.H) / sv
  c2 += (-r0.H3 - r0.H) / sv
  h2 += (r0.H3 - r0.H) / sv
  c3 += (-r0.H4 - r0.H) / sv
  h3 += (r0.H4 - r0.H) / sv
  z += (0 - r0.H) / sv
  x += (Math.PI - r0.H) / sv

  const rs = computeSunCoord(s, dtDays, obliquity, observer, 1)
  s += normalizeAngleSigned(-rs.H1 - rs.H) / sv
  if (rs.H1 === Math.PI) sm += '無日出'

  const rj = computeSunCoord(j, dtDays, obliquity, observer, 1)
  j += normalizeAngleSigned(rj.H1 - rj.H) / sv
  if (rj.H1 === Math.PI) sm += '無日落'

  const rc = computeSunCoord(c, dtDays, obliquity, observer, 2)
  c += normalizeAngleSigned(-rc.H2 - rc.H) / sv
  if (rc.H2 === Math.PI) sm += '無民用晨光'

  const rh = computeSunCoord(h, dtDays, obliquity, observer, 2)
  h += normalizeAngleSigned(rh.H2 - rh.H) / sv
  if (rh.H2 === Math.PI) sm += '無民用昏光'

  const rc2 = computeSunCoord(c2, dtDays, obliquity, observer, 3)
  c2 += normalizeAngleSigned(-rc2.H3 - rc2.H) / sv
  if (rc2.H3 === Math.PI) sm += '無航海晨光'

  const rh2 = computeSunCoord(h2, dtDays, obliquity, observer, 3)
  h2 += normalizeAngleSigned(rh2.H3 - rh2.H) / sv
  if (rh2.H3 === Math.PI) sm += '無航海昏光'

  const rc3 = computeSunCoord(c3, dtDays, obliquity, observer, 4)
  c3 += normalizeAngleSigned(-rc3.H4 - rc3.H) / sv
  if (rc3.H4 === Math.PI) sm += '無天文晨光'

  const rh3 = computeSunCoord(h3, dtDays, obliquity, observer, 4)
  h3 += normalizeAngleSigned(rh3.H4 - rh3.H) / sv
  if (rh3.H4 === Math.PI) sm += '無天文昏光'

  const rz = computeSunCoord(z, dtDays, obliquity, observer, 0)
  z += (0 - rz.H) / sv

  const rx = computeSunCoord(x, dtDays, obliquity, observer, 0)
  x += normalizeAngleSigned(Math.PI - rx.H) / sv

  return { s, j, z, x, c, h, c2, h2, c3, h3, sm }
}

/**
 * 多日升中降：計算連續 n 日的日月升降並回傳 DailyRow 陣列。
 *
 * @param startJd 起始儒略日（當地中午 J2000 起算）
 * @param n 日數
 * @param observer 觀測者位置
 * @param tzOffsetDays 時區偏移（日數，如 UTC+8 = 8/24）
 */
export function multiDayRiseTransitSet(
  startJd: number,
  n: number,
  observer: Observer,
  tzOffsetDays: number,
): DailyRow[] {
  const rows: DailyRow[] = Array.from({ length: n }, () => ({
    s: '--:--:--',
    z: '--:--:--',
    j: '--:--:--',
    c: '--:--:--',
    h: '--:--:--',
    ch: '--:--:--',
    sj: '--:--:--',
    Ms: '--:--:--',
    Mz: '--:--:--',
    Mj: '--:--:--',
  }))

  for (let i = -1; i <= n; i++) {
    if (i >= 0 && i < n) {
      const r = sunRiseTransitSet(startJd + i + tzOffsetDays, observer)
      const row = rows[i]!
      row.s = formatTimeOfDay((r.s - tzOffsetDays) as never)
      row.z = formatTimeOfDay((r.z - tzOffsetDays) as never)
      row.j = formatTimeOfDay((r.j - tzOffsetDays) as never)
      row.c = formatTimeOfDay((r.c - tzOffsetDays) as never)
      row.h = formatTimeOfDay((r.h - tzOffsetDays) as never)
      row.ch = formatTimeOfDay((r.h - r.c - 0.5) as never)
      row.sj = formatTimeOfDay((r.j - r.s - 0.5) as never)
    }
    const mr = moonRiseTransitSet(startJd + i + tzOffsetDays, observer)

    const dayS = Math.floor(mr.s - tzOffsetDays + 0.5) - startJd
    if (dayS >= 0 && dayS < n) rows[dayS]!.Ms = formatTimeOfDay((mr.s - tzOffsetDays) as never)

    const dayZ = Math.floor(mr.z - tzOffsetDays + 0.5) - startJd
    if (dayZ >= 0 && dayZ < n) rows[dayZ]!.Mz = formatTimeOfDay((mr.z - tzOffsetDays) as never)

    const dayJ = Math.floor(mr.j - tzOffsetDays + 0.5) - startJd
    if (dayJ >= 0 && dayJ < n) rows[dayJ]!.Mj = formatTimeOfDay((mr.j - tzOffsetDays) as never)
  }
  return rows
}
