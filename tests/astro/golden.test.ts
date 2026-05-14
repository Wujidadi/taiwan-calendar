// 岱員時憲章 — 演算法層 bit-exact 對照測試
//
// 此測試載入 tests/fixtures/astro-golden.json，逐案比對主倉 astro/ 模組之輸出
// 與標準參考實作的期望值，採嚴格 bit-exact（0 ULP 容忍）。
//
// 因 fixture 生成（notes 倉 generate.ts）與本測試皆於 Bun（JavaScriptCore）
// 同一引擎執行，浮點末位完全一致。唯一例外是 JSON 序列化會把 `-0` 寫成
// `"0"`、解析回 `+0`——bit-close.ts 內 `a === b` 自動視 ±0 相等，故此情形
// 不需額外容忍。NaN 與 NaN 亦視為相等。
import { computeDeltaT, deltaT } from '#astro/delta-t'
import {
  gregorianToJulianDay,
  julianDayOfNthWeekday,
  julianDayToGregorian,
  julianDayToWeekday,
} from '#astro/julian-day'
import {
  angularSeparation,
  balancedMod,
  cartesianToSpherical,
  equatorialToHorizon,
  heliocentricToGeocentric,
  normalizeAngle,
  normalizeAngleSigned,
  parallacticAngle,
  rotateSpherical,
  sphericalToCartesian,
} from '#astro/math'
import type { JulianDay } from '#types/time'
import { describe, expect, it } from 'bun:test'
import fixtureJson from '../fixtures/astro-golden.json' with { type: 'json' }
import { bitCloseDiagnostic } from '../utils/bit-close'

// JSON 載入的型別過於寬鬆（input 可能是 number 或多元組陣列），統一斷言為
// 通用案例型別；在各 it.each 內依函式簽名解構即可。
interface AnyCase {
  description?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expected: any
}
type Cases = AnyCase[]
const fixture = fixtureJson as unknown as {
  modules: {
    math: {
      normalizeAngle: Cases
      normalizeAngleSigned: Cases
      balancedMod: Cases
      sphericalToCartesian: Cases
      cartesianToSpherical: Cases
      rotateSpherical: Cases
      equatorialToHorizon: Cases
      angularSeparation: Cases
      heliocentricToGeocentric: Cases
      parallacticAngle: Cases
    }
    julianDay: {
      gregorianToJulianDay: Cases
      julianDayToGregorian: Cases
      julianDayToWeekday: Cases
      julianDayOfNthWeekday: Cases
    }
    deltaT: {
      computeDeltaT: Cases
      deltaT: Cases
    }
  }
}

// 自訂 matcher：toBeBitExact(expected) — 嚴格 bit-exact（含 ±0 等同）
expect.extend({
  toBeBitExact(received: unknown, expected: unknown) {
    const diag = bitCloseDiagnostic(received, expected, 0)
    return {
      pass: diag === null,
      message: () => diag ?? 'OK',
      actual: received,
      expected,
    }
  },
})

declare module 'bun:test' {
  // T 為 bun:test Matchers 自身的泛型參數，介面擴充需保留簽名以對齊
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Matchers<T = unknown> {
    toBeBitExact: (expected: unknown) => void
  }
  interface AsymmetricMatchersContaining {
    toBeBitExact: (expected: unknown) => void
  }
}

const asJD = (n: number): JulianDay => n as unknown as JulianDay

describe('Golden bit-exact 對照（0 ULP）', () => {
  describe('math', () => {
    const m = fixture.modules.math

    it.each(m.normalizeAngle)('normalizeAngle: $description', ({ input, expected }) => {
      expect(normalizeAngle(input)).toBeBitExact(expected)
    })

    it.each(m.normalizeAngleSigned)('normalizeAngleSigned: $description', ({ input, expected }) => {
      expect(normalizeAngleSigned(input)).toBeBitExact(expected)
    })

    it.each(m.balancedMod)('balancedMod: $description', ({ input, expected }) => {
      expect(balancedMod(input[0], input[1])).toBeBitExact(expected)
    })

    it.each(m.sphericalToCartesian)('sphericalToCartesian: $description', ({ input, expected }) => {
      expect([...sphericalToCartesian([input[0], input[1], input[2]])]).toBeBitExact(expected)
    })

    it.each(m.cartesianToSpherical)('cartesianToSpherical: $description', ({ input, expected }) => {
      expect([...cartesianToSpherical([input[0], input[1], input[2]])]).toBeBitExact(expected)
    })

    it.each(m.rotateSpherical)('rotateSpherical: $description', ({ input, expected }) => {
      const [jwr, e] = input
      expect([...rotateSpherical([jwr[0], jwr[1], jwr[2]], e)]).toBeBitExact(expected)
    })

    it.each(m.equatorialToHorizon)('equatorialToHorizon: $description', ({ input, expected }) => {
      const [eq, lon, lat, gst] = input
      expect([...equatorialToHorizon([eq[0], eq[1], eq[2]], lon, lat, gst)]).toBeBitExact(expected)
    })

    it.each(m.angularSeparation)('angularSeparation: $description', ({ input, expected }) => {
      expect(angularSeparation(input[0], input[1], input[2], input[3])).toBeBitExact(expected)
    })

    it.each(m.heliocentricToGeocentric)(
      'heliocentricToGeocentric: $description',
      ({ input, expected }) => {
        const [t, e] = input
        expect([...heliocentricToGeocentric([t[0], t[1], t[2]], [e[0], e[1], e[2]])]).toBeBitExact(
          expected,
        )
      },
    )

    it.each(m.parallacticAngle)('parallacticAngle: $description', ({ input, expected }) => {
      expect(parallacticAngle(input[0], input[1], input[2], input[3], input[4])).toBeBitExact(
        expected,
      )
    })
  })

  describe('julian-day', () => {
    const j = fixture.modules.julianDay

    it.each(j.gregorianToJulianDay)('gregorianToJulianDay: $description', ({ input, expected }) => {
      expect(gregorianToJulianDay(input[0], input[1], input[2])).toBeBitExact(expected)
    })

    it.each(j.julianDayToGregorian)('julianDayToGregorian: $description', ({ input, expected }) => {
      expect(julianDayToGregorian(asJD(input))).toBeBitExact(expected)
    })

    it.each(j.julianDayToWeekday)('julianDayToWeekday: $description', ({ input, expected }) => {
      expect(julianDayToWeekday(asJD(input))).toBeBitExact(expected)
    })

    it.each(j.julianDayOfNthWeekday)(
      'julianDayOfNthWeekday: $description',
      ({ input, expected }) => {
        expect(julianDayOfNthWeekday(input[0], input[1], input[2], input[3])).toBeBitExact(expected)
      },
    )
  })

  describe('delta-t', () => {
    const d = fixture.modules.deltaT

    it.each(d.computeDeltaT)('computeDeltaT: $description', ({ input, expected }) => {
      expect(computeDeltaT(input)).toBeBitExact(expected)
    })

    it.each(d.deltaT)('deltaT: $description', ({ input, expected }) => {
      expect(deltaT(input)).toBeBitExact(expected)
    })
  })
})
