import { Locator, Page, expect } from '@playwright/test';
import { allure } from 'allure-playwright';

export class TodoPage {
  readonly page: Page;
  readonly textInput: Locator;
  readonly todoItemLabel: Locator;
  readonly todoItemToggle: Locator;
  readonly filterLinks: Locator;
  readonly toggleAll: Locator;
  readonly clearCompleted: Locator;
  readonly todoCount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textInput = page.getByTestId('text-input');
    this.todoItemLabel = page.getByTestId('todo-item-label');
    this.todoItemToggle = page.getByTestId('todo-item-toggle');
    this.filterLinks = page.getByRole('link');
    this.toggleAll = page.getByTestId('toggle-all');
    this.clearCompleted = page.getByRole('button', { name: 'Clear completed' });
    this.todoCount = page.getByTestId('todo-count');
  }

  async addTodo(text: string) {
    await this.textInput.fill(text);
    await this.textInput.press('Enter');
  }

  async toggleTodoByText(text: string) {
    const todoItem = this.page.getByRole('listitem').filter({
      has: this.page.getByTestId('todo-item-label').filter({
      hasText: new RegExp(`^${text}$`)
      })
    });
    // Ensure the label text matches exactly by checking its length
    const label = todoItem.getByTestId('todo-item-label');
    const labelText = await label.textContent();
    if (labelText?.length === text.length && labelText === text) {
      await todoItem.getByTestId('todo-item-toggle').click();
    }
  }

  async filter(name: 'All' | 'Active' | 'Completed') {
    await this.filterLinks.filter({ hasText: name }).click();
  }

  async getTodoLabels() {
    return this.todoItemLabel;
  }

  async deleteTodoByText(text: string) {
    const todoItem = this.page.getByRole('listitem').filter({ hasText: text });
    await todoItem.hover();
    await todoItem.getByTestId('todo-item-button').click();
  }

  async deleteMultipleTodos(texts: string[]) {
    for (const text of texts) {
      await this.deleteTodoByText(text);
    }
  }

  async editTodoByText(oldText: string, newText: string) {
    const todoItem = this.page.getByRole('listitem').filter({ hasText: oldText });
    await todoItem.dblclick();
    const editInput = this.page.getByTestId('todo-item').getByTestId('text-input')
    await editInput.waitFor({ state: 'visible' });
    await editInput.fill(newText);
    await editInput.press('Enter');
  }

  async editTodoByTextAndCancel(oldText: string, newText: string) {
    const todoItem = this.page.getByRole('listitem').filter({ hasText: oldText });
    await todoItem.dblclick();
    const editInput = this.page.getByTestId('todo-item').getByTestId('text-input')
    await editInput.waitFor({ state: 'visible' });
    await editInput.fill(newText);
    await editInput.press('Tab');
  }

  async cancelEditTodoByText(text: string) {
    const todoItem = this.page.getByRole('listitem').filter({ hasText: text });
    await todoItem.dblclick();
    const editInput = this.page.getByTestId('todo-item-input');
    await editInput.press('Escape');
  }

  async toggleAllTodos() {
    await this.toggleAll.click();
  }

  async clearCompletedTodos() {
    await this.clearCompleted.click();
  }

  async getTodoCount() {
    return this.todoCount;
  }

  async isTodoCompleted(text: string) {
    const todoItem = this.page.getByRole('listitem').filter({ hasText: text });
    const className = await todoItem.getAttribute('class');
    return className?.includes('completed') || false;
  }

  // Screenshot and reporting methods
  async takeScreenshot(name: string = 'screenshot') {
    try {
      const screenshot = await this.page.screenshot({ fullPage: true });
      await allure.attachment(`${name}.png`, screenshot, 'image/png');
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
  }

  async takeScreenshotOnFailure(name: string = 'failure-screenshot') {
    try {
      const screenshot = await this.page.screenshot({ fullPage: true });
      await allure.attachment(`${name}.png`, screenshot, 'image/png');
    } catch (error) {
      console.error('Failed to take failure screenshot:', error);
    }
  }

  async capturePageHTML(name: string = 'page-html') {
    try {
      const html = await this.page.content();
      await allure.attachment(`${name}.html`, html, 'text/html');
    } catch (error) {
      console.error('Failed to capture page HTML:', error);
    }
  }

  async captureConsoleLogs(name: string = 'console-logs') {
    try {
      const logs = await this.page.evaluate(() => {
        return (window as any).consoleLogs || [];
      });
      await allure.attachment(`${name}.txt`, logs.join('\n'), 'text/plain');
    } catch (error) {
      console.error('Failed to capture console logs:', error);
    }
  }

  // Enhanced methods with automatic screenshots
  async addTodoWithScreenshot(text: string, screenshotName?: string) {
    await this.addTodo(text);
    if (screenshotName) {
      await this.takeScreenshot(screenshotName);
    }
  }

  async toggleTodoWithScreenshot(text: string, screenshotName?: string) {
    await this.toggleTodoByText(text);
    if (screenshotName) {
      await this.takeScreenshot(screenshotName);
    }
  }

  async filterWithScreenshot(name: 'All' | 'Active' | 'Completed', screenshotName?: string) {
    await this.filter(name);
    if (screenshotName) {
      await this.takeScreenshot(screenshotName);
    }
  }

  async deleteTodoWithScreenshot(text: string, screenshotName?: string) {
    await this.deleteTodoByText(text);
    if (screenshotName) {
      await this.takeScreenshot(screenshotName);
    }
  }

  async editTodoWithScreenshot(oldText: string, newText: string, screenshotName?: string) {
    await this.editTodoByText(oldText, newText);
    if (screenshotName) {
      await this.takeScreenshot(screenshotName);
    }
  }

  async toggleAllTodosWithScreenshot(screenshotName?: string) {
    await this.toggleAllTodos();
    if (screenshotName) {
      await this.takeScreenshot(screenshotName);
    }
  }

  async clearCompletedTodosWithScreenshot(screenshotName?: string) {
    await this.clearCompletedTodos();
    if (screenshotName) {
      await this.takeScreenshot(screenshotName);
    }
  }

  // Additional helper methods to reduce duplication
  async addMultipleTodos(todos: string[]) {
    for (const todo of todos) {
      await this.addTodo(todo);
    }
  }

  async toggleMultipleTodos(todos: string[]) {
    for (const todo of todos) {
      await this.toggleTodoByText(todo);
    }
  }

  async getTodoItemByText(text: string) {
    return this.page.getByRole('listitem').filter({ hasText: text });
  }

  async expectTodoCompleted(text: string) {
    const todoItem = await this.getTodoItemByText(text);
    await expect(todoItem).toHaveClass(/completed/);
  }

  async expectTodoNotCompleted(text: string) {
    const todoItem = await this.getTodoItemByText(text);
    await expect(todoItem).not.toHaveClass(/completed/);
  }

  async expectTodoCount(count: number) {
    const todos = await this.getTodoLabels();
    await expect(todos).toHaveCount(count);
  }

  async expectTodoText(text: string) {
    const todos = await this.getTodoLabels();
    await expect(todos.first()).toHaveText(text);
  }

  async expectTodoTexts(texts: string[]) {
    const todos = await this.getTodoLabels();
    await expect(todos).toHaveText(texts);
  }
}