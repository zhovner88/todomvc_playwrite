import { test as base, devices } from '@playwright/test';
import { UIHelpers } from '../utils/ui-helpers';
import { WebApp } from '../utils/webApp';

type MyFixtures = {
  webApp: WebApp;
};

export const test = base.extend<MyFixtures>({
  webApp: async ({ page }, use) => {
    await page.goto('https://todomvc.com/examples/react/dist/');
    const webApp = WebApp.init(page);
    await UIHelpers.takeScreenshotToScenario(page, 'After page load');
    await use(webApp);
  },
});

export { expect } from '@playwright/test';
