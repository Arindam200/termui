# TermUI — Technical Interview Reference

## What is TermUI?

TermUI is a **React-based terminal UI framework** that lets developers build rich, interactive CLI applications using the same mental model as web UI development. It ships as a **shadcn/ui-style component library** — instead of installing a runtime package, you copy components directly into your project via a CLI (`npx termui add spinner`), giving you full ownership and customization.

**Core value propositions:**
- No runtime lock-in — components live in your codebase
- First-class TypeScript support
- Built-in theming, accessibility, and AI-native tooling
- Works with any Node.js CLI framework via adapters

---

## Monorepo Structure

Built on **pnpm workspaces + Turborepo** for parallel builds and caching.

```
packages/
  core/          — Hooks, theme engine, terminal primitives (@termui/core)
  components/    — 101 UI components in 13 categories (@termui/components)
  cli/           — The npx termui CLI tool (termui)
  testing/       — Headless test utilities (@termui/testing)
  adapters/      — 28+ wrappers for chalk, ora, inquirer, AI SDKs, etc.
  types/         — Framework-agnostic TypeScript types (@termui/types)

registry/        — Component manifest JSON (schema + metadata)
templates/       — Starter project templates
examples/        — Demo apps
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Language | TypeScript (ESM-only) | Type safety, tree-shaking |
| Runtime | Node.js 18+ | Native fetch, ESM support |
| Renderer | **Ink 5** | React-to-terminal renderer |
| Layout engine | **Yoga (Facebook)** | Flexbox in the terminal |
| Build | tsup / tsc | Fast ESM + CJS dual output |
| Tests | Vitest | Fast, ESM-native |
| Package manager | pnpm 9 | Workspace deduplication |
| Task runner | Turborepo | Parallel builds, cache |

**Ink** is the critical piece — it runs a React reconciler that renders JSX as terminal output using Yoga's flexbox layout engine. Everything in TermUI builds on top of it.

---

## Core Package (`@termui/core`)

This is the engine room. It exports three subpaths:
- `@termui/core` — hooks + theme utilities
- `@termui/core/styling` — ThemeProvider
- `@termui/core/hooks` — all interaction hooks

### Hooks (16 total)

| Hook | What it does |
|---|---|
| `useInput` | Raw keyboard input from Ink |
| `useFocus` / `useFocusManager` | Ink focus state + programmatic control |
| `useKeyboardNavigation` | List navigation — arrows, Home/End, PgUp/Down, Enter, Escape |
| `useFocusTrap` | Traps Tab focus within overlays (Modal, Dialog, Drawer) |
| `useTheme` | Reads current theme tokens from context |
| `useTerminal` | Terminal size (cols, rows, color depth) |
| `useAnimation` | Frame-based animation with FPS control |
| `useInterval` | Safe `setInterval` that cleans up on unmount |
| `useClipboard` | Read/write clipboard via OSC 52 escape sequences |
| `useKeymap` | Declarative keybinding mapping |
| `useMouse` | Mouse event handling |
| `useResize` | Detect terminal resize events |
| `useAsync` | Async data loading with loading/error/data state |
| `useMotion` | Reads `NO_MOTION` / `CI` env vars for animation opt-out |
| `useUnicode` | Reads `NO_UNICODE` env var for ASCII fallbacks |
| `useNotifications` | Toast/notification queue |
| `usePushToTalk` | Voice dictation input capture |

**`useKeyboardNavigation` internals:**
Wraps `useInput` to dispatch arrow keys, Home/End, Page Up/Down to an index state. It supports both looping (wraps from last → first) and clamping. The `Enter`/`Space` callbacks call back into the component's selection logic. Every interactive list (Select, Table, Tree) delegates to this one hook.

**`useFocusTrap` internals:**
Takes an array of focusable IDs. On Tab it advances the active focus index within that array using Ink's `focusManager`. On Shift+Tab it reverses. When the trap is active (e.g., a modal opens), focus is contained to the provided IDs and cannot escape to background elements. This is the accessibility story for overlays.

---

## Component System (`@termui/components`)

101 components across 13 categories. Each is a React functional component that:

1. Accepts typed props (with sensible defaults)
2. Calls `useTheme()` to read tokens
3. Calls `useMotion()` / `useUnicode()` for environment adaptation
4. Renders Ink primitives (`<Text>`, `<Box>`) with Yoga flexbox

**Pattern example (Spinner):**
```tsx
export function Spinner({ style = 'dots', label, fps = 10 }: SpinnerProps) {
  const theme = useTheme();
  const { reduced } = useMotion();
  const unicode = useUnicode();
  const frame = useAnimation(fps);

  if (reduced) return <Text>{label ?? '...'}</Text>;

  const frames = unicode ? FRAMES[style] : ASCII_FRAMES[style];
  return (
    <Text color={theme.colors.primary}>
      {frames[frame % frames.length]} {label}
    </Text>
  );
}
```

**AI components** (in `/ai/` category):
- `ChatMessage`, `ChatThread` — Render conversations
- `ToolCall`, `ToolApproval` — Show/confirm function calls
- `ThinkingBlock` — Collapsible reasoning output
- `ContextMeter` — Context window progress with warning zones
- `TokenUsage` — Prompt/completion/cost display
- `ModelSelector` — Interactive model picker grouped by provider

---

## Theming System

**Architecture:** React context (`ThemeProvider`) → `useTheme()` hook in every component.

```tsx
<ThemeProvider theme={draculaTheme}>
  <App />
</ThemeProvider>
```

`ThemeProvider` reads `COLORFGBG` env var to auto-detect dark/light mode. `AutoThemeProvider` is a wrapper that switches between two themes automatically.

**10 built-in themes:** default, dracula, nord, catppuccin, monokai, tokyo-night, one-dark, solarized, high-contrast, high-contrast-light.

**Token shape:**
```typescript
interface Theme {
  colors: {
    primary, secondary, accent,
    background, surface, border,
    text, textMuted, textInverse,
    success, warning, error, info,
    focusRing, selection,
    // 20+ semantic colors total
  };
  spacing: { xs, sm, md, lg, xl };
  radius:  { sm, md, lg };
}
```

**Custom theme:**
```typescript
const myTheme = createTheme('brand', {
  colors: { primary: '#FF6B6B', focusRing: '#FF6B6B' }
});
```

---

## CLI Tool (`termui`)

The CLI is the distribution mechanism. It's dogfooded — built with `@termui/adapters/args` (TermUI's own CLI builder adapter).

### Commands

| Command | What it does |
|---|---|
| `init` | Creates `termui.config.json` in the project |
| `add <component>` | Fetch + write component from registry |
| `list` | Browse all components by category |
| `diff <component>` | Show local vs. upstream registry diff |
| `update <component>` | Re-download from registry |
| `theme [name]` | List or apply a theme |
| `preview` | Interactive component gallery (Ink TUI) |
| `mcp` | Start the MCP server on stdio |
| `create <name>` | Scaffold a new project from a template |
| `publish` | Submit to community registry |

### Config System

File: `termui.config.json`

```json
{
  "version": "1",
  "componentsDir": "./components/ui",
  "registry": "https://arindam200.github.io/termui",
  "registries": [],
  "theme": "default"
}
```

Search order: `.json` → `.ts` → `.js`. The `.json` file is the only one the CLI writes to; the `.ts`/`.js` forms are for TypeScript-first projects.

### `add` Command — How Component Installation Works

1. Read `termui.config.json` to find registry URL(s)
2. `GET /registry/schema.json` → parse manifest
3. Resolve `ComponentMeta` for each requested component
4. Recursively resolve `peerComponents` (dependencies)
5. `GET` each source file from registry
6. Apply Prettier formatting using the user's local config (if present)
7. Write to `{componentsDir}/{category}/{ComponentName}.tsx`
8. Print peer npm dependencies the user needs to install manually

**Fuzzy matching:** If the component name doesn't match exactly, Levenshtein distance is used to suggest the closest match.

**Dry-run:** `--dry-run` flag shows what would be written without touching disk.

**Recipes:** `--recipe login-flow` installs a pre-configured set of components and writes wiring code in one step.

**Multi-registry:** The `registries` array in config allows community registries to override core components. Resolution is last-wins — components from later registries shadow earlier ones.

---

## Registry System

The registry is a static JSON file hosted on GitHub Pages with a jsDelivr CDN fallback. The CLI binary also embeds a minimal offline fallback manifest.

**Fallback chain:**
1. `https://arindam200.github.io/termui/registry/schema.json`
2. `https://cdn.jsdelivr.net/gh/arindam200/termui@main/registry/schema.json`
3. Embedded local manifest (always-available offline mode)

**ComponentMeta shape:**
```typescript
interface ComponentMeta {
  name: string;
  description: string;
  version: string;
  category: string;
  deps?: string[];            // npm packages to install
  peerComponents?: string[];  // auto-installed TermUI components
  files: string[];            // file paths in registry
  author?: { name, url, github };
  registry?: 'core' | 'community';
}
```

---

## MCP Server

The `termui mcp` command starts a **Model Context Protocol server over stdio** so AI assistants (Claude Code, Cursor, GitHub Copilot) can browse and install components natively.

**5 tools exposed:**

| Tool | Parameters | Description |
|---|---|---|
| `list_components` | `category?`, `filter?` | Browse all components grouped by category |
| `search_components` | `query` | Ranked keyword search |
| `get_component_docs` | `name` | Full props, usage, source files |
| `add_component` | `names[]`, `dryRun?` | Install into current project |
| `get_theme_tokens` | `theme?` | List themes and token structure |

**Search ranking algorithm (`search_components`):**
```
+20  exact name match
+10  name contains query
 +5  description contains query
 +3  category match
 +4  per-word name match
 +2  per-word description match
 +3  per-word category exact match
```
Returns top 10 results.

**MCP installation (`npx termui add mcp`):**
Prompts for scope, then writes the server config to:
- `.mcp.json` (current project / Claude Code)
- `~/.claude/settings.json` (global Claude Code)
- `~/Library/Application Support/Claude/claude_desktop_config.json` (Claude Desktop)

---

## Testing Package (`@termui/testing`)

Ink renders to a string, not a DOM — so TermUI has its own test utilities built on top of that.

| Export | Purpose |
|---|---|
| `renderToString(component)` | Single-frame string render |
| `createTestRenderer()` | Reusable renderer with `cleanup()` |
| `screen.getByText()` / `hasText()` | Query the rendered output |
| `fireEvent.key()` / `type()` / `press()` | Simulate keyboard input |
| `waitFor(fn, opts)` | Poll an assertion until it passes or times out |
| `stripVolatile(str)` | Remove spinner frames and timestamps for stable snapshots |
| `normalizeAnsi(str)` | Normalize ANSI escape codes for snapshot comparison |
| `testCLI()` | Full CLI test harness with mock registry + filesystem |

---

## Adapters Package (`@termui/adapters`)

28+ drop-in replacements for popular CLI libraries that integrate TermUI theming. The point is to let existing codebases adopt TermUI theming without rewriting everything.

**Key adapters:**
- `chalk` — chalk-compatible coloring API reading theme tokens
- `ora` — ora-compatible spinner backed by `Spinner` component
- `clack` — @clack/prompts-style interactive prompts
- `inquirer` — inquirer-compatible prompts
- `commander` / `meow` — argument parsing with TermUI help formatting
- `ai` — hooks for Anthropic, OpenAI, Ollama (`useChat`, `useCompletion`, `useStream`)
- `voice` — FFmpeg-based voice capture for push-to-talk dictation
- `pty` — Pseudo-terminal control
- `git` / `github` — Git operations and GitHub API wrapper

---

## Key Architectural Decisions (and the trade-offs)

**1. Copy-paste distribution (shadcn model)**
> Components are copied into your repo, not imported from npm.
- Pro: No version lock-in, full customization, zero runtime dependency on TermUI infra.
- Con: Updates require re-running `npx termui update`; no automatic patch delivery.

**2. Ink as the renderer (not raw ANSI strings)**
> TermUI is a React library rendering through Ink's reconciler to the terminal.
- Pro: React component model, diffing/reconciliation, hooks, JSX — familiar to web devs.
- Con: Ink adds overhead; not the right tool for simple one-liner CLIs.

**3. Hook-based architecture for all interactivity**
> Every interactive behavior (navigation, focus, animation) is a hook.
- Pro: Composable, testable, shareable across components. No hidden global state.
- Con: Requires React knowledge; not usable outside React component trees.

**4. Theme via React context, not CSS variables**
> `useTheme()` reads from a context provider; no stylesheet system exists.
- Pro: Works in a string-rendering environment with no DOM.
- Con: Can't do media queries or cascade; all theming is explicit and programmatic.

**5. Static registry on GitHub Pages**
> No server, no auth, no database. Just a JSON file on a CDN.
- Pro: Zero infra cost, high availability, community-forkable.
- Con: No search-as-a-service, no versioned component history (mitigated by `diff`/`update`).

**6. MCP server on stdio transport**
> No HTTP listener, no port — communicates via process stdin/stdout.
- Pro: Zero network config, works inside any AI tool that supports MCP.
- Con: One client at a time; can't serve multiple AI agents simultaneously.

**7. Accessibility via env vars**
> `NO_UNICODE=1`, `NO_MOTION=1`, `CI=true` trigger safe fallbacks automatically.
- Pro: Works without any config in CI pipelines; CI gets stable, animation-free output.
- Con: Coarse-grained; you can't selectively disable motion for one component at runtime.

---

## Interview Talking Points

**"Walk me through how `npx termui add button` works"**
Read config → fetch registry manifest → resolve component + peer components recursively → fetch source files → format with Prettier → write to disk → print required npm dependencies.

**"How is the theming system implemented?"**
React context with a typed token object. `ThemeProvider` wraps the app. Every component calls `useTheme()` to get colors/spacing/radius. Auto dark/light detection via `COLORFGBG` env var. Custom themes via `createTheme()`.

**"How does keyboard accessibility work?"**
`useKeyboardNavigation` gives every list a consistent UX (arrows, Home/End, PgUp/Down). `useFocusTrap` contains focus within modals/dialogs during overlay lifecycles, cycling through focusable IDs with Tab/Shift+Tab.

**"Why shadcn model and not a traditional npm package?"**
Ownership, customization, no runtime dependency on TermUI infra. Components are just TypeScript files in the user's repo — they can change anything without waiting for upstream.

**"How does the MCP integration work?"**
`termui mcp` starts a stdio MCP server exposing 5 tools. AI assistants call these tools to search for components, read their docs, and install them directly into the project. No HTTP, no auth — pure stdio JSON-RPC.

**"How do you test terminal UI components?"**
Ink renders to a string, not a DOM. `@termui/testing` provides `renderToString()`, screen query helpers, keyboard event simulation, `waitFor()` for async state, and `stripVolatile()` to remove animation frames before snapshotting.
