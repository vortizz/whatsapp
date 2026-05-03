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
  await page.locator('#next-btn').click()

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

  await page.waitForURL('/', { timeout: 15000 })
}

async function logout(page: Page) {
  await page.getByRole('button', { name: 'overflow-menu-sidebar' }).click()
  await page.getByRole('button', { name: 'logout' }).click()
  await page.waitForURL('/auth/login')
}

const timestamp = Date.now()

const userOne = {
  name: `VG ${timestamp}`,
  email: `victor.group.${timestamp}@test.com`,
  password: 'Password123',
  passphrase: 'passphrase-one',
}

const userTwo = {
  name: `CG ${timestamp}`,
  email: `caren.group.${timestamp}@test.com`,
  password: 'Password456',
  passphrase: 'passphrase-two',
}

const userThree = {
  name: `MG ${timestamp}`,
  email: `maria.group.${timestamp}@test.com`,
  password: 'Password789',
  passphrase: 'passphrase-three',
}

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage()
  await register(page, userOne)
  await register(page, userTwo)
  await register(page, userThree)
  await page.close()
})

test.describe('Group Chat', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    await login(page, userOne)
  })

  test.afterEach(async () => {
    await logout(page)
    await page.close()
  })

  test('should open new group panel from overflow menu', async () => {
    await page.getByRole('button', { name: 'overflow-menu-sidebar' }).click()
    await page.getByRole('button', { name: 'new-group' }).click()

    await expect(page.getByRole('complementary', { name: 'new-group-sidebar' })).toBeVisible()
    await expect(page.getByLabel('add-group-members')).toBeVisible()

    // Go back to the main sidebar so it can log out
    await page.getByRole('button', { name: 'close-curr-sidebar' }).click()
  })

  test('should select members and proceed to step 2', async () => {
    await page.getByRole('button', { name: 'overflow-menu-sidebar' }).click()
    await page.getByRole('button', { name: 'new-group' }).click()

    // select userTwo
    await page.locator(`[aria-label="${userTwo.name}"]`).first().dispatchEvent('click')
    await expect(page.getByLabel(`selected-${userTwo.name}`).first()).toBeVisible()

    // select userThree
    await page.locator(`[aria-label="${userThree.name}"]`).first().dispatchEvent('click')
    await expect(page.getByLabel(`selected-${userThree.name}`).first()).toBeVisible()

    // click forward arrow to go to step 2
    await page.getByRole('button', { name: 'selected-users' }).click()

    await expect(page.getByLabel('add-group-name')).toBeVisible()

    // Go back to the main sidebar so it can log out
    await page.getByRole('button', { name: 'close-curr-sidebar' }).click()
    await page.getByRole('button', { name: 'close-curr-sidebar' }).click()
  })

  test('should create a group chat with a name', async () => {
    await page.getByRole('button', { name: 'overflow-menu-sidebar' }).click()
    await page.getByRole('button', { name: 'new-group' }).click()

    await page.locator(`[aria-label="${userTwo.name}"]`).first().dispatchEvent('click')
    await page.getByRole('button', { name: 'selected-users' }).click()

    const groupName = `Test Group ${timestamp}`
    await page.getByRole('textbox', { name: 'group-name' }).fill(groupName)
    await page.getByRole('button', { name: 'create-group' }).click()

    // group chat should open
    await expect(page.getByRole('main', { name: 'main-panel-chat' })).toBeVisible()
  })

  test('should send a message in the group chat', async () => {
    // create the group first
    await page.getByRole('button', { name: 'overflow-menu-sidebar' }).click()
    await page.getByRole('button', { name: 'new-group' }).click()

    await page.locator(`[aria-label="${userTwo.name}"]`).first().dispatchEvent('click')
    await page.getByRole('button', { name: 'selected-users' }).click()

    const groupName = `Message Group ${timestamp}`
    await page.getByRole('textbox', { name: 'group-name' }).fill(groupName)
    await page.getByRole('button', { name: 'create-group' }).click()

    // send a message
    const message = `Group message ${timestamp}`
    await page.getByRole('textbox', { name: 'new-msg' }).fill(message)
    await page.getByRole('button', { name: 'send-msg' }).click()

    await expect(
      page.locator('[data-testid="message-bubble"]').filter({ hasText: message }).last(),
    ).toBeVisible()
  })
})

test.describe('Group Messaging', () => {
  let contextOne: BrowserContext
  let contextTwo: BrowserContext
  let contextThree: BrowserContext
  let pageOne: Page
  let pageTwo: Page
  let pageThree: Page

  test.beforeEach(async ({ browser }) => {
    contextOne = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    contextTwo = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    contextThree = await browser.newContext({ storageState: { cookies: [], origins: [] } })

    pageOne = await contextOne.newPage()
    pageTwo = await contextTwo.newPage()
    pageThree = await contextThree.newPage()

    await Promise.all([
      login(pageOne, userOne),
      login(pageTwo, userTwo),
      login(pageThree, userThree),
    ])
  })

  test.afterEach(async () => {
    await logout(pageOne)
    await logout(pageTwo)
    await logout(pageThree)
    await contextOne.close()
    await contextTwo.close()
    await contextThree.close()
  })

  test('all group members receive the message', async () => {
    // userOne creates a group with userTwo and userThree
    await pageOne.getByRole('button', { name: 'overflow-menu-sidebar' }).click()
    await pageOne.getByRole('button', { name: 'new-group' }).click()

    await pageOne.locator(`[aria-label="${userTwo.name}"]`).first().dispatchEvent('click')
    await pageOne.locator(`[aria-label="${userThree.name}"]`).first().dispatchEvent('click')
    await pageOne.getByRole('button', { name: 'selected-users' }).click()

    const groupName = `Broadcast Group ${timestamp}`
    await pageOne.getByRole('textbox', { name: 'group-name' }).fill(groupName)
    await pageOne.getByRole('button', { name: 'create-group' }).click()

    // userOne sends a message
    const message = `Hello group! ${timestamp}`
    await pageOne.getByRole('textbox', { name: 'new-msg' }).fill(message)
    await pageOne.getByRole('button', { name: 'send-msg' }).click()

    await expect(
      pageOne.locator('[data-testid="message-bubble"]').filter({ hasText: message }).last(),
    ).toBeVisible()

    // userTwo should receive it
    await expect(pageTwo.getByRole('button', { name: groupName })).toBeVisible()
    await pageTwo.getByRole('button', { name: groupName }).dispatchEvent('click')
    await expect(
      pageTwo.locator('[data-testid="message-bubble"]').filter({ hasText: message }).last(),
    ).toBeVisible()

    // userThree should receive it
    await expect(pageThree.getByRole('button', { name: groupName })).toBeVisible()
    await pageThree.getByRole('button', { name: groupName }).dispatchEvent('click')
    await expect(
      pageThree.locator('[data-testid="message-bubble"]').filter({ hasText: message }).last(),
    ).toBeVisible()
  })
})
