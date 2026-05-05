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
  const closeEditProfileButton = page.getByRole('button', { name: 'close-edit-profile' })
  await expect(closeEditProfileButton).toBeVisible()
  await closeEditProfileButton.click()

  const profileLogoutButton = page.getByRole('button', { name: 'profile-logout' })
  await expect(profileLogoutButton).toBeVisible()
  await profileLogoutButton.click()
  await page.waitForURL('/auth/login')
}

async function openEditProfile(page: Page) {
  await page.getByRole('button', { name: 'open-profile' }).click()
  await page.getByRole('button', { name: 'open-edit-profile' }).click()
  await expect(page.getByRole('complementary', { name: 'edit-profile-panel' })).toBeVisible()
}

const timestamp = Date.now()

const user = {
  name: `VP ${timestamp}`,
  email: `victor.profile.${timestamp}@test.com`,
  password: 'Password123',
  passphrase: 'passphrase-one',
}

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage()
  await register(page, user)
  await page.close()
})

test.describe('Edit Profile', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    await login(page, user)
  })

  test.afterEach(async () => {
    await logout(page)
    await page.close()
  })

  test('should open the edit profile panel', async () => {
    await openEditProfile(page)
  })

  test('should update the name', async () => {
    await openEditProfile(page)

    const editNameButton = page.getByRole('button', { name: 'edit-name' })
    await expect(editNameButton).toBeVisible()
    await editNameButton.click()

    const newName = `VPN ${timestamp}`

    const nameInput = page.getByLabel('name-input')
    await expect(nameInput).toBeVisible()
    await nameInput.fill(newName)

    const nameSubmit = page.getByRole('button', { name: 'submit-name' })
    await expect(nameSubmit).toBeVisible()
    await nameSubmit.click()

    const spanNameValue = page.getByLabel('current-name-user')
    await expect(spanNameValue).toBeVisible()
    await expect(spanNameValue).toHaveText(newName)
  })

  test('should cancel name edit without saving', async () => {
    await openEditProfile(page)

    const originalName = await page.getByLabel('current-name-user').textContent()

    const newName = 'This should not save'
    await page.getByRole('button', { name: 'edit-name' }).click()
    await page.getByLabel('name-input').fill(newName)

    const cancelNameButton = page.getByRole('button', { name: 'cancel-name' })
    await expect(cancelNameButton).toBeVisible()
    await cancelNameButton.click()

    const spanNameValue = page.getByLabel('current-name-user')
    await expect(spanNameValue).toBeVisible()
    await expect(spanNameValue).not.toHaveText(newName)
    if (originalName) {
      await expect(spanNameValue).toHaveText(originalName)
    }
  })

  test('should update the about', async () => {
    await openEditProfile(page)

    const editAboutButton = page.getByRole('button', { name: 'edit-about' })
    await expect(editAboutButton).toBeVisible()
    await editAboutButton.click()

    const newAbout = 'New about text'

    const aboutInput = page.getByLabel('about-input')
    await expect(aboutInput).toBeVisible()
    await aboutInput.fill(newAbout)

    const aboutSubmit = page.getByRole('button', { name: 'submit-about' })
    await expect(aboutSubmit).toBeVisible()
    await aboutSubmit.click()

    const spanAboutValue = page.getByLabel('about-display')
    await expect(spanAboutValue).toBeVisible()
    await expect(spanAboutValue).toHaveText(newAbout)
  })

  test('should cancel about edit without saving', async () => {
    await openEditProfile(page)
    const originalAbout = await page.getByLabel('about-display').textContent()

    const newAbout = 'This should not save'

    await page.getByRole('button', { name: 'edit-about' }).click()
    await page.getByLabel('about-input').fill(newAbout)

    const cancelAboutButton = page.getByRole('button', { name: 'cancel-about' })
    await expect(cancelAboutButton).toBeVisible()
    await cancelAboutButton.click()

    const spanAboutValue = page.getByLabel('about-display')
    await expect(spanAboutValue).toBeVisible()
    await expect(spanAboutValue).not.toHaveText(newAbout)
    if (originalAbout) {
      await expect(spanAboutValue).toHaveText(originalAbout)
    }
  })
})
