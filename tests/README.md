# TodoMVC End-to-End Test Suite

This directory contains comprehensive end-to-end tests for the TodoMVC React application.

## Test Files

### `todomvc-comprehensive.spec.ts`
The main comprehensive test suite covering all TodoMVC functionality:

#### Test Categories:

1. **Basic Functionality**
   - Page title and placeholder verification
   - Adding single and multiple todos
   - Handling empty and whitespace-only todos

2. **Todo Management**
   - Completing and uncompleting todos
   - Editing todos (double-click, Enter, Escape)
   - Deleting single and multiple todos

3. **Filtering**
   - All, Active, and Completed filters
   - Dynamic filter updates when todos are completed

4. **Bulk Operations**
   - Toggle all todos on/off
   - Clear completed todos
   - Visibility of clear completed button

5. **Counter and Status**
   - Item count display
   - Singular vs plural text handling

6. **Edge Cases**
   - Very long todo text
   - Special characters and emojis
   - Rapid operations

7. **Keyboard Navigation**
   - Enter key for adding/editing
   - Escape key for canceling edits
   - Other key handling

### `test-1.spec.ts`
Optimized test focusing on filtering functionality.

### `test-2.spec.ts`
Simple test for adding and filtering todos.

### `todomvc.spec.ts`
Basic tests for page elements and adding todos.

### `example.spec.ts`
Playwright documentation examples (not TodoMVC related).

## Page Object Model

### `pages/TodoPage.ts`
Page Object Model class providing:
- Locators for all UI elements
- Methods for common actions (add, edit, delete, filter, etc.)
- Reusable test helpers

## Running Tests

```bash
# Run all TodoMVC tests
npx playwright test tests/todomvc-comprehensive.spec.ts

# Run specific test category
npx playwright test tests/todomvc-comprehensive.spec.ts --grep "Basic Functionality"

# Run with UI mode
npx playwright test tests/todomvc-comprehensive.spec.ts --ui

# Run with headed browser
npx playwright test tests/todomvc-comprehensive.spec.ts --headed
```

## Test Coverage

The comprehensive test suite covers:

✅ **Core Features**
- Adding todos
- Completing todos
- Editing todos
- Deleting todos
- Filtering (All/Active/Completed)

✅ **Bulk Operations**
- Toggle all
- Clear completed

✅ **UI Elements**
- Input field
- Todo list
- Filter buttons
- Counter display
- Toggle all checkbox
- Clear completed button

✅ **User Interactions**
- Keyboard navigation
- Mouse interactions
- Form submissions

✅ **Edge Cases**
- Empty inputs
- Long text
- Special characters
- Rapid operations

✅ **State Management**
- Todo persistence
- Filter state
- Counter updates
- UI state changes

## Test Structure

Tests are organized using Playwright's `test.describe()` blocks for better organization and readability. Each test is independent and uses `test.beforeEach()` to set up a fresh application state.

## Best Practices

1. **Page Object Model**: All tests use the `TodoPage` class for better maintainability
2. **Descriptive Names**: Test names clearly describe what they're testing
3. **Independent Tests**: Each test can run independently
4. **Comprehensive Coverage**: Tests cover both happy path and edge cases
5. **Reusable Setup**: Common setup is handled in `beforeEach` hooks 