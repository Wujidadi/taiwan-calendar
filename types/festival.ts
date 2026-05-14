/** 節日分類 */
export type FestivalCategory =
  | 'tw-statutory' // 台灣國定假日
  | 'tw-memorial' // 台灣紀念日（非假日）
  | 'tw-folk' // 台灣民俗節日
  | 'cross-strait' // 兩岸共通（春節、端午、中秋等）
  | 'cn-statutory' // 中國大陸國定假日
  | 'international' // 國際性節日（母親節、世界 X 日）
  | 'religious' // 宗教節日（聖誕節、復活節等）
  | 'climate' // 傳統氣候事件（三九、初伏、入梅；非節日）
  | 'solar-term' // 二十四節氣

/** 適用區域標籤（節日顯示的地理範圍） */
export type FestivalRegion = 'tw' | 'hk' | 'mo' | 'cn' | 'global'

/** 日期規則 */
export type DateRule =
  | { kind: 'gregorian-fixed'; month: number; day: number }
  | { kind: 'lunar-fixed'; month: number; day: number }
  | { kind: 'gregorian-nth-weekday'; month: number; weekday: number; nth: number }
  | { kind: 'solar-term'; termIndex: number }
  | { kind: 'computed'; computeId: string } // 由演算法計算（如三九、初伏）

/** 節日資料條目 */
export interface Festival {
  /** ASCII 唯一識別字（如 'tw-new-year'、'mid-autumn'） */
  readonly id: string
  readonly category: FestivalCategory
  readonly regions: readonly FestivalRegion[]
  readonly dateRule: DateRule
}

/** 二十四節氣資料條目 */
export interface SolarTerm {
  /** ASCII id（如 'lichun'、'qingming'） */
  readonly id: string
  /** 在 24 節氣序列中的索引（0 = 冬至、依太陽黃經 270° 每 15° 一節氣） */
  readonly index: number
  /** 對應太陽黃經（度，0–360） */
  readonly solarLongitude: number
}
