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

const timestamp = Date.now()

const user = {
  name: `VS ${timestamp}`,
  email: `victor.signout.${timestamp}@test.com`,
  password: 'Password123',
  passphrase: 'passphrase-one',
}

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage()
  await register(page, user)
  await page.close()
})

test.describe('Sign Out', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    await login(page, user)
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('should sign out from the sidebar overflow menu', async () => {
    await page.getByRole('button', { name: 'overflow-menu-sidebar' }).click()
    await expect(page.getByRole('button', { name: 'logout' })).toBeVisible()
    await page.getByRole('button', { name: 'logout' }).click()

    await page.waitForURL('/auth/login')
    await expect(page.getByLabel('E-mail')).toBeVisible()
  })

  test('should sign out from the profile panel', async () => {
    await page.getByRole('button', { name: 'open-profile' }).click()
    await expect(page.getByRole('button', { name: 'profile-logout' })).toBeVisible()
    await page.getByRole('button', { name: 'profile-logout' }).click()

    await page.waitForURL('/auth/login')
    await expect(page.getByLabel('E-mail')).toBeVisible()
  })

  test('should redirect to login when accessing home without session', async () => {
    await page.getByRole('button', { name: 'overflow-menu-sidebar' }).click()
    await page.getByRole('button', { name: 'logout' }).click()
    await page.waitForURL('/auth/login')

    await page.goto('/')
    await page.waitForURL('/auth/login')
    await expect(page.getByLabel('E-mail')).toBeVisible()
  })

  test('should not be able to go back to home after signing out', async () => {
    await page.getByRole('button', { name: 'overflow-menu-sidebar' }).click()
    await page.getByRole('button', { name: 'logout' }).click()
    await page.waitForURL('/auth/login')

    await page.goBack()
    await expect(page).toHaveURL(/auth\/login/)
    await expect(page.getByLabel('E-mail')).toBeVisible()
  })
})
