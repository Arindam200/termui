![TermUI demo](.github/assets/demo.png)

<div align="center">

# TermUI

**Build beautiful terminal interfaces with React components you actually own.**

[![CI](https://github.com/Arindam200/termui/actions/workflows/ci.yml/badge.svg)](https://github.com/Arindam200/termui/actions)
[![npm](https://img.shields.io/npm/v/termui)](https://www.npmjs.com/package/termui)
[![npm downloads](https://img.shields.io/npm/dm/termui)](https://www.npmjs.com/package/termui)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Quick Start](#quick-start) &bull; [Documentation](#documentation) &bull; [Components](#component-categories) &bull; [Adapters](#library-adapters) &bull; [Theming](#theming) &bull; [CLI](#cli) &bull; [Development](#development)

</div>

---

TermUI is a comprehensive terminal UI framework for TypeScript, with **101+ components**, **8 themes**, **12 hooks**, and a shadcn-style CLI that copies source code directly into your project. No black-box dependency. No version lock-in. Just code you own and can customize.

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
- **Built-in testing:** `termui/testing` gives you `renderToString`, `fireEvent`, and `waitFor` for headless component tests

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
import { ThemeProvider } from 'termui';
import { Spinner, ProgressBar, Alert, Select } from 'termui/components';

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

| Category              | Components                                                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout** (9)        | `Box` `Stack` `Grid` `Divider` `Spacer` `ScrollView` `Columns` `Center` `AspectRatio`                                                   |
| **Typography** (11)   | `Text` `Heading` `Code` `Link` `Badge` `Tag` `Markdown` `JSON` `Gradient` `BigText` `Digits`                                            |
| **Input** (8)         | `TextInput` `TextArea` `PasswordInput` `NumberInput` `SearchInput` `MaskedInput` `EmailInput` `PathInput`                               |
| **Selection** (9)     | `Select` `MultiSelect` `RadioGroup` `Checkbox` `CheckboxGroup` `Toggle` `TreeSelect` `TagInput` `ColorPicker`                           |
| **Data Display** (11) | `Table` `DataGrid` `List` `VirtualList` `Tree` `DirectoryTree` `KeyValue` `Definition` `Card` `Panel` `GitStatus`                       |
| **Feedback** (9)      | `Spinner` `ProgressBar` `ProgressCircle` `StatusMessage` `Toast` `Alert` `Banner` `Skeleton` `MultiProgress`                            |
| **Navigation** (7)    | `Tabs` `TabbedContent` `Breadcrumb` `Pagination` `CommandPalette` `Menu` `Sidebar`                                                      |
| **Overlays** (7)      | `Modal` `Dialog` `Drawer` `Tooltip` `Popover` `NotificationCenter` `NotificationBadge`                                                  |
| **Forms** (7)         | `Form` `FormField` `Wizard` `Confirm` `DatePicker` `TimePicker` `FilePicker`                                                            |
| **Charts** (6)        | `Sparkline` `BarChart` `LineChart` `PieChart` `HeatMap` `Gauge`                                                                         |
| **Utility** (12)      | `Timer` `Stopwatch` `Clock` `Clipboard` `KeyboardShortcuts` `Help` `ErrorBoundary` `Log` `Image` `QRCode` `EmbeddedTerminal` `Profiler` |
| **Templates** (9)     | `SplashScreen` `InfoBox` `AppShell` `BulletList` `WelcomeScreen` `LoginFlow` `UsageMonitor` `SetupFlow` `HelpScreen`                    |

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

// AI provider hooks (streaming) — Anthropic, OpenAI, Ollama, custom
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

// ffmpeg-based voice capture for push-to-talk dictation in TextInput
import { createFfmpegMicCapture } from 'termui/voice';
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
| `npx termui mcp`                | Start the TermUI MCP server (stdio)       |
| `npx termui add mcp`            | Install MCP server config (local/global)  |

---

## Theming

TermUI ships 8 built-in themes.

```bash
npx termui theme dracula
npx termui theme nord
npx termui theme catppuccin
```

| Theme         | Description                     |
| ------------- | ------------------------------- |
| `default`     | Clean, neutral palette          |
| `dracula`     | Dark purple with vibrant colors |
| `nord`        | Arctic, north-bluish palette    |
| `catppuccin`  | Soothing pastel mocha tones     |
| `monokai`     | Classic warm dark theme         |
| `tokyo-night` | Vibrant neon city               |
| `one-dark`    | Atom-inspired dark              |
| `solarized`   | Ethan Schoonover classic        |

Or use a theme programmatically:

```tsx
import { ThemeProvider, draculaTheme } from 'termui';

<ThemeProvider theme={draculaTheme}>
  <App />
</ThemeProvider>;
```

### Custom theme

```tsx
import { createTheme } from 'termui';

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
  useKeyboardNavigation, // arrow/Home/End/PgUp/PgDn/Enter/Esc for list components
  useFocusTrap, // trap Tab focus within overlays (Modal, Drawer, Dialog)
  useTheme, // access theme tokens
  useTerminal, // cols, rows, color depth
  useAnimation, // frame-based animation
  useInterval, // safe setInterval
  useClipboard, // OSC 52 clipboard
  useKeymap, // declarative keybindings
  useMouse, // mouse events
  useResize, // terminal resize
  useAsync, // async data loading
} from 'termui';
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
| `TokenUsage`    | Shows prompt/completion/total token counts with optional cost    |
| `ContextMeter`  | Progress bar showing context window usage with warn/critical zones |
| `ModelSelector` | Interactive picker for AI model selection, grouped by provider   |
| `FileChange`    | Diff-style display of file modifications from an agent           |
| `ToolApproval`        | Confirmation prompt before executing a tool call (risk-gated)    |
| `StreamOutput`        | Standalone streaming display — animates text or AsyncIterable    |
| `ConversationHistory` | Scrollable wrapper for ChatMessage history with ↑↓ navigation    |
| `ErrorRetry`          | Error state with keyboard retry/dismiss affordance               |

The `termui/ai` adapter provides streaming React hooks:

```ts
import { useChat, useCompletion } from 'termui/ai';

// useChat — multi-turn conversation with streaming
const { messages, sendMessage, isStreaming, abort, tokenUsage } = useChat({
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// useCompletion — single-turn streaming text completion
const { completion, complete, isLoading } = useCompletion({ api: '/api/complete' });
```

The `ai-assistant` template (`npx termui create my-tool --template ai-assistant`) is a fully-wired chat app including ChatThread, ToolApproval, ModelSelector, TokenUsage, ContextMeter, and ConversationStore — ready to run with Anthropic, OpenAI, or Ollama.

---

## MCP Integration

TermUI ships a built-in [Model Context Protocol](https://modelcontextprotocol.io) server so AI assistants (Claude Code, Cursor, GitHub Copilot) can browse and install components on your behalf.

```bash
# Start the server directly (stdio transport)
npx termui mcp

# Or install the config for your AI tool
npx termui add mcp
```

`npx termui add mcp` prompts you to choose one of three installation targets:

| Scope | Config file written |
| --- | --- |
| **Local project** | `.mcp.json` (Claude Code project scope) |
| **Global — Claude Code** | `~/.claude/settings.json` |
| **Global — Claude Desktop** | `~/Library/Application Support/Claude/claude_desktop_config.json` |

Once installed, your AI assistant gets five tools:

| Tool | Description |
| --- | --- |
| `list_components` | Browse all components grouped by category |
| `add_component` | Install component(s) into the current project |
| `get_component_docs` | Full props + usage for a specific component |
| `search_components` | Keyword search over the registry |
| `get_theme_tokens` | List available themes and their token structure |

---

## Testing

`termui/testing` provides headless testing utilities for TermUI components:

```ts
import { renderToString, screen, waitFor, fireEvent } from 'termui/testing';

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

## Voice Dictation

`TextInput` supports push-to-talk voice dictation via the `voice` prop. Provide a capture factory and a transcription function — the component handles the rest:

```ts
import { createFfmpegMicCapture } from 'termui/voice';
import OpenAI from 'openai';

const openai = new OpenAI();

<TextInput
  value={value}
  onChange={setValue}
  voice={{
    captureFactory: () => createFfmpegMicCapture(),
    transcribe: async (wav) => {
      const res = await openai.audio.transcriptions.create({
        file: new File([wav], 'audio.wav', { type: 'audio/wav' }),
        model: 'whisper-1',
      });
      return res.text;
    },
  }}
/>
```

`createFfmpegMicCapture` requires `ffmpeg` in `PATH`. Platform backends default automatically: `avfoundation` (macOS), `dshow` (Windows), `pulse` (Linux).

---

## Documentation

In-repo docs live under [`docs/`](./docs). Start at **[docs/index.md](./docs/index.md)** for the overview and category guides (layout, typography, feedback, charts, and more). API-focused pages:

| Doc                                                  | Contents                              |
| ---------------------------------------------------- | ------------------------------------- |
| [docs/api/cli.md](./docs/api/cli.md)                 | CLI reference                         |
| [docs/api/hooks.md](./docs/api/hooks.md)             | Hooks API                             |
| [docs/api/testing.md](./docs/api/testing.md)         | Testing utilities                     |
| [docs/adapters.md](./docs/adapters.md)               | Adapters overview                     |
| [docs/accessibility.md](./docs/accessibility.md)     | Keyboard nav, focus traps, ARIA, env vars |

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
    └── workflows/     # CI (Node 18, 20, 22 × macOS, Linux, Windows + registry check)
```

---

## Development

This repository is a **pnpm** workspace with **Turborepo**. Use the same toolchain CI uses so local results match the checks on a PR.

### Prerequisites

| Requirement | Notes                                                                                                                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Node.js** | **18+** (CI runs 18, 20, and 22)                                                                                                                                                                                                     |
| **pnpm**    | **9.x** — this repo pins `packageManager` in `package.json`. Enable with [Corepack](https://nodejs.org/api/corepack.html): `corepack enable` then `corepack prepare pnpm@9.0.0 --activate` (or match the version in `package.json`). |

Do not use `npm` or `yarn` at the repo root; workspace protocol and scripts expect **pnpm**.

### First-time setup

```bash
git clone https://github.com/Arindam200/termui.git
cd termui
pnpm install

# Build core first — other packages depend on it
pnpm --filter @termui/core build

pnpm test
```

Full fork-and-PR workflow, commit conventions, and component checklist: **[CONTRIBUTING.md](./CONTRIBUTING.md)**. For registry and component structure: **[CONTRIBUTING_COMPONENTS.md](./CONTRIBUTING_COMPONENTS.md)**.

### Common commands

```bash
# Tests (all packages)
pnpm test

# Type-check
pnpm typecheck

# Build everything
pnpm build

# Format & lint
pnpm format
pnpm lint

# Interactive demo app
pnpm --filter @termui/demo start

# AI demo (examples/ai-demo)
pnpm --filter @termui/ai-demo start

# Dev: parallel package watch (Turborepo)
pnpm dev

# CLI package only — run from repo root
pnpm --filter @termui/cli dev
```

### Troubleshooting

| Problem                              | What to try                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| Build or test fails after `git pull` | `pnpm install`, then `pnpm --filter @termui/core build`, then `pnpm build` or `pnpm test`. |
| Wrong package manager errors         | Use **pnpm** from the repo root, not npm/yarn.                                             |
| Stale Turborepo cache                | `pnpm exec turbo run build --force` (or your usual clean build).                           |
| Type errors across packages          | Run `pnpm typecheck` after a full `pnpm build`.                                            |

---

## Roadmap

| Phase       | Status         | Description                                                                                                              |
| ----------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Phase 1** | ✅ **Done**    | 19 components, CLI (init/add/list), 3 themes, 12 hooks                                                                   |
| **Phase 2** | ✅ **Done**    | 75 components, 9 themes, adapters, diff/update/theme commands                                                            |
| **Phase 3** | ✅ **Done**    | 101 components, charts, dev tools, templates, testing package                                                            |
| **Phase 4** | ✅ Complete    | AI components + streaming hooks, chalk/ora/meow/commander/inquirer/Vue/Svelte adapters, voice dictation, Windows CI, NO_UNICODE compat, `termui/testing` subpath, MCP server, accessibility hooks (`useKeyboardNavigation`, `useFocusTrap`), `StreamOutput`, `ConversationHistory`, `ErrorRetry`, `Modal`/`Drawer` focus trapping, 1,300+ tests |
| **Phase 5** | 🔜 Planned     | Plugin system, community registry                                                                                        |

---

## Community & contributing

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — setup, workflow, tests, commits, PRs, reporting issues.
- **[CONTRIBUTING_COMPONENTS.md](./CONTRIBUTING_COMPONENTS.md)** — adding or changing components and registry entries.
- **[GOVERNANCE.md](./GOVERNANCE.md)** — project governance.
- **[Issues](https://github.com/Arindam200/termui/issues)** — bugs and feature requests.

---

## License

MIT © [Arindam Majumder](https://arindammajumder.com)
