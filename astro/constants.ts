// 岱員時憲章 — 天文與物理常數
//
// 學術依據：
// - 地球參數：IERS 慣用值
// - AU：IAU 2012 定義（1 AU = 149,597,870,700 m，此處以 km 表示並取小數）
// - 光速：CODATA 真空中光速精確值
// - 章動／恆星時：IAU SOFA conventions
// - VSOP87、ELP-2000 等行星與月球理論：Bretagnon & Francou 1988、Chapront-Touzé & Chapront 1983

// ── 地球參數 ──
/** 地球赤道半徑（km） */
export const EARTH_EQUATORIAL_RADIUS_KM = 6378.1366

/** 地球平均半徑（km），約為赤道半徑 × 0.99834 */
export const EARTH_MEAN_RADIUS_KM = 0.99834 * EARTH_EQUATORIAL_RADIUS_KM

/** 地球極半徑與赤道半徑比值（地球扁率相關） */
export const EARTH_POLAR_EQ_RATIO = 0.99664719

/** 比值平方（章動／視差計算常用） */
export const EARTH_POLAR_EQ_RATIO_SQ = EARTH_POLAR_EQ_RATIO * EARTH_POLAR_EQ_RATIO

// ── 天文距離 ──
/** 天文單位（km） */
export const AU_KM = 1.49597870691e8

/** 太陽視差正弦（地球赤道半徑 / AU） */
export const SIN_SOLAR_PARALLAX = EARTH_EQUATORIAL_RADIUS_KM / AU_KM

/** 太陽視差（弧度） */
export const SOLAR_PARALLAX = Math.asin(SIN_SOLAR_PARALLAX)

// ── 光速與光行時 ──
/** 真空中光速（km/s） */
export const SPEED_OF_LIGHT_KM_S = 299792.458

/** 1 AU 的光行時間，以儒略世紀為單位（用於 VSOP87 視位置修正） */
export const LIGHT_TIME_PER_AU_JCY = AU_KM / SPEED_OF_LIGHT_KM_S / 86400 / 36525

// ── 行星朔望週期（日，序對應 Mercury…Pluto） ──
export const SYNODIC_PERIODS: readonly number[] = [116, 584, 780, 399, 378, 370, 367, 367] as const

// ── 角度轉換常數 ──
/** 弧度轉弧秒係數 */
export const RAD_TO_ARCSEC = (180 * 3600) / Math.PI

/** 弧度轉度係數 */
export const RAD_TO_DEG = 180 / Math.PI

/** 度轉弧度係數 */
export const DEG_TO_RAD = Math.PI / 180

/** 2π */
export const TWO_PI = Math.PI * 2

/** π/2 */
export const HALF_PI = Math.PI / 2

// ── 時間與紀元 ──
/** J2000.0 紀元的儒略日（TT，2000 年 1 月 1 日 12:00 TT） */
export const J2000 = 2451545

/** 1 儒略世紀的天數 */
export const JCY_DAYS = 36525

/** 1 日的秒數 */
export const SECONDS_PER_DAY = 86400

// ── 食相幾何（用於日月食計算） ──
/** 月球本影半徑相對地球半徑的比值（penumbra，半影） */
export const MOON_EARTH_RATIO_PENUMBRA = 0.2725076

/** 月球本影半徑相對地球半徑的比值（umbra，本影） */
export const MOON_EARTH_RATIO_UMBRA = 0.272281

/** 太陽半徑相對地球半徑的比值 */
export const SUN_EARTH_RATIO = 109.1222

/** 太陽視半徑（arcsec，於 1 AU 處） */
export const SUN_RADIUS_ARCSEC = 959.64

/** 月球半影半徑因子（弧秒） */
export const MOON_RADIUS_FACTOR_PENUMBRA =
  MOON_EARTH_RATIO_PENUMBRA * EARTH_EQUATORIAL_RADIUS_KM * 1.0000036 * RAD_TO_ARCSEC

/** 月球本影半徑因子（弧秒） */
export const MOON_RADIUS_FACTOR_UMBRA =
  MOON_EARTH_RATIO_UMBRA * EARTH_EQUATORIAL_RADIUS_KM * 1.0000036 * RAD_TO_ARCSEC
