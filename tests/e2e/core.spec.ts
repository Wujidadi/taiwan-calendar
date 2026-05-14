// 岱員時憲章 — E2E 核心流程測試
// 涵蓋 M5 驗收的 8 個關鍵流程
import { expect, test } from '@playwright/test'

// 等待 Vue 完成客戶端 hydration 後的頁面就緒輔助函式
async function waitReady(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle')
}

// ── 1. 首頁 ──
test('首頁顯示今日日期與農曆資訊', async ({ page }) => {
  await page.goto('/')
  await waitReady(page)
  await expect(page).toHaveTitle(/岱員時憲章/)
  const year = new Date().getFullYear()
  await expect(page.locator('h1')).toContainText(String(year))
  await expect(page.locator('body')).toContainText('農曆')
  await expect(page.locator('body')).toContainText('日出')
  await expect(page.locator('body')).toContainText('日沒')
})

// ── 2. 月曆 ──
test('月曆頁可正常載入並顯示農曆日名', async ({ page }) => {
  await page.goto('/calendar')
  await waitReady(page)
  await expect(page).toHaveTitle(/月曆/)
  // 農曆日名（初二～初十 必有其一）
  await expect(page.locator('body')).toContainText('初二')
  // 星期列頭
  await expect(page.locator('body')).toContainText('日')
  await expect(page.locator('button', { hasText: '上月' })).toBeVisible()
  await expect(page.locator('button', { hasText: '下月' })).toBeVisible()
})

test('月曆可切換上下月', async ({ page }) => {
  await page.goto('/calendar')
  await waitReady(page)
  const heading = page.locator('h2').first()
  const before = await heading.textContent()
  await page.locator('button', { hasText: '上月' }).click()
  const after = await heading.textContent()
  expect(after).not.toBe(before)
})

// ── 3. 年曆 ──
test('年曆頁可正常載入並顯示 12 個月份', async ({ page }) => {
  await page.goto('/calendar/year')
  await waitReady(page)
  await expect(page).toHaveTitle(/年曆/)
  // zh-TW 顯示民國紀年（2026 → 民國 115 年）
  const rocYear = String(new Date().getFullYear() - 1911)
  await expect(page.locator('body')).toContainText(rocYear)
  // 年曆中應包含節氣名
  await expect(page.locator('body')).toContainText('冬至')
})

// ── 4. 八字計算 ──
test('八字頁可輸入日期並計算顯示四柱', async ({ page }) => {
  await page.goto('/bazi')
  await waitReady(page)
  await expect(page).toHaveTitle(/八字/)
  const dateInput = page.locator('input[type="date"]')
  await dateInput.fill('2026-05-14')
  await page.locator('button', { hasText: '計算' }).click()
  await expect(page.locator('body')).toContainText('年柱')
  await expect(page.locator('body')).toContainText('月柱')
  await expect(page.locator('body')).toContainText('日柱')
  await expect(page.locator('body')).toContainText('時柱')
})

// ── 5. 朔氣頁 ──
test('朔氣頁顯示節氣與合朔表', async ({ page }) => {
  await page.goto('/astro/solar-terms')
  await waitReady(page)
  await expect(page).toHaveTitle(/朔氣/)
  await expect(page.locator('body')).toContainText('冬至')
  await expect(page.locator('body')).toContainText('合朔')
})

// ── 6. 語系切換 ──
test('切換語系後導覽列與標題正確變更', async ({ page }) => {
  await page.goto('/')
  await waitReady(page)
  // 預設 zh-TW：確認月曆項目
  await expect(page.locator('body')).toContainText('月曆')
  // 直接導覽到英文版首頁（繞過 detectBrowserLanguage 重定向）
  await page.goto('/en/')
  await waitReady(page)
  // 英文頁面：body 應含 Month 字樣（nav.calendar.month = 'Month'）
  await expect(page.locator('body')).toContainText('Month')
  // 確認語言標籤有正確切換
  await expect(page.locator('html')).toHaveAttribute('lang', /en/)
})

// ── 7. 主題切換 ──
test('主題切換後 html 元素正確加上 dark 類別', async ({ page }) => {
  await page.goto('/')
  await waitReady(page)
  const html = page.locator('html')
  // 尋找主題切換區域內的「暗色」按鈕
  const darkBtn = page
    .locator('nav button', { hasText: '暗色' })
    .or(page.locator('header button', { hasText: '暗色' }))
    .first()
  await darkBtn.waitFor({ state: 'visible', timeout: 10000 })
  await darkBtn.click()
  await expect(html).toHaveClass(/dark/)
  // 切換回亮色
  const lightBtn = page
    .locator('nav button', { hasText: '亮色' })
    .or(page.locator('header button', { hasText: '亮色' }))
    .first()
  await lightBtn.click()
  await expect(html).not.toHaveClass(/dark/)
})

// ── 8. 升降頁 ──
test('升降頁顯示日出日沒時間表', async ({ page }) => {
  await page.goto('/astro/rise-set')
  await waitReady(page)
  await expect(page).toHaveTitle(/升降/)
  await expect(page.locator('body')).toContainText('日出')
  await expect(page.locator('body')).toContainText('日沒')
  await expect(page.locator('input[type="number"]').first()).toBeVisible()
})

// ── 附加：所有佔位頁面可達 ──
for (const [path, title] of [
  ['/astro/eclipses', '日月食'],
  ['/astro/local-eclipse', '地方食'],
  ['/astro/ephemeris', '星曆'],
  ['/astro/phenomena', '天象'],
  ['/astro/stars', '恆星'],
  ['/astro/constants', '常數'],
  ['/tools', '工具'],
] as const) {
  test(`${title} 頁面可達`, async ({ page }) => {
    await page.goto(path)
    await waitReady(page)
    await expect(page.locator('body')).toContainText(title)
  })
}
