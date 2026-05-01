import { test, expect, type Page, type BrowserContext } from '@playwright/test'

async function clearAndGoto(page: Page, url: string) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.goto(url)
  await page.waitForLoadState('networkidle')
}

async function register(
  page: Page,
  user: { name: string; email: string; password: string; passphrase: string },
) {
  await clearAndGoto(page, '/auth/create-account')

  await page.getByLabel('Name').first().fill(user.name)
  await page.getByLabel('E-mail').first().fill(user.email)
  await page.getByLabel('Password').first().fill(user.password)
  await page.getByLabel('Confirm Password').first().fill(user.password)
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByLabel('Set Passphrase').fill(user.passphrase)
  await page.getByLabel('Confirm Passphrase').fill(user.passphrase)
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByLabel('I have saved my recovery codes in a safe place.').check()
  await page.getByRole('button', { name: 'Finish' }).click()

  await page.waitForURL('/auth/login')
}

async function login(page: Page, user: { email: string; password: string; passphrase: string }) {
  await clearAndGoto(page, '/auth/login')

  await page.getByLabel('E-mail').fill(user.email)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: 'Login' }).click()

  await page.getByLabel('Passphrase or Recovery Code').fill(user.passphrase)
  await page.getByRole('button', { name: 'Confirm' }).click()

  await page.waitForURL('/')
}

async function logout(page: Page) {
  await page.getByRole('button', { name: 'overflow-menu-sidebar' }).click()
  await page.getByRole('button', { name: 'logout' }).click()
  await page.waitForURL('/auth/login')
}

const timestamp = Date.now()

const userOne = {
  name: `VC ${timestamp}`,
  email: `victor.${timestamp}@test.com`,
  password: 'Password123',
  passphrase: 'passphrase-one',
}

const userTwo = {
  name: `CC ${timestamp}`,
  email: `caren.${timestamp}@test.com`,
  password: 'Password456',
  passphrase: 'passphrase-two',
}

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage()
  await register(page, userOne)
  await register(page, userTwo)
  await page.close()
})

// ─── Chat tests ────────────────────────────────────────────────────────────

test.describe('Chat', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    await login(page, userOne)
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('should show the sidebar after login', async () => {
    await expect(page.getByRole('complementary', { name: 'main-sidebar' })).toBeVisible()
  })

  test('should open new chat panel when clicking the new chat button', async () => {
    await page.getByRole('button', { name: 'New Chat' }).click()
    await expect(page.getByRole('complementary', { name: 'new-chat-sidebar' })).toBeVisible()
  })

  test('should find userTwo when searching in new chat', async () => {
    await page.getByRole('button', { name: 'New Chat' }).click()
    await page.getByRole('textbox', { name: 'search-name' }).fill(userTwo.name)
    await expect(page.getByRole('button', { name: userTwo.name })).toBeVisible()
  })

  test('should open a chat when clicking on a user', async () => {
    await page.getByRole('button', { name: 'New Chat' }).click()
    await page.getByRole('textbox', { name: 'search-name' }).fill(userTwo.name)
    await page.locator(`[aria-label="${userTwo.name}"]`).dispatchEvent('click')
    await expect(page.getByRole('main', { name: 'main-panel-chat' })).toBeVisible()
  })
})

// ─── Messaging tests ───────────────────────────────────────────────────────

test.describe('Messaging', () => {
  let contextOne: BrowserContext
  let contextTwo: BrowserContext
  let pageOne: Page
  let pageTwo: Page

  test.beforeEach(async ({ browser }) => {
    // two separate browser contexts
    contextOne = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    contextTwo = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    pageOne = await contextOne.newPage()
    pageTwo = await contextTwo.newPage()

    // log in both users simultaneously
    await Promise.all([login(pageOne, userOne), login(pageTwo, userTwo)])
  })

  test.afterEach(async () => {
    await logout(pageOne)
    await logout(pageTwo)
    await contextOne.close()
    await contextTwo.close()
  })

  test('userOne can send a message to userTwo', async () => {
    await pageOne.getByRole('button', { name: 'New Chat' }).click()
    await pageOne.getByRole('textbox', { name: 'search-name' }).fill(userTwo.name)
    await pageOne.getByText(userTwo.name).click()
    await pageOne.locator(`[aria-label="${userTwo.name}"]`).dispatchEvent('click')

    const message = 'Hello from Victor!!!'
    await pageOne.getByRole('textbox', { name: 'new-msg' }).fill(message)
    await pageOne.getByRole('button', { name: 'send-msg' }).click()

    await expect(
      pageOne.locator('[data-testid="message-bubble"]').filter({ hasText: message }).last(),
    ).toBeVisible()
  })

  test('userTwo receives the message from userOne', async () => {
    // userOne sends a message
    await pageOne.getByRole('button', { name: 'New Chat' }).click()
    await pageOne.getByRole('textbox', { name: 'search-name' }).fill(userTwo.name)
    await pageOne.locator(`[aria-label="${userTwo.name}"]`).dispatchEvent('click')

    const message = `Hello Caren! ${Date.now()}`
    await pageOne.getByRole('textbox', { name: 'new-msg' }).fill(message)
    await pageOne.getByRole('button', { name: 'send-msg' }).click()

    // userTwo should see userOne in their sidebar
    await expect(pageTwo.getByRole('button', { name: userOne.name })).toBeVisible()

    // userTwo clicks on the chat
    await pageTwo.getByRole('button', { name: userOne.name }).dispatchEvent('click')

    // userTwo should see the decrypted message
    await expect(
      pageTwo.locator('[data-testid="message-bubble"]').filter({ hasText: message }).last(),
    ).toBeVisible()
  })
})
