// 岱員時憲章 — 演算法層對照測試（位元級接近）
//
// 此測試載入 tests/fixtures/astro-golden.json，逐案比對主倉 astro/ 模組之輸出
// 與標準參考實作的期望值。
//
// 比對採「位元級接近」（最多 2 ULP 容忍）而非嚴格相等，原因有二：
//   1. 生成 fixture 的 runtime（Bun JSC）與 vitest worker（Node V8）之
//      Math 函式可能於最後一位產生 1 ULP 差異；
//   2. JSON 序列化會把 `-0` 寫成 `"0"`、解析回 `+0`。
//
// 2 ULP 容忍仍可靠地捕捉所有演算法 bug（常數錯、運算次序錯、邏輯錯通常
// 都遠超此距離），只放行跨引擎的純引擎差異。詳見 tests/utils/bit-close.ts。
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
import { describe, expect, it } from 'vitest'
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

// 自訂 matcher：toBeBitClose(expected, maxUlp?)
expect.extend({
  toBeBitClose(received: unknown, expected: unknown, maxUlp = 2) {
    const diag = bitCloseDiagnostic(received, expected, maxUlp)
    return {
      pass: diag === null,
      message: () => diag ?? 'OK',
      actual: received,
      expected,
    }
  },
})

declare module 'vitest' {
  interface Assertion {
    toBeBitClose: (expected: unknown, maxUlp?: number) => void
  }
}

const asJD = (n: number): JulianDay => n as unknown as JulianDay

describe('Golden 位元級對照（≤ 2 ULP）', () => {
  describe('math', () => {
    const m = fixture.modules.math

    it.each(m.normalizeAngle)('normalizeAngle: $description', ({ input, expected }) => {
      expect(normalizeAngle(input)).toBeBitClose(expected)
    })

    it.each(m.normalizeAngleSigned)('normalizeAngleSigned: $description', ({ input, expected }) => {
      expect(normalizeAngleSigned(input)).toBeBitClose(expected)
    })

    it.each(m.balancedMod)('balancedMod: $description', ({ input, expected }) => {
      expect(balancedMod(input[0], input[1])).toBeBitClose(expected)
    })

    it.each(m.sphericalToCartesian)('sphericalToCartesian: $description', ({ input, expected }) => {
      expect([...sphericalToCartesian([input[0], input[1], input[2]])]).toBeBitClose(expected)
    })

    it.each(m.cartesianToSpherical)('cartesianToSpherical: $description', ({ input, expected }) => {
      expect([...cartesianToSpherical([input[0], input[1], input[2]])]).toBeBitClose(expected)
    })

    it.each(m.rotateSpherical)('rotateSpherical: $description', ({ input, expected }) => {
      const [jwr, e] = input
      expect([...rotateSpherical([jwr[0], jwr[1], jwr[2]], e)]).toBeBitClose(expected)
    })

    it.each(m.equatorialToHorizon)('equatorialToHorizon: $description', ({ input, expected }) => {
      const [eq, lon, lat, gst] = input
      expect([...equatorialToHorizon([eq[0], eq[1], eq[2]], lon, lat, gst)]).toBeBitClose(expected)
    })

    it.each(m.angularSeparation)('angularSeparation: $description', ({ input, expected }) => {
      expect(angularSeparation(input[0], input[1], input[2], input[3])).toBeBitClose(expected)
    })

    it.each(m.heliocentricToGeocentric)(
      'heliocentricToGeocentric: $description',
      ({ input, expected }) => {
        const [t, e] = input
        expect([...heliocentricToGeocentric([t[0], t[1], t[2]], [e[0], e[1], e[2]])]).toBeBitClose(
          expected,
        )
      },
    )

    it.each(m.parallacticAngle)('parallacticAngle: $description', ({ input, expected }) => {
      expect(parallacticAngle(input[0], input[1], input[2], input[3], input[4])).toBeBitClose(
        expected,
      )
    })
  })

  describe('julian-day', () => {
    const j = fixture.modules.julianDay

    it.each(j.gregorianToJulianDay)('gregorianToJulianDay: $description', ({ input, expected }) => {
      expect(gregorianToJulianDay(input[0], input[1], input[2])).toBeBitClose(expected)
    })

    it.each(j.julianDayToGregorian)('julianDayToGregorian: $description', ({ input, expected }) => {
      expect(julianDayToGregorian(asJD(input))).toBeBitClose(expected)
    })

    it.each(j.julianDayToWeekday)('julianDayToWeekday: $description', ({ input, expected }) => {
      expect(julianDayToWeekday(asJD(input))).toBeBitClose(expected)
    })

    it.each(j.julianDayOfNthWeekday)(
      'julianDayOfNthWeekday: $description',
      ({ input, expected }) => {
        expect(julianDayOfNthWeekday(input[0], input[1], input[2], input[3])).toBeBitClose(expected)
      },
    )
  })

  describe('delta-t', () => {
    const d = fixture.modules.deltaT

    it.each(d.computeDeltaT)('computeDeltaT: $description', ({ input, expected }) => {
      expect(computeDeltaT(input)).toBeBitClose(expected)
    })

    it.each(d.deltaT)('deltaT: $description', ({ input, expected }) => {
      expect(deltaT(input)).toBeBitClose(expected)
    })
  })
})
