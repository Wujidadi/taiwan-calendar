// 岱員時憲章 — 香港
import { assignSortIndex, coords, tz } from './_helpers'

const HK = 'HK'
const HKT = tz('Asia/Hong_Kong')

export const hongKongCities = assignSortIndex([
  {
    id: 'hong-kong',
    region: 'hong-kong',
    country: HK,
    timezone: HKT,
    coordinates: coords(22.3193, 114.1694),
  },
] as const)
