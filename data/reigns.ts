// 涵蓋：
// - 民國（1912 至今、不設終止）
// - 清朝全套 11 年號（順治 → 宣統）
// - 明朝全套 17 年號（洪武 → 崇禎）
// - 元朝、南宋、北宋、唐、隋、漢 主要年號
//
// 至少滿足 1900–2099 連續無缺口（光緒 → 宣統 → 民國）。
// 1911 年以前其他朝代之缺漏，待後續批次擴充。
import type { ReignTitle } from '#types/time'

export const reigns: readonly ReignTitle[] = [
  // ── 中華民國 ──
  { id: 'minguo', dynasty: 'roc', startYear: 1912, endYear: null },

  // ── 清 ──
  { id: 'shunzhi', dynasty: 'qing', startYear: 1644, endYear: 1661 },
  { id: 'kangxi', dynasty: 'qing', startYear: 1662, endYear: 1722 },
  { id: 'yongzheng', dynasty: 'qing', startYear: 1723, endYear: 1735 },
  { id: 'qianlong', dynasty: 'qing', startYear: 1736, endYear: 1795 },
  { id: 'jiaqing', dynasty: 'qing', startYear: 1796, endYear: 1820 },
  { id: 'daoguang', dynasty: 'qing', startYear: 1821, endYear: 1850 },
  { id: 'xianfeng', dynasty: 'qing', startYear: 1851, endYear: 1861 },
  { id: 'tongzhi', dynasty: 'qing', startYear: 1862, endYear: 1874 },
  { id: 'guangxu', dynasty: 'qing', startYear: 1875, endYear: 1908 },
  { id: 'xuantong', dynasty: 'qing', startYear: 1909, endYear: 1911 },

  // ── 明 ──
  { id: 'hongwu', dynasty: 'ming', startYear: 1368, endYear: 1398 },
  { id: 'jianwen', dynasty: 'ming', startYear: 1399, endYear: 1402 },
  { id: 'yongle', dynasty: 'ming', startYear: 1403, endYear: 1424 },
  { id: 'hongxi', dynasty: 'ming', startYear: 1425, endYear: 1425 },
  { id: 'xuande', dynasty: 'ming', startYear: 1426, endYear: 1435 },
  { id: 'zhengtong', dynasty: 'ming', startYear: 1436, endYear: 1449 },
  { id: 'jingtai', dynasty: 'ming', startYear: 1450, endYear: 1456 },
  { id: 'tianshun', dynasty: 'ming', startYear: 1457, endYear: 1464 },
  { id: 'chenghua', dynasty: 'ming', startYear: 1465, endYear: 1487 },
  { id: 'hongzhi', dynasty: 'ming', startYear: 1488, endYear: 1505 },
  { id: 'zhengde', dynasty: 'ming', startYear: 1506, endYear: 1521 },
  { id: 'jiajing', dynasty: 'ming', startYear: 1522, endYear: 1566 },
  { id: 'longqing', dynasty: 'ming', startYear: 1567, endYear: 1572 },
  { id: 'wanli', dynasty: 'ming', startYear: 1573, endYear: 1620 },
  { id: 'taichang', dynasty: 'ming', startYear: 1620, endYear: 1620 },
  { id: 'tianqi', dynasty: 'ming', startYear: 1621, endYear: 1627 },
  { id: 'chongzhen', dynasty: 'ming', startYear: 1628, endYear: 1644 },

  // ── 元（主要年號）──
  { id: 'zhongtong', dynasty: 'yuan', startYear: 1260, endYear: 1263 },
  { id: 'zhiyuan-shizu', dynasty: 'yuan', startYear: 1264, endYear: 1294 },
  { id: 'dade', dynasty: 'yuan', startYear: 1297, endYear: 1307 },
  { id: 'zhizheng', dynasty: 'yuan', startYear: 1341, endYear: 1370 },

  // ── 南宋（主要年號）──
  { id: 'jianyan-song', dynasty: 'song-southern', startYear: 1127, endYear: 1130 },
  { id: 'shaoxing', dynasty: 'song-southern', startYear: 1131, endYear: 1162 },
  { id: 'jiading', dynasty: 'song-southern', startYear: 1208, endYear: 1224 },
  { id: 'xianchun', dynasty: 'song-southern', startYear: 1265, endYear: 1274 },

  // ── 北宋（主要年號）──
  { id: 'jianlong', dynasty: 'song-northern', startYear: 960, endYear: 963 },
  { id: 'taipingxingguo', dynasty: 'song-northern', startYear: 976, endYear: 984 },
  { id: 'qingli', dynasty: 'song-northern', startYear: 1041, endYear: 1048 },
  { id: 'yuanfeng', dynasty: 'song-northern', startYear: 1078, endYear: 1085 },

  // ── 唐（主要年號）──
  { id: 'wude', dynasty: 'tang', startYear: 618, endYear: 626 },
  { id: 'zhenguan', dynasty: 'tang', startYear: 627, endYear: 649 },
  { id: 'yonghui', dynasty: 'tang', startYear: 650, endYear: 655 },
  { id: 'kaiyuan', dynasty: 'tang', startYear: 713, endYear: 741 },
  { id: 'tianbao', dynasty: 'tang', startYear: 742, endYear: 756 },
  { id: 'zhenyuan', dynasty: 'tang', startYear: 785, endYear: 805 },

  // ── 隋（主要年號）──
  { id: 'kaihuang', dynasty: 'sui', startYear: 581, endYear: 600 },
  { id: 'daye', dynasty: 'sui', startYear: 605, endYear: 618 },

  // ── 漢（主要年號）──
  // 漢武帝建元（公元前 140 起）：本表暫不涵蓋公元前年號
  { id: 'jianwu', dynasty: 'han-eastern', startYear: 25, endYear: 56 },
  { id: 'yongping', dynasty: 'han-eastern', startYear: 58, endYear: 75 },
] as const

/** ID → ReignTitle */
export const reignsById: ReadonlyMap<string, ReignTitle> = new Map(reigns.map(r => [r.id, r]))

/**
 * 依公元年查找對應年號。
 * 若多個年號區間涵蓋同一年（如改元當年），回傳第一個匹配；
 * 邊界處理由使用方依需求決定。
 */
export function findReignByYear(year: number): ReignTitle | undefined {
  return reigns.find(r => r.startYear <= year && (r.endYear === null || year <= r.endYear))
}
