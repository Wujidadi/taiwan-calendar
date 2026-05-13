// 岱員時憲章 — 角度與球面工具測試
import {
  angularSeparation,
  balancedMod,
  cartesianToSpherical,
  normalizeAngle,
  normalizeAngleSigned,
  sphericalToCartesian,
} from '#astro/math'
import { describe, expect, it } from 'vitest'

const TWO_PI = Math.PI * 2

describe('normalizeAngle', () => {
  it('保持 [0, 2π) 內角度不變', () => {
    expect(normalizeAngle(0)).toBe(0)
    expect(normalizeAngle(Math.PI)).toBe(Math.PI)
    expect(normalizeAngle(TWO_PI - 0.001)).toBeCloseTo(TWO_PI - 0.001)
  })

  it('將負角度正規化為正向', () => {
    expect(normalizeAngle(-Math.PI)).toBeCloseTo(Math.PI)
    expect(normalizeAngle(-TWO_PI)).toBeCloseTo(0)
  })

  it('將超過 2π 的角度回繞', () => {
    expect(normalizeAngle(TWO_PI + 0.5)).toBeCloseTo(0.5)
    expect(normalizeAngle(5 * TWO_PI)).toBeCloseTo(0)
  })
})

describe('normalizeAngleSigned', () => {
  it('將角度規範到 (−π, π]', () => {
    expect(normalizeAngleSigned(0)).toBe(0)
    expect(normalizeAngleSigned(Math.PI)).toBeCloseTo(Math.PI)
    expect(normalizeAngleSigned(Math.PI + 0.1)).toBeCloseTo(-Math.PI + 0.1)
    expect(normalizeAngleSigned(-Math.PI - 0.1)).toBeCloseTo(Math.PI - 0.1)
  })
})

describe('balancedMod', () => {
  it('回傳最近 b 倍數的偏差，落於 [−b/2, b/2]', () => {
    expect(balancedMod(7, 10)).toBe(-3)
    expect(balancedMod(3, 10)).toBe(3)
    expect(balancedMod(5, 10)).toBe(5)
    expect(balancedMod(12, 10)).toBe(2)
  })
})

describe('sphericalToCartesian / cartesianToSpherical', () => {
  it('互為逆運算', () => {
    const original = [Math.PI / 3, Math.PI / 6, 2] as const
    const cart = sphericalToCartesian(original)
    const back = cartesianToSpherical(cart)
    expect(back[0]).toBeCloseTo(original[0])
    expect(back[1]).toBeCloseTo(original[1])
    expect(back[2]).toBeCloseTo(original[2])
  })

  it('球面座標 (0, 0, 1) 對應到 (1, 0, 0)', () => {
    const [x, y, z] = sphericalToCartesian([0, 0, 1])
    expect(x).toBeCloseTo(1)
    expect(y).toBeCloseTo(0)
    expect(z).toBeCloseTo(0)
  })
})

describe('angularSeparation', () => {
  it('同一點之角距為 0', () => {
    expect(angularSeparation(1, 0.5, 1, 0.5)).toBeCloseTo(0)
  })

  it('對極點（赤經對應的子午圈）之角距為 π', () => {
    expect(angularSeparation(0, 0, Math.PI, 0)).toBeCloseTo(Math.PI)
  })

  it('黃道上 90 度間距為 π/2', () => {
    expect(angularSeparation(0, 0, Math.PI / 2, 0)).toBeCloseTo(Math.PI / 2)
  })
})
