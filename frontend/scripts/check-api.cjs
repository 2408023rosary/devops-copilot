/* HTTP-adapter contract checks with intercepted network responses; no real backend required. */
const { chromium } = require('playwright')
const { spawn } = require('node:child_process')
const { pathToFileURL } = require('node:url')
const path = require('node:path')
const assert = require('node:assert/strict')
const root = path.resolve(__dirname, '..')
const base = 'http://127.0.0.1:4176'
const server = spawn(
  process.execPath,
  [
    path.join(root, 'node_modules/vite/bin/vite.js'),
    '--host',
    '127.0.0.1',
    '--port',
    '4176',
    '--strictPort',
  ],
  {
    cwd: root,
    env: { ...process.env, VITE_API_MODE: 'http', VITE_API_BASE_URL: '/api' },
    stdio: 'pipe',
  },
)
let browser
async function run() {
  for (let count = 0; count < 60; count++) {
    try {
      if ((await fetch(base)).ok) break
    } catch {}
    if (count === 59) throw new Error('Test server failed to start')
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  browser = await chromium.launch({
    ...(executablePath
      ? { executablePath, args: ['--no-sandbox', '--disable-gpu', '--disable-software-rasterizer'] }
      : {}),
    headless: true,
  })
  const page = await browser.newPage()
  const { createDemoWorkspace } = await import(
    pathToFileURL(path.join(root, 'src/data/demo.js')).href
  )
  const db = createDemoWorkspace()
  let workspaceFails = true
  let failSend = true
  let createCount = 0
  const requestIds = []
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname
    const json = (body) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
    if (pathname === '/api/workspace') {
      if (workspaceFails) return route.fulfill({ status: 503, body: 'Temporarily unavailable' })
      return json(db)
    }
    if (pathname === '/api/conversations' && request.method() === 'POST') {
      createCount++
      const payload = request.postDataJSON()
      assert.equal(payload.incidentId, 'INC-002')
      const chat = {
        id: 'chat-http-test',
        title: 'New investigation',
        ...payload,
        persisted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      }
      db.conversations.push(chat)
      return json(chat)
    }
    if (pathname === '/api/conversations/chat-http-test/messages') {
      const payload = request.postDataJSON()
      requestIds.push(payload.requestId)
      if (failSend) {
        failSend = false
        return route.fulfill({ status: 503, body: 'Retry this request' })
      }
      const chat = db.conversations[0]
      chat.title = payload.text
      chat.messages = [
        { id: 'user-1', role: 'user', text: payload.text, at: new Date().toISOString() },
        {
          id: 'assistant-1',
          role: 'assistant',
          text: 'Backend reply: inspect downstream latency.',
          at: new Date().toISOString(),
        },
      ]
      return json(chat)
    }
    return route.fulfill({ status: 404, body: 'Unexpected endpoint' })
  })
  await page.goto(`${base}/copilot?incident=INC-002`)
  await page.getByText('Request failed (503). Please try again.', { exact: true }).waitFor()
  workspaceFails = false
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await page.locator('.nx-page').waitFor()
  await page.locator('.demo-notice').filter({ hasText: 'CONNECTED WORKSPACE' }).waitFor()
  await page.getByRole('textbox', { name: 'Message Nexus' }).fill('Review order latency')
  await page.getByRole('button', { name: 'Send ↑' }).click()
  await page.getByRole('button', { name: 'Retry message' }).waitFor()
  assert.equal(
    await page.getByRole('textbox', { name: 'Message Nexus' }).inputValue(),
    'Review order latency',
  )
  await page.getByRole('button', { name: 'Retry message' }).click()
  await page.getByText('Backend reply: inspect downstream latency.').waitFor()
  assert.equal(createCount, 1)
  assert.equal(requestIds.length, 2)
  assert.equal(requestIds[0], requestIds[1], 'Retry must reuse the idempotency key')
  assert.equal(await page.locator('.nx-message.user').count(), 1)
  workspaceFails = true
  await page.getByRole('button', { name: 'Refresh data' }).click()
  await page.getByText('Something needs attention').waitFor()
  assert.equal(
    await page.locator('.nx-message.assistant').count(),
    1,
    'Failed refresh should preserve current data',
  )
  assert.deepEqual(errors, [])
  console.log(
    'PASS: HTTP mode, load failure/retry, backend response rendering, message failure recovery, retained draft, one conversation per retry, reusable requestId, and failed-refresh data preservation.',
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
