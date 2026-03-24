---
name: termui
description: Quick reference for TermUI components, hooks, and theming. Use when working inside an existing TermUI project and needing to look up props, hook signatures, theme tokens, or the CLI commands. Pairs with the cli-creator skill for building new CLIs from scratch. Trigger for questions like "what props does Table take", "how does useAsync work", "what are the theme tokens", "which spinner styles are available", or any lookup about TermUI's API surface.
---

# TermUI Reference

TermUI is a TypeScript terminal UI framework built on React/Ink. 101 components, 8 themes, 12 hooks. Shadcn-style: `npx termui add <component>` copies source files into your project.

Always wrap the app root in `<ThemeProvider>`. Components read colors from the theme via `useTheme()`.

## CLI

```bash
npx termui init                     # setup project, creates termui.config.json
npx termui add spinner table select # add components (copies source into project)
npx termui list                     # browse all 101 components
npx termui theme dracula            # switch project theme
npx termui preview <component>      # live preview
```

---

## Component Categories

See `references/components.md` for full props on every component.

| Category | Components |
|----------|------------|
| **Layout** | `Box` `Stack` `Grid` `ScrollView` `Columns` `Center` `Divider` `Spacer` `AspectRatio` |
| **Typography** | `Text` `Heading` `Code` `Link` `Badge` `Tag` `Markdown` `JSONView` `Gradient` `BigText` `Digits` |
| **Input** | `TextInput` `TextArea` `PasswordInput` `NumberInput` `SearchInput` `MaskedInput` `EmailInput` `PathInput` |
| **Selection** | `Select` `MultiSelect` `RadioGroup` `Checkbox` `CheckboxGroup` `Toggle` `TreeSelect` `TagInput` `ColorPicker` |
| **Data** | `Table` `DataGrid` `List` `VirtualList` `Tree` `DirectoryTree` `KeyValue` `Definition` `Card` `Panel` |
| **Feedback** | `Spinner` `ProgressBar` `ProgressCircle` `StatusMessage` `Toast` `Alert` `Banner` `Skeleton` |
| **Navigation** | `Tabs` `TabbedContent` `Breadcrumb` `Pagination` `CommandPalette` `Menu` `Sidebar` |
| **Overlays** | `Modal` `Dialog` `Drawer` `Tooltip` `Popover` |
| **Forms** | `Form` `FormField` `Wizard` `Confirm` `DatePicker` `TimePicker` `FilePicker` |
| **Charts** | `Sparkline` `BarChart` `LineChart` `PieChart` `HeatMap` `Gauge` |
| **Utility** | `Timer` `Stopwatch` `Clock` `Clipboard` `KeyboardShortcuts` `Help` `ErrorBoundary` `Log` `Image` `QRCode` |
| **Templates** | `SplashScreen` `AppShell` `WelcomeScreen` `LoginFlow` `SetupFlow` `UsageMonitor` `InfoBox` `BulletList` `HelpScreen` |

---

## Hooks

All imported from `termui/core`:

```tsx
// Keyboard input
useInput((input, key) => {
  if (key.upArrow) { /* ... */ }
  if (key.escape) { /* ... */ }
  if (key.ctrl && input === 'c') process.exit(0);
});

// Focus management
const { isFocused } = useFocus({ autoFocus: true, id: 'my-input' });
const { focus, focusNext, focusPrev } = useFocusManager();

// Theme
const theme = useTheme();              // read current theme
const setTheme = useThemeUpdater();    // switch theme at runtime

// Terminal
const { columns, rows, hasColor } = useTerminal();
const { columns, rows } = useResize(); // reactive to resize

// Animation & timing
const frame = useAnimation(12);        // 12fps frame counter
useInterval(() => tick(), 1000);       // runs every 1000ms

// Async state
const { data, loading, error } = useAsync(() => fetchData(), []);

// Declarative keybindings
useKeymap([
  { key: 'q', description: 'Quit', handler: () => process.exit(0) },
  { key: 'r', description: 'Refresh', handler: refresh },
]);

// Clipboard
const { copy, paste } = useClipboard();
```

---

## Theming

```tsx
import {
  ThemeProvider, AutoThemeProvider, createTheme, useTheme, useThemeUpdater,
  defaultTheme, draculaTheme, nordTheme, catppuccinTheme,
  monokaiTheme, solarizedTheme, tokyoNightTheme, oneDarkTheme,
} from 'termui/core';

// Wrap app
<ThemeProvider theme={draculaTheme}><App /></ThemeProvider>

// Auto dark/light
<AutoThemeProvider darkTheme={draculaTheme} lightTheme={nordTheme}><App /></AutoThemeProvider>

// Custom theme (merges with default)
const myTheme = createTheme({
  name: 'brand',
  colors: { primary: '#E11D48', accent: '#F97316', focusRing: '#E11D48' },
});
```

**Token shape (all `colors.*` are hex strings):**
`primary` `primaryForeground` `secondary` `secondaryForeground` `accent` `accentForeground`
`success` `warning` `error` `info` (each has a `*Foreground` variant)
`background` `foreground` `muted` `mutedForeground` `border`
`focusRing` `selection` `selectionForeground`

**In a component:** always fall back to theme tokens, never hardcode hex:
```tsx
const theme = useTheme();
const color = props.color ?? theme.colors.primary;
```

---

## Library Adapters

```ts
import { intro, text, select, spinner } from 'termui/clack';  // @clack/prompts wrapper
import pc from 'termui/picocolors';      // picocolors + pc.hex(), pc.theme.primary()
import matter from 'termui/gray-matter'; // gray-matter + <FrontmatterDisplay>
import { useGit, GitStatus } from 'termui/git';
import { useKeychain } from 'termui/keychain';
import { EmbeddedTerminal } from 'termui/pty';
import { createCLI } from 'termui/args';
import { useGitHub } from 'termui/github';
```

---

## Testing

```tsx
import { renderToString, fireEvent, waitFor } from '@termui/testing';

const out = await renderToString(<Spinner label="Loading" />);
expect(out).toContain('Loading');

await fireEvent.keyPress({ upArrow: true });
await waitFor(() => expect(getRow()).toBe(1));
```

---

## Key Constraints

- **ESM-only** — `"type": "module"` required in package.json
- **Node.js 18+**
- **React 18** peer dependency
- Colors: Ink converts hex to ANSI; `NO_COLOR` / `FORCE_COLOR` env vars respected
- `useInput` fires on every keystroke — guard with `if (!isFocused) return` in multi-input UIs
