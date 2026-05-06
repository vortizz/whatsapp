import { test, expect, type Page } from '@playwright/test'

async function fillRegistrationStep1(
  page: Page,
  user: { name: string; email: string; password: string },
) {
  await page.getByLabel('Name').fill(user.name)
  await page.getByLabel('E-mail').first().fill(user.email)
  await page.getByLabel('Password').first().fill(user.password)
  await page.getByLabel('Confirm Password').fill(user.password)
  await page.getByRole('button', { name: 'Next' }).click()
  await page.waitForLoadState('networkidle')
}

async function fillPassphrase(page: Page, passphrase: string) {
  await page.getByLabel('Set Passphrase').fill(passphrase)
  await page.getByLabel('Confirm Passphrase').fill(passphrase)
  await page.getByRole('button', { name: 'Next' }).click()
}

async function saveRecoveryCodes(page: Page) {
  await page.getByRole('checkbox', { name: 'saved-recovery-codes' }).check()
  await page.getByRole('button', { name: 'Finish' }).click()
}

async function login(page: Page, email: string, password: string) {
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
  await page.waitForFunction(
    () =>
      document.querySelector('[aria-label="One more step"]') !== null ||
      document.querySelector('[aria-label="Welcome back"]') !== null,
  )
}

const timestamp = Date.now()

// Test data
const userOne = {
  name: `VA ${timestamp}`,
  email: `victor.${Date.now()}@test.com`,
  password: 'Password123',
  passphrase: 'my-secret-passphrase',
}

test.describe('Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/create-account')
  })

  test('should show the registration form', async ({ page }) => {
    await expect(page.getByLabel('Name')).toBeVisible()
    await expect(page.getByLabel('E-mail')).toBeVisible()
    await expect(page.getByLabel('Password').first()).toBeVisible()
    await expect(page.getByLabel('Confirm Password')).toBeVisible()
  })

  test('should show validation errors when form is empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Next' }).click()

    await expect(page.getByLabel('Name is required')).toBeVisible()
    await expect(page.getByLabel('Email is required')).toBeVisible()
    await expect(page.getByLabel('Password is required')).toBeVisible()
    await expect(page.getByLabel('Please confirm your password')).toBeVisible()
  })

  test('should show error when passwords do not match', async ({ page }) => {
    await page.getByLabel('Name').fill('Victor')
    await page.getByLabel('E-mail').first().fill('victor@test.com')
    await page.getByLabel('Password').first().fill('Password123')
    await page.getByLabel('Confirm Password').fill('DifferentPassword')
    await page.getByRole('button', { name: 'Next' }).click()

    await expect(page.getByLabel('Passwords do not match')).toBeVisible()
  })

  test('should complete full registration flow', async ({ page }) => {
    await fillRegistrationStep1(page, userOne)

    await expect(page.getByLabel('set-encryption-passphrase-step')).toBeVisible()
    await fillPassphrase(page, userOne.passphrase)

    await expect(page.getByLabel('save-recovery-codes-step')).toBeVisible()
    await saveRecoveryCodes(page)

    await expect(page).toHaveURL('/auth/login')
  })
})

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })
  test('should show the login form', async ({ page }) => {
    await expect(page.getByLabel('E-mail')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })
  test('should show error with wrong credentials', async ({ page }) => {
    await login(page, 'wrong@email.com', 'wrongpassword')
    await expect(page.getByText('Email or password is incorrect')).toBeVisible()
  })
  test('should proceed to passphrase step after correct credentials', async ({ page }) => {
    await login(page, userOne.email, userOne.password)
    await expect(page.getByLabel('One more step')).toBeVisible()
  })
  test('should show error with wrong passphrase', async ({ page }) => {
    await login(page, userOne.email, userOne.password)
    await expect(page.getByLabel('One more step')).toBeVisible()
    await page.getByLabel('Passphrase').fill('wrong-passphrase')
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(page.getByText('Incorrect passphrase or recovery code.')).toBeVisible()
  })
  test('should login successfully and redirect to home', async ({ page }) => {
    await login(page, userOne.email, userOne.password)
    await expect(page.getByLabel('One more step')).toBeVisible()
    await page.getByLabel('Passphrase').fill(userOne.passphrase)
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })
})
