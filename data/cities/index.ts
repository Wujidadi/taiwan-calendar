// 區域排序：台灣本位 → 港澳 → 中國大陸 → 亞太 → 美洲 → 歐洲 → 其他國家首都
import type { City, Region, RegionKey } from '#types/geography'
import { americasCities } from './americas'
import { asiaPacificCities } from './asia-pacific'
import { europeCities } from './europe'
import { hongKongCities } from './hong-kong'
import { macauCities } from './macau'
import { mainlandChinaCities } from './mainland-china'
import { taiwanCities } from './taiwan'
import { worldCapitals } from './world-capitals'

/** 區域 metadata（排序：台灣最先） */
export const regions: readonly Region[] = [
  { key: 'taiwan', sortIndex: 0 },
  { key: 'hong-kong', sortIndex: 1 },
  { key: 'macau', sortIndex: 2 },
  { key: 'mainland-china', sortIndex: 3 },
  { key: 'asia-pacific', sortIndex: 4 },
  { key: 'americas', sortIndex: 5 },
  { key: 'europe', sortIndex: 6 },
  { key: 'world-capitals', sortIndex: 7 },
] as const

/** 全部城市，依 region.sortIndex 與 city.sortIndex 排序 */
export const allCities: readonly City[] = [
  ...taiwanCities,
  ...hongKongCities,
  ...macauCities,
  ...mainlandChinaCities,
  ...asiaPacificCities,
  ...americasCities,
  ...europeCities,
  ...worldCapitals,
]

/** 城市 ID → City 的查找索引 */
export const citiesById: ReadonlyMap<string, City> = new Map(allCities.map(c => [c.id, c]))

/** 區域 → 該區域城市清單 */
export const citiesByRegion: Readonly<Record<RegionKey, readonly City[]>> = {
  taiwan: taiwanCities,
  'hong-kong': hongKongCities,
  macau: macauCities,
  'mainland-china': mainlandChinaCities,
  'asia-pacific': asiaPacificCities,
  americas: americasCities,
  europe: europeCities,
  'world-capitals': worldCapitals,
}

/** 預設城市 ID：台北 */
export const DEFAULT_CITY_ID = 'taipei'

export {
  americasCities,
  asiaPacificCities,
  europeCities,
  hongKongCities,
  macauCities,
  mainlandChinaCities,
  taiwanCities,
  worldCapitals,
}
