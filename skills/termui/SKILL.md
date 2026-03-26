---
name: termui
description: Quick reference for TermUI components, hooks, and theming. Use when working inside an existing TermUI project and needing to look up props, hook signatures, theme tokens, or the CLI commands. Pairs with the cli-creator skill for building new CLIs from scratch. Trigger for questions like "what props does Table take", "how does useAsync work", "what are the theme tokens", "which spinner styles are available", "how do I stream AI output", "how do I build a chat UI", or any lookup about TermUI's API surface — including the AI components (StreamingText, ChatThread, ToolCall, ThinkingBlock, DiffView, useChat).
---

# TermUI Reference

TermUI is a TypeScript terminal UI framework built on React/Ink. 101 components + AI components, 8 themes, 12 hooks. Shadcn-style: `npx termui add <component>` copies source files into your project.

Always wrap the app root in `<ThemeProvider>`. Components read colors from the theme via `useTheme()`.

## CLI

```bash
npx termui create my-app            # scaffold a new project (4 templates: minimal, cli, dashboard, wizard)
npx termui init                     # setup termui in an existing project
npx termui add spinner table select # add components (copies source into project)
npx termui list                     # browse all components
npx termui theme dracula            # switch project theme
npx termui preview <component>      # live preview
```

---

## Component Categories

See `references/components.md` for full props on every component.

| Category       | Components                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Layout**     | `Box` `Stack` `Grid` `ScrollView` `Columns` `Center` `Divider` `Spacer` `AspectRatio`                                         |
| **Typography** | `Text` `Heading` `Code` `Link` `Badge` `Tag` `Markdown` `StreamingText` `JSONView` `Gradient` `BigText` `Digits`              |
| **Input**      | `TextInput` `TextArea` `PasswordInput` `NumberInput` `SearchInput` `MaskedInput` `EmailInput` `PathInput`                     |
| **Selection**  | `Select` `MultiSelect` `RadioGroup` `Checkbox` `CheckboxGroup` `Toggle` `TreeSelect` `TagInput` `ColorPicker`                 |
| **Data**       | `Table` `DataGrid` `List` `VirtualList` `Tree` `DirectoryTree` `KeyValue` `Definition` `Card` `Panel` `DiffView`              |
| **Feedback**   | `Spinner` `ProgressBar` `ProgressCircle` `StatusMessage` `Toast` `Alert` `Banner` `Skeleton`                                  |
| **Navigation** | `Tabs` `TabbedContent` `Breadcrumb` `Pagination` `CommandPalette` `Menu` `Sidebar`                                            |
| **Overlays**   | `Modal` `Dialog` `Drawer` `Tooltip` `Popover`                                                                                 |
| **Forms**      | `Form` `FormField` `Wizard` `Confirm` `DatePicker` `TimePicker` `FilePicker`                                                  |
| **Charts**     | `Sparkline` `BarChart` `LineChart` `PieChart` `HeatMap` `Gauge`                                                               |
| **Utility**    | `Timer` `Stopwatch` `Clock` `Clipboard` `KeyboardShortcuts` `Help` `ErrorBoundary` `Log` `Image` `QRCode`                     |
| **Templates**  | `SplashScreen` `AppShell` `WelcomeScreen` `LoginFlow` `SetupFlow` `UsageMonitor` `InfoBox` `BulletList` `HelpScreen`          |
| **AI**         | `ChatThread` `ChatMessage` `ToolCall` `ThinkingBlock` `ToolApproval` `TokenUsage` `ContextMeter` `ModelSelector` `FileChange` |

---

## Hooks

All imported from `termui/core`:

```tsx
// Keyboard input
useInput((input, key) => {
  if (key.upArrow) {
    /* ... */
  }
  if (key.escape) {
    /* ... */
  }
  if (key.ctrl && input === 'c') process.exit(0);
});

// Focus management
const { isFocused } = useFocus({ autoFocus: true, id: 'my-input' });
const { focus, focusNext, focusPrev } = useFocusManager();

// Theme
const theme = useTheme(); // read current theme
const setTheme = useThemeUpdater(); // switch theme at runtime

// Terminal
const { columns, rows, hasColor } = useTerminal();
const { columns, rows } = useResize(); // reactive to resize

// Animation & timing
const frame = useAnimation(12); // 12fps frame counter
useInterval(() => tick(), 1000); // runs every 1000ms

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
import { intro, text, select, spinner, tasks } from 'termui/clack'; // @clack/prompts wrapper
import pc from 'termui/picocolors'; // picocolors + pc.hex(), pc.theme.primary()
import { matter, matterWithYaml } from 'termui/gray-matter';
import { useGit, GitStatus } from 'termui/git';
import { useKeychain } from 'termui/keychain';
import { EmbeddedTerminal } from 'termui/pty';
import { createCLI, createOutput, withGracefulExit } from 'termui/args';
import { useGitHub } from 'termui/github';
import { useChat, useCompletion } from 'termui/ai'; // AI streaming hooks
import { createConversationStore } from 'termui/ai'; // conversation persistence
```

---

## AI Components

For building AI-powered CLIs (streaming chat, tool calls, diffs). All in `packages/components/src/ai/`.

### `StreamingText` (typography)

```tsx
// Token-by-token streaming output with blinking cursor
<StreamingText text={partialResponse} cursor="▌" />

// From an async iterator
<StreamingText stream={tokenStream} onComplete={(full) => saveMessage(full)} />

// Typing animation for pre-buffered text
<StreamingText text={fullText} animate speed={30} />
```

### `Markdown` with streaming

```tsx
// Pass streaming prop — handles partial code fences and appends cursor
<Markdown streaming cursor="▌">
  {partialMarkdownFromLLM}
</Markdown>
```

### `ChatThread` + `ChatMessage`

```tsx
<ChatThread maxHeight={30} autoScroll>
  <ChatMessage role="user" name="You">
    Explain React hooks
  </ChatMessage>
  <ChatMessage role="assistant" name="Claude" streaming>
    <StreamingText text={response} cursor="▌" />
  </ChatMessage>
  <ChatMessage role="system" collapsed>
    System prompt…
  </ChatMessage>
</ChatThread>
// role: 'user'|'assistant'|'system'|'error'
// streaming prop shows ●●● typing indicator while true
```

### `ToolCall`

```tsx
<ToolCall
  name="read_file"
  args={{ path: '/src/index.ts' }}
  status="running" // 'pending'|'running'|'success'|'error'
  result={fileContents}
  duration={230}
  collapsible
/>
```

### `ThinkingBlock`

```tsx
<ThinkingBlock
  content={thinkingTokens}
  streaming
  defaultCollapsed={true}
  label="Reasoning"
  tokenCount={1247}
/>
// Space/Enter to expand — shows "▶ Reasoning (1,247 tokens)" when collapsed
```

### `ToolApproval`

```tsx
<ToolApproval
  name="run_command"
  args={{ command: 'rm -rf node_modules' }}
  risk="medium" // 'low'|'medium'|'high'
  onApprove={() => {}}
  onDeny={() => {}}
  onAlwaysAllow={() => {}}
  timeout={30} // auto-deny after N seconds
/>
// Keys: y approve, n deny, a always-allow
```

### `TokenUsage` + `ContextMeter`

```tsx
// Inline token/cost summary
<TokenUsage prompt={1200} completion={850} model="claude-sonnet-4-6" showCost />
// ⟨ 1.2k in / 850 out · $0.003 ⟩

// Context window progress bar
<ContextMeter used={45000} limit={200000} label="Context" showPercent warnAt={80} criticalAt={95} />
```

### `ModelSelector`

```tsx
<ModelSelector
  models={[
    { id: 'claude-sonnet-4-6', name: 'Claude Sonnet', provider: 'anthropic', context: 200000 },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', context: 128000 },
  ]}
  selected={model}
  onSelect={setModel}
  showContext
  groupByProvider
/>
```

### `FileChange`

```tsx
<FileChange
  changes={[
    { path: 'src/index.ts', type: 'modify', diff: unifiedDiff },
    { path: 'src/utils.ts', type: 'create', content: newContent },
    { path: 'old.ts', type: 'delete' },
  ]}
  onAccept={(path) => applyChange(path)}
  onReject={(path) => rejectChange(path)}
  onAcceptAll={() => applyAll()}
/>
// Keys: ↑↓ navigate files, Enter expand/collapse, y accept, n reject
```

### `DiffView` (data category)

```tsx
<DiffView
  oldText={original}
  newText={modified}
  filename="src/index.ts"
  language="typescript"
  mode="unified" // 'unified'|'split'|'inline'
  context={3}
  showLineNumbers
/>
```

### `termui/ai` — provider-agnostic hooks

```ts
import { useChat, useCompletion, createConversationStore } from 'termui/ai';

// Full chat with history
const { messages, sendMessage, isStreaming, abort, error, tokenUsage } = useChat({
  provider: 'anthropic', // 'anthropic'|'openai'|'ollama'|'custom'
  model: 'claude-sonnet-4-6',
  apiKey: process.env.ANTHROPIC_API_KEY,
  system: 'You are a helpful assistant.',
  onToolCall: async (call) => executeToolCall(call),
});

// Single-turn completion
const { complete, result, isStreaming } = useCompletion({ provider: 'anthropic', model: '...' });

// Conversation persistence
const store = createConversationStore({ dir: '~/.myapp/conversations', format: 'jsonl' });
await store.save(id, messages);
const history = await store.load(id);
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
