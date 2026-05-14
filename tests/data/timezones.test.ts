// 岱員時憲章 — 時區資料完整性測試
import { citiesById } from '#data/cities'
import { DEFAULT_TIMEZONE_ID, timezones, timezonesById } from '#data/timezones'
import { describe, expect, it } from 'bun:test'

describe('時區資料', () => {
  it('ID 全為 ASCII 且唯一', () => {
    const ids = timezones.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('IANA 時區可被 Intl 接受', () => {
    for (const t of timezones) {
      expect(() =>
        new Intl.DateTimeFormat('en-US', { timeZone: t.iana }).format(new Date()),
      ).not.toThrow()
    }
  })

  it('UTC offset 在合理範圍內 (−12 到 +14)', () => {
    for (const t of timezones) {
      expect(t.utcOffsetHours).toBeGreaterThanOrEqual(-12)
      expect(t.utcOffsetHours).toBeLessThanOrEqual(14)
    }
  })

  it('代表城市的 ID 對應到資料庫中的城市（或為已知例外）', () => {
    const knownExceptions = new Set(['tehran']) // 尚未列入城市清單者
    for (const t of timezones) {
      if (knownExceptions.has(t.representativeCity)) continue
      expect(
        citiesById.has(t.representativeCity),
        `${t.id} 的代表城市 ${t.representativeCity} 不存在`,
      ).toBe(true)
    }
  })

  it('預設時區為台北時間', () => {
    expect(DEFAULT_TIMEZONE_ID).toBe('taipei-time')
    expect(timezonesById.get(DEFAULT_TIMEZONE_ID)).toBeDefined()
  })
})
