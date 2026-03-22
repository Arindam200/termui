# TermUI

> The missing terminal UI framework for TypeScript.
> Built with React/Ink. Distributed like shadcn. Designed for developers.

---

TermUI fills the gap in the TypeScript/JS ecosystem — no framework today combines React DX, shadcn-style copy-paste distribution, a comprehensive component library, full theming, and accessibility. TermUI is that framework.

## Why TermUI

- **Ink has ~5 components.** Blessed is abandoned. Nothing offers a complete terminal UI toolkit for TypeScript.
- **shadcn-style distribution** — components live in your project. No black-box abstractions.
- **Accessibility-first** — keyboard-only navigation, screen reader support via ANSI annotations.
- **90+ components** — from inputs and data tables to charts, modals, and full-screen app shells.

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (ESM-only) |
| Renderer | Ink (React reconciler for terminal) |
| Layout | Yoga (Facebook's flexbox engine) |
| Distribution | shadcn/ui-style CLI |
| Runtime | Node.js 18+ (Bun supported) |
| License | MIT |

## Components

**98 components across 11 categories:**

| Category | Components |
|---|---|
| Layout | Box, Stack, Grid, Divider, Spacer, ScrollView, Columns, Center, AspectRatio |
| Typography | Text, Heading, Code, Link, Badge, Tag, Markdown, JSON, Gradient, BigText, Digits |
| Input | TextInput, TextArea, PasswordInput, NumberInput, SearchInput, MaskedInput, EmailInput, PathInput |
| Selection | Select, MultiSelect, RadioGroup, Checkbox, CheckboxGroup, Toggle, TreeSelect, TagInput, ColorPicker |
| Data Display | Table, DataGrid, List, VirtualList, Tree, DirectoryTree, KeyValue, Definition, Card, Panel |
| Feedback | Spinner, ProgressBar, ProgressCircle, StatusMessage, Toast, Alert, Banner, Skeleton |
| Navigation | Tabs, TabbedContent, Breadcrumb, Pagination, CommandPalette, Menu, Sidebar |
| Overlays | Modal, Dialog, Drawer, Tooltip, Popover |
| Forms | Form, FormField, Wizard, Confirm, DatePicker, TimePicker, FilePicker |
| Charts | Sparkline, BarChart, LineChart, PieChart, HeatMap, Gauge |
| Utility | Timer, Stopwatch, Clock, Clipboard, KeyboardShortcuts, Help, ErrorBoundary, Log, Image, QRCode |

**High-level templates:**

- `SplashScreen` — ASCII art banner with gradient, subtitle, and status line
- `InfoBox` — Bordered box with header and tree rows
- `AppShell` + `BulletList` — Full-screen TUI layout with header, input, scrollable content
- `WelcomeScreen` — Two-panel welcome dashboard
- `LoginFlow` — Full-page onboarding/auth screen with figlet title and numbered select
- `UsageMonitor` — Real-time resource dashboard with live metrics and progress bars
- `SetupFlow` — Sequential step flow with clack-style visual language

## Hooks

`useInput` · `useFocus` · `useFocusManager` · `useTheme` · `useTerminal` · `useAnimation` · `useInterval` · `useClipboard` · `useKeymap` · `useMouse` · `useResize` · `useAsync`

## Themes

Default · Dracula · Nord · Catppuccin · Monokai · Solarized · Tokyo Night · One Dark

## CLI

```sh
npx termui init         # scaffold a new project
npx termui add <component>  # copy component into your project
npx termui diff         # compare local component vs registry
npx termui theme        # manage themes
npx termui preview      # live preview components
```

## Adapters

| Package | Description |
|---|---|
| `termui/clack` | Drop-in wrapper for `@clack/prompts` |
| `termui/picocolors` | Drop-in wrapper for `picocolors` + theme integration |
| `termui/gray-matter` | Frontmatter parser + `<FrontmatterDisplay>` component |
| `termui/pty` | `<EmbeddedTerminal>` — spawn real PTY inside a TUI panel |
| `termui/keychain` | `useKeychain()` — OS secure credential storage |
| `termui/git` | `useGit()` + `<GitStatus>` via simple-git |
| `termui/args` | Styled `--help` + `createCLI()` via yargs |
| `termui/github` | `useGitHub()` via @octokit/rest |

## Roadmap

| Phase | Timeline | Goal |
|---|---|---|
| v0.1.0 beta | Month 1–2 | 15 core components, CLI init+add, 3 themes |
| v1.0 | Month 3–4 | 50+ components, full theming, docs site |
| v1.x | Month 5–6 | All 90 components, charts, dev tools, 4 templates |
| v2.0+ | Month 7+ | Plugin system, community registry, Vue/Svelte adapters |

---

Built by [Arindam Majumder](https://studio1hq.com) · MIT License
