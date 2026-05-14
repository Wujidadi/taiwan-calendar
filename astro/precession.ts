// 岱員時憲章 — 歲差（precession）模型與座標變換
//
// 支援三種歲差模型：
//   - IAU 1976（Lieske et al. 1977）
//   - IAU 2000（Lieske 1979 + IAU 2000 修正）
//   - P03（Capitaine et al. 2003；目前 IAU 推薦）
//
// 歲差量名稱沿用文獻慣例：
//   fi（精度因子）、w（黃赤交角）、P、Q、E、x、pi、II（自導出）、
//   p（總歲差）、th、Z、z（赤道歲差三角）。

import { RAD_TO_ARCSEC } from './constants'
import type { Spherical } from './math'
import { normalizeAngle, rotateSpherical } from './math'

/** 歲差量名稱 */
export type PrecessionQuantity =
  | 'fi'
  | 'w'
  | 'P'
  | 'Q'
  | 'E'
  | 'x'
  | 'pi'
  | 'II'
  | 'p'
  | 'th'
  | 'Z'
  | 'z'

/** 歲差模型 */
export type PrecessionModel = 'IAU1976' | 'IAU2000' | 'P03'

/** 12 個歲差量按來源實作之固定順序 */
const QUANTITY_ORDER: readonly PrecessionQuantity[] = [
  'fi',
  'w',
  'P',
  'Q',
  'E',
  'x',
  'pi',
  'II',
  'p',
  'th',
  'Z',
  'z',
] as const

/** IAU 1976 歲差表：每個量 4 個次冪係數（arcsec 單位） */
// prettier-ignore
export const PRECESSION_TABLE_IAU1976: Record<PrecessionQuantity, readonly number[]> = {
  fi: [     0,     5038.7784, -1.07259, -0.001147],
  w:  [84381.448,     0,      +0.05127, -0.007726],
  P:  [     0,       +4.1976, +0.19447, -0.000179],
  Q:  [     0,      -46.8150, +0.05059, +0.000344],
  E:  [84381.448,  -46.8150,  -0.00059, +0.001813],
  x:  [     0,      +10.5526, -2.38064, -0.001125],
  pi: [     0,       47.0028, -0.03301, +0.000057],
  II: [629554.886, -869.8192, +0.03666, -0.001504],
  p:  [     0,     5029.0966, +1.11113, +0.000006],
  th: [     0,     2004.3109, -0.42665, -0.041833],
  Z:  [     0,     2306.2181, +0.30188, +0.017998],
  z:  [     0,     2306.2181, +1.09468, +0.018203],
} as const

/** IAU 2000 歲差表：每個量 6 個次冪係數 */
// prettier-ignore
export const PRECESSION_TABLE_IAU2000: Record<PrecessionQuantity, readonly number[]> = {
  fi: [     0,         5038.478750,  -1.07259,   -0.001147,   0,          0        ],
  w:  [ 84381.448,       -0.025240,  +0.05127,   -0.007726,   0,          0        ],
  P:  [     0,           +4.1976,    +0.19447,   -0.000179,   0,          0        ],
  Q:  [     0,          -46.8150,    +0.05059,   +0.000344,   0,          0        ],
  E:  [ 84381.448,      -46.84024,   -0.00059,   +0.001813,   0,          0        ],
  x:  [     0,          +10.5526,    -2.38064,   -0.001125,   0,          0        ],
  pi: [     0,           47.0028,    -0.03301,   +0.000057,   0,          0        ],
  II: [629554.886,     -869.8192,    +0.03666,   -0.001504,   0,          0        ],
  p:  [     0,         5028.79695,   +1.11113,   +0.000006,   0,          0        ],
  th: [     0,         2004.1917476, -0.4269353, -0.0418251, -0.0000601, -0.0000001],
  Z:  [    +2.5976176, 2306.0809506, +0.3019015, +0.0179663, -0.0000327, -0.0000002],
  z:  [    -2.5976176, 2306.0803226, +1.0947790, +0.0182273, +0.0000470, -0.0000003],
} as const

/** P03 歲差表（Capitaine et al. 2003）：每個量 6 個次冪係數 */
// prettier-ignore
export const PRECESSION_TABLE_P03: Record<PrecessionQuantity, readonly number[]> = {
  fi: [     0,        5038.481507, -1.0790069, -0.00114045, +0.000132851, -9.51e-8 ],
  w:  [ 84381.406,     -0.025754, +0.0512623, -0.00772503, -4.67e-7,     +3.337e-7 ],
  P:  [     0,           4.199094, +0.1939873, -0.00022466, -9.12e-7,     +1.20e-8 ],
  Q:  [     0,         -46.811015, +0.0510283, +0.00052413, -6.46e-7,     -1.72e-8 ],
  E:  [ 84381.406,     -46.836769, -0.0001831, +0.00200340, -5.76e-7,     -4.34e-8 ],
  x:  [     0,          10.556403, -2.3814292, -0.00121197, +0.000170663, -5.60e-8 ],
  pi: [     0,          46.998973, -0.0334926, -0.00012559, +1.13e-7,     -2.2e-9  ],
  II: [629546.7936,   -867.95758,  +0.157992,  -0.0005371,  -0.00004797,  +7.2e-8  ],
  p:  [     0,        5028.796195, +1.1054348, +0.00007964, -0.000023857, +3.83e-8 ],
  th: [     0,        2004.191903, -0.4294934, -0.04182264, -7.089e-6,    -1.274e-7],
  Z:  [     2.650545, 2306.083227, +0.2988499, +0.01801828, -5.971e-6,    -3.173e-7],
  z:  [    -2.650545, 2306.077181, +1.0927348, +0.01826837, -0.000028596, -2.904e-7],
} as const

/**
 * 取得指定歲差量（rad）。
 *
 * @param t 儒略世紀數（J2000 起）
 * @param quantity 歲差量名稱
 * @param model 歲差模型
 */
export function precessionQuantity(
  t: number,
  quantity: PrecessionQuantity,
  model: PrecessionModel,
): number {
  let n: number
  let table: Record<PrecessionQuantity, readonly number[]>
  if (model === 'IAU1976') {
    n = 4
    table = PRECESSION_TABLE_IAU1976
  } else if (model === 'IAU2000') {
    n = 6
    table = PRECESSION_TABLE_IAU2000
  } else {
    n = 6
    table = PRECESSION_TABLE_P03
  }
  const coefs = table[quantity]
  let tn = 1
  let c = 0
  for (let i = 0; i < n; i++, tn *= t) {
    c += coefs[i]! * tn
  }
  return c / RAD_TO_ARCSEC
}

/**
 * P03 平黃赤交角（rad）。
 * @param t 儒略世紀數（J2000 起）
 */
export function meanObliquityP03(t: number): number {
  const t2 = t * t
  const t3 = t2 * t
  const t4 = t3 * t
  const t5 = t4 * t
  return (
    (84381.406 - 46.836769 * t - 0.0001831 * t2 + 0.0020034 * t3 - 5.76e-7 * t4 - 4.34e-8 * t5) /
    RAD_TO_ARCSEC
  )
}

/**
 * 赤道球面座標：J2000 → Date 分點。
 * @param t 儒略世紀數
 * @param llr [赤經, 赤緯, 距離]
 * @param model 歲差模型
 */
export function equatorialJ2000ToDate(
  t: number,
  llr: Spherical,
  model: PrecessionModel,
): Spherical {
  const Z = precessionQuantity(t, 'Z', model) + llr[0]
  const z = precessionQuantity(t, 'z', model)
  const th = precessionQuantity(t, 'th', model)
  const cosW = Math.cos(llr[1])
  const cosH = Math.cos(th)
  const sinW = Math.sin(llr[1])
  const sinH = Math.sin(th)
  const A = cosW * Math.sin(Z)
  const B = cosH * cosW * Math.cos(Z) - sinH * sinW
  const C = sinH * cosW * Math.cos(Z) + cosH * sinW
  return [normalizeAngle(Math.atan2(A, B) + z), Math.asin(C), llr[2]]
}

/**
 * 赤道球面座標：Date 分點 → J2000。
 */
export function equatorialDateToJ2000(
  t: number,
  llr: Spherical,
  model: PrecessionModel,
): Spherical {
  const Z = -precessionQuantity(t, 'z', model) + llr[0]
  const z = -precessionQuantity(t, 'Z', model)
  const th = -precessionQuantity(t, 'th', model)
  const cosW = Math.cos(llr[1])
  const cosH = Math.cos(th)
  const sinW = Math.sin(llr[1])
  const sinH = Math.sin(th)
  const A = cosW * Math.sin(Z)
  const B = cosH * cosW * Math.cos(Z) - sinH * sinW
  const C = sinH * cosW * Math.cos(Z) + cosH * sinW
  return [normalizeAngle(Math.atan2(A, B) + z), Math.asin(C), llr[2]]
}

/**
 * 黃道球面座標：J2000 → Date 分點。
 */
export function eclipticJ2000ToDate(t: number, llr: Spherical, model: PrecessionModel): Spherical {
  let r: Spherical = [llr[0], llr[1], llr[2]]
  r = [r[0] + precessionQuantity(t, 'fi', model), r[1], r[2]]
  r = rotateSpherical(r, precessionQuantity(t, 'w', model))
  r = [r[0] - precessionQuantity(t, 'x', model), r[1], r[2]]
  r = rotateSpherical(r, -precessionQuantity(t, 'E', model))
  return r
}

/**
 * 黃道球面座標：Date 分點 → J2000。
 */
export function eclipticDateToJ2000(t: number, llr: Spherical, model: PrecessionModel): Spherical {
  let r: Spherical = [llr[0], llr[1], llr[2]]
  r = rotateSpherical(r, precessionQuantity(t, 'E', model))
  r = [r[0] + precessionQuantity(t, 'x', model), r[1], r[2]]
  r = rotateSpherical(r, -precessionQuantity(t, 'w', model))
  r = [normalizeAngle(r[0] - precessionQuantity(t, 'fi', model)), r[1], r[2]]
  return r
}

// 內部使用 QUANTITY_ORDER 以保留來源實作之 sc 索引（如將來需暴露給外部測試）
export const PRECESSION_QUANTITY_ORDER = QUANTITY_ORDER
