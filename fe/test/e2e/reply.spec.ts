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
  await page.getByRole('button', { name: 'overflow-menu-sidebar' }).click()
  await page.getByRole('button', { name: 'logout' }).click()
  await page.waitForURL('/auth/login')
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
  ).toBeVisible()
}

async function openMessageMenu(page: Page, messageText: string) {
  const bubble = page
    .locator('[data-testid="message-bubble"]')
    .filter({ hasText: messageText })
    .last()
  await bubble.hover()
  const messageMenuToggle = page.getByRole('button', { name: 'message-menu-toggle' }).last()
  await expect(messageMenuToggle).toBeVisible()
  await messageMenuToggle.click()
  await expect(page.getByRole('button', { name: 'reply-btn' })).toBeVisible()
}

const timestamp = Date.now()

const userOne = {
  name: `VR ${timestamp}`,
  email: `victor.reply.${timestamp}@test.com`,
  password: 'Password123',
  passphrase: 'passphrase-one',
}

const userTwo = {
  name: `CR ${timestamp}`,
  email: `caren.reply.${timestamp}@test.com`,
  password: 'Password456',
  passphrase: 'passphrase-two',
}

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage()
  await register(page, userOne)
  await register(page, userTwo)
  await page.close()
})

test.describe('Reply to Message', () => {
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

  test('should show reply preview when clicking reply on a message', async () => {
    await openChatWith(pageOne, userTwo.name)
    const originalMessage = `Hello ${timestamp}`
    await sendMessage(pageOne, originalMessage)

    await openMessageMenu(pageOne, originalMessage)
    await pageOne.getByRole('button', { name: 'reply-btn' }).click()

    const replyPreview = pageOne.getByLabel('reply-preview')
    await expect(replyPreview).toBeVisible()
    await expect(replyPreview).toContainText(originalMessage)
  })

  test('should cancel reply preview', async () => {
    await openChatWith(pageOne, userTwo.name)
    const originalMessage = `Hello cancel ${timestamp}`
    await sendMessage(pageOne, originalMessage)

    await openMessageMenu(pageOne, originalMessage)
    await pageOne.getByRole('button', { name: 'reply-btn' }).click()
    await expect(pageOne.getByLabel('reply-preview')).toBeVisible()

    await pageOne.getByRole('button', { name: 'cancel-reply' }).click()
    await expect(pageOne.getByLabel('reply-preview')).not.toBeVisible()
  })

  test('should send a reply and show it in the chat', async () => {
    await openChatWith(pageOne, userTwo.name)
    const originalMessage = `Original ${timestamp}`
    await sendMessage(pageOne, originalMessage)

    await openMessageMenu(pageOne, originalMessage)
    await pageOne.getByRole('button', { name: 'reply-btn' }).click()
    await expect(pageOne.getByLabel('reply-preview')).toBeVisible()

    const replyText = `Reply to original ${timestamp}`
    await pageOne.getByRole('textbox', { name: 'new-msg' }).fill(replyText)
    await pageOne.getByRole('button', { name: 'send-msg' }).click()

    const replyBubble = pageOne
      .locator('[data-message-bubble]')
      .filter({ hasText: replyText })
      .last()
    await expect(replyBubble).toBeVisible()

    const replyReference = replyBubble.locator('[aria-label="reply-reference"]').last()
    await expect(replyReference).toBeVisible()
    await expect(replyReference).toContainText(originalMessage)
  })

  test('userTwo receives the reply with the original message reference', async () => {
    await openChatWith(pageOne, userTwo.name)
    const originalMessage = `Original for two ${timestamp}`
    await sendMessage(pageOne, originalMessage)

    await openMessageMenu(pageOne, originalMessage)
    await pageOne.getByRole('button', { name: 'reply-btn' }).click()

    const replyText = `Reply seen by two ${timestamp}`
    await pageOne.getByRole('textbox', { name: 'new-msg' }).fill(replyText)
    await pageOne.getByRole('button', { name: 'send-msg' }).click()

    await expect(pageTwo.getByRole('button', { name: userOne.name })).toBeVisible()
    await pageTwo.getByRole('button', { name: userOne.name }).dispatchEvent('click')

    const replyBubble = pageTwo
      .locator('[data-message-bubble]')
      .filter({ hasText: replyText })
      .last()
    await expect(replyBubble).toBeVisible()

    const replyReference = replyBubble.locator('[aria-label="reply-reference"]')
    await expect(replyReference).toBeVisible()
    await expect(replyReference).toContainText(originalMessage)
  })
})
