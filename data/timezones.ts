// 以 IANA tzdb 為基準。實際時間換算由 Intl.DateTimeFormat / Temporal API 處理；
// 此處只儲存「給人看」與「給程式分類」的 metadata。
//
// 排序：以台北為首，依大致經度與政治區別排列。
import type { IanaTimezone } from '#types/geography'
import type { TimezoneEntry } from '#types/time'

function tz(iana: string): IanaTimezone {
  return iana as IanaTimezone
}

export const timezones: readonly TimezoneEntry[] = [
  // ── UTC+8 區（台灣本位）──
  {
    id: 'taipei-time',
    iana: tz('Asia/Taipei'),
    utcOffsetHours: 8,
    hasDst: false,
    representativeCity: 'taipei',
  },
  {
    id: 'hong-kong-time',
    iana: tz('Asia/Hong_Kong'),
    utcOffsetHours: 8,
    hasDst: false,
    representativeCity: 'hong-kong',
  },
  {
    id: 'macau-time',
    iana: tz('Asia/Macau'),
    utcOffsetHours: 8,
    hasDst: false,
    representativeCity: 'macau',
  },
  {
    id: 'shanghai-time',
    iana: tz('Asia/Shanghai'),
    utcOffsetHours: 8,
    hasDst: false,
    representativeCity: 'beijing',
  },
  {
    id: 'singapore-time',
    iana: tz('Asia/Singapore'),
    utcOffsetHours: 8,
    hasDst: false,
    representativeCity: 'singapore',
  },
  {
    id: 'kuala-lumpur-time',
    iana: tz('Asia/Kuala_Lumpur'),
    utcOffsetHours: 8,
    hasDst: false,
    representativeCity: 'kuala-lumpur',
  },
  {
    id: 'manila-time',
    iana: tz('Asia/Manila'),
    utcOffsetHours: 8,
    hasDst: false,
    representativeCity: 'manila',
  },
  {
    id: 'perth-time',
    iana: tz('Australia/Perth'),
    utcOffsetHours: 8,
    hasDst: false,
    representativeCity: 'sydney', // Perth 未列為城市；以最近的代表城代
  },

  // ── UTC+9 區 ──
  {
    id: 'tokyo-time',
    iana: tz('Asia/Tokyo'),
    utcOffsetHours: 9,
    hasDst: false,
    representativeCity: 'tokyo',
  },
  {
    id: 'seoul-time',
    iana: tz('Asia/Seoul'),
    utcOffsetHours: 9,
    hasDst: false,
    representativeCity: 'seoul',
  },

  // ── UTC+7 區 ──
  {
    id: 'bangkok-time',
    iana: tz('Asia/Bangkok'),
    utcOffsetHours: 7,
    hasDst: false,
    representativeCity: 'bangkok',
  },
  {
    id: 'jakarta-time',
    iana: tz('Asia/Jakarta'),
    utcOffsetHours: 7,
    hasDst: false,
    representativeCity: 'jakarta',
  },
  {
    id: 'ho-chi-minh-time',
    iana: tz('Asia/Ho_Chi_Minh'),
    utcOffsetHours: 7,
    hasDst: false,
    representativeCity: 'hanoi',
  },

  // ── UTC+5:30 / +6 / +6:30 區（南亞）──
  {
    id: 'kolkata-time',
    iana: tz('Asia/Kolkata'),
    utcOffsetHours: 5.5,
    hasDst: false,
    representativeCity: 'new-delhi',
  },
  {
    id: 'dhaka-time',
    iana: tz('Asia/Dhaka'),
    utcOffsetHours: 6,
    hasDst: false,
    representativeCity: 'dhaka',
  },
  {
    id: 'kathmandu-time',
    iana: tz('Asia/Kathmandu'),
    utcOffsetHours: 5.75,
    hasDst: false,
    representativeCity: 'kathmandu',
  },
  {
    id: 'yangon-time',
    iana: tz('Asia/Yangon'),
    utcOffsetHours: 6.5,
    hasDst: false,
    representativeCity: 'naypyidaw',
  },

  // ── UTC+4 / +5 區（中亞 / 中東）──
  {
    id: 'dubai-time',
    iana: tz('Asia/Dubai'),
    utcOffsetHours: 4,
    hasDst: false,
    representativeCity: 'abu-dhabi',
  },
  {
    id: 'tehran-time',
    iana: tz('Asia/Tehran'),
    utcOffsetHours: 3.5,
    hasDst: true, // 伊朗自 2022 起暫停 DST，本欄留 true 以提醒檢查
    representativeCity: 'tehran', // 未列為城市；保留代號待擴充
  },
  {
    id: 'tashkent-time',
    iana: tz('Asia/Tashkent'),
    utcOffsetHours: 5,
    hasDst: false,
    representativeCity: 'tashkent',
  },
  {
    id: 'urumqi-time',
    iana: tz('Asia/Urumqi'),
    utcOffsetHours: 6,
    hasDst: false,
    representativeCity: 'urumqi',
  },

  // ── UTC+3 區 ──
  {
    id: 'moscow-time',
    iana: tz('Europe/Moscow'),
    utcOffsetHours: 3,
    hasDst: false,
    representativeCity: 'moscow',
  },
  {
    id: 'istanbul-time',
    iana: tz('Europe/Istanbul'),
    utcOffsetHours: 3,
    hasDst: false,
    representativeCity: 'ankara',
  },
  {
    id: 'jerusalem-time',
    iana: tz('Asia/Jerusalem'),
    utcOffsetHours: 2,
    hasDst: true,
    representativeCity: 'jerusalem',
  },
  {
    id: 'cairo-time',
    iana: tz('Africa/Cairo'),
    utcOffsetHours: 2,
    hasDst: true,
    representativeCity: 'cairo',
  },

  // ── UTC+1 / +2 區（歐洲大陸）──
  {
    id: 'paris-time',
    iana: tz('Europe/Paris'),
    utcOffsetHours: 1,
    hasDst: true,
    representativeCity: 'paris',
  },
  {
    id: 'berlin-time',
    iana: tz('Europe/Berlin'),
    utcOffsetHours: 1,
    hasDst: true,
    representativeCity: 'berlin',
  },
  {
    id: 'amsterdam-time',
    iana: tz('Europe/Amsterdam'),
    utcOffsetHours: 1,
    hasDst: true,
    representativeCity: 'amsterdam',
  },
  {
    id: 'madrid-time',
    iana: tz('Europe/Madrid'),
    utcOffsetHours: 1,
    hasDst: true,
    representativeCity: 'madrid',
  },
  {
    id: 'rome-time',
    iana: tz('Europe/Rome'),
    utcOffsetHours: 1,
    hasDst: true,
    representativeCity: 'rome',
  },
  {
    id: 'zurich-time',
    iana: tz('Europe/Zurich'),
    utcOffsetHours: 1,
    hasDst: true,
    representativeCity: 'zurich',
  },
  {
    id: 'stockholm-time',
    iana: tz('Europe/Stockholm'),
    utcOffsetHours: 1,
    hasDst: true,
    representativeCity: 'stockholm',
  },
  {
    id: 'helsinki-time',
    iana: tz('Europe/Helsinki'),
    utcOffsetHours: 2,
    hasDst: true,
    representativeCity: 'helsinki',
  },

  // ── UTC 0 ──
  {
    id: 'london-time',
    iana: tz('Europe/London'),
    utcOffsetHours: 0,
    hasDst: true,
    representativeCity: 'london',
  },
  {
    id: 'lisbon-time',
    iana: tz('Europe/Lisbon'),
    utcOffsetHours: 0,
    hasDst: true,
    representativeCity: 'lisbon',
  },

  // ── 非洲 ──
  {
    id: 'casablanca-time',
    iana: tz('Africa/Casablanca'),
    utcOffsetHours: 1,
    hasDst: true,
    representativeCity: 'rabat',
  },
  {
    id: 'nairobi-time',
    iana: tz('Africa/Nairobi'),
    utcOffsetHours: 3,
    hasDst: false,
    representativeCity: 'nairobi',
  },
  {
    id: 'johannesburg-time',
    iana: tz('Africa/Johannesburg'),
    utcOffsetHours: 2,
    hasDst: false,
    representativeCity: 'pretoria',
  },
  {
    id: 'lagos-time',
    iana: tz('Africa/Lagos'),
    utcOffsetHours: 1,
    hasDst: false,
    representativeCity: 'abuja',
  },

  // ── 美洲（東 → 西）──
  {
    id: 'sao-paulo-time',
    iana: tz('America/Sao_Paulo'),
    utcOffsetHours: -3,
    hasDst: false,
    representativeCity: 'sao-paulo',
  },
  {
    id: 'buenos-aires-time',
    iana: tz('America/Argentina/Buenos_Aires'),
    utcOffsetHours: -3,
    hasDst: false,
    representativeCity: 'buenos-aires',
  },
  {
    id: 'santiago-time',
    iana: tz('America/Santiago'),
    utcOffsetHours: -4,
    hasDst: true,
    representativeCity: 'santiago',
  },
  {
    id: 'new-york-time',
    iana: tz('America/New_York'),
    utcOffsetHours: -5,
    hasDst: true,
    representativeCity: 'new-york',
  },
  {
    id: 'toronto-time',
    iana: tz('America/Toronto'),
    utcOffsetHours: -5,
    hasDst: true,
    representativeCity: 'toronto',
  },
  {
    id: 'havana-time',
    iana: tz('America/Havana'),
    utcOffsetHours: -5,
    hasDst: true,
    representativeCity: 'havana',
  },
  {
    id: 'chicago-time',
    iana: tz('America/Chicago'),
    utcOffsetHours: -6,
    hasDst: true,
    representativeCity: 'chicago',
  },
  {
    id: 'mexico-city-time',
    iana: tz('America/Mexico_City'),
    utcOffsetHours: -6,
    hasDst: false,
    representativeCity: 'mexico-city',
  },
  {
    id: 'phoenix-time',
    iana: tz('America/Phoenix'),
    utcOffsetHours: -7,
    hasDst: false,
    representativeCity: 'phoenix',
  },
  {
    id: 'los-angeles-time',
    iana: tz('America/Los_Angeles'),
    utcOffsetHours: -8,
    hasDst: true,
    representativeCity: 'los-angeles',
  },
  {
    id: 'vancouver-time',
    iana: tz('America/Vancouver'),
    utcOffsetHours: -8,
    hasDst: true,
    representativeCity: 'vancouver',
  },
  {
    id: 'honolulu-time',
    iana: tz('Pacific/Honolulu'),
    utcOffsetHours: -10,
    hasDst: false,
    representativeCity: 'honolulu',
  },

  // ── 大洋洲 ──
  {
    id: 'sydney-time',
    iana: tz('Australia/Sydney'),
    utcOffsetHours: 10,
    hasDst: true,
    representativeCity: 'sydney',
  },
  {
    id: 'melbourne-time',
    iana: tz('Australia/Melbourne'),
    utcOffsetHours: 10,
    hasDst: true,
    representativeCity: 'melbourne',
  },
  {
    id: 'auckland-time',
    iana: tz('Pacific/Auckland'),
    utcOffsetHours: 12,
    hasDst: true,
    representativeCity: 'auckland',
  },
] as const

/** ID → TimezoneEntry */
export const timezonesById: ReadonlyMap<string, TimezoneEntry> = new Map(
  timezones.map(t => [t.id, t]),
)

/** 預設時區：台北時間 */
export const DEFAULT_TIMEZONE_ID = 'taipei-time'
