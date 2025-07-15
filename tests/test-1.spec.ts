import { expect } from '@playwright/test';
import { test } from './fixtures';

test.describe('Filter functionality', () => {
  test('should filter active todos', async ({ webApp }) => {
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

  test('should filter completed todos', async ({ webApp }) => {
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