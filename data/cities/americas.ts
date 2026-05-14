// 涵蓋美國、加拿大、墨西哥、中南美主要城市
import { assignSortIndex, coords, tz } from './_helpers'

const REGION = 'americas' as const

export const americasCities = assignSortIndex([
  // ── 美國 ──
  {
    id: 'new-york',
    region: REGION,
    country: 'US',
    timezone: tz('America/New_York'),
    coordinates: coords(40.7128, -74.006),
  },
  {
    id: 'washington-dc',
    region: REGION,
    country: 'US',
    timezone: tz('America/New_York'),
    coordinates: coords(38.9072, -77.0369),
  },
  {
    id: 'boston',
    region: REGION,
    country: 'US',
    timezone: tz('America/New_York'),
    coordinates: coords(42.3601, -71.0589),
  },
  {
    id: 'miami',
    region: REGION,
    country: 'US',
    timezone: tz('America/New_York'),
    coordinates: coords(25.7617, -80.1918),
  },
  {
    id: 'chicago',
    region: REGION,
    country: 'US',
    timezone: tz('America/Chicago'),
    coordinates: coords(41.8781, -87.6298),
  },
  {
    id: 'houston',
    region: REGION,
    country: 'US',
    timezone: tz('America/Chicago'),
    coordinates: coords(29.7604, -95.3698),
  },
  {
    id: 'phoenix',
    region: REGION,
    country: 'US',
    timezone: tz('America/Phoenix'),
    coordinates: coords(33.4484, -112.074),
  },
  {
    id: 'las-vegas',
    region: REGION,
    country: 'US',
    timezone: tz('America/Los_Angeles'),
    coordinates: coords(36.1699, -115.1398),
  },
  {
    id: 'los-angeles',
    region: REGION,
    country: 'US',
    timezone: tz('America/Los_Angeles'),
    coordinates: coords(34.0522, -118.2437),
  },
  {
    id: 'san-francisco',
    region: REGION,
    country: 'US',
    timezone: tz('America/Los_Angeles'),
    coordinates: coords(37.7749, -122.4194),
  },
  {
    id: 'san-jose',
    region: REGION,
    country: 'US',
    timezone: tz('America/Los_Angeles'),
    coordinates: coords(37.3382, -121.8863),
  },
  {
    id: 'seattle',
    region: REGION,
    country: 'US',
    timezone: tz('America/Los_Angeles'),
    coordinates: coords(47.6062, -122.3321),
  },
  {
    id: 'honolulu',
    region: REGION,
    country: 'US',
    timezone: tz('Pacific/Honolulu'),
    coordinates: coords(21.3069, -157.8583),
  },

  // ── 加拿大 ──
  {
    id: 'toronto',
    region: REGION,
    country: 'CA',
    timezone: tz('America/Toronto'),
    coordinates: coords(43.6532, -79.3832),
  },
  {
    id: 'montreal',
    region: REGION,
    country: 'CA',
    timezone: tz('America/Toronto'),
    coordinates: coords(45.5017, -73.5673),
  },
  {
    id: 'vancouver',
    region: REGION,
    country: 'CA',
    timezone: tz('America/Vancouver'),
    coordinates: coords(49.2827, -123.1207),
  },

  // ── 中南美 ──
  {
    id: 'mexico-city',
    region: REGION,
    country: 'MX',
    timezone: tz('America/Mexico_City'),
    coordinates: coords(19.4326, -99.1332),
  },
  {
    id: 'sao-paulo',
    region: REGION,
    country: 'BR',
    timezone: tz('America/Sao_Paulo'),
    coordinates: coords(-23.5505, -46.6333),
  },
  {
    id: 'rio-de-janeiro',
    region: REGION,
    country: 'BR',
    timezone: tz('America/Sao_Paulo'),
    coordinates: coords(-22.9068, -43.1729),
  },
  {
    id: 'buenos-aires',
    region: REGION,
    country: 'AR',
    timezone: tz('America/Argentina/Buenos_Aires'),
    coordinates: coords(-34.6037, -58.3816),
  },
] as const)
