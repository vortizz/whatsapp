import { test, expect, type Page } from '@playwright/test'

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

async function openChatWith(page: Page, userName: string) {
  await page.getByRole('button', { name: 'New Chat' }).click()
  await page.getByRole('textbox', { name: 'search-name' }).fill(userName)
  await page.locator(`[aria-label="${userName}"]`).dispatchEvent('click')
}

const timestamp = Date.now()

const userOne = {
  name: `VB ${timestamp}`,
  email: `victor.block.${timestamp}@test.com`,
  password: 'Password123',
  passphrase: 'passphrase-one',
}

const userTwo = {
  name: `CB ${timestamp}`,
  email: `caren.block.${timestamp}@test.com`,
  password: 'Password456',
  passphrase: 'passphrase-two',
}

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage()
  await register(page, userOne)
  await register(page, userTwo)
  await page.close()
})

test.describe('Block / Unblock User', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    await login(page, userOne)
  })

  test.afterEach(async () => {
    await logout(page)
    await page.close()
  })

  test('should block a user from the contact info panel', async () => {
    await openChatWith(page, userTwo.name)

    await page.getByRole('button', { name: 'chat-header' }).click()

    await expect(page.getByRole('form', { name: 'typing-form' })).toBeVisible()

    const blockButton = page.getByRole('button', { name: 'block-user' })
    await expect(blockButton).toBeVisible()
    await blockButton.click()

    const confirmBlockButton = page.getByRole('button', { name: 'confirm-block' })
    await expect(confirmBlockButton).toBeVisible()
    await confirmBlockButton.click()

    await expect(page.getByRole('button', { name: 'unblock-user' })).toBeVisible()
  })

  test('should unblock a user', async () => {
    await openChatWith(page, userTwo.name)

    await page.getByRole('button', { name: 'chat-header' }).click()

    const unblockUserButton = page.getByRole('button', { name: 'unblock-user' })
    await expect(unblockUserButton).toBeVisible()
    await unblockUserButton.click()

    const confirmUnblockButton = page.getByRole('button', { name: 'confirm-unblock' })
    await expect(confirmUnblockButton).toBeVisible()
    await confirmUnblockButton.click()

    await expect(page.getByRole('button', { name: 'block-user' })).toBeVisible()
    await expect(page.getByRole('form', { name: 'typing-form' })).toBeVisible()
  })

  test('blocked user cannot send messages', async () => {
    await openChatWith(page, userTwo.name)

    await page.getByRole('button', { name: 'chat-header' }).click()
    await page.getByRole('button', { name: 'block-user' }).click()
    await page.getByRole('button', { name: 'confirm-block' }).click()

    await page.getByRole('button', { name: 'close-contact-info' }).click()

    await expect(page.getByRole('main', { name: 'main-panel-chat' })).toBeVisible()
    await expect(page.getByLabel('blocked-actions')).toBeVisible()
    await expect(page.getByRole('form', { name: 'typing-form ' })).not.toBeVisible()
  })
})
