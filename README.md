# TermUI

> The missing terminal UI framework for TypeScript.
> Built with React/Ink. Distributed like shadcn. Designed for developers.

[![CI](https://github.com/Arindam200/termui/actions/workflows/ci.yml/badge.svg)](https://github.com/Arindam200/termui/actions)
[![npm](https://img.shields.io/npm/v/termui)](https://www.npmjs.com/package/termui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Why TermUI?

The TypeScript/JS terminal UI ecosystem is fragmented:
- **Ink** ships ~5 basic primitives
- **Blessed** is abandoned
- Nothing has shadcn-style copy-paste distribution

TermUI fixes all three.

---

## Quick Start

```bash
# 1. Initialize in your project
npx termui init

# 2. Add components
npx termui add spinner
npx termui add table select alert

# 3. Browse all components
npx termui list
```

### Your first TermUI app

```tsx
import React from 'react';
import { render } from 'ink';
import { ThemeProvider } from '@termui/core';
import { Spinner, ProgressBar, Alert, Select } from '@termui/components';

function App() {
  return (
    <ThemeProvider>
      <Spinner style="dots" label="Loading…" />
      <ProgressBar value={72} total={100} label="Installing…" />
      <Alert variant="success" title="Done!">
        Your app is ready.
      </Alert>
      <Select
        options={[
          { value: 'npm', label: 'npm' },
          { value: 'pnpm', label: 'pnpm' },
          { value: 'bun', label: 'bun' },
        ]}
        onSubmit={(val) => console.log('Selected:', val)}
      />
    </ThemeProvider>
  );
}

render(<App />);
```

---

## Components (v0.1.0 — 19 components)

| Category | Components |
|---|---|
| Layout | `Box` `Stack` `Grid` `ScrollView` |
| Typography | `Text` `Badge` |
| Input | `TextInput` |
| Selection | `Select` `Checkbox` |
| Data | `List` `Table` |
| Feedback | `Spinner` `ProgressBar` `Alert` |
| Navigation | `Tabs` |
| Overlays | `Modal` |
| Forms | `Form` |
| Utility | `Panel` `Toggle` |

---

## Theming

TermUI ships 3 built-in themes: **Default**, **Dracula**, **Nord**.

```tsx
import { ThemeProvider, draculaTheme, nordTheme } from '@termui/core';

// Wrap your app
<ThemeProvider theme={draculaTheme}>
  <App />
</ThemeProvider>
```

### Custom theme

```tsx
import { createTheme } from '@termui/core';

const myTheme = createTheme({
  name: 'my-brand',
  colors: {
    primary: '#FF6B6B',
    focusRing: '#FF6B6B',
  },
});
```

---

## Hooks

```ts
import {
  useInput,        // keyboard input
  useFocus,        // component focus state
  useFocusManager, // programmatic focus
  useTheme,        // access theme tokens
  useTerminal,     // cols, rows, color depth
  useAnimation,    // frame-based animation
  useInterval,     // safe setInterval
  useClipboard,    // OSC 52 clipboard
  useKeymap,       // declarative keybindings
  useMouse,        // mouse events
  useResize,       // terminal resize
  useAsync,        // async data loading
} from '@termui/core';
```

---

## Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (ESM-only) |
| Renderer | [Ink](https://github.com/vadimdemedes/ink) (React for terminal) |
| Layout | Yoga (Facebook's flexbox engine) |
| Distribution | shadcn/ui-style CLI |
| Runtime | Node.js 18+ |

---

## Monorepo Structure

```
termui/
├── packages/
│   ├── core/          # Terminal layer, styling engine, 12 hooks
│   ├── components/    # 19+ UI components
│   └── cli/           # npx termui CLI tool
├── registry/          # Component registry (schema + meta)
├── examples/
│   └── demo/          # Interactive demo app
└── .github/
    └── workflows/     # CI (Node 18, 20, 22)
```

---

## Development

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test

# Run interactive demo
pnpm --filter @termui/demo start

# Test CLI
node --import tsx/esm packages/cli/src/cli.ts help
node --import tsx/esm packages/cli/src/cli.ts list
```

---

## Roadmap

| Phase | Status | Description |
|---|---|---|
| **Phase 1** | ✅ **Done** | 19 components, CLI (init/add/list), 3 themes, 12 hooks |
| **Phase 2** | 🔜 Planned | 50+ components, full theming, docs site — v1.0 |
| **Phase 3** | 🔜 Planned | All 90+ components, charts, dev tools, templates |
| **Phase 4** | 🔜 Planned | Plugin system, community registry, Vue/Svelte adapters |

---

## License

MIT © [Arindam Majumder](https://studio1hq.com)
