// 涵蓋亞洲（中西亞、南亞、東南亞）、非洲、中南美等非前述清單之國家
// 後續可分批擴充至全球聯合國會員國
import { assignSortIndex, coords, tz } from './_helpers'

const REGION = 'world-capitals' as const

export const worldCapitals = assignSortIndex([
  // ── 中東 ──
  {
    id: 'abu-dhabi',
    region: REGION,
    country: 'AE',
    timezone: tz('Asia/Dubai'),
    coordinates: coords(24.4539, 54.3773),
  },
  {
    id: 'riyadh',
    region: REGION,
    country: 'SA',
    timezone: tz('Asia/Riyadh'),
    coordinates: coords(24.7136, 46.6753),
  },
  {
    id: 'doha',
    region: REGION,
    country: 'QA',
    timezone: tz('Asia/Qatar'),
    coordinates: coords(25.2854, 51.531),
  },
  {
    id: 'ankara',
    region: REGION,
    country: 'TR',
    timezone: tz('Europe/Istanbul'),
    coordinates: coords(39.9334, 32.8597),
  },
  {
    id: 'jerusalem',
    region: REGION,
    country: 'IL',
    timezone: tz('Asia/Jerusalem'),
    coordinates: coords(31.7683, 35.2137),
  },
  {
    id: 'ramallah',
    region: REGION,
    country: 'PS',
    timezone: tz('Asia/Hebron'),
    coordinates: coords(31.9038, 35.2034),
  },

  // ── 中亞 ──
  {
    id: 'astana',
    region: REGION,
    country: 'KZ',
    timezone: tz('Asia/Almaty'),
    coordinates: coords(51.1605, 71.4704),
  },
  {
    id: 'tashkent',
    region: REGION,
    country: 'UZ',
    timezone: tz('Asia/Tashkent'),
    coordinates: coords(41.2995, 69.2401),
  },
  {
    id: 'ulaanbaatar',
    region: REGION,
    country: 'MN',
    timezone: tz('Asia/Ulaanbaatar'),
    coordinates: coords(47.8864, 106.9057),
  },

  // ── 南亞 ──
  {
    id: 'islamabad',
    region: REGION,
    country: 'PK',
    timezone: tz('Asia/Karachi'),
    coordinates: coords(33.6844, 73.0479),
  },
  {
    id: 'dhaka',
    region: REGION,
    country: 'BD',
    timezone: tz('Asia/Dhaka'),
    coordinates: coords(23.8103, 90.4125),
  },
  {
    id: 'kathmandu',
    region: REGION,
    country: 'NP',
    timezone: tz('Asia/Kathmandu'),
    coordinates: coords(27.7172, 85.324),
  },
  {
    id: 'thimphu',
    region: REGION,
    country: 'BT',
    timezone: tz('Asia/Thimphu'),
    coordinates: coords(27.4728, 89.639),
  },
  {
    id: 'colombo',
    region: REGION,
    country: 'LK',
    timezone: tz('Asia/Colombo'),
    coordinates: coords(6.9271, 79.8612),
  },

  // ── 東南亞 ──
  {
    id: 'naypyidaw',
    region: REGION,
    country: 'MM',
    timezone: tz('Asia/Yangon'),
    coordinates: coords(19.7633, 96.0785),
  },
  {
    id: 'phnom-penh',
    region: REGION,
    country: 'KH',
    timezone: tz('Asia/Phnom_Penh'),
    coordinates: coords(11.5564, 104.9282),
  },
  {
    id: 'vientiane',
    region: REGION,
    country: 'LA',
    timezone: tz('Asia/Vientiane'),
    coordinates: coords(17.9757, 102.6331),
  },

  // ── 非洲 ──
  {
    id: 'cairo',
    region: REGION,
    country: 'EG',
    timezone: tz('Africa/Cairo'),
    coordinates: coords(30.0444, 31.2357),
  },
  {
    id: 'rabat',
    region: REGION,
    country: 'MA',
    timezone: tz('Africa/Casablanca'),
    coordinates: coords(34.0209, -6.8416),
  },
  {
    id: 'tunis',
    region: REGION,
    country: 'TN',
    timezone: tz('Africa/Tunis'),
    coordinates: coords(36.8065, 10.1815),
  },
  {
    id: 'abuja',
    region: REGION,
    country: 'NG',
    timezone: tz('Africa/Lagos'),
    coordinates: coords(9.0765, 7.3986),
  },
  {
    id: 'nairobi',
    region: REGION,
    country: 'KE',
    timezone: tz('Africa/Nairobi'),
    coordinates: coords(-1.2921, 36.8219),
  },
  {
    id: 'pretoria',
    region: REGION,
    country: 'ZA',
    timezone: tz('Africa/Johannesburg'),
    coordinates: coords(-25.7479, 28.2293),
  },
  {
    id: 'antananarivo',
    region: REGION,
    country: 'MG',
    timezone: tz('Indian/Antananarivo'),
    coordinates: coords(-18.8792, 47.5079),
  },
  {
    id: 'port-louis',
    region: REGION,
    country: 'MU',
    timezone: tz('Indian/Mauritius'),
    coordinates: coords(-20.1639, 57.5012),
  },

  // ── 中南美 ──
  {
    id: 'havana',
    region: REGION,
    country: 'CU',
    timezone: tz('America/Havana'),
    coordinates: coords(23.1136, -82.3666),
  },
  {
    id: 'kingston',
    region: REGION,
    country: 'JM',
    timezone: tz('America/Jamaica'),
    coordinates: coords(17.9711, -76.7936),
  },
  {
    id: 'bogota',
    region: REGION,
    country: 'CO',
    timezone: tz('America/Bogota'),
    coordinates: coords(4.711, -74.0721),
  },
  {
    id: 'lima',
    region: REGION,
    country: 'PE',
    timezone: tz('America/Lima'),
    coordinates: coords(-12.0464, -77.0428),
  },
  {
    id: 'santiago',
    region: REGION,
    country: 'CL',
    timezone: tz('America/Santiago'),
    coordinates: coords(-33.4489, -70.6693),
  },
] as const)
