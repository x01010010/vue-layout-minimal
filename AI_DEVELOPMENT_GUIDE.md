# AI Development and Maintenance Guide

This guide provides a comprehensive, step-by-step process for developing and maintaining applications based on this Vue 3 skeleton. It is intended for a generative AI to follow.

## Development

This section details the process for adding new features to the application.

### 1. Code Implementation

Adherence to the existing architecture, coding style, and naming conventions is crucial for maintaining a clean and scalable codebase.

**Architecture:**

*   **Component-Based:** All UI elements are encapsulated within Vue components located in `src/components`. New UI features should be implemented as new components.
*   **Composable-Driven State:** Application state and business logic are managed through composables in `src/composables`. For example, [`useLayoutState.ts`](src/composables/useLayoutState.ts:1) manages the layout's state. New complex state logic should be encapsulated in a new composable.
*   **TypeScript:** The project uses TypeScript for type safety. All new code must include type definitions. Type definitions are located in `src/types`.
*   **Vuetify Framework:** The UI is built with the Vuetify component framework. All new UI components should leverage Vuetify components for consistency.

**Coding Style and Naming Conventions:**

*   **Components:** Use PascalCase for component filenames (e.g., `AppHeader.vue`) and when referencing them in templates.
*   **Composables:** Use camelCase for composable filenames and functions (e.g., `useLayoutState.ts`).
*   **Props and Events:** Use camelCase for prop names in script sections and kebab-case in templates.
*   **Variables:** Use camelCase for all variables and functions.
*   **TypeScript:** Adhere to standard TypeScript syntax and best practices.

**Process for Adding a New Feature:**

1.  **Create a New Component:** For any new UI feature, create a new `.vue` file in the `src/components` directory.
2.  **Define Props and Events:** Use TypeScript to define the component's props and events within the `<script setup lang="ts">` block.
3.  **Implement the Template:** Use Vuetify components to build the UI in the `<template>` section.
4.  **Add Logic:** Implement the component's logic in the `<script setup>` section. If the logic is complex or needs to be shared, create a new composable in `src/composables`.
5.  **Style the Component:** Add component-specific styles in a `<style scoped>` block.
6.  **Integrate the Component:** Import and use the new component in the appropriate parent component (e.g., [`AppLayout.vue`](src/components/AppLayout.vue:1)).

### 2. Unit Testing

Unit tests are essential for ensuring code quality and preventing regressions. All new functionality must be accompanied by unit tests.

**Testing Framework:**

The project is set up with `vue-tsc` for type checking, which can be extended with a testing framework like Vitest.

**Procedure for Creating Unit Tests:**

1.  **Install Vitest:** If not already installed, add Vitest to the project:
    ```bash
    npm install -D vitest @vue/test-utils
    ```
2.  **Configure Vite:** Update [`vite.config.ts`](vite.config.ts:1) to include a `test` configuration for Vitest.
3.  **Create Test Files:** For each new component or composable, create a corresponding test file with a `.spec.ts` extension (e.g., `AppHeader.spec.ts`) in a `tests/unit` directory.
4.  **Write Tests:**
    *   **Components:** Use `@vue/test-utils` to mount the component and test its behavior.
        *   Verify that the component renders correctly with different props.
        *   Test that events are emitted correctly.
        *   Assert that the component's state changes as expected in response to user interactions.
    *   **Composables:** Import the composable and test its functions directly.
        *   Test the initial state.
        *   Verify that actions update the state correctly.
        *   Assert that computed properties return the expected values.
5.  **Run Tests:** Execute the tests from the integrated terminal using the `npm test` command (add this script to `package.json`).

### 3. Documentation

Clear documentation is vital for maintainability.

**README.md:**

Update the `README.md` file with:

*   A description of the new feature.
*   Instructions on how to use the new feature.
*   Any new dependencies that were added.

**Code Comments:**

*   Add JSDoc comments to all new functions and composables, explaining their purpose, parameters, and return values.
*   Add comments to complex or non-obvious sections of code to clarify their functionality.

## Maintenance

This section covers the process for maintaining the application.

### 1. Bug Fixing

A systematic approach to bug fixing ensures that issues are resolved effectively.

**Process:**

1.  **Identify the Root Cause:**
    *   Reproduce the bug consistently.
    *   Use the browser's developer tools to inspect the component's state and network requests.
    *   Add logging statements to trace the code's execution flow.
2.  **Implement a Fix:**
    *   Write a failing regression test that reproduces the bug.
    *   Implement the code change to fix the bug.
    *   Ensure that the regression test and all other unit tests pass.
3.  **Create a Regression Test:**
    *   The regression test should fail before the fix is applied and pass after. This ensures the bug will not be reintroduced.

### 2. Refactoring

Refactoring improves the codebase without changing its external behavior.

**Guidelines:**

*   **Identify Areas for Improvement:** Look for code that is complex, duplicated, or difficult to understand.
*   **Refactor in Small Steps:** Make small, incremental changes and run tests after each change to ensure that no functionality is broken.
*   **Focus on Readability and Performance:** Aim to make the code easier to read and more performant.
*   **Update Documentation:** Ensure that all related documentation and code comments are updated to reflect the changes.

### 3. Dependency Updates

Keeping dependencies up-to-date is important for security and performance.

**Steps:**

1.  **Identify Outdated Dependencies:** Use a tool like `npm outdated` to list outdated dependencies.
2.  **Test Updates:**
    *   Update one dependency at a time.
    *   Run all unit tests to ensure that the update has not introduced any breaking changes.
    *   Manually test the application to verify that all features are still working correctly.
3.  **Integrate Updates:** Once an update has been tested and verified, commit the changes.