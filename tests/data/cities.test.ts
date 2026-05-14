// 岱員時憲章 — 城市資料完整性測試
import { allCities, citiesById, citiesByRegion, DEFAULT_CITY_ID, regions } from '#data/cities'
import { describe, expect, it } from 'bun:test'

describe('城市資料', () => {
  it('ID 全為 ASCII 且唯一', () => {
    const ids = allCities.map(c => c.id)
    const set = new Set(ids)
    expect(set.size).toBe(ids.length)
    for (const id of ids) {
      // eslint-disable-next-line no-control-regex
      expect(id).toMatch(/^[\x00-\x7F]+$/)
      expect(id).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('座標範圍合法', () => {
    for (const city of allCities) {
      expect(city.coordinates.latitude).toBeGreaterThan(-90)
      expect(city.coordinates.latitude).toBeLessThan(90)
      expect(city.coordinates.longitude).toBeGreaterThan(-180)
      expect(city.coordinates.longitude).toBeLessThanOrEqual(180)
    }
  })

  it('IANA 時區皆可被 Intl 接受', () => {
    for (const city of allCities) {
      expect(() =>
        new Intl.DateTimeFormat('en-US', { timeZone: city.timezone }).format(new Date()),
      ).not.toThrow()
    }
  })

  it('citiesById 索引完整', () => {
    expect(citiesById.size).toBe(allCities.length)
    for (const city of allCities) {
      expect(citiesById.get(city.id)).toBe(city)
    }
  })

  it('citiesByRegion 各區域非空且為 region 內城市', () => {
    for (const region of regions) {
      const list = citiesByRegion[region.key]
      expect(list.length).toBeGreaterThan(0)
      for (const city of list) {
        expect(city.region).toBe(region.key)
      }
    }
  })

  it('台灣有 22 個一級行政區', () => {
    expect(citiesByRegion.taiwan.length).toBe(22)
  })

  it('預設城市為台北', () => {
    expect(DEFAULT_CITY_ID).toBe('taipei')
    expect(citiesById.get(DEFAULT_CITY_ID)).toBeDefined()
  })

  it('港、澳獨立為兩個區域', () => {
    expect(citiesByRegion['hong-kong'].length).toBe(1)
    expect(citiesByRegion.macau.length).toBe(1)
  })

  it('中國大陸城市數量符合預期（30–40 之間）', () => {
    const count = citiesByRegion['mainland-china'].length
    expect(count).toBeGreaterThanOrEqual(30)
    expect(count).toBeLessThanOrEqual(40)
  })
})
