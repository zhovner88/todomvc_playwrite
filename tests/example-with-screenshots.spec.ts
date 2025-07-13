import { expect, test } from '@playwright/test';
import { allure } from 'allure-playwright';
import { attachPageHTML, attachScreenshot } from '../utils/allure-helper';

test.describe('Example with Screenshots', () => {
  test('Should capture screenshot on failure', async ({ page }) => {
    await page.goto('https://todomvc.com/examples/react/dist/');
    
    // Take a screenshot at a specific step
    await attachScreenshot(page, 'page-loaded');
    
    // This will fail and trigger automatic screenshot
    await expect(page.locator('non-existent-element')).toBeVisible();
  });

  test('Should capture multiple screenshots during test', async ({ page }) => {
    await page.goto('https://todomvc.com/examples/react/dist/');
    
    // Screenshot after page load
    await attachScreenshot(page, 'initial-page');
    
    // Add a todo
    await page.getByTestId('text-input').fill('Test todo');
    await page.getByTestId('text-input').press('Enter');
    
    // Screenshot after adding todo
    await attachScreenshot(page, 'after-adding-todo');
    
    // Complete the todo
    await page.getByTestId('todo-item-toggle').first().check();
    
    // Screenshot after completing todo
    await attachScreenshot(page, 'after-completing-todo');
    
    // Verify the todo is completed
    await expect(page.getByTestId('todo-item-label').first()).toHaveClass(/completed/);
  });

  test('Should capture page HTML on failure', async ({ page }) => {
    await page.goto('https://todomvc.com/examples/react/dist/');
    
    // This will fail and we'll capture the page HTML
    try {
      await expect(page.locator('non-existent-element')).toBeVisible();
    } catch (error) {
      // Capture page HTML when test fails
      await attachPageHTML(page, 'failure-page-html');
      throw error; // Re-throw to mark test as failed
    }
  });

  test('Should demonstrate manual screenshot attachment', async ({ page }) => {
    await page.goto('https://todomvc.com/examples/react/dist/');
    
    // Manual screenshot attachment with custom name
    const screenshot = await page.screenshot({ fullPage: true });
    await allure.attachment('manual-screenshot.png', screenshot, 'image/png');
    
    // Add some todos
    const todos = ['First todo', 'Second todo', 'Third todo'];
    for (const todo of todos) {
      await page.getByTestId('text-input').fill(todo);
      await page.getByTestId('text-input').press('Enter');
    }
    
    // Another screenshot after adding todos
    const screenshotAfterTodos = await page.screenshot({ fullPage: true });
    await allure.attachment('after-adding-todos.png', screenshotAfterTodos, 'image/png');
    
    // Verify todos were added
    await expect(page.getByTestId('todo-item-label')).toHaveCount(3);
  });
}); 