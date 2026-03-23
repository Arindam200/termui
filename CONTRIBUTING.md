# Contributing to TermUI

Thanks for your interest in contributing! This guide covers everything you need to get started.

## Table of Contents

- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Adding a Component](#adding-a-component)
- [Writing Tests](#writing-tests)
- [Commit Style](#commit-style)
- [Pull Requests](#pull-requests)
- [Reporting Issues](#reporting-issues)

---

## Project Structure

```
termui/
├── packages/
│   ├── core/          # Terminal layer, styling engine, 12 hooks
│   ├── components/    # 101 UI components
│   ├── testing/       # Headless testing utilities
│   ├── adapters/      # Drop-in adapters (clack, picocolors, …)
│   └── cli/           # npx termui CLI
├── registry/          # Component registry (schema + meta)
├── templates/         # Starter app templates
└── examples/
    └── demo/          # Interactive demo app
```

The repo is a **pnpm monorepo** managed with **Turborepo**. Each package under `packages/` is independently versioned and published.

---

## Getting Started

**Requirements:** Node.js 18+, pnpm 9+

```bash
# 1. Fork and clone
git clone https://github.com/<your-username>/termui.git
cd termui

# 2. Install dependencies
pnpm install

# 3. Build core (other packages depend on it)
pnpm --filter @termui/core build

# 4. Run all tests to confirm everything works
pnpm test
```

---

## Development Workflow

```bash
# Run tests across all packages
pnpm test

# Type-check all packages
pnpm typecheck

# Build all packages
pnpm build

# Format all files
pnpm format

# Lint all files
pnpm lint

# Run the interactive demo
pnpm --filter @termui/demo start

# Test the CLI locally (from packages/cli)
pnpm dev
```

CI runs tests on **Node 18, 20, and 22**. Make sure your changes pass on all three if they touch runtime behaviour.

---

## Adding a Component

1. Create the component file in `packages/components/src/<Category>/<ComponentName>.tsx`.
2. Export it from `packages/components/src/index.ts`.
3. Add a registry entry in `registry/` following the existing schema.
4. Write at least one test in `packages/components/src/<Category>/<ComponentName>.test.tsx` using `@termui/testing`.
5. Run `pnpm build` and `pnpm test` to confirm nothing is broken.

### Component checklist

- [ ] Props are fully typed with a `<ComponentName>Props` interface
- [ ] Component respects the active theme via `useTheme()`
- [ ] Keyboard interactions (if any) use `useInput` or `useKeymap`
- [ ] At least one `renderToString` test covers the happy path

---

## Writing Tests

TermUI uses **Vitest** and the `@termui/testing` package for headless component tests.

```ts
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from '@termui/testing';
import { MyComponent } from '../MyComponent.js';

describe('MyComponent', () => {
  it('renders expected text', async () => {
    const output = await renderToString(
      React.createElement(MyComponent, { label: 'Hello' })
    );
    expect(output).toContain('Hello');
  });
});
```

Run tests for a single package:

```bash
pnpm --filter @termui/components test
```

---

## Commit Style

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
```

| Type       | When to use                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | New component, hook, or CLI command              |
| `fix`      | Bug fix                                          |
| `docs`     | Documentation only                               |
| `test`     | Adding or updating tests                         |
| `refactor` | Code change that is not a feature or bug fix     |
| `chore`    | Tooling, config, dependency updates              |

Examples:

```
feat(components): add GanttChart component
fix(testing): use debug mode to capture output in CI
docs(readme): update component count to 101
```

---

## Pull Requests

1. **Branch** off `main` with a descriptive name: `feat/gantt-chart`, `fix/spinner-flicker`.
2. **Keep PRs focused.** One feature or fix per PR makes review faster.
3. **All CI checks must pass** — tests (Node 18/20/22), typecheck, and formatting.
4. **Describe what changed and why** in the PR description. Link any related issues.
5. A maintainer will review and merge. Draft PRs are welcome for early feedback.

---

## Reporting Issues

Open a [GitHub issue](https://github.com/Arindam200/termui/issues) and include:

- TermUI version (`npx termui --version`)
- Node.js version (`node --version`)
- Terminal + OS
- Minimal reproduction steps or a code snippet
- What you expected vs. what actually happened

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
