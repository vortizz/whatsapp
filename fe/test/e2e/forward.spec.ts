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
  await page.getByLabel('Name').fill(user.name)
  await page.getByLabel('E-mail').fill(user.email)
  await page.getByLabel('Password').first().fill(user.password)
  await page.getByLabel('Confirm Password').fill(user.password)
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByLabel('Set Passphrase').fill(user.passphrase)
  await page.getByLabel('Confirm Passphrase').fill(user.passphrase)
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('checkbox', { name: 'saved-recovery-codes' }).check()
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
  const closeBtn = page.getByRole('button', { name: 'close-forward-modal' })
  if (await closeBtn.isVisible()) {
    await closeBtn.click()
  }
  await page.getByRole('button', { name: 'overflow-menu-sidebar' }).click()
  await page.getByRole('button', { name: 'logout' }).click()
  await page.waitForURL('/auth/login', { timeout: 10000 })
}

async function openChatWith(page: Page, userName: string) {
  await page.getByRole('button', { name: 'New Chat' }).click()
  await page.getByRole('textbox', { name: 'search-name' }).fill(userName)
  await page.locator(`[aria-label="${userName}"]`).dispatchEvent('click')
}

async function sendMessage(page: Page, text: string) {
  await page.getByRole('textbox', { name: 'new-msg' }).fill(text)
  await page.getByRole('button', { name: 'send-msg' }).click()
  await expect(
    page.locator('[data-testid="message-bubble"]').filter({ hasText: text }).last(),
  ).toBeVisible({ timeout: 10000 })
}

async function openMessageMenu(page: Page, messageText: string) {
  const bubble = page
    .locator('[data-testid="message-bubble"]')
    .filter({ hasText: messageText })
    .last()
  await bubble.hover()
  await page.getByRole('button', { name: 'message-menu-toggle' }).last().click()
  await expect(page.getByRole('button', { name: 'forward-btn' })).toBeVisible()
}

async function forwardMessage(page: Page, messageText: string) {
  await openMessageMenu(page, messageText)
  await page.getByRole('button', { name: 'forward-btn' }).click()
  await expect(page.getByRole('button', { name: 'selection-forward-btn' })).toBeVisible()
  await page.getByRole('button', { name: 'selection-forward-btn' }).click()
  await expect(page.getByLabel('forward-message-modal')).toBeVisible()
}

const timestamp = Date.now()

const userOne = {
  name: `VF ${timestamp}`,
  email: `victor.forward.${timestamp}@test.com`,
  password: 'Password123',
  passphrase: 'passphrase-one',
}

const userTwo = {
  name: `CF ${timestamp}`,
  email: `caren.forward.${timestamp}@test.com`,
  password: 'Password456',
  passphrase: 'passphrase-two',
}

const userThree = {
  name: `MF ${timestamp}`,
  email: `maria.forward.${timestamp}@test.com`,
  password: 'Password789',
  passphrase: 'passphrase-three',
}

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage()
  await register(page, userOne)
  await register(page, userTwo)
  await register(page, userThree)

  const loginPage = await browser.newPage()
  await login(loginPage, userOne)
  await openChatWith(loginPage, userTwo.name)
  await loginPage.close()
  await page.close()
})

test.describe('Forward Message', () => {
  let contextOne: BrowserContext
  let contextTwo: BrowserContext
  let pageOne: Page
  let pageTwo: Page

  test.beforeEach(async ({ browser }) => {
    contextOne = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    contextTwo = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    pageOne = await contextOne.newPage()
    pageTwo = await contextTwo.newPage()
    await Promise.all([login(pageOne, userOne), login(pageTwo, userTwo)])
  })

  test.afterEach(async () => {
    await logout(pageOne)
    await logout(pageTwo)
    await contextOne.close()
    await contextTwo.close()
  })

  test('should open the forward modal when clicking forward on a message', async () => {
    await openChatWith(pageOne, userTwo.name)
    const message = `Forward test ${timestamp}`
    await sendMessage(pageOne, message)

    await forwardMessage(pageOne, message)

    await expect(pageOne.getByLabel('forward-message-modal')).toBeVisible()
  })

  test('should select a user and enable the send button', async () => {
    await openChatWith(pageOne, userTwo.name)
    const message = `Select user test ${timestamp}`
    await sendMessage(pageOne, message)

    await forwardMessage(pageOne, message)

    const forwardToUserButton = pageOne.getByRole('button', { name: `forward-to-${userTwo.name}` })
    await expect(forwardToUserButton).toBeVisible()
    await forwardToUserButton.click()

    await expect(pageOne.getByRole('button', { name: 'forward-send-btn' })).toBeVisible()
  })

  test('should forward a message to another user', async () => {
    await openChatWith(pageOne, userTwo.name)
    const originalMessage = `Original message ${timestamp}`
    await sendMessage(pageOne, originalMessage)

    await forwardMessage(pageOne, originalMessage)

    await pageOne.getByRole('button', { name: `forward-to-${userTwo.name}` }).click()
    await pageOne.getByRole('button', { name: 'forward-send-btn' }).click()

    await expect(pageOne.getByLabel('forward-message-modal')).not.toBeVisible()

    const forwardedBubble = pageOne
      .locator('[data-message-bubble]')
      .filter({ hasText: originalMessage })
      .last()
    await expect(forwardedBubble).toBeVisible()
    await expect(forwardedBubble.getByLabel('forwarded-tag')).toBeVisible()
  })

  test('userTwo receives the forwarded message', async () => {
    await openChatWith(pageOne, userTwo.name)
    const originalMessage = `Forward to two ${timestamp}`
    await sendMessage(pageOne, originalMessage)

    await forwardMessage(pageOne, originalMessage)

    await pageOne.getByRole('button', { name: `forward-to-${userTwo.name}` }).click()
    await pageOne.getByRole('button', { name: 'forward-send-btn' }).click()

    await expect(pageTwo.getByRole('button', { name: userOne.name })).toBeVisible()
    await pageTwo.getByRole('button', { name: userOne.name }).dispatchEvent('click')

    const forwardedBubble = pageTwo
      .locator('[data-message-bubble]')
      .filter({ hasText: originalMessage })
      .last()
    await expect(forwardedBubble).toBeVisible()
  })
})
