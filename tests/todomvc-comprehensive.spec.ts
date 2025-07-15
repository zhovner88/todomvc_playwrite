import { expect, test } from '@playwright/test';
import { WebApp } from '../utils/webApp';

test.describe('TodoMVC Application', () => {
  let webApp: WebApp;

  test.beforeEach(async ({ page }) => {
    await page.goto('https://todomvc.com/examples/react/dist/');
    webApp = WebApp.init(page);
  });

  test.describe('Basic Functionality', () => {
    test('Should display correct page title and placeholder', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
      await expect(page.getByTestId('text-input')).toHaveAttribute('placeholder', 'What needs to be done?');
    });

    test('Should add a single todo', async () => {
      await webApp.todoPage.addTodo('Buy groceries');
      const todos = await webApp.todoPage.getTodoLabels();
      await expect(todos).toHaveCount(1);
      await expect(todos.first()).toHaveText('Buy groceries');
    });

    test('Should add multiple todos', async () => {
      const todoItems = ['Buy groceries', 'Walk the dog', 'Read a book'];
      await webApp.todoPage.addMultipleTodos(todoItems);
      await webApp.todoPage.expectTodoCount(3);
      await webApp.todoPage.expectTodoTexts(todoItems);
    });

    test('Should not add empty todos', async () => {
      await webApp.todoPage.textInput.press('Enter');
      const todos = await webApp.todoPage.getTodoLabels();
      await expect(todos).toHaveCount(0);
    });

    test('Should not add todos with only whitespace', async () => {
      await webApp.todoPage.textInput.fill('   ');
      await webApp.todoPage.textInput.press('Enter');
      const todos = await webApp.todoPage.getTodoLabels();
      await expect(todos).toHaveCount(0);
    });
  });

  test.describe('Todo Management', () => {
    test('Should complete a todo', async () => {
      await webApp.todoPage.addTodo('Complete this task');
      await webApp.todoPage.toggleTodoByText('Complete this task');
      await webApp.todoPage.expectTodoCompleted('Complete this task');
    });

    test('Should uncomplete a todo', async () => {
      await webApp.todoPage.addTodo('Toggle this task');
      await webApp.todoPage.toggleTodoByText('Toggle this task');
      await webApp.todoPage.toggleTodoByText('Toggle this task');
      await webApp.todoPage.expectTodoNotCompleted('Toggle this task');
    });

    test('Should edit a todo by double-clicking', async () => {
      await webApp.todoPage.addTodo('Original text');
      const todoItem = (await webApp.todoPage.getTodoLabels()).first();
      await expect(todoItem).toHaveText('Original text');
      await webApp.todoPage.editTodoByText('Original text', 'Updated text');
      await expect(todoItem).toHaveText('Updated text');
    });

    test('Should edit a todo and save with Enter', async () => {
      await webApp.todoPage.addTodo('Original text');
      const todoItem = webApp.todoPage.page.getByTestId('todo-item-label').first();
      await webApp.todoPage.editTodoByText('Original text', 'Updated text');
      await expect(todoItem).toHaveText('Updated text');
    });

    test('Should edit a todo and save with Escape', async () => {
      await webApp.todoPage.addTodo('Original text');
      const todoItem = webApp.todoPage.page.getByTestId('todo-item-label').first();
      await webApp.todoPage.editTodoByTextAndCancel('Original text', 'Cancelled edit');
      await expect(todoItem).toHaveText('Original text');
    });

    test('Should delete a todo', async () => {
      await webApp.todoPage.addTodo('Delete this task');
      const todoItem = webApp.todoPage.page.getByRole('listitem').filter({ hasText: 'Delete this task' });
      await todoItem.hover();
      const deleteButton = todoItem.getByTestId('todo-item-button');
      await deleteButton.click();
      await expect(todoItem).not.toBeVisible();
    });

    test('Should delete multiple todos', async () => {
      const todos = ['First todo', 'Second todo', 'Third todo'];
      await webApp.todoPage.addMultipleTodos(todos);
      await webApp.todoPage.deleteMultipleTodos(['First todo', 'Third todo']);
      await webApp.todoPage.expectTodoCount(1);
      await webApp.todoPage.expectTodoText('Second todo');
    });
  });

  test.describe('Filtering', () => {
    test.beforeEach(async () => {
      const todos = ['Active task 1', 'Active task 2', 'Completed task 1', 'Completed task 2'];
      for (const todo of todos) {
        await webApp.todoPage.addTodo(todo);
      }
      await webApp.todoPage.toggleTodoByText('Completed task 1');
      await webApp.todoPage.toggleTodoByText('Completed task 2');
    });

    test('Should filter by All', async () => {
      await webApp.todoPage.filter('All');
      const allTodos = await webApp.todoPage.getTodoLabels();
      await expect(allTodos).toHaveCount(4);
      await expect(allTodos).toHaveText(['Active task 1', 'Active task 2', 'Completed task 1', 'Completed task 2']);
    });

    test('Should filter by Active', async () => {
      await webApp.todoPage.filter('Active');
      const activeTodos = await webApp.todoPage.getTodoLabels();
      await expect(activeTodos).toHaveCount(2);
      await expect(activeTodos).toHaveText(['Active task 1', 'Active task 2']);
    });

    test('Should filter by Completed', async () => {
      await webApp.todoPage.filter('Completed');
      const completedTodos = await webApp.todoPage.getTodoLabels();
      await expect(completedTodos).toHaveCount(2);
      await expect(completedTodos).toHaveText(['Completed task 1', 'Completed task 2']);
    });

    test('Should update active filter when todos are completed', async () => {
      await webApp.todoPage.filter('Active');
      await expect(await webApp.todoPage.getTodoLabels()).toHaveCount(2);
      await webApp.todoPage.toggleTodoByText('Active task 1');
      await expect(await webApp.todoPage.getTodoLabels()).toHaveCount(1);
      await expect((await webApp.todoPage.getTodoLabels()).first()).toHaveText('Active task 2');
    });
  });

  test.describe('Bulk Operations', () => {
    test('Should toggle all todos', async () => {
      const todos = ['Task 1', 'Task 2', 'Task 3'];
      await webApp.todoPage.addMultipleTodos(todos);
      await webApp.todoPage.toggleAllTodos();
      for (const todo of todos) {
        await webApp.todoPage.expectTodoCompleted(todo);
      }
    });

    test('Should untoggle all todos', async () => {
      const todos = ['Task 1', 'Task 2', 'Task 3'];
      await webApp.todoPage.addMultipleTodos(todos);
      await webApp.todoPage.toggleAllTodos();
      await webApp.todoPage.toggleAllTodos();
      for (const todo of todos) {
        await webApp.todoPage.expectTodoNotCompleted(todo);
      }
    });

    test('Should clear completed todos', async () => {
      const todos = ['Keep this', 'Complete this', 'Also complete this'];
      await webApp.todoPage.addMultipleTodos(todos);
      await webApp.todoPage.toggleMultipleTodos(['Complete this', 'Also complete this']);
      await webApp.todoPage.clearCompletedTodos();
      await webApp.todoPage.expectTodoCount(1);
      await webApp.todoPage.expectTodoText('Keep this');
    });

    test('Should not show clear completed button when no todos are completed', async () => {
      await webApp.todoPage.addTodo('Active task');
      await expect(webApp.todoPage.page.getByTestId('clear-completed')).not.toBeVisible();
    });
  });

  test.describe('Counter and Status', () => {
    test('Should show correct item count', async () => {
      await webApp.todoPage.addTodo('First task');
      await expect(webApp.todoPage.page.locator('span.todo-count')).toHaveText('1 item left!');
      await webApp.todoPage.addTodo('Second task');
      await expect(webApp.todoPage.page.locator('span.todo-count')).toHaveText('2 items left!');
      await webApp.todoPage.toggleTodoByText('First task');
      await expect(webApp.todoPage.page.locator('span.todo-count')).toHaveText('1 item left!');
    });

    test('Should show "item" for single todo and "items" for multiple', async () => {
      await webApp.todoPage.addTodo('Single task');
      await expect(webApp.todoPage.page.locator('span.todo-count')).toHaveText('1 item left!');
      await webApp.todoPage.addTodo('Second task');
      await expect(webApp.todoPage.page.locator('span.todo-count')).toHaveText('2 items left!');
    });
  });

  test.describe('Edge Cases', () => {
    test('Should handle very long todo text', async () => {
      const longText = 'This is a very long todo item that should be handled properly by the application without breaking the layout or functionality. It contains many characters and should still be editable and deletable.';
      await webApp.todoPage.addTodo(longText);
      const todos = await webApp.todoPage.getTodoLabels();
      await expect(todos).toHaveCount(1);
      await expect(todos.first()).toHaveText(longText);
    });

    test('Should handle special characters in todo text', async () => {
      const specialText = 'Todo with special chars: !@#$%^()_+-=[]{}|;:,.?';
      await webApp.todoPage.addTodo(specialText);
      const todos = await webApp.todoPage.getTodoLabels();
      await expect(todos).toHaveCount(1);
      await expect(todos.first()).toHaveText(specialText);
    });

    test('Should handle emoji in todo text', async () => {
      const emojiText = 'Todo with emoji 🚀 🎉 💻';
      await webApp.todoPage.addTodo(emojiText);
      const todos = await webApp.todoPage.getTodoLabels();
      await expect(todos).toHaveCount(1);
      await expect(todos.first()).toHaveText(emojiText);
    });

    test('Should handle rapid todo additions', async () => {
      const todos = ['Rapid 1', 'Rapid 2', 'Rapid 3', 'Rapid 4', 'Rapid 5'];
      await webApp.todoPage.addMultipleTodos(todos);
      await webApp.todoPage.expectTodoCount(5);
      await webApp.todoPage.expectTodoTexts(todos);
    });

    test('Should handle rapid todo completions', async () => {
      const todos = ['Complete 1', 'Complete 2', 'Complete 3'];
      await webApp.todoPage.addMultipleTodos(todos);
      await webApp.todoPage.toggleMultipleTodos(todos);
      await webApp.todoPage.filter('Completed');
      await webApp.todoPage.expectTodoCount(3);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('Should add todo with Enter key', async () => {
      await webApp.todoPage.textInput.fill('Keyboard todo');
      await webApp.todoPage.textInput.press('Enter');
      const todos = await webApp.todoPage.getTodoLabels();
      await expect(todos).toHaveCount(1);
      await expect(todos.first()).toHaveText('Keyboard todo');
    });

    test('Should not add todo with other keys', async () => {
      await webApp.todoPage.textInput.fill('Should not add');
      await webApp.todoPage.textInput.press('Tab');
      const todos = await webApp.todoPage.getTodoLabels();
      await expect(todos).toHaveCount(0);
    });

    test('Should edit todo with Enter key', async () => {
      await webApp.todoPage.addTodo('Original');
      const todoItem = webApp.todoPage.page.getByRole('listitem').filter({ hasText: 'Original' });
      await todoItem.dblclick();
      const editInput = webApp.todoPage.page.getByTestId('todo-item-input');
      await editInput.fill('Updated');
      await editInput.press('Enter');
      await expect(todoItem).toHaveText('Updated');
    });

    test('Should cancel edit with Tab key', async () => {
      await webApp.todoPage.addTodo('Original');
      const todoItem = webApp.todoPage.page.getByRole('listitem').filter({ hasText: 'Original' });
      await todoItem.dblclick();
      const editInput = webApp.todoPage.page.getByTestId('todo-item').getByTestId('text-input');
      await editInput.waitFor({ state: 'visible' });
      await editInput.fill('Should not save');
      await editInput.press('Tab');
      await expect(todoItem).toHaveText('Original');
    });
  });
});