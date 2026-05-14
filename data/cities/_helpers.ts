import type {
  City,
  Coordinates,
  Elevation,
  IanaTimezone,
  Latitude,
  Longitude,
} from '#types/geography'

export function coords(latitude: number, longitude: number, elevation?: number): Coordinates {
  return {
    latitude: latitude as Latitude,
    longitude: longitude as Longitude,
    ...(elevation !== undefined ? { elevation: elevation as Elevation } : {}),
  }
}

export function tz(iana: string): IanaTimezone {
  return iana as IanaTimezone
}

export type CityInput = Omit<City, 'sortIndex'> & { sortIndex?: number }

/**
 * 依輸入陣列順序自動分派 sortIndex，避免人工管理連續數字。
 * 若條目已自帶 sortIndex 則保留。
 */
export function assignSortIndex(cities: readonly CityInput[]): readonly City[] {
  return cities.map((c, i) => ({
    ...c,
    sortIndex: c.sortIndex ?? i,
  }))
}
