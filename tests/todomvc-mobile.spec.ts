import { devices, expect, test } from '@playwright/test';
import { UIHelpers } from '../utils/ui-helpers';
import { WebApp } from '../utils/webApp';

// Use iPhone 12 device emulation for all tests in this file
// (Playwright project config will also run this on other devices if configured)
test.use({ ...devices['iPhone 12'] });

test.describe('TodoMVC Mobile - with Rotation', () => {
  let webApp;

  test.beforeEach(async ({ page }) => {
    await test.step('Go to app', async () => {
      await page.goto('https://todomvc.com/examples/react/dist/');
      webApp = WebApp.init(page);
      await UIHelpers.takeScreenshotToScenario(page, 'After page load');
    });
  });

  test('Should add a single todo and survive rotation', async ({ page }) => {
    await test.step('Add single todo', async () => {
      await webApp.todoPage.addTodo('Buy groceries');
      await UIHelpers.takeScreenshotToScenario(page, 'After adding single todo');
    });
    await UIHelpers.rotateDevice(page);
    const todos = await webApp.todoPage.getTodoLabels();
    await expect(todos).toHaveCount(1);
    await expect(todos.first()).toHaveText('Buy groceries');
  });

  test('Should add multiple todos and survive rotation', async ({ page }) => {
    await test.step('Add multiple todos', async () => {
      const todoItems = ['Buy groceries', 'Walk the dog', 'Read a book'];
      await webApp.todoPage.addMultipleTodos(todoItems);
      await UIHelpers.takeScreenshotToScenario(page, 'After adding multiple todos');
    });
    await UIHelpers.rotateDevice(page);
    await webApp.todoPage.expectTodoCount(3);
    await webApp.todoPage.expectTodoTexts(['Buy groceries', 'Walk the dog', 'Read a book']);
  });

  test('Should complete a todo and survive rotation', async ({ page }) => {
    await test.step('Add todo', async () => {
      await webApp.todoPage.addTodo('Complete this task');
      await UIHelpers.takeScreenshotToScenario(page, 'After adding todo');
    });
    await test.step('Toggle todo', async () => {
      await webApp.todoPage.toggleTodoByText('Complete this task');
      await UIHelpers.takeScreenshotToScenario(page, 'After toggling todo');
    });
    await UIHelpers.rotateDevice(page);
    await webApp.todoPage.expectTodoCompleted('Complete this task');
  });

  test('Should edit a todo and survive rotation', async ({ page }) => {
    await test.step('Add todo', async () => {
      await webApp.todoPage.addTodo('Original text');
      await UIHelpers.takeScreenshotToScenario(page, 'After adding todo');
    });
    await test.step('Edit todo', async () => {
      await webApp.todoPage.editTodoByText('Original text', 'Updated text');
      await UIHelpers.takeScreenshotToScenario(page, 'After editing todo');
    });
    await UIHelpers.rotateDevice(page);
    const todos = await webApp.todoPage.getTodoLabels();
    await expect(todos.first()).toHaveText('Updated text');
  });

  test('Should delete a todo and survive rotation', async ({ page }) => {
    await test.step('Add todo', async () => {
      await webApp.todoPage.addTodo('Delete this task');
      await UIHelpers.takeScreenshotToScenario(page, 'After adding todo');
    });
    await test.step('Delete todo', async () => {
      await webApp.todoPage.deleteTodoByText('Delete this task');
      await UIHelpers.takeScreenshotToScenario(page, 'After deleting todo');
    });
    await UIHelpers.rotateDevice(page);
    const todos = await webApp.todoPage.getTodoLabels();
    await expect(todos).toHaveCount(0);
  });

  test('Should filter todos and survive rotation', async ({ page }) => {
    await test.step('Add all todos', async () => {
      const todos = ['Active task 1', 'Active task 2', 'Completed task 1', 'Completed task 2'];
      for (const todo of todos) {
        await webApp.todoPage.addTodo(todo);
      }
      await UIHelpers.takeScreenshotToScenario(page, 'After adding all todos');
    });
    await test.step('Toggle completed todos', async () => {
      await webApp.todoPage.toggleTodoByText('Completed task 1');
      await webApp.todoPage.toggleTodoByText('Completed task 2');
      await UIHelpers.takeScreenshotToScenario(page, 'After toggling completed todos');
    });
    await test.step('Filter active', async () => {
      await webApp.todoPage.filter('Active');
      await UIHelpers.takeScreenshotToScenario(page, 'After filtering active');
    });
    await UIHelpers.rotateDevice(page);
    const activeTodos = await webApp.todoPage.getTodoLabels();
    await expect(activeTodos).toHaveCount(2);
    await expect(activeTodos).toHaveText(['Active task 1', 'Active task 2']);
  });

  test('Should handle long todo and survive rotation', async ({ page }) => {
    await test.step('Add long todo', async () => {
      const longText = 'This is a very long todo item that should be handled properly by the application without breaking the layout or functionality. It contains many characters and should still be editable and deletable.';
      await webApp.todoPage.addTodo(longText);
      await UIHelpers.takeScreenshotToScenario(page, 'After adding long todo');
    });
    await UIHelpers.rotateDevice(page);
    const todos = await webApp.todoPage.getTodoLabels();
    await expect(todos.first()).toHaveText('This is a very long todo item that should be handled properly by the application without breaking the layout or functionality. It contains many characters and should still be editable and deletable.');
  });

  test('Should handle emoji todo and survive rotation', async ({ page }) => {
    await test.step('Add emoji todo', async () => {
      const emojiText = 'Todo with emoji 🎉 💻';
      await webApp.todoPage.addTodo(emojiText);
      await UIHelpers.takeScreenshotToScenario(page, 'After adding emoji todo');
    });
    await UIHelpers.rotateDevice(page);
    const todos = await webApp.todoPage.getTodoLabels();
    await expect(todos.first()).toHaveText('Todo with emoji 🎉 💻');
  });
}); 