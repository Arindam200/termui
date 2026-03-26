![TermUI demo](.github/assets/demo.png)

<div align="center">

# TermUI

**Build beautiful terminal interfaces with React components you actually own.**

[![CI](https://github.com/Arindam200/termui/actions/workflows/ci.yml/badge.svg)](https://github.com/Arindam200/termui/actions)
[![npm](https://img.shields.io/npm/v/termui)](https://www.npmjs.com/package/termui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Quick Start](#quick-start) &bull; [Components](#component-categories) &bull; [Adapters](#library-adapters) &bull; [Theming](#theming) &bull; [CLI](#cli) &bull; [Docs](./docs)

</div>

---

TermUI is a comprehensive terminal UI framework for TypeScript, with **101+ components**, **9 themes**, **12 hooks**, and a shadcn-style CLI that copies source code directly into your project. No black-box dependency. No version lock-in. Just code you own and can customize.

```bash
npx termui add spinner table select alert
```

### Why TermUI?

The terminal UI landscape in JavaScript is stuck. **Ink** gives you 5 primitives and leaves the rest to you. **Blessed** hasn't seen a commit in years. Neither offers a component library with real breadth (charts, forms, data grids, templates), and nothing gives you shadcn-style distribution where you own every line.

TermUI fills that gap:

- **101+ production-ready components:** from `Spinner` and `Table` to `LineChart`, `DataGrid`, `LoginFlow`, and `QRCode`
- **Copy-paste distribution:** `npx termui add` drops source files into your project; no runtime dependency on the registry
- **Themeable everything:** swap between Dracula, Nord, Catppuccin, and 6 more with a single command, or create your own
- **React mental model:** if you know React, you already know TermUI; it's JSX, hooks, and flexbox all the way down
- **Built-in testing:** `@termui/testing` gives you `renderToString`, `fireEvent`, and `waitFor` for headless component tests

---

## Quick Start

```bash
# Launch the interactive menu
npx termui

# Or use commands directly
npx termui init
npx termui add spinner
npx termui add table select alert
npx termui list
```

## Zero to CLI in 60 seconds

```bash
# 1. Scaffold a new project
npx termui create my-cli --template cli

# 2. Add components
cd my-cli
npx termui add spinner table select

# 3. Run your app
npm run dev
```

Or start with an AI chat interface:

```bash
npx termui create my-ai-tool --template ai-assistant
```

---

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

## Component Categories

| Category              | Components                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout** (9)        | `Box` `Stack` `Grid` `Divider` `Spacer` `ScrollView` `Columns` `Center` `AspectRatio`                                                    |
| **Typography** (11)   | `Text` `Heading` `Code` `Link` `Badge` `Tag` `Markdown` `JSON` `Gradient` `BigText` `Digits`                                             |
| **Input** (8)         | `TextInput` `TextArea` `PasswordInput` `NumberInput` `SearchInput` `MaskedInput` `EmailInput` `PathInput`                                |
| **Selection** (9)     | `Select` `MultiSelect` `RadioGroup` `Checkbox` `CheckboxGroup` `Toggle` `TreeSelect` `TagInput` `ColorPicker`                            |
| **Data Display** (10) | `Table` `DataGrid` `List` `VirtualList` `Tree` `DirectoryTree` `KeyValue` `Definition` `Card` `Panel`                                    |
| **Feedback** (9)      | `Spinner` `ProgressBar` `ProgressCircle` `StatusMessage` `Toast` `Alert` `Banner` `Skeleton` `MultiProgress`                             |
| **Navigation** (7)    | `Tabs` `TabbedContent` `Breadcrumb` `Pagination` `CommandPalette` `Menu` `Sidebar`                                                       |
| **Overlays** (7)      | `Modal` `Dialog` `Drawer` `Tooltip` `Popover` `NotificationCenter` `NotificationBadge`                                                   |
| **Forms** (7)         | `Form` `FormField` `Wizard` `Confirm` `DatePicker` `TimePicker` `FilePicker`                                                             |
| **Charts** (6)        | `Sparkline` `BarChart` `LineChart` `PieChart` `HeatMap` `Gauge`                                                                          |
| **Utility** (12)      | `Timer` `Stopwatch` `Clock` `Clipboard` `KeyboardShortcuts` `Help` `ErrorBoundary` `Log` `Image` `QRCode` `EmbeddedTerminal` `GitStatus` |
| **Templates** (9)     | `SplashScreen` `InfoBox` `AppShell` `BulletList` `WelcomeScreen` `LoginFlow` `UsageMonitor` `SetupFlow` `HelpScreen`                     |

Browse everything: `npx termui list` or `npx termui preview`

---

## Library Adapters

TermUI wraps popular CLI libraries so you can use familiar APIs with TermUI theming:

```ts
// @clack/prompts-style interactive prompts
import { intro, text, select, spinner } from 'termui/clack';

// picocolors-compatible color API + hex/theme extras
import pc from 'termui/picocolors';
console.log(pc.bold(pc.green('Success!')));

// Non-React imperative prompt API
import { intro, text, confirm, outro } from 'termui/imperative';

// Git status in your TUI
import { useGit } from 'termui/git';

// Styled --help generation
import { createCLI } from 'termui/args';

// AI provider hooks (streaming)
import { useChat, useCompletion } from 'termui/ai';

// chalk-compatible color API with TermUI theme integration
import chalk from 'termui/chalk';

// ora-compatible spinner with TermUI styling
import ora from 'termui/ora';

// meow-compatible CLI argument parser
import meow from 'termui/meow';

// commander-compatible program builder
import { program } from 'termui/commander';

// inquirer-compatible interactive prompts
import { input, confirm, select } from 'termui/inquirer';
```

### Framework Type Bridges

`termui/vue` and `termui/svelte` provide framework-agnostic type bridges so TermUI component prop types can be consumed in Vue and Svelte projects without pulling in React:

```ts
import type { SpinnerProps, TableProps } from 'termui/vue';
import type { AlertProps, SelectProps } from 'termui/svelte';
```

---

## CLI

`npx termui` with no arguments launches a full interactive menu:

![Interactive-demo](.github/assets/interactive-demo.png)

| Command                         | Description                               |
| ------------------------------- | ----------------------------------------- |
| `npx termui`                    | Interactive menu                          |
| `npx termui init`               | Initialize TermUI in your project         |
| `npx termui add <component>`    | Add one or more components                |
| `npx termui add --all`          | Add all 101 components at once            |
| `npx termui update <component>` | Re-download a component from the registry |
| `npx termui list`               | Browse all available components           |
| `npx termui diff <component>`   | Show diff vs registry version             |
| `npx termui theme [name]`       | List or apply a theme                     |
| `npx termui preview`            | Interactive component gallery             |
| `npx termui dev`                | Watch mode: hot-reload on file change     |

---

## Theming

TermUI ships 9 built-in themes.

```bash
npx termui theme dracula
npx termui theme nord
npx termui theme catppuccin
```

| Theme           | Description                     |
| --------------- | ------------------------------- |
| `default`       | Clean, neutral palette          |
| `dracula`       | Dark purple with vibrant colors |
| `nord`          | Arctic, north-bluish palette    |
| `catppuccin`    | Soothing pastel mocha tones     |
| `monokai`       | Classic warm dark theme         |
| `tokyo-night`   | Vibrant neon city               |
| `one-dark`      | Atom-inspired dark              |
| `solarized`     | Ethan Schoonover classic        |
| `high-contrast` | Accessibility-focused palette   |

Or use a theme programmatically:

```tsx
import { ThemeProvider, draculaTheme } from '@termui/core';

<ThemeProvider theme={draculaTheme}>
  <App />
</ThemeProvider>;
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
  useInput, // keyboard input
  useFocus, // component focus state
  useFocusManager, // programmatic focus
  useTheme, // access theme tokens
  useTerminal, // cols, rows, color depth
  useAnimation, // frame-based animation
  useInterval, // safe setInterval
  useClipboard, // OSC 52 clipboard
  useKeymap, // declarative keybindings
  useMouse, // mouse events
  useResize, // terminal resize
  useAsync, // async data loading
} from '@termui/core';
```

---

## AI Components

TermUI ships a dedicated set of AI/LLM UI components for building chat interfaces and agent UIs:

| Component       | Description                                                      |
| --------------- | ---------------------------------------------------------------- |
| `ChatMessage`   | Renders a single chat turn with role, content, and style         |
| `ChatThread`    | Scrollable thread of `ChatMessage` components                    |
| `ToolCall`      | Displays a tool/function call with name and arguments            |
| `ThinkingBlock` | Collapsible reasoning/thinking block for chain-of-thought output |
| `TokenUsage`    | Shows prompt/completion/total token counts                       |
| `ModelSelector` | Interactive picker for AI model selection                        |
| `FileChange`    | Diff-style display of file modifications from an agent           |
| `ToolApproval`  | Confirmation prompt before executing a tool call                 |

The `termui/ai` adapter provides streaming React hooks:

```ts
import { useChat, useCompletion } from 'termui/ai';

// useChat — multi-turn conversation with streaming
const { messages, input, handleSubmit, isLoading } = useChat({ api: '/api/chat' });

// useCompletion — single-turn streaming text completion
const { completion, complete, isLoading } = useCompletion({ api: '/api/complete' });
```

---

## Testing

`@termui/testing` provides headless testing utilities for TermUI components:

```ts
import { renderToString, screen, waitFor, fireEvent } from '@termui/testing';

const output = await renderToString(<Spinner style="dots" />);
expect(screen.hasText('⠋', output)).toBe(true);
```

| Export               | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `renderToString`     | Render a component to a plain string (one frame)        |
| `createTestRenderer` | Reusable renderer with `render` / `cleanup`             |
| `screen`             | Query helpers: `getByText`, `hasText`, `getLines`, etc. |
| `fireEvent`          | Simulate keyboard input: `key`, `type`, `press`         |
| `waitFor`            | Poll an assertion until it passes or times out          |

---

## Stack

| Layer        | Technology                                                      |
| ------------ | --------------------------------------------------------------- |
| Language     | TypeScript (ESM-only)                                           |
| Renderer     | [Ink](https://github.com/vadimdemedes/ink) (React for terminal) |
| Layout       | Yoga (Facebook's flexbox engine)                                |
| Distribution | shadcn/ui-style CLI                                             |
| Runtime      | Node.js 18+                                                     |

---

## Monorepo Structure

```
termui/
├── packages/
│   ├── core/          # Terminal layer, styling engine, 12 hooks
│   ├── components/    # 101 UI components (including AI components)
│   ├── testing/       # Headless testing utilities
│   ├── adapters/      # Drop-in adapters (clack, chalk, ora, meow, commander, inquirer, vue, svelte…)
│   ├── types/         # Framework-agnostic TypeScript type definitions (@termui/types)
│   └── cli/           # npx termui CLI tool
├── registry/          # Component registry (schema + meta)
├── templates/         # Starter app templates
├── examples/
│   ├── demo/          # Interactive demo app
│   └── ai-demo/       # AI chat interface demo
└── .github/
    ├── assets/        # README images and media
    └── workflows/     # CI (Node 18, 20, 22)
```

---

## Development

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test

# Type-check all packages
pnpm typecheck

# Build all packages
pnpm build

# Run interactive demo
pnpm --filter @termui/demo start

# Test CLI locally (from packages/cli)
pnpm dev
```

---

## Roadmap

| Phase       | Status         | Description                                                                                                        |
| ----------- | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Phase 1** | ✅ **Done**    | 19 components, CLI (init/add/list), 3 themes, 12 hooks                                                             |
| **Phase 2** | ✅ **Done**    | 75 components, 9 themes, adapters, diff/update/theme commands                                                      |
| **Phase 3** | ✅ **Done**    | 101 components, charts, dev tools, templates, testing package                                                      |
| **Phase 4** | 🚧 In Progress | AI components, streaming hooks, chalk/ora/meow/commander/inquirer/Vue/Svelte adapters, `@termui/types`, 600+ tests |
| **Phase 5** | 🔜 Planned     | Plugin system, community registry                                                                                  |

---

## License

MIT © [Arindam Majumder](https://arindammajumder.com)
