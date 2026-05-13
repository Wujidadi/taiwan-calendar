// 岱員時憲章 — 澳門
import { assignSortIndex, coords, tz } from './_helpers'

const MO = 'MO'
const MOT = tz('Asia/Macau')

export const macauCities = assignSortIndex([
  {
    id: 'macau',
    region: 'macau',
    country: MO,
    timezone: MOT,
    coordinates: coords(22.1987, 113.5439),
  },
] as const)
