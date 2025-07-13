import { test as base } from '@playwright/test';
import { allure } from 'allure-playwright';

// Extend the test to automatically attach screenshots and videos to Allure
export const test = base.extend({
  page: async ({ page }, use) => {
    // Listen for page errors and take screenshots
    page.on('pageerror', async (error) => {
      const screenshot = await page.screenshot({ fullPage: true });
      await allure.attachment('page-error-screenshot.png', screenshot, 'image/png');
      await allure.attachment('page-error.txt', error.message, 'text/plain');
    });

    // Listen for console errors
    page.on('console', async (msg) => {
      if (msg.type() === 'error') {
        const screenshot = await page.screenshot({ fullPage: true });
        await allure.attachment('console-error-screenshot.png', screenshot, 'image/png');
        await allure.attachment('console-error.txt', msg.text(), 'text/plain');
      }
    });

    await use(page);
  },
});

// Helper function to attach screenshot to Allure
export async function attachScreenshot(page: any, name: string = 'screenshot') {
  try {
    const screenshot = await page.screenshot({ fullPage: true });
    await allure.attachment(`${name}.png`, screenshot, 'image/png');
  } catch (error) {
    console.error('Failed to take screenshot:', error);
  }
}

// Helper function to attach video to Allure
export async function attachVideo(videoPath: string, name: string = 'video') {
  try {
    const fs = require('fs');
    if (fs.existsSync(videoPath)) {
      const videoBuffer = fs.readFileSync(videoPath);
      await allure.attachment(`${name}.webm`, videoBuffer, 'video/webm');
    }
  } catch (error) {
    console.error('Failed to attach video:', error);
  }
}

// Helper function to attach page HTML to Allure
export async function attachPageHTML(page: any, name: string = 'page-html') {
  try {
    const html = await page.content();
    await allure.attachment(`${name}.html`, html, 'text/html');
  } catch (error) {
    console.error('Failed to attach page HTML:', error);
  }
}

// Helper function to attach browser console logs to Allure
export async function attachConsoleLogs(page: any, name: string = 'console-logs') {
  try {
    const logs = await page.evaluate(() => {
      return (window as any).consoleLogs || [];
    });
    await allure.attachment(`${name}.txt`, logs.join('\n'), 'text/plain');
  } catch (error) {
    console.error('Failed to attach console logs:', error);
  }
} 