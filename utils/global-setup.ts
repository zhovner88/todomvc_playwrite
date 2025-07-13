import { FullConfig } from '@playwright/test';
import { allure } from 'allure-playwright';

async function globalSetup(config: FullConfig) {
  // Global setup code if needed
}

export default globalSetup;

// Hook to automatically attach screenshots and videos to Allure
export async function attachArtifactsToAllure(testInfo: any) {
  const { test, result } = testInfo;
  
  // Only attach artifacts if test failed
  if (result.status !== 'passed') {
    try {
      // Attach screenshot if available
      if (testInfo.attachments) {
        const screenshot = testInfo.attachments.find((a: any) => a.name === 'screenshot');
        if (screenshot) {
          await allure.attachment('failure-screenshot.png', screenshot.body, 'image/png');
        }
      }

      // Attach video if available
      if (testInfo.attachments) {
        const video = testInfo.attachments.find((a: any) => a.name === 'video');
        if (video) {
          await allure.attachment('failure-video.webm', video.body, 'video/webm');
        }
      }

      // Attach trace if available
      if (testInfo.attachments) {
        const trace = testInfo.attachments.find((a: any) => a.name === 'trace');
        if (trace) {
          await allure.attachment('failure-trace.zip', trace.body, 'application/zip');
        }
      }

    } catch (error) {
      console.error('Failed to attach artifacts to Allure:', error);
    }
  }
} 