// 岱員時憲章 — 公曆基礎資料

// 月內第 N 個星期 W 的節日表。
// 格式：MMNQ<type><節日名>，其中 MM=月份(2 位)、N=第幾個(0=最後、1-5=順位)、
// Q=星期(0-6)、type=#放假 / I 重要 / . 其他
export const WEEKDAY_FESTIVALS: string[] = [
  '0150I世界痲瘋日',              // 一月的最後一個星期日
  '0520.國際母親節',
  '0530I全國助殘日',
  '0630.父親節',
  '0730.被奴役國家週',
  '0932I國際和平日',
  '0940.國際聾人節 世界兒童日',
  '0950I世界海事日',
  '1011.國際住房日',
  '1013I國際減輕自然災害日（減災日）',
  '1144I感恩節',
]

// 陽曆固定日期節日（依月份，| 分隔）。
// 格式：DD<type><年限範圍?>節日名, ...
// type=# 放假 / I 重要 / . 其他；年限範圍為「-YYYY」字串（如「1989-9999」）。
const SOLAR_DATE_FESTIVALS_RAW =
   '01#元旦|' // 1 月
  +'02I世界濕地日,10.國際氣象節,14I情人節|' // 2 月
  +'01.國際海豹日,03.全國愛耳日,05.1963-9999學雷鋒紀念日,08I婦女節,12I植樹節,12.1925-9999孫中山逝世紀念日,14.國際警察日,'
  +'15I1983-9999消費者權益日,17.中國國醫節,17.國際航海日,21.世界森林日,21.消除種族歧視國際日,21.世界兒歌日,22I世界水日,'
  +'23I世界氣象日,24.1982-9999世界防治結核病日,25.全國中小學生安全教育日,30.巴勒斯坦國土日|'
  +'01I1564-9999愚人節,01.全國愛國衛生運動月（四月）,01.稅收宣傳月（四月）,07I世界衛生日,22I世界地球日,23.世界圖書和版權日,24.亞非新聞工作者日|'
  +'01#1889-9999勞動節,04I青年節,05.碘缺乏病防治日,08.世界紅十字日,12I國際護士節,15I國際家庭日,17.國際電信日,18.國際博物館日,'
  +'20.全國學生營養日,23.國際牛奶日,31I世界無菸日|'
  +'01I1925-9999國際兒童節,05.世界環境保護日,06.全國愛眼日,17.防治荒漠化和乾旱日,23.國際奧林匹克日,25.全國土地日,26I國際禁毒日|'
  +'01I1997-9999香港回歸紀念日,01I1921-9999中共誕辰,01.世界建築日,02.國際體育記者日,07I1937-9999抗日戰爭紀念日,11I世界人口日,30.非洲婦女日|'
  +'01I1927-9999建軍節,08.中國男子節（爸爸節）|'
  +'03I1945-9999抗日戰爭勝利紀念,08.1966-9999國際掃盲日,08.國際新聞工作者日,09.毛澤東逝世紀念,10I中國教師節,14.世界清潔地球日,'
  +'16.國際臭氧層保護日,18I九‧一八事變紀念日,20.國際愛牙日,27.世界旅遊日,28I孔子誕辰|'
  +'01#1949-9999國慶日,01.世界音樂日,01.國際老人節,02#1949-9999國慶日假日,02.國際和平與民主自由鬥爭日,03#1949-9999國慶日假日,'
  +'04.世界動物日,06.老人節,08.全國高血壓日,08.世界視覺日,09.世界郵政日,09.萬國郵聯日,10I辛亥革命紀念日,10.世界精神衛生日,'
  +'13.世界保健日,13.國際教師節,14.世界標準日,15.國際盲人節（白手杖節）,16.世界糧食日,17.世界消除貧困日,22.世界傳統醫藥日,24.聯合國日,31.世界勤儉日|'
  +'07.1917-9999十月社會主義革命紀念日,08.中國記者日,09.全國消防安全宣傳教育日,10.世界青年節,11.國際科學與和平週（本日所屬的一週）,12.孫中山誕辰紀念日,'
  +'14.世界糖尿病日,17.國際大學生節,17.世界學生節,20.彝族年,21.彝族年,21.世界問候日,21.世界電視日,22.彝族年,29.國際聲援巴勒斯坦人民國際日|'
  +'01I1988-9999世界愛滋病日,03.世界殘疾人日,05.國際經濟和社會發展志願人員日,08.國際兒童電視日,09.世界足球日,10.世界人權日,'
  +'12I西安事變紀念日,13I南京大屠殺（1937 年）紀念日,20.澳門回歸紀念,21.國際籃球日,24I平安夜,25I聖誕節,26.毛澤東誕辰紀念'

export const SOLAR_DATE_FESTIVALS: string[][] = SOLAR_DATE_FESTIVALS_RAW.split('|').map((s) => s.split(','))

// 取某日節日（公曆）。
//   u 為日物件，必須含 year / month / day / weekday / weekIndex / firstWeekday / weekCount。
//   r 為輸出物件，會追加 holidayA / holidayB / holidayC 字串、isHoliday 旗標。
export function getDayName(u: Record<string, unknown>, r: Record<string, unknown>): void {
  const m0 = (Number(u['month']) < 10 ? '0' : '') + String(u['month'])
  const d0 = (Number(u['day'])   < 10 ? '0' : '') + String(u['day'])

  if (Number(u['weekday']) === 0 || Number(u['weekday']) === 6) r['isHoliday'] = 1

  // 按公曆日期查找
  const monthFtv = SOLAR_DATE_FESTIVALS[Number(u['month']) - 1]!
  for (let i = 0; i < monthFtv.length; i++) {
    let s = monthFtv[i]!
    if (s.substring(0, 2) !== d0) continue
    s = s.substring(2)
    const type = s.substring(0, 1)
    if (s.substring(5, 6) === '-') {
      if (Number(u['year']) < Number(s.substring(1, 5)) || Number(u['year']) > Number(s.substring(6, 10))) continue
      s = s.substring(10)
    } else {
      if (Number(u['year']) < 1850) continue
      s = s.substring(1)
    }
    if (type === '#') { r['holidayA'] = String(r['holidayA']) + s + ' '; r['isHoliday'] = 1 }
    if (type === 'I')   r['holidayB'] = String(r['holidayB']) + s + ' '
    if (type === '.')   r['holidayC'] = String(r['holidayC']) + s + ' '
  }

  // 按週查找：本月的第 N 個星期 W
  let w = Number(u['weekIndex']); if (Number(u['weekday']) >= Number(u['firstWeekday'])) w += 1
  let w2 = w; if (Number(u['weekIndex']) === Number(u['weekCount']) - 1) w2 = 5
  const wKey  = m0 + w  + String(u['weekday'])
  const w2Key = m0 + w2 + String(u['weekday'])

  for (let i = 0; i < WEEKDAY_FESTIVALS.length; i++) {
    let s = WEEKDAY_FESTIVALS[i]!
    const s2 = s.substring(0, 4)
    if (s2 !== wKey && s2 !== w2Key) continue
    const type = s.substring(4, 5)
    s = s.substring(5)
    if (type === '#') { r['holidayA'] = String(r['holidayA']) + s + ' '; r['isHoliday'] = 1 }
    if (type === 'I')   r['holidayB'] = String(r['holidayB']) + s + ' '
    if (type === '.')   r['holidayC'] = String(r['holidayC']) + s + ' '
  }
}

// 回曆（伊斯蘭曆）換算。d0 為 J2000 起算的儒略日（北京中午 12 時）。
// 結果寫入 r.hijriYear / r.hijriMonth / r.hijriDay。
export function getHijriDate(d0: number, r: Record<string, unknown>): void {
  let d = d0 + 503105
  const z = Math.floor(d / 10631) // 10631 為一週期（30 年）
  d -= z * 10631
  const y = Math.floor((d + 0.5) / 354.366) // +0.5 保證閏年正確
  d -= Math.floor(y * 354.366 + 0.5)
  const m = Math.floor((d + 0.11) / 29.51) // +0.11 / +0.01 使第 354–355 天保持為 12 月
  d -= Math.floor(m * 29.5 + 0.5)
  r['hijriYear']  = z * 30 + y + 1
  r['hijriMonth'] = m + 1
  r['hijriDay']   = d + 1
}
