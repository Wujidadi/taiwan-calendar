// 岱員時憲章 — Branded type 工具
// 用法：type Latitude = Brand<number, 'Latitude'>
// 這讓 number 與 Latitude / Longitude / JulianDay 互不相通，避免單位混淆

declare const __brand: unique symbol

export type Brand<T, B extends string> = T & { readonly [__brand]: B }

/**
 * 將原始值安全地視為 branded 型別。
 * 不檢查值域；驗證須在資料建立時完成。
 */
export function brand<B extends string>() {
  return <T>(value: T): Brand<T, B> => value as Brand<T, B>
}
