import { expect, test } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

test('Should filter todos correctly', async ({ page }) => {
  await page.goto('https://todomvc.com/examples/react/dist/');
  const todoPage = new TodoPage(page);

  // Add two todos
  const todos = ['feed the cat', 'water the plants'];
  for (const todo of todos) {
    await todoPage.addTodo(todo);
  }

  // Complete "feed the cat"
  await todoPage.toggleTodoByText('feed the cat');

  // Test Completed filter
  await todoPage.filter('Completed');
  const completedTodos = await todoPage.getTodoLabels();
  await expect(completedTodos).toHaveCount(1);
  await expect(completedTodos.first()).toHaveText('feed the cat');

  // Test Active filter
  await todoPage.filter('Active');
  const activeTodos = await todoPage.getTodoLabels();
  await expect(activeTodos).toHaveCount(1);
  await expect(activeTodos.first()).toHaveText('water the plants');

  // Test All filter
  await todoPage.filter('All');
  const allTodos = await todoPage.getTodoLabels();
  await expect(allTodos).toHaveCount(2);
  await expect(allTodos).toHaveText(todos);
});