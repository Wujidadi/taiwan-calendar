// 岱員時憲章 — 地理與行政區型別
import type { Brand } from './branded'

/** 緯度（−90 到 +90，北正南負） */
export type Latitude = Brand<number, 'Latitude'>

/** 經度（−180 到 +180，東正西負） */
export type Longitude = Brand<number, 'Longitude'>

/** 海拔（公尺，地平面為 0） */
export type Elevation = Brand<number, 'Elevation'>

/** 經緯座標 */
export interface Coordinates {
  latitude: Latitude
  longitude: Longitude
  elevation?: Elevation
}

/** IANA 時區識別字（如 'Asia/Taipei'） */
export type IanaTimezone = Brand<string, 'IanaTimezone'>

/** 一級區域分類 */
export type RegionKey =
  | 'taiwan'
  | 'hong-kong'
  | 'macau'
  | 'mainland-china'
  | 'asia-pacific'
  | 'americas'
  | 'europe'
  | 'world-capitals'

/** 城市資料條目 */
export interface City {
  /** ASCII 唯一識別字（如 'taipei'、'new-taipei'、'hsinchu-city'） */
  readonly id: string
  /** 所屬一級區域 */
  readonly region: RegionKey
  /** ISO 3166-1 alpha-2 國家碼（'TW'、'HK'、'MO'、'CN'、'JP'、'US' 等） */
  readonly country: string
  /** IANA 時區識別字 */
  readonly timezone: IanaTimezone
  /** 座標 */
  readonly coordinates: Coordinates
  /**
   * 在區域內的排序鍵（小者在前；台灣本位排序時，台灣城市應有最小 sort key）。
   * 同 region 內 sort 一致時，依 id 字母序穩定排序。
   */
  readonly sortIndex: number
}

/** 區域 metadata（每個 RegionKey 對應一筆） */
export interface Region {
  readonly key: RegionKey
  /** 區域排序鍵（台灣 = 0、港 = 1、澳 = 2 ... 全球首都 = 7） */
  readonly sortIndex: number
}
