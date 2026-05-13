// 岱員時憲章 — 年號資料完整性測試
import { findReignByYear, reigns, reignsById } from '#data/reigns'
import { describe, expect, it } from 'vitest'

describe('年號資料', () => {
  it('ID 唯一且全為 ASCII', () => {
    const ids = reigns.map(r => r.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('每個年號 startYear ≤ endYear（若 endYear 非 null）', () => {
    for (const r of reigns) {
      if (r.endYear !== null) {
        expect(r.startYear).toBeLessThanOrEqual(r.endYear)
      }
    }
  })

  it('1900–2099 連續無缺口可找到對應年號', () => {
    for (let year = 1900; year <= 2099; year++) {
      const r = findReignByYear(year)
      expect(r, `${year} 年找不到對應年號`).toBeDefined()
    }
  })

  it('1912 起對應「民國」年號', () => {
    for (const year of [1912, 1949, 2026, 2099, 3000]) {
      expect(findReignByYear(year)?.id).toBe('minguo')
    }
  })

  it('1900–1908 對應「光緒」', () => {
    expect(findReignByYear(1900)?.id).toBe('guangxu')
    expect(findReignByYear(1908)?.id).toBe('guangxu')
  })

  it('1909–1911 對應「宣統」', () => {
    expect(findReignByYear(1909)?.id).toBe('xuantong')
    expect(findReignByYear(1911)?.id).toBe('xuantong')
  })

  it('reignsById 索引完整', () => {
    expect(reignsById.size).toBe(reigns.length)
  })

  it('民國年號 endYear 為 null（不設終止）', () => {
    const minguo = reignsById.get('minguo')
    expect(minguo).toBeDefined()
    expect(minguo?.endYear).toBe(null)
  })
})
