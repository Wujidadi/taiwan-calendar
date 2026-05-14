// 岱員時憲章 — 位元級比對工具
//
// 設計理由：
//   Golden fixture 由 Bun（JavaScriptCore）執行對照參考實作產出，
//   本測試亦由 Bun 執行——同引擎下浮點完全 bit-exact 一致。
//   golden.test.ts 使用 `maxUlp = 0`（嚴格 bit-exact）。
//
//   保留 `maxUlp` 參數的彈性是為了應付兩種仍可能出現的 1 ULP 場景：
//     - 將來 fixture 由不同 JS 引擎產出（如 Node V8）
//     - 某些 Math 函式在 OS／CPU 升級後微調最低位
//   屆時可逐案酌情放寬，預設仍維持 0 ULP 嚴格相等。
//
//   無論 maxUlp 為何，皆視 ±0 相等、NaN 與 NaN 相等（前者因 JSON
//   序列化會把 `-0` 寫為 `"0"`，後者便於對照）。陣列／物件遞迴。

const SIGN_BIT = 1n << 63n

const f64 = new Float64Array(2)
const i64 = new BigInt64Array(f64.buffer)

/** 取得 double 在「signed-magnitude → 二補數空間」中的整數表示 */
function toOrdered(x: number): bigint {
  f64[0] = x
  const bits = i64[0]!
  return bits < 0n ? SIGN_BIT - bits : bits
}

/** 計算兩個 double 的 ULP 距離；不可比較者回傳 Infinity */
export function ulpDistance(a: number, b: number): number {
  if (Object.is(a, b)) return 0
  if (a === b) return 0 // ±0 視為相等
  if (Number.isNaN(a) && Number.isNaN(b)) return 0
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Number.POSITIVE_INFINITY

  const oa = toOrdered(a)
  const ob = toOrdered(b)
  const diff = oa > ob ? oa - ob : ob - oa
  // 將 bigint diff 轉 number；對於極端情形（diff > 2^53）會失精度，
  // 但此種情況代表「差距巨大」，無關 ULP 細節，照樣回傳 +Inf。
  if (diff > BigInt(Number.MAX_SAFE_INTEGER)) return Number.POSITIVE_INFINITY
  return Number(diff)
}

/** 內部遞迴比較 */
function compare(a: unknown, b: unknown, maxUlp: number, path: string): string | null {
  if (typeof a === 'number' && typeof b === 'number') {
    const dist = ulpDistance(a, b)
    if (dist <= maxUlp) return null
    return `${path}: ULP 距離 ${dist} 超過上限 ${maxUlp}（actual=${a}, expected=${b}）`
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return `${path}: 陣列長度不一致（actual=${a.length}, expected=${b.length}）`
    }
    for (let i = 0; i < a.length; i++) {
      const r = compare(a[i], b[i], maxUlp, `${path}[${i}]`)
      if (r !== null) return r
    }
    return null
  }
  if (
    typeof a === 'object' &&
    a !== null &&
    typeof b === 'object' &&
    b !== null &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  ) {
    const aObj = a as Record<string, unknown>
    const bObj = b as Record<string, unknown>
    const keys = new Set([...Object.keys(aObj), ...Object.keys(bObj)])
    for (const k of keys) {
      const r = compare(aObj[k], bObj[k], maxUlp, `${path}.${k}`)
      if (r !== null) return r
    }
    return null
  }
  // 其他類型：嚴格相等
  if (a !== b) return `${path}: 不相等（actual=${String(a)}, expected=${String(b)}）`
  return null
}

/**
 * 判斷兩值在「位元級接近」意義下相等。
 * 對於 number 走 ULP 距離；對於 array/object 遞迴；其他用 ===。
 */
export function isBitClose(actual: unknown, expected: unknown, maxUlp = 0): boolean {
  return compare(actual, expected, maxUlp, '$') === null
}

/**
 * 取得「不相等」的描述字串；相等則回傳 null。
 * 供 bun:test 自訂 matcher 產生訊息。
 */
export function bitCloseDiagnostic(actual: unknown, expected: unknown, maxUlp = 0): string | null {
  return compare(actual, expected, maxUlp, '$')
}
