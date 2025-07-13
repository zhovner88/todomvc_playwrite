import { test, expect } from '@playwright/test';

test('Has title', async ({ page }) => {
    await page.goto('https://todomvc.com/examples/react/dist/');

   // Expect a heading with the name 'todos' to be visible.
    await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible(); 
})

test('Has placeholder', async ({page}) => {
    await page.goto('https://todomvc.com/examples/react/dist/');

    await expect(page.locator('//*[@id="todo-input"]')).toHaveAttribute('placeholder', "What needs to be done?");
})

test('Add an item to the list', async ({ page }) => {
    await page.goto('https://todomvc.com/examples/react/dist/');

    // Add a new todo item
    await page.fill('#todo-input', 'Feed my cat 🐱');
    await page.keyboard.press('Enter');

    // Verify the new item is added
    const todoItems = page.locator('.todo-list li');
    await expect(todoItems).toHaveCount(1);
    // Output the text of the first todo item to the console
    const firstItemText = await todoItems.first().textContent();
    console.log('First todo item text:', firstItemText);
    await expect(todoItems.first()).toHaveText('Feed my cat 🐱');
})