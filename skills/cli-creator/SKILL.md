---
name: cli-creator
description: Build a complete, working CLI tool using TermUI components. Use this skill whenever someone describes a CLI or TUI app they want to create — a dashboard, a setup wizard, a data browser, a deployment tool, a monitoring app, or any interactive terminal interface. Trigger on phrases like "build me a CLI", "create a terminal app", "make a TUI for", "I want a command-line tool that", "build a CLI that shows", or any request to generate a Node.js CLI from scratch. Even vague requests like "I need a CLI for my project" should trigger this skill.
---

# TermUI CLI Creator

Your job is to build a complete, working CLI project for the user using TermUI. The output is real code — a runnable TypeScript app.

TermUI is a React/Ink-based terminal UI framework. 101 components. Shadcn-style: `npx termui add <component>` copies source files into the user's project. No runtime registry dependency.

---

## Step 1 — Interview the user

Before writing a single line of code, understand what they're building. Ask these questions (you can batch them):

1. **What does the CLI do?** What problem does it solve? (e.g., "manage my deployment configs", "browse GitHub PRs", "monitor server metrics")
2. **What are the main screens or commands?** Does it have subcommands (like `mytool deploy`, `mytool logs`) or is it one interactive TUI session?
3. **What data does it work with?** Lists of things? Forms to fill in? Real-time metrics? File browsing?
4. **Any interactions?** Search? Filters? Edit/create/delete? Confirm dialogs?
5. **Visual style?** Any theme preference? (Dracula, Nord, Catppuccin, Monokai, Solarized, Tokyo Night, One Dark, or default purple) — default to Dracula if they don't care
6. **Tech context?** Do they already have a Node project, or are we starting from zero?

If the request is clear enough (e.g., "build me a Docker container manager with a table view and a detail panel"), skip questions you can infer and just clarify the ones that would change the component selection.

---

## Step 2 — Choose a CLI pattern

Map what they described to one of these patterns. Patterns can be combined.

| Pattern | When to use | Core components |
|---------|-------------|-----------------|
| **Data Browser** | Browse/search/filter a list of items | `AppShell` + `Table` or `VirtualList` + `SearchInput` |
| **Dashboard** | Real-time metrics, logs, charts | `AppShell` + `Tabs` + `BarChart`/`Gauge`/`Sparkline` + `useInterval` |
| **Setup Wizard** | Onboarding, init, configuration | `SetupFlow` + `TextInput`/`Select`/`MultiSelect` + `Spinner` |
| **CRUD Manager** | Create / read / update / delete resources | `AppShell` + `Table` + `Form`/`FormField` + `Modal`/`Confirm` |
| **Auth Flow** | Login, token entry, account setup | `LoginFlow` + `TextInput`/`PasswordInput` + `SetupFlow` |
| **Log Viewer** | Streaming logs, event feeds | `AppShell` + `Log` + `StatusMessage` + `useAsync` |
| **File Browser** | Navigate filesystem, pick files | `AppShell` + `DirectoryTree` or `FilePicker` |

Full working code for each pattern is in `references/patterns.md`. Read it before writing code.

---

## Step 3 — Scaffold the project

### File structure to generate

```
<project-name>/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.tsx          ← entry point: render(<App />) wrapped in ThemeProvider
│   ├── app.tsx            ← root App component, handles routing between screens
│   ├── screens/           ← one file per top-level screen/view
│   │   ├── HomeScreen.tsx
│   │   └── DetailScreen.tsx
│   └── components/        ← TermUI components land here after npx termui add
│       └── (added by CLI)
└── termui.config.json     ← created by npx termui init
```

For single-screen apps (e.g., a simple wizard) you can skip `screens/` and put everything in `app.tsx`.

### `package.json` template

```json
{
  "name": "<project-name>",
  "version": "0.1.0",
  "type": "module",
  "bin": { "<project-name>": "./dist/index.js" },
  "scripts": {
    "dev": "tsx src/index.tsx",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "ink": "^5.0.0",
    "react": "^18.0.0",
    "termui": "latest"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "tsx": "^4.7.0",
    "@types/react": "^18.0.0"
  },
  "engines": { "node": ">=18.0.0" }
}
```

### `tsconfig.json` template

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

### Setup commands to give the user

```bash
cd <project-name>
npm install
npx termui init                     # sets up termui.config.json
npx termui add <component-list>     # install exactly the components you're using
npm run dev                         # run with tsx (hot-reloading)
```

Generate the `npx termui add` command using the kebab-case component names from the registry (e.g., `app-shell`, `table`, `select`, `spinner`, `setup-flow`). List only the components the project actually uses.

---

## Step 4 — Write the code

### Entry point pattern (`src/index.tsx`)

```tsx
#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { ThemeProvider } from 'termui/core';
import { draculaTheme } from 'termui/core';
import { App } from './app.js';

render(
  <ThemeProvider theme={draculaTheme}>
    <App />
  </ThemeProvider>
);
```

### Root app with screen routing (`src/app.tsx`)

```tsx
import React, { useState } from 'react';

type Screen = 'home' | 'detail' | 'create';

export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (screen === 'detail' && selectedId) {
    return <DetailScreen id={selectedId} onBack={() => setScreen('home')} />;
  }
  if (screen === 'create') {
    return <CreateScreen onDone={() => setScreen('home')} />;
  }
  return (
    <HomeScreen
      onSelect={(id) => { setSelectedId(id); setScreen('detail'); }}
      onCreate={() => setScreen('create')}
    />
  );
}
```

### Always wrap in ThemeProvider — never render components without it.

### Keyboard conventions
- `q` / `Ctrl+C` → quit
- `Escape` → go back / cancel
- `↑↓` → navigate lists
- `Enter` → select / confirm
- `Tab` / `Shift+Tab` → switch tabs or focus
- `?` → show help

Implement quit handling in every screen:
```tsx
useInput((input, key) => {
  if (input === 'q' || (key.ctrl && input === 'c')) process.exit(0);
  if (key.escape) onBack?.();
});
```

---

## Step 5 — Component reference quick-pick

Read `references/component-picker.md` to match user needs to specific components with their exact props.

Read `references/patterns.md` for complete, copy-paste-ready implementations of each pattern.

---

## Code quality rules

- Every component that accepts a color prop falls back to `useTheme().colors.primary` — never hardcode hex
- Use `useState` for local UI state, pass callbacks up for cross-screen navigation
- Keep screens focused — one file per screen, props define the screen's contract
- For async work (fetching data, running commands), use `useAsync` from `termui/core` and show `Skeleton` or `Spinner` while loading
- For data that should persist between sessions, use the `conf` adapter (`termui/conf`) which wraps the `conf` npm package
- Add `ErrorBoundary` at the app root so crashes don't leave the terminal in a broken state

---

## Deliver to the user

When done, give them:
1. Every file with its full content (no placeholders like `// TODO`)
2. The exact `npx termui add` command to run
3. `npm install && npm run dev` to try it immediately
4. A one-line description of the keyboard shortcuts

If the app is complex (3+ screens), walk through what each screen does before showing the code.
