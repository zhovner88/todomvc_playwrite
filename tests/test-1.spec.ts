import { expect, test } from '@playwright/test';
import { WebApp } from '../utils/webApp';

test.describe('Filter functionality', () => {
  let webApp: WebApp;

  test.beforeEach(async ({ page }) => {
    await page.goto('https://todomvc.com/examples/react/dist/');
    webApp = WebApp.init(page);
  });

  test('should filter active todos', async () => {
    const todoPage = webApp.todoPage;
    await todoPage.addTodo('active 1');
    await todoPage.addTodo('active 2');
    await todoPage.addTodo('completed 1');
    await todoPage.toggleTodoByText('completed 1');
    await todoPage.filter('Active');
    const todos = await todoPage.getTodoLabels();
    await expect(todos).toHaveCount(2);
    await expect(todos).toHaveText(['active 1', 'active 2']);
  });

  test('should filter completed todos', async () => {
    const todoPage = webApp.todoPage;
    await todoPage.addTodo('active 1');
    await todoPage.addTodo('completed 1');
    await todoPage.toggleTodoByText('completed 1');
    await todoPage.filter('Completed');
    const todos = await todoPage.getTodoLabels();
    await expect(todos).toHaveCount(1);
    await expect(todos.first()).toHaveText('completed 1');
  });
});