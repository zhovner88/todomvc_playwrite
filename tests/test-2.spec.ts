import { test, expect } from '@playwright/test';

test('Add and filter todos', async ({ page }) => {
  await page.goto('https://todomvc.com/examples/react/dist/');

  // Add two todos
  for (const text of ['feed the cat', 'feed myself', 'feed the dog']) {
    await page.getByTestId('text-input').fill(text);
    await page.getByTestId('text-input').press('Enter');
  }

  await expect(page.getByTestId('todo-item-label')).toHaveCount(3);

  // Complete the first todo and filter
  await page.getByRole('listitem').filter({ hasText: 'feed myself' }).getByTestId('todo-item-toggle').check();
  await page.getByRole('link', { name: 'Active' }).click();
  await expect(page.getByTestId('todo-item-label')).toHaveCount(2);
  await expect(page.getByTestId('todo-item-label')).toHaveText(['feed the cat', 'feed the dog']);
});