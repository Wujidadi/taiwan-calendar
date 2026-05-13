// 岱員時憲章 — 二十四節氣
// 索引：0 = 冬至，依太陽黃經 270° 每 15° 一節氣，向後遞推。
// 實際每年的節氣時刻由天文演算法（M2）計算，這裡只儲存名稱與黃經。
import type { SolarTerm } from '#types/festival'

export const solarTerms: readonly SolarTerm[] = [
  { id: 'dongzhi', index: 0, solarLongitude: 270 }, // 冬至
  { id: 'xiaohan', index: 1, solarLongitude: 285 }, // 小寒
  { id: 'dahan', index: 2, solarLongitude: 300 }, // 大寒
  { id: 'lichun', index: 3, solarLongitude: 315 }, // 立春
  { id: 'yushui', index: 4, solarLongitude: 330 }, // 雨水
  { id: 'jingzhe', index: 5, solarLongitude: 345 }, // 驚蟄
  { id: 'chunfen', index: 6, solarLongitude: 0 }, // 春分
  { id: 'qingming', index: 7, solarLongitude: 15 }, // 清明
  { id: 'guyu', index: 8, solarLongitude: 30 }, // 穀雨
  { id: 'lixia', index: 9, solarLongitude: 45 }, // 立夏
  { id: 'xiaoman', index: 10, solarLongitude: 60 }, // 小滿
  { id: 'mangzhong', index: 11, solarLongitude: 75 }, // 芒種
  { id: 'xiazhi', index: 12, solarLongitude: 90 }, // 夏至
  { id: 'xiaoshu', index: 13, solarLongitude: 105 }, // 小暑
  { id: 'dashu', index: 14, solarLongitude: 120 }, // 大暑
  { id: 'liqiu', index: 15, solarLongitude: 135 }, // 立秋
  { id: 'chushu', index: 16, solarLongitude: 150 }, // 處暑
  { id: 'bailu', index: 17, solarLongitude: 165 }, // 白露
  { id: 'qiufen', index: 18, solarLongitude: 180 }, // 秋分
  { id: 'hanlu', index: 19, solarLongitude: 195 }, // 寒露
  { id: 'shuangjiang', index: 20, solarLongitude: 210 }, // 霜降
  { id: 'lidong', index: 21, solarLongitude: 225 }, // 立冬
  { id: 'xiaoxue', index: 22, solarLongitude: 240 }, // 小雪
  { id: 'daxue', index: 23, solarLongitude: 255 }, // 大雪
] as const

/** ID → SolarTerm */
export const solarTermsById: ReadonlyMap<string, SolarTerm> = new Map(
  solarTerms.map(t => [t.id, t]),
)

/** Index → SolarTerm */
export const solarTermsByIndex: readonly SolarTerm[] = [...solarTerms].sort(
  (a, b) => a.index - b.index,
)
