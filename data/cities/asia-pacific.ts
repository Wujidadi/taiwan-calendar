// 涵蓋日韓、東南亞、南亞、大洋洲主要城市
import { assignSortIndex, coords, tz } from './_helpers'

const REGION = 'asia-pacific' as const

export const asiaPacificCities = assignSortIndex([
  // ── 日本 ──
  {
    id: 'tokyo',
    region: REGION,
    country: 'JP',
    timezone: tz('Asia/Tokyo'),
    coordinates: coords(35.6762, 139.6503),
  },
  {
    id: 'osaka',
    region: REGION,
    country: 'JP',
    timezone: tz('Asia/Tokyo'),
    coordinates: coords(34.6937, 135.5023),
  },
  {
    id: 'kyoto',
    region: REGION,
    country: 'JP',
    timezone: tz('Asia/Tokyo'),
    coordinates: coords(35.0116, 135.7681),
  },
  {
    id: 'sapporo',
    region: REGION,
    country: 'JP',
    timezone: tz('Asia/Tokyo'),
    coordinates: coords(43.0618, 141.3545),
  },
  {
    id: 'fukuoka',
    region: REGION,
    country: 'JP',
    timezone: tz('Asia/Tokyo'),
    coordinates: coords(33.5904, 130.4017),
  },

  // ── 南韓 ──
  {
    id: 'seoul',
    region: REGION,
    country: 'KR',
    timezone: tz('Asia/Seoul'),
    coordinates: coords(37.5665, 126.978),
  },
  {
    id: 'busan',
    region: REGION,
    country: 'KR',
    timezone: tz('Asia/Seoul'),
    coordinates: coords(35.1796, 129.0756),
  },

  // ── 東南亞 ──
  {
    id: 'singapore',
    region: REGION,
    country: 'SG',
    timezone: tz('Asia/Singapore'),
    coordinates: coords(1.3521, 103.8198),
  },
  {
    id: 'kuala-lumpur',
    region: REGION,
    country: 'MY',
    timezone: tz('Asia/Kuala_Lumpur'),
    coordinates: coords(3.139, 101.6869),
  },
  {
    id: 'bangkok',
    region: REGION,
    country: 'TH',
    timezone: tz('Asia/Bangkok'),
    coordinates: coords(13.7563, 100.5018),
  },
  {
    id: 'jakarta',
    region: REGION,
    country: 'ID',
    timezone: tz('Asia/Jakarta'),
    coordinates: coords(-6.2088, 106.8456),
  },
  {
    id: 'manila',
    region: REGION,
    country: 'PH',
    timezone: tz('Asia/Manila'),
    coordinates: coords(14.5995, 120.9842),
  },
  {
    id: 'hanoi',
    region: REGION,
    country: 'VN',
    timezone: tz('Asia/Ho_Chi_Minh'),
    coordinates: coords(21.0285, 105.8542),
  },
  {
    id: 'ho-chi-minh-city',
    region: REGION,
    country: 'VN',
    timezone: tz('Asia/Ho_Chi_Minh'),
    coordinates: coords(10.8231, 106.6297),
  },

  // ── 南亞 ──
  {
    id: 'new-delhi',
    region: REGION,
    country: 'IN',
    timezone: tz('Asia/Kolkata'),
    coordinates: coords(28.6139, 77.209),
  },
  {
    id: 'mumbai',
    region: REGION,
    country: 'IN',
    timezone: tz('Asia/Kolkata'),
    coordinates: coords(19.076, 72.8777),
  },

  // ── 大洋洲 ──
  {
    id: 'sydney',
    region: REGION,
    country: 'AU',
    timezone: tz('Australia/Sydney'),
    coordinates: coords(-33.8688, 151.2093),
  },
  {
    id: 'melbourne',
    region: REGION,
    country: 'AU',
    timezone: tz('Australia/Melbourne'),
    coordinates: coords(-37.8136, 144.9631),
  },
  {
    id: 'canberra',
    region: REGION,
    country: 'AU',
    timezone: tz('Australia/Sydney'),
    coordinates: coords(-35.2809, 149.13),
  },
  {
    id: 'auckland',
    region: REGION,
    country: 'NZ',
    timezone: tz('Pacific/Auckland'),
    coordinates: coords(-36.8485, 174.7633),
  },
  {
    id: 'wellington',
    region: REGION,
    country: 'NZ',
    timezone: tz('Pacific/Auckland'),
    coordinates: coords(-41.2865, 174.7762),
  },
] as const)
