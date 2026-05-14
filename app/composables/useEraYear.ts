// 岱員時憲章 — 年份顯示（依語系切換曆元）
import { useI18n } from 'vue-i18n'

export function useEraYear() {
  const { t, locale } = useI18n()

  function eraYear(year: number): string {
    if (locale.value === 'zh-tw') {
      if (year >= 1912) return `${t('era.roc')} ${year - 1911} 年`
      if (year > 0)  return `${t('era.gregorian')} ${year} 年`
      return `${t('era.bc')} ${1 - year} 年`
    }
    if (year > 0) return String(year)
    return `${1 - year} BC`
  }

  return { eraYear }
}
