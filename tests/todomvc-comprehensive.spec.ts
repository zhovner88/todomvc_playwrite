import { expect, test } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';
import { PageFactory } from '../utils/page-factory';
import { UIHelpers } from '../utils/ui-helpers';

test.describe('TodoMVC Application', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    await page.goto('https://todomvc.com/examples/react/dist/');
    todoPage = PageFactory.getTodoPage(page);
    await UIHelpers.takeScreenshotToScenario(page, 'After page load');
  });

  test.describe('Basic Functionality', () => {
    test('Should display correct page title and placeholder', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
      await expect(page.getByTestId('text-input')).toHaveAttribute('placeholder', 'What needs to be done?');
    });

    test('Should add a single todo', async () => {
      await todoPage.addTodo('Buy groceries');
      const todos = await todoPage.getTodoLabels();
      await expect(todos).toHaveCount(1);
      await expect(todos.first()).toHaveText('Buy groceries');
  });

    test('Should add multiple todos', async () => {
      const todoItems = ['Buy groceries', 'Walk the dog', 'Read a book'];
      await todoPage.addMultipleTodos(todoItems);
      
      await todoPage.expectTodoCount(3);
      await todoPage.expectTodoTexts(todoItems);
    });

    test('Should not add empty todos', async () => {
      await todoPage.textInput.press('Enter');
      const todos = await todoPage.getTodoLabels();
      await expect(todos).toHaveCount(0);
    });

    test('Should not add todos with only whitespace', async () => {
      await todoPage.textInput.fill('   ');
      await todoPage.textInput.press('Enter');
      const todos = await todoPage.getTodoLabels();
      await expect(todos).toHaveCount(0);
    });
  });

  test.describe('Todo Management', () => {
    test('Should complete a todo', async () => {
      await todoPage.addTodo('Complete this task');
      await todoPage.toggleTodoByText('Complete this task');
      
      await todoPage.expectTodoCompleted('Complete this task');
    });

    test('Should uncomplete a todo', async () => {
      await todoPage.addTodo('Toggle this task');
      await todoPage.toggleTodoByText('Toggle this task');
      await todoPage.toggleTodoByText('Toggle this task');

      await todoPage.expectTodoNotCompleted('Toggle this task');
    });

    test('Should edit a todo by double-clicking', async () => {
      await todoPage.addTodo('Original text');
      const todoItem = (await todoPage.getTodoLabels()).first();
      await expect(todoItem).toHaveText('Original text');
      
      await todoPage.editTodoByText('Original text', 'Updated text');
      
      await expect(todoItem).toHaveText('Updated text');
    });

    test('Should edit a todo and save with Enter', async () => {
      await todoPage.addTodo('Original text');
      const todoItem = todoPage.page.getByTestId('todo-item-label').first();
      
      await todoPage.editTodoByText('Original text', 'Updated text');
    
      await expect(todoItem).toHaveText('Updated text');
    })

    test('Should edit a todo and save with Escape', async () => {
      await todoPage.addTodo('Original text');
      const todoItem = todoPage.page.getByTestId('todo-item-label').first();
      
      await todoPage.editTodoByTextAndCancel('Original text', 'Cancelled edit');

      await expect(todoItem).toHaveText('Original text');
    });

    test('Should delete a todo', async () => {
      await todoPage.addTodo('Delete this task');
      const todoItem = todoPage.page.getByRole('listitem').filter({ hasText: 'Delete this task' });
      
      await todoItem.hover();
      const deleteButton = todoItem.getByTestId('todo-item-button');
      await deleteButton.click();
      
      await expect(todoItem).not.toBeVisible();
    });

    test('Should delete multiple todos', async () => {
      const todos = ['First todo', 'Second todo', 'Third todo'];
      await todoPage.addMultipleTodos(todos);
      
      // Delete first and last todos
      await todoPage.deleteMultipleTodos(['First todo', 'Third todo']);
      
      await todoPage.expectTodoCount(1);
      await todoPage.expectTodoText('Second todo');
    });
  });

  test.describe('Filtering', () => {
    test.beforeEach(async () => {
      const todos = ['Active task 1', 'Active task 2', 'Completed task 1', 'Completed task 2'];
      for (const todo of todos) {
        await todoPage.addTodo(todo);
      }
      
      // Complete the last two todos
      await todoPage.toggleTodoByText('Completed task 1');
      await todoPage.toggleTodoByText('Completed task 2');
    });

    test('Should filter by All', async () => {
      await todoPage.filter('All');
      const allTodos = await todoPage.getTodoLabels();
      await expect(allTodos).toHaveCount(4);
      await expect(allTodos).toHaveText(['Active task 1', 'Active task 2', 'Completed task 1', 'Completed task 2']);
    });

    test('Should filter by Active', async () => {
      await todoPage.filter('Active');
      const activeTodos = await todoPage.getTodoLabels();
      await expect(activeTodos).toHaveCount(2);
      await expect(activeTodos).toHaveText(['Active task 1', 'Active task 2']);
    });

    test('Should filter by Completed', async () => {
      await todoPage.filter('Completed');
      const completedTodos = await todoPage.getTodoLabels();
      await expect(completedTodos).toHaveCount(2);
      await expect(completedTodos).toHaveText(['Completed task 1', 'Completed task 2']);
    });

    test('Should update active filter when todos are completed', async () => {
      await todoPage.filter('Active');
      await expect(await todoPage.getTodoLabels()).toHaveCount(2);
      
      await todoPage.toggleTodoByText('Active task 1');
      await expect(await todoPage.getTodoLabels()).toHaveCount(1);
      await expect((await todoPage.getTodoLabels()).first()).toHaveText('Active task 2');
    });
  });

  test.describe('Bulk Operations', () => {
    test('Should toggle all todos', async () => {
      const todos = ['Task 1', 'Task 2', 'Task 3'];
      await todoPage.addMultipleTodos(todos);
      
      // Toggle all
      await todoPage.toggleAllTodos();
      
      for (const todo of todos) {
        await todoPage.expectTodoCompleted(todo);
      }
    });

    test('Should untoggle all todos', async () => {
      const todos = ['Task 1', 'Task 2', 'Task 3'];
      await todoPage.addMultipleTodos(todos);
      
      // Toggle all on
      await todoPage.toggleAllTodos();
      
      // Toggle all off
      await todoPage.toggleAllTodos();
      
      for (const todo of todos) {
        await todoPage.expectTodoNotCompleted(todo);
      }
    });

    test('Should clear completed todos', async () => {
      const todos = ['Keep this', 'Complete this', 'Also complete this'];
      await todoPage.addMultipleTodos(todos);
      
      // Complete last two todos
      await todoPage.toggleMultipleTodos(['Complete this', 'Also complete this']);
      
      // Clear completed
      await todoPage.clearCompletedTodos();
      
      await todoPage.expectTodoCount(1);
      await todoPage.expectTodoText('Keep this');
    });

    test('Should not show clear completed button when no todos are completed', async () => {
      await todoPage.addTodo('Active task');
      await expect(todoPage.page.getByTestId('clear-completed')).not.toBeVisible();
    });
  });

  test.describe('Counter and Status', () => {
    test('Should show correct item count', async () => {
      await todoPage.addTodo('First task');
      await expect(todoPage.page.locator('span.todo-count')).toHaveText('1 item left!');
      
      await todoPage.addTodo('Second task');
      await expect(todoPage.page.locator('span.todo-count')).toHaveText('2 items left!');
      
      await todoPage.toggleTodoByText('First task');
      await expect(todoPage.page.locator('span.todo-count')).toHaveText('1 item left!');
    });

    test('Should show "item" for single todo and "items" for multiple', async () => {
      await todoPage.addTodo('Single task');
      await expect(todoPage.page.locator('span.todo-count')).toHaveText('1 item left!');
      
      await todoPage.addTodo('Second task');
      await expect(todoPage.page.locator('span.todo-count')).toHaveText('2 items left!');
    });
  });

  test.describe('Edge Cases', () => {
    test('Should handle very long todo text', async () => {
      const longText = 'This is a very long todo item that should be handled properly by the application without breaking the layout or functionality. It contains many characters and should still be editable and deletable.';
      await todoPage.addTodo(longText);
      
      const todos = await todoPage.getTodoLabels();
      await expect(todos).toHaveCount(1);
      await expect(todos.first()).toHaveText(longText);
    });

    test('Should handle special characters in todo text', async () => {
      const specialText = 'Todo with special chars: !@#$%^()_+-=[]{}|;:,.?';
      await todoPage.addTodo(specialText);
      
      const todos = await todoPage.getTodoLabels();
      await expect(todos).toHaveCount(1);
      await expect(todos.first()).toHaveText(specialText);
    });

    test('Should handle emoji in todo text', async () => {
      const emojiText = 'Todo with emoji 🚀 🎉 💻';
      await todoPage.addTodo(emojiText);
      
      const todos = await todoPage.getTodoLabels();
      await expect(todos).toHaveCount(1);
      await expect(todos.first()).toHaveText(emojiText);
    });

    test('Should handle rapid todo additions', async () => {
      const todos = ['Rapid 1', 'Rapid 2', 'Rapid 3', 'Rapid 4', 'Rapid 5'];
      
      await todoPage.addMultipleTodos(todos);
      
      await todoPage.expectTodoCount(5);
      await todoPage.expectTodoTexts(todos);
    });

    test('Should handle rapid todo completions', async () => {``
      const todos = ['Complete 1', 'Complete 2', 'Complete 3'];
      await todoPage.addMultipleTodos(todos);
      
      await todoPage.toggleMultipleTodos(todos);
      
      await todoPage.filter('Completed');
      await todoPage.expectTodoCount(3);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('Should add todo with Enter key', async () => {
      await todoPage.textInput.fill('Keyboard todo');
      await todoPage.textInput.press('Enter')
      
      const todos = await todoPage.getTodoLabels();
      await expect(todos).toHaveCount(1);
      await expect(todos.first()).toHaveText('Keyboard todo');
    });

    test('Should not add todo with other keys', async () => {
      await todoPage.textInput.fill('Should not add');
      await todoPage.textInput.press('Tab');
      
      const todos = await todoPage.getTodoLabels();
      await expect(todos).toHaveCount(0);
    });

    test('Should edit todo with Enter key', async () => {
      await todoPage.addTodo('Original');
      const todoItem = todoPage.page.getByRole('listitem').filter({ hasText: 'Original' });
      
      await todoItem.dblclick();
      const editInput = todoPage.page.getByTestId('todo-item-input');
      await editInput.fill('Updated');
      await editInput.press('Enter');
      
      await expect(todoItem).toHaveText('Updated');
    });

    test('Should cancel edit with Tab key', async () => {
      await todoPage.addTodo('Original');
      const todoItem = todoPage.page.getByRole('listitem').filter({ hasText: 'Original' });
      
      await todoItem.dblclick();
      const editInput = todoPage.page.getByTestId('todo-item').getByTestId('text-input')
      await editInput.waitFor({ state: 'visible' });
      await editInput.fill('Should not save');
      await editInput.press('Tab');
      
      await expect(todoItem).toHaveText('Original');
    });
  });
});