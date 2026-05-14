// 岱員時憲章 — 節日資料完整性測試
import { festivals, festivalsById } from '#data/festivals'
import { solarTerms, solarTermsById } from '#data/solar-terms'
import { describe, expect, it } from 'bun:test'

describe('節日資料', () => {
  it('ID 唯一且全為 ASCII', () => {
    const ids = festivals.map(f => f.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('regions 陣列至少有一個區域標籤', () => {
    for (const f of festivals) {
      expect(f.regions.length).toBeGreaterThan(0)
    }
  })

  it('兩岸同名異日節日皆已分立為兩個 ID', () => {
    const ids = new Set(festivals.map(f => f.id))
    expect(ids.has('tw-youth-day')).toBe(true)
    expect(ids.has('cn-youth-day')).toBe(true)
    expect(ids.has('tw-teacher-day')).toBe(true)
    expect(ids.has('cn-teacher-day')).toBe(true)
    expect(ids.has('tw-national-day')).toBe(true)
    expect(ids.has('cn-national-day')).toBe(true)
    expect(ids.has('tw-children-day')).toBe(true)
    expect(ids.has('cn-children-day')).toBe(true)
  })

  it('台灣國定假日有 6 個（不含 lunar-new-year/dragon-boat/mid-autumn 之 cross-strait）', () => {
    const twStatutory = festivals.filter(f => f.category === 'tw-statutory')
    expect(twStatutory.length).toBe(6)
  })

  it('festivalsById 索引完整', () => {
    expect(festivalsById.size).toBe(festivals.length)
  })
})

describe('二十四節氣', () => {
  it('共 24 條', () => {
    expect(solarTerms.length).toBe(24)
  })

  it('索引從 0 連續到 23', () => {
    const indexes = [...solarTerms].map(t => t.index).sort((a, b) => a - b)
    expect(indexes).toEqual([...Array.from({ length: 24 }, (_, i) => i)])
  })

  it('太陽黃經為 0–360 範圍且間距 15°', () => {
    for (const t of solarTerms) {
      expect(t.solarLongitude).toBeGreaterThanOrEqual(0)
      expect(t.solarLongitude).toBeLessThan(360)
      expect(t.solarLongitude % 15).toBe(0)
    }
  })

  it('索引 0 為冬至，索引 12 為夏至', () => {
    expect(solarTermsById.get('dongzhi')?.index).toBe(0)
    expect(solarTermsById.get('xiazhi')?.index).toBe(12)
  })
})
