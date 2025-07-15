import { Page } from '@playwright/test';
import { allure } from 'allure-playwright';

export class UIHelpers {
  /**
   * Rotates the device viewport to landscape and back to portrait, taking screenshots for each step.
   * @param page Playwright Page object
   */
  static async rotateDevice(page: Page) {
    await allure.step('Rotate device to landscape', async () => {
      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForTimeout(200);
      await UIHelpers.takeScreenshotToScenario(page, 'Landscape');
    });
    await allure.step('Rotate device to portrait', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(200);
      await UIHelpers.takeScreenshotToScenario(page, 'Portrait');
    });
  }

  /**
   * Takes a screenshot and attaches it to the current Allure step.
   * @param page Playwright Page object
   * @param stepName Name for the screenshot attachment
   */
  static async takeScreenshotToScenario(page: Page, stepName: string) {
    const screenshot = await page.screenshot({ fullPage: true });
    await allure.attachment(`${stepName}.png`, screenshot, 'image/png');
  }
} 