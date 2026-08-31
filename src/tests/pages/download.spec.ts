import { expect, test } from '@playwright/test'

import { getReleasesWithChecksums } from '~/components/download/release-data'
import { CONSTANT } from '~/constants'

test.describe('Download page — Windows-first release', () => {
  test('shows both Windows downloads and Linux coming soon', async ({ page }) => {
    await page.goto('/download')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('#windows-x86_64-downloads')).toBeVisible()
    await expect(page.locator('#windows-arm64-downloads')).toBeVisible()
    await expect(page.locator('#linux-coming-soon')).toBeVisible()
  })

  test('does not expose Linux download links', async ({ page }) => {
    await page.goto('/download')
    await page.waitForLoadState('domcontentloaded')

    const releases = getReleasesWithChecksums('en')(CONSTANT.CHECKSUMS)

    await expect(
      page.locator(`a[href="${releases.linux.x86_64.tarball.link}"]`)
    ).toHaveCount(0)
    await expect(
      page.locator(`a[href="${releases.linux.aarch64.tarball.link}"]`)
    ).toHaveCount(0)
    await expect(page.locator(`a[href="${releases.linux.flathub.all.link}"]`)).toHaveCount(0)
    await expect(page.locator(`a[href="${releases.macos.universal.link}"]`)).toHaveCount(0)
  })

  test('Windows download links are correct', async ({ page }) => {
    const releases = getReleasesWithChecksums('en')(CONSTANT.CHECKSUMS)
    await page.goto('/download')
    await page.waitForLoadState('domcontentloaded')

    await expect(
      page.locator(`#windows-x86_64-downloads .download-button[href="${releases.windows.x86_64.link}"]`)
    ).toContainText('Download')

    await expect(
      page.locator(`#windows-arm64-downloads .download-button[href="${releases.windows.arm64.link}"]`)
    ).toContainText('Download')
  })
})
