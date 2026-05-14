// 岱員時憲章 — 「位元級接近」比對工具
//
// 設計理由：
//   Golden fixture 由「對照標準參考實作」產生；理想上應 toEqual 嚴格相等。
//   但實務上跨 JavaScript 引擎（Bun JSC vs Node V8）的 Math 函式
//   （asin、atan2 等）可能在最後一位有 1 ULP 差異，且 JSON 序列化
//   會把 `-0` 寫成 `"0"`、解析回 `+0`。為避免測試對引擎敏感而誤報，
//   採「位元級接近」比對：
//     - ±0 視為相等
//     - NaN 與 NaN 相等
//     - 一般 finite 浮點：允許 ≤ N ULP 距離（預設 2，極嚴格）
//     - 陣列／物件：遞迴比較
//
//   2 ULP 容忍仍能可靠捕捉所有真實演算法 bug；只放行純引擎差異。

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
export function isBitClose(actual: unknown, expected: unknown, maxUlp = 2): boolean {
  return compare(actual, expected, maxUlp, '$') === null
}

/**
 * 取得「不相等」的描述字串；相等則回傳 null。
 * 供 vitest 自訂 matcher 產生訊息。
 */
export function bitCloseDiagnostic(actual: unknown, expected: unknown, maxUlp = 2): string | null {
  return compare(actual, expected, maxUlp, '$')
}
