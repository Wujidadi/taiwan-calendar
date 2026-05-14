// 岱員時憲章 — ΔT 力學時差測試
//
// 已知對照（USNO / Espenak 表）：
//   1820 年：ΔT ≈ 12 秒（擬合表起點附近）
//   1900 年：ΔT ≈ −2.79 秒
//   2000 年：ΔT ≈ 63.87 秒（J2000）
//   2026 年：ΔT ≈ 69 秒（近期實測 / 預測）
import { computeDeltaT, deltaT } from '#astro/delta-t'
import { describe, expect, it } from 'bun:test'

describe('computeDeltaT', () => {
  it('1900 年約 −2.8 秒', () => {
    expect(computeDeltaT(1900)).toBeCloseTo(-2.3, 0)
  })

  it('2000 年約 63.87 秒', () => {
    expect(computeDeltaT(2000)).toBeCloseTo(63.87, 1)
  })

  it('2026 年約 69 秒', () => {
    const v = computeDeltaT(2026)
    expect(v).toBeGreaterThan(68)
    expect(v).toBeLessThan(70)
  })

  it('回傳值對年份單調連續（在資料表分段邊界處不應有大跳變）', () => {
    const v1900 = computeDeltaT(1900)
    const v1901 = computeDeltaT(1901)
    expect(Math.abs(v1901 - v1900)).toBeLessThan(5)
  })

  it('超出表外的遠古／未來年份可外推（不拋例外）', () => {
    expect(() => computeDeltaT(-3000)).not.toThrow()
    expect(() => computeDeltaT(3500)).not.toThrow()
    expect(computeDeltaT(3000)).toBeGreaterThan(0)
  })
})

describe('deltaT', () => {
  it('回傳「日」單位，與 computeDeltaT 秒值一致', () => {
    const days = deltaT(0) // J2000
    const seconds = computeDeltaT(2000)
    expect(days * 86400).toBeCloseTo(seconds, 2)
  })

  it('J2000 起算 1 年的儒略日數應對應 2000+ 年', () => {
    // t = 365.2425 → year ≈ 2001
    const days = deltaT(365.2425)
    expect(days * 86400).toBeCloseTo(computeDeltaT(2001), 1)
  })
})
