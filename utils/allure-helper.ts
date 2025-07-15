import { test } from '@playwright/test';

// Helper function to attach screenshot to Playwright report (and Allure if configured)
export async function attachScreenshot(page: any, name: string = 'screenshot') {
  try {
    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach(`${name}.png`, {
      body: screenshot,
      contentType: 'image/png',
    });
  } catch (error) {
    console.error('Failed to take screenshot:', error);
  }
}

// Helper function to attach video to Playwright report (and Allure if configured)
export async function attachVideo(videoPath: string, name: string = 'video') {
  try {
    const fs = require('fs');
    if (fs.existsSync(videoPath)) {
      const videoBuffer = fs.readFileSync(videoPath);
      await test.info().attach(`${name}.webm`, {
        body: videoBuffer,
        contentType: 'video/webm',
      });
    }
  } catch (error) {
    console.error('Failed to attach video:', error);
  }
}

// Helper function to attach page HTML to Playwright report (and Allure if configured)
export async function attachPageHTML(page: any, name: string = 'page-html') {
  try {
    const html = await page.content();
    await test.info().attach(`${name}.html`, {
      body: html,
      contentType: 'text/html',
    });
  } catch (error) {
    console.error('Failed to attach page HTML:', error);
  }
}

// Helper function to attach browser console logs to Playwright report (and Allure if configured)
export async function attachConsoleLogs(page: any, name: string = 'console-logs') {
  try {
    const logs = await page.evaluate(() => {
      return (window as any).consoleLogs || [];
    });
    await test.info().attach(`${name}.txt`, {
      body: logs.join('\n'),
      contentType: 'text/plain',
    });
  } catch (error) {
    console.error('Failed to attach console logs:', error);
  }
} 