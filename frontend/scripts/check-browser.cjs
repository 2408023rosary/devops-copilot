/* Run npm run test:browser. Uses an isolated browser profile and local Vite process. */
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const { spawn } = require('node:child_process')
const path = require('node:path')
const fs = require('node:fs/promises')
const root = path.resolve(__dirname, '..')
const port = 4175
const server = spawn(
  process.execPath,
  [
    path.join(root, 'node_modules/vite/bin/vite.js'),
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
    '--strictPort',
  ],
  { cwd: root, stdio: 'pipe' },
)
let serverLog = ''
server.stdout.on('data', (chunk) => {
  serverLog += chunk
})
server.stderr.on('data', (chunk) => {
  serverLog += chunk
})
const base = `http://127.0.0.1:${port}`
let browser
async function run() {
  for (let count = 0; count < 60; count++) {
    try {
      if ((await fetch(base)).ok) break
    } catch {
      /* Await server startup. */
    }
    if (count === 59) throw new Error(serverLog || 'Server did not start')
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  browser = await chromium.launch({
    ...(executablePath
      ? { executablePath, args: ['--no-sandbox', '--disable-gpu', '--disable-software-rasterizer'] }
      : {}),
    headless: true,
  })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const go = async (route) => {
    await page.goto(`${base}/${route}`)
    await page.locator('.nx-page').waitFor()
  }
  await go('incidents')
  await page.getByRole('searchbox', { name: 'Search incidents' }).fill('order')
  assert.equal(await page.locator('.nx-incident-item').count(), 1)
  await page.getByLabel('Filter', { exact: true }).selectOption('critical')
  await page.getByText('No matching incidents').waitFor()
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await page.locator('.nx-incident-item').filter({ hasText: 'INC-001' }).click()
  await page.getByRole('button', { name: 'Run analysis', exact: true }).click()
  await page.getByRole('button', { name: 'Run analysis again' }).waitFor()
  await page.getByRole('button', { name: /^notes/ }).click()
  await page
    .getByLabel('Investigation note')
    .fill('Verified database connectivity from the payment pod.')
  await page.getByRole('button', { name: 'Save note' }).click()
  await page
    .locator('.nx-note')
    .getByText('Verified database connectivity from the payment pod.')
    .waitFor()
  await page.getByLabel('Investigation status').selectOption('resolved')
  await page.getByText('1 open · 3 total').waitFor()
  await page.reload()
  await page.locator('.nx-page').waitFor()
  assert.equal(await page.getByLabel('Investigation status').inputValue(), 'resolved')
  await page.getByRole('button', { name: /^notes/ }).click()
  assert.equal(await page.locator('.nx-note').count(), 1)
  await page.getByRole('button', { name: 'Ask Nexus' }).click()
  await page.getByRole('textbox', { name: 'Message Nexus' }).fill('What should I check first?')
  await page.getByRole('button', { name: 'Send ↑' }).click()
  await page.waitForURL('**/copilot?chat=*')
  assert.equal(await page.locator('.nx-message.assistant').count(), 1)
  const firstChat = page.url()
  await page.getByRole('textbox', { name: 'Message Nexus' }).fill('Show the evidence')
  await page.getByRole('button', { name: 'Send ↑' }).click()
  await page.getByRole('button', { name: 'Stop', exact: true }).click()
  await page.getByText('Response stopped. Your message is ready to send again.').waitFor()
  assert.equal(await page.locator('.nx-message.assistant').count(), 1)
  await page.getByRole('button', { name: 'Retry message' }).click()
  await page.waitForFunction(() => document.querySelectorAll('.nx-message.assistant').length === 2)
  assert.equal(await page.locator('.nx-message.user').count(), 2)
  await page.getByRole('button', { name: 'Save to memory' }).click()
  await page.getByLabel('Verified root cause').fill('Incorrect database host')
  await page
    .getByLabel('Resolution', { exact: true })
    .fill('Corrected the host and confirmed successful connections.')
  await page.getByRole('button', { name: 'Save investigation', exact: true }).click()
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  await page.getByRole('button', { name: 'New conversation' }).click()
  await page.getByLabel('Incident', { exact: true }).selectOption('INC-002')
  await page.getByRole('textbox', { name: 'Message Nexus' }).fill('Why is order-service slow?')
  await page.getByRole('button', { name: 'Send ↑' }).click()
  await page.waitForURL('**/copilot?chat=*')
  await page
    .locator('.nx-message.assistant')
    .getByText(/order-service/)
    .waitFor()
  await go('history')
  assert.equal(await page.locator('.nx-history-row').count(), 2)
  const row = page.locator('.nx-history-row').filter({ hasText: 'Why is order-service slow?' })
  await row.getByRole('button', { name: /^Rename/ }).click()
  await page.getByLabel('Conversation title').fill('Order latency review')
  await page.getByRole('button', { name: 'Save title' }).click()
  await page.getByRole('link', { name: 'Order latency review' }).waitFor()
  const exportEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export results' }).click()
  const downloaded = await exportEvent
  assert.equal(downloaded.suggestedFilename(), 'nexus-chats.json')
  const exported = JSON.parse(await fs.readFile(await downloaded.path(), 'utf8'))
  assert.equal(exported.length, 2)
  await page.goto(firstChat)
  await page.locator('.nx-page').waitFor()
  assert.equal(await page.locator('.nx-message').count(), 4)
  await go('memory')
  assert.equal(await page.locator('.nx-memory-item').count(), 4)
  await page.getByRole('searchbox', { name: 'Search memories' }).fill('Incorrect database host')
  await page.locator('.nx-memory-item').filter({ hasText: 'INC-001' }).click()
  await page.getByRole('button', { name: 'Use this investigation' }).click()
  await page.getByRole('button', { name: /Have we seen this before/ }).click()
  await page.waitForURL('**/copilot?chat=*')
  await page
    .locator('.nx-message.assistant')
    .getByText(/Corrected the host/)
    .waitFor()
  await go('settings')
  await page.getByRole('switch', { name: 'Show evidence panels' }).click()
  await page.waitForFunction(
    () =>
      document.querySelector('[aria-labelledby="showLogs-title"]').getAttribute('aria-checked') ===
      'false',
  )
  await page.getByRole('switch', { name: 'Save new conversations' }).click()
  await page.waitForFunction(
    () =>
      document
        .querySelector('[aria-labelledby="rememberChats-title"]')
        .getAttribute('aria-checked') === 'false',
  )
  await page.getByRole('switch', { name: 'Interface animations' }).click()
  await page.waitForFunction(() => document.documentElement.dataset.motion === 'off')
  await go('dashboard')
  assert.equal(await page.getByRole('heading', { name: 'Recent evidence' }).count(), 0)
  await go('copilot')
  await page.getByRole('textbox', { name: 'Message Nexus' }).fill('Private session question')
  await page.getByRole('button', { name: 'Send ↑' }).click()
  await page.waitForURL('**/copilot?chat=*')
  await page.getByText('◌ Session only · not saved after reload').waitFor()
  const privateUrl = page.url()
  await page.reload()
  await page.getByText('Conversation not found').waitFor()
  assert.equal(page.url(), privateUrl)
  await go('settings')
  await page.getByRole('switch', { name: 'Analyze when opening an incident' }).click()
  await page.waitForFunction(
    () =>
      document
        .querySelector('[aria-labelledby="autoAnalyze-title"]')
        .getAttribute('aria-checked') === 'true',
  )
  await go('incidents?id=INC-002')
  await page.getByRole('button', { name: 'Run analysis again' }).waitFor()
  await go('history')
  await page.getByRole('button', { name: 'Clear conversations' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Cancel' }).click()
  assert.equal(await page.locator('.nx-history-row').count(), 3)
  await page.getByRole('button', { name: 'Clear conversations' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Clear conversations' }).click()
  await page.getByText('No conversations yet').waitFor()
  await go('memory')
  await page.getByRole('button', { name: 'Clear all memories' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Clear memories' }).click()
  await page.getByText('No matching memories').waitFor()
  await go('settings')
  await page.getByRole('button', { name: 'Reset demo workspace' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Reset demo', exact: true }).click()
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  await page.waitForFunction(() => document.documentElement.dataset.motion === 'on')
  await go('dashboard')
  await page.locator('.nx-service-button').first().click()
  await page.getByRole('dialog').getByText('Replicas').waitFor()
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  assert.equal(
    await page
      .locator('.nx-service-button')
      .first()
      .evaluate((el) => el === document.activeElement),
    true,
  )
  await page.getByRole('textbox', { name: 'Your question for Nexus' }).fill('Explain the logs')
  await page.getByRole('button', { name: 'Ask Nexus' }).click()
  assert.equal(
    await page.getByRole('textbox', { name: 'Message Nexus' }).inputValue(),
    'Explain the logs',
  )
  await go('does-not-exist')
  await page.waitForURL('**/dashboard')
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of [
      '',
      'dashboard',
      'incidents?id=INC-001',
      'copilot?incident=INC-002',
      'history',
      'memory',
      'settings',
    ]) {
      await page.goto(`${base}/${route}`)
      await page.locator(route ? '.nx-page' : '.welcome-page').waitFor()
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `Horizontal overflow on ${route} at ${width}px`,
      )
    }
  }
  await context.close()
  const reduced = await browser.newContext({ reducedMotion: 'reduce' })
  const reducedPage = await reduced.newPage()
  await reducedPage.goto(`${base}/dashboard`)
  await reducedPage.locator('.nx-page').waitFor()
  assert.equal(
    await reducedPage.locator('.nx-route').evaluate((el) => getComputedStyle(el).animationName),
    'none',
  )
  await reduced.close()
  assert.deepEqual(errors, [])
  console.log(
    'PASS: incident filtering, analysis, notes/status persistence, multiple chats, cancel/retry without duplicates, save/use memory, rename/resume/export history, session-only privacy, effective settings, auto-analysis, confirmations, clearing/reset, dialog focus return, dashboard actions, route fallback, 28 responsive route checks, reduced motion, and zero browser errors.',
  )
}
run()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await browser?.close()
    server.kill()
  })
