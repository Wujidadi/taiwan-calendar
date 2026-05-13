// 岱員時憲章 — 時間與紀年型別
import type { Brand } from './branded'
import type { IanaTimezone } from './geography'

/** 儒略日（含小數，TT/TD/UT 之分由語境決定） */
export type JulianDay = Brand<number, 'JulianDay'>

/** Unix epoch 毫秒數 */
export type UnixMillis = Brand<number, 'UnixMillis'>

/** 角度（度） */
export type Degree = Brand<number, 'Degree'>

/** 角度（弧度） */
export type Radian = Brand<number, 'Radian'>

/** 時區資料條目 */
export interface TimezoneEntry {
  /** ASCII 唯一識別字（如 'asia-taipei'） */
  readonly id: string
  /** IANA 時區識別字 */
  readonly iana: IanaTimezone
  /** 標準時間相對 UTC 的小時偏移（不含 DST），如台北為 8 */
  readonly utcOffsetHours: number
  /** 是否實施夏令時 */
  readonly hasDst: boolean
  /** 代表城市的 ASCII id（呼應 City.id） */
  readonly representativeCity: string
}

/** 年號（朝代或政權的紀元名） */
export interface ReignTitle {
  /** ASCII 唯一識別字（如 'guangxu'、'minguo'、'wanli'） */
  readonly id: string
  /** 朝代或政權代號（如 'qing'、'roc'、'ming'、'song-north' 等） */
  readonly dynasty: string
  /** 起始公元年（包含；含 1 則為元年） */
  readonly startYear: number
  /**
   * 結束公元年（包含；若年號至今未廢止則為 null）。
   * 民國紀年 startYear = 1912、endYear = null。
   */
  readonly endYear: number | null
}
