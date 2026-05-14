import { assignSortIndex, coords, tz } from './_helpers'

const REGION = 'europe' as const

export const europeCities = assignSortIndex([
  // ── 西歐 ──
  {
    id: 'london',
    region: REGION,
    country: 'GB',
    timezone: tz('Europe/London'),
    coordinates: coords(51.5074, -0.1278),
  },
  {
    id: 'paris',
    region: REGION,
    country: 'FR',
    timezone: tz('Europe/Paris'),
    coordinates: coords(48.8566, 2.3522),
  },
  {
    id: 'amsterdam',
    region: REGION,
    country: 'NL',
    timezone: tz('Europe/Amsterdam'),
    coordinates: coords(52.3676, 4.9041),
  },
  {
    id: 'brussels',
    region: REGION,
    country: 'BE',
    timezone: tz('Europe/Brussels'),
    coordinates: coords(50.8503, 4.3517),
  },

  // ── 中歐 ──
  {
    id: 'berlin',
    region: REGION,
    country: 'DE',
    timezone: tz('Europe/Berlin'),
    coordinates: coords(52.52, 13.405),
  },
  {
    id: 'munich',
    region: REGION,
    country: 'DE',
    timezone: tz('Europe/Berlin'),
    coordinates: coords(48.1351, 11.582),
  },
  {
    id: 'frankfurt',
    region: REGION,
    country: 'DE',
    timezone: tz('Europe/Berlin'),
    coordinates: coords(50.1109, 8.6821),
  },
  {
    id: 'zurich',
    region: REGION,
    country: 'CH',
    timezone: tz('Europe/Zurich'),
    coordinates: coords(47.3769, 8.5417),
  },
  {
    id: 'geneva',
    region: REGION,
    country: 'CH',
    timezone: tz('Europe/Zurich'),
    coordinates: coords(46.2044, 6.1432),
  },
  {
    id: 'vienna',
    region: REGION,
    country: 'AT',
    timezone: tz('Europe/Vienna'),
    coordinates: coords(48.2082, 16.3738),
  },

  // ── 南歐 ──
  {
    id: 'madrid',
    region: REGION,
    country: 'ES',
    timezone: tz('Europe/Madrid'),
    coordinates: coords(40.4168, -3.7038),
  },
  {
    id: 'barcelona',
    region: REGION,
    country: 'ES',
    timezone: tz('Europe/Madrid'),
    coordinates: coords(41.3851, 2.1734),
  },
  {
    id: 'lisbon',
    region: REGION,
    country: 'PT',
    timezone: tz('Europe/Lisbon'),
    coordinates: coords(38.7223, -9.1393),
  },
  {
    id: 'rome',
    region: REGION,
    country: 'IT',
    timezone: tz('Europe/Rome'),
    coordinates: coords(41.9028, 12.4964),
  },
  {
    id: 'milan',
    region: REGION,
    country: 'IT',
    timezone: tz('Europe/Rome'),
    coordinates: coords(45.4642, 9.19),
  },

  // ── 北歐 ──
  {
    id: 'stockholm',
    region: REGION,
    country: 'SE',
    timezone: tz('Europe/Stockholm'),
    coordinates: coords(59.3293, 18.0686),
  },
  {
    id: 'copenhagen',
    region: REGION,
    country: 'DK',
    timezone: tz('Europe/Copenhagen'),
    coordinates: coords(55.6761, 12.5683),
  },
  {
    id: 'oslo',
    region: REGION,
    country: 'NO',
    timezone: tz('Europe/Oslo'),
    coordinates: coords(59.9139, 10.7522),
  },
  {
    id: 'helsinki',
    region: REGION,
    country: 'FI',
    timezone: tz('Europe/Helsinki'),
    coordinates: coords(60.1699, 24.9384),
  },

  // ── 東歐 ──
  {
    id: 'moscow',
    region: REGION,
    country: 'RU',
    timezone: tz('Europe/Moscow'),
    coordinates: coords(55.7558, 37.6173),
  },
  {
    id: 'saint-petersburg',
    region: REGION,
    country: 'RU',
    timezone: tz('Europe/Moscow'),
    coordinates: coords(59.9311, 30.3609),
  },
] as const)
