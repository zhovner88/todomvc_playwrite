import { Page } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

export class WebApp {
  readonly page: Page;
  readonly todoPage: TodoPage;

  private constructor(page: Page) {
    this.page = page;
    this.todoPage = new TodoPage(page);
    // Add more pages here as needed
  }

  static init(page: Page): WebApp {
    return new WebApp(page);
  }
} 