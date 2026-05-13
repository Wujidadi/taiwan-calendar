// 岱員時憲章 — 節日資料
// 涵蓋：台灣國定假日、紀念日、民俗節日、兩岸共通、國際節日、宗教節日、傳統氣候事件
// 二十四節氣請見 ./solar-terms.ts，此處不重複收錄
//
// 兩岸同名異日的節日（青年節、兒童節、教師節、國慶日）以個別 id 區分
import type { Festival } from '#types/festival'

export const festivals: readonly Festival[] = [
  // ── 台灣國定假日 ──
  {
    id: 'tw-new-year',
    category: 'tw-statutory',
    regions: ['tw'],
    dateRule: { kind: 'gregorian-fixed', month: 1, day: 1 },
  },
  {
    id: 'tw-228-memorial',
    category: 'tw-statutory',
    regions: ['tw'],
    dateRule: { kind: 'gregorian-fixed', month: 2, day: 28 },
  },
  {
    id: 'tw-children-day',
    category: 'tw-statutory',
    regions: ['tw'],
    dateRule: { kind: 'gregorian-fixed', month: 4, day: 4 },
  },
  {
    id: 'tw-qingming',
    category: 'tw-statutory',
    regions: ['tw'],
    dateRule: { kind: 'solar-term', termIndex: 7 }, // 清明
  },
  {
    id: 'tw-labor-day',
    category: 'tw-statutory',
    regions: ['tw'],
    dateRule: { kind: 'gregorian-fixed', month: 5, day: 1 },
  },
  {
    id: 'tw-national-day',
    category: 'tw-statutory',
    regions: ['tw'],
    dateRule: { kind: 'gregorian-fixed', month: 10, day: 10 },
  },

  // ── 兩岸共通國定假日（同名同日）──
  {
    id: 'lunar-new-year',
    category: 'cross-strait',
    regions: ['tw', 'hk', 'mo', 'cn'],
    dateRule: { kind: 'lunar-fixed', month: 1, day: 1 },
  },
  {
    id: 'dragon-boat',
    category: 'cross-strait',
    regions: ['tw', 'hk', 'mo', 'cn'],
    dateRule: { kind: 'lunar-fixed', month: 5, day: 5 },
  },
  {
    id: 'mid-autumn',
    category: 'cross-strait',
    regions: ['tw', 'hk', 'mo', 'cn'],
    dateRule: { kind: 'lunar-fixed', month: 8, day: 15 },
  },

  // ── 台灣紀念日（非假日）──
  {
    id: 'tw-youth-day',
    category: 'tw-memorial',
    regions: ['tw'],
    dateRule: { kind: 'gregorian-fixed', month: 3, day: 29 }, // 青年節（台）
  },
  {
    id: 'tw-teacher-day',
    category: 'tw-memorial',
    regions: ['tw'],
    dateRule: { kind: 'gregorian-fixed', month: 9, day: 28 }, // 教師節（台、孔子誕辰）
  },
  {
    id: 'tw-founders-day',
    category: 'tw-memorial',
    regions: ['tw'],
    dateRule: { kind: 'gregorian-fixed', month: 11, day: 12 }, // 國父誕辰紀念日
  },
  {
    id: 'tw-constitution-day',
    category: 'tw-memorial',
    regions: ['tw'],
    dateRule: { kind: 'gregorian-fixed', month: 12, day: 25 }, // 行憲紀念日
  },

  // ── 台灣民俗節日（兩岸共通的民俗，但顯示為 tw-folk）──
  {
    id: 'lantern-festival',
    category: 'tw-folk',
    regions: ['tw', 'hk', 'mo', 'cn'],
    dateRule: { kind: 'lunar-fixed', month: 1, day: 15 }, // 元宵節
  },
  {
    id: 'qixi',
    category: 'tw-folk',
    regions: ['tw', 'hk', 'mo', 'cn'],
    dateRule: { kind: 'lunar-fixed', month: 7, day: 7 }, // 七夕
  },
  {
    id: 'ghost-festival',
    category: 'tw-folk',
    regions: ['tw', 'hk', 'mo', 'cn'],
    dateRule: { kind: 'lunar-fixed', month: 7, day: 15 }, // 中元節
  },
  {
    id: 'double-ninth',
    category: 'tw-folk',
    regions: ['tw', 'hk', 'mo', 'cn'],
    dateRule: { kind: 'lunar-fixed', month: 9, day: 9 }, // 重陽節
  },

  // ── 中國大陸國定假日（與台灣同名異日者）──
  {
    id: 'cn-youth-day',
    category: 'cn-statutory',
    regions: ['cn'],
    dateRule: { kind: 'gregorian-fixed', month: 5, day: 4 }, // 青年節（中，五四運動）
  },
  {
    id: 'cn-children-day',
    category: 'cn-statutory',
    regions: ['cn'],
    dateRule: { kind: 'gregorian-fixed', month: 6, day: 1 }, // 兒童節（中，國際）
  },
  {
    id: 'cn-teacher-day',
    category: 'cn-statutory',
    regions: ['cn'],
    dateRule: { kind: 'gregorian-fixed', month: 9, day: 10 }, // 教師節（中）
  },
  {
    id: 'cn-national-day',
    category: 'cn-statutory',
    regions: ['cn'],
    dateRule: { kind: 'gregorian-fixed', month: 10, day: 1 }, // 中華人民共和國國慶日
  },

  // ── 國際性節日 ──
  {
    id: 'valentines-day',
    category: 'international',
    regions: ['global'],
    dateRule: { kind: 'gregorian-fixed', month: 2, day: 14 },
  },
  {
    id: 'womens-day',
    category: 'international',
    regions: ['global'],
    dateRule: { kind: 'gregorian-fixed', month: 3, day: 8 },
  },
  {
    id: 'mothers-day',
    category: 'international',
    regions: ['global'],
    dateRule: { kind: 'gregorian-nth-weekday', month: 5, weekday: 0, nth: 2 }, // 5 月第二個週日
  },
  {
    id: 'fathers-day-tw',
    category: 'international',
    regions: ['tw'],
    dateRule: { kind: 'gregorian-fixed', month: 8, day: 8 }, // 台灣父親節 8/8（諧音）
  },
  {
    id: 'fathers-day-intl',
    category: 'international',
    regions: ['global'],
    dateRule: { kind: 'gregorian-nth-weekday', month: 6, weekday: 0, nth: 3 }, // 國際父親節 6 月第三個週日
  },
  {
    id: 'halloween',
    category: 'international',
    regions: ['global'],
    dateRule: { kind: 'gregorian-fixed', month: 10, day: 31 },
  },

  // ── 宗教節日 ──
  {
    id: 'christmas',
    category: 'religious',
    regions: ['global'],
    dateRule: { kind: 'gregorian-fixed', month: 12, day: 25 },
  },
  {
    id: 'easter',
    category: 'religious',
    regions: ['global'],
    dateRule: { kind: 'computed', computeId: 'easter' }, // 由演算法計算
  },

  // ── 傳統氣候事件（非節日）──
  {
    id: 'rufu',
    category: 'climate',
    regions: ['tw', 'cn', 'hk', 'mo'],
    dateRule: { kind: 'computed', computeId: 'rufu' }, // 初伏
  },
  {
    id: 'zhongfu',
    category: 'climate',
    regions: ['tw', 'cn', 'hk', 'mo'],
    dateRule: { kind: 'computed', computeId: 'zhongfu' }, // 中伏
  },
  {
    id: 'mofu',
    category: 'climate',
    regions: ['tw', 'cn', 'hk', 'mo'],
    dateRule: { kind: 'computed', computeId: 'mofu' }, // 末伏
  },
  {
    id: 'rumei',
    category: 'climate',
    regions: ['tw', 'cn', 'hk', 'mo'],
    dateRule: { kind: 'computed', computeId: 'rumei' }, // 入梅
  },
  {
    id: 'chumei',
    category: 'climate',
    regions: ['tw', 'cn', 'hk', 'mo'],
    dateRule: { kind: 'computed', computeId: 'chumei' }, // 出梅
  },
  {
    id: 'shujiu',
    category: 'climate',
    regions: ['tw', 'cn', 'hk', 'mo'],
    dateRule: { kind: 'computed', computeId: 'shujiu' }, // 數九（冬至起每九天一段）
  },
] as const

/** ID → Festival */
export const festivalsById: ReadonlyMap<string, Festival> = new Map(festivals.map(f => [f.id, f]))
