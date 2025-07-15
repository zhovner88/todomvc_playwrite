import { Page } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

export class PageFactory {
  static getTodoPage(page: Page): TodoPage {
    return new TodoPage(page);
  }
} 