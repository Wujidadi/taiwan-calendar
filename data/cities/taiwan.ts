// 岱員時憲章 — 台灣 22 一級行政區
// 座標：縣市政府所在地
// 排序：6 都（北→南）→ 3 市（北→南）→ 13 縣（西部 N→S → 東部 N→S → 離島）
import { assignSortIndex, coords, tz } from './_helpers'

const TW = 'TW'
const TPE = tz('Asia/Taipei')

export const taiwanCities = assignSortIndex([
  // ── 6 都 ──
  {
    id: 'taipei',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(25.0375, 121.5637),
  },
  {
    id: 'new-taipei',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(25.0125, 121.4628),
  },
  {
    id: 'taoyuan',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(24.9929, 121.301),
  },
  {
    id: 'taichung',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(24.1614, 120.6479),
  },
  {
    id: 'tainan',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(22.9999, 120.227),
  },
  {
    id: 'kaohsiung',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(22.6273, 120.3014),
  },

  // ── 3 市 ──
  {
    id: 'keelung',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(25.1311, 121.7407),
  },
  {
    id: 'hsinchu-city',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(24.8049, 120.9719),
  },
  {
    id: 'chiayi-city',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(23.4799, 120.4525),
  },

  // ── 13 縣（西部）──
  {
    id: 'hsinchu-county',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(24.8388, 121.0117),
  },
  {
    id: 'miaoli',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(24.5602, 120.8225),
  },
  {
    id: 'changhua',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(24.0759, 120.5418),
  },
  {
    id: 'nantou',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(23.9099, 120.6858),
  },
  {
    id: 'yunlin',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(23.7099, 120.5418),
  },
  {
    id: 'chiayi-county',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(23.4592, 120.3329),
  },
  {
    id: 'pingtung',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(22.6711, 120.4878),
  },

  // ── 13 縣（東部）──
  {
    id: 'yilan',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(24.7548, 121.7558),
  },
  {
    id: 'hualien',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(23.9871, 121.6015),
  },
  {
    id: 'taitung',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(22.7549, 121.1504),
  },

  // ── 13 縣（離島）──
  {
    id: 'penghu',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(23.5654, 119.5793),
  },
  {
    id: 'kinmen',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(24.4327, 118.3171),
  },
  {
    id: 'lienchiang',
    region: 'taiwan',
    country: TW,
    timezone: TPE,
    coordinates: coords(26.1602, 119.9492),
  },
] as const)
