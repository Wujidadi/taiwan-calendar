// 涵蓋：4 直轄市 + 22 省會 + 5 自治區首府 + 5 副省級城市
// 排序：直轄市 → 省會（依大致地理北至南） → 自治區首府 → 副省級城市
// 時區：除新疆烏魯木齊用 Asia/Urumqi、西藏拉薩用 Asia/Shanghai（中國境內法定統一）外，皆為 Asia/Shanghai
import { assignSortIndex, coords, tz } from './_helpers'

const CN = 'CN'
const SHANGHAI = tz('Asia/Shanghai')
const URUMQI = tz('Asia/Urumqi')

export const mainlandChinaCities = assignSortIndex([
  // ── 4 直轄市 ──
  {
    id: 'beijing',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(39.9042, 116.4074),
  },
  {
    id: 'shanghai',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(31.2304, 121.4737),
  },
  {
    id: 'tianjin',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(39.3434, 117.3616),
  },
  {
    id: 'chongqing',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(29.563, 106.5516),
  },

  // ── 22 省會 ──
  {
    id: 'harbin',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(45.8038, 126.535),
  },
  {
    id: 'changchun',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(43.817, 125.3235),
  },
  {
    id: 'shenyang',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(41.8057, 123.4315),
  },
  {
    id: 'shijiazhuang',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(38.0428, 114.5149),
  },
  {
    id: 'taiyuan',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(37.8706, 112.5511),
  },
  {
    id: 'jinan',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(36.6512, 117.1201),
  },
  {
    id: 'zhengzhou',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(34.7466, 113.6253),
  },
  {
    id: 'xian',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(34.3416, 108.9398),
  },
  {
    id: 'lanzhou',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(36.0611, 103.8343),
  },
  {
    id: 'xining',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(36.6171, 101.7782),
  },
  {
    id: 'nanjing',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(32.0603, 118.7969),
  },
  {
    id: 'hefei',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(31.8206, 117.2272),
  },
  {
    id: 'hangzhou',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(30.2741, 120.1551),
  },
  {
    id: 'wuhan',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(30.5928, 114.3055),
  },
  {
    id: 'chengdu',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(30.5728, 104.0668),
  },
  {
    id: 'changsha',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(28.2278, 112.9388),
  },
  {
    id: 'nanchang',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(28.6829, 115.858),
  },
  {
    id: 'fuzhou',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(26.0745, 119.2965),
  },
  {
    id: 'guiyang',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(26.647, 106.6302),
  },
  {
    id: 'kunming',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(24.8801, 102.8329),
  },
  {
    id: 'guangzhou',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(23.1291, 113.2644),
  },
  {
    id: 'haikou',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(20.044, 110.1989),
  },

  // ── 5 自治區首府 ──
  {
    id: 'hohhot',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(40.8424, 111.7497),
  },
  {
    id: 'yinchuan',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(38.4872, 106.2308),
  },
  {
    id: 'urumqi',
    region: 'mainland-china',
    country: CN,
    timezone: URUMQI,
    coordinates: coords(43.8256, 87.6168),
  },
  {
    id: 'lhasa',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(29.65, 91.1),
  },
  {
    id: 'nanning',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(22.817, 108.3669),
  },

  // ── 5 副省級城市 ──
  {
    id: 'dalian',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(38.914, 121.6147),
  },
  {
    id: 'qingdao',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(36.0671, 120.3826),
  },
  {
    id: 'ningbo',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(29.8683, 121.544),
  },
  {
    id: 'xiamen',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(24.4798, 118.0894),
  },
  {
    id: 'shenzhen',
    region: 'mainland-china',
    country: CN,
    timezone: SHANGHAI,
    coordinates: coords(22.5429, 114.0596),
  },
] as const)
