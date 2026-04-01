# Changelog

All notable changes to TermUI are documented here.

## [1.4.2] - 2026-04-02

### Fixed

- **`termui/testing` export missing** -- added `./testing` subpath export to the root package; `import { renderToString } from 'termui/testing'` now works as documented
- **Short flag validation in `termui/args`** -- unknown short flags (e.g. `-x`) are now rejected with an error message, consistent with how unknown long flags (`--x`) are handled
- **`registry:check` silent fallback** -- the script no longer silently falls back to `schema.json` file list when `meta.json` is missing a `files` field; a missing `files` field is now a hard error
- **Stale `@termui/*` path mappings in example tsconfigs** -- `examples/ai-demo`, `examples/demo`, and `examples/with-ai` tsconfigs no longer redefine dead `@termui/core` and `@termui/components` path aliases; they now cleanly inherit root config paths
- **`examples/with-voice` raw source imports** -- replaced `../../packages/core/src/index.js` and `../../packages/components/src/input/TextInput.js` with `termui` and `termui/components`
- **CI registry validation** -- `pnpm run registry:check` now runs as a dedicated CI job on every push and pull request

### Internal

- Deleted stale `.tmp/` and `__tmp_wizard_test/` test artifact directories

## [1.4.1] - 2026-03-31

### Fixed

- **404 on `npm install`** -- `@termui/core`, `@termui/components`, and `@termui/adapters` are internal workspace packages not published to npm; all user-facing files (templates, registry components, examples, docs, CLI scaffolder) now correctly import from the published `termui` package and its subpath exports
- **Scaffolded `package.json` listed unpublishable deps** -- `termui create` no longer adds `@termui/core: latest` to generated project dependencies
- **Registry components used internal import paths** -- all 95+ `registry/components/` files updated from `from '@termui/core'` to `from 'termui'`; adapter imports updated to corresponding `termui/*` subpaths
- **Documentation examples** -- `README.md`, `COMPATIBILITY.md`, `docs/ai.md`, `docs/adapters.md`, `docs/api/hooks.md`, `docs/api/testing.md` all updated to use public import paths
- **Misleading JSDoc comments** -- example imports in `@termui/core`, `@termui/adapters/svelte`, `@termui/adapters/voice`, and `@termui/adapters/clack-ink` package files corrected to use public-facing import paths

## [1.4.0] - 2026-03-28

### Added

#### CLI Improvements

- **`termui/args` integration** (`createCLI`) -- the CLI now uses `createCLI` from `termui/args` for command routing, `--help`, and unknown-command handling; dogfooding the product instead of hand-rolled switch logic
- **`packages/cli/src/utils/clack.ts`** -- inline raw-mode TTY prompt utilities (`text`, `confirm`, `select`, `multiselect`, `spinner`, `tasks`, `group`, `log`) for the CLI; avoids the compile-time rootDir constraint against importing `@termui/adapters` directly
- **`packages/cli/src/utils/createCLI.ts`** -- inline `createCLI` equivalent for the same reason
- **Prettier formatting on `add`** -- installed components are automatically formatted with the project's Prettier config when Prettier is present; dry-run mode now shows an 8-line source preview

#### `termui/clack` Adapter

- **Raw-mode TTY support** -- `text`, `confirm`, `select`, and `multiselect` now use raw-mode keyboard input (arrow keys, single-key confirm) instead of readline; graceful fallback to readline in non-TTY environments (CI, piped input)
- **`NO_COLOR` / `FORCE_COLOR` / `CLICOLOR` respect** -- all ANSI output checks `isColorEnabled()` so color can be disabled at the environment level
- **`select` and `multiselect` added** to the adapter public API (previously only `text` and `confirm`)
- **`white` and `gray` ANSI helpers** added to the internal color map

#### Components

- **`ChatMessage`** -- new props: `stream` (live `AsyncIterable<string>`), `streamText` (animated pre-buffered string), `streamSpeed`, `onStreamComplete`, `inline` (prefix + content on one row), `prefix` (per-role override), `showSeparator`, `maxLines`; uses `StreamingText` internally for real streaming and animation; content is now padded left by 2 in block mode
- **`Pagination`** -- `current` prop is now optional (uncontrolled mode); `buildPages` accepts `showEdges` parameter for finer control over edge-page display

#### Themes

- **`highContrastTheme`** -- all color pairs annotated with WCAG 2.1 contrast ratios; `error` changed to `#FF4444` (5.1:1 on black, meets AA); `info` changed to `#00CCFF` (7.5:1); `muted` darkened to `#1A1A1A`; `mutedForeground` changed to `#CCCCCC` (10.4:1)
- **`highContrastLightTheme`** -- new light variant (black text on white) for terminals with a light background

#### Infrastructure

- **`.github/workflows/validate-registry.yml`** -- new CI workflow to validate registry manifests on every push and pull request

### Changed

- CLI `--version` / `-v` now handled before `createCLI` dispatch so the logo always prints correctly
- `init` command prompt calls migrated from `ui.ts` helpers to the new `clack.ts` utilities (`select`, `confirm`, `text`)
- All package versions aligned to `1.4.0`

---

## [1.3.0] - 2026-03-26

### Added - Adapter Ecosystem, Registry Expansion & DX

#### New Library Adapters

- **`termui/chalk`** — drop-in Chalk wrapper that maps colours through the active TermUI theme so hex values stay consistent across ANSI escape sequences and Ink renders
- **`termui/commander`** — Commander.js integration that generates styled `--help` output using TermUI typography; entry-point commands render inside an `AppShell`
- **`termui/inquirer`** — @inquirer/prompts replacement that routes `input`, `select`, `confirm`, and `checkbox` prompts through TermUI components so they inherit the active theme
- **`termui/meow`** — meow wrapper with auto-styled help text; flags and positional args are documented via TermUI's `KeyValue` table
- **`termui/ora`** — ora spinner proxy that delegates to TermUI's `Spinner` component; `start`/`stop`/`succeed`/`fail`/`warn` all map to themed variants
- **`termui/imperative`** — imperative API surface (`prompt`, `confirm`, `select`, `spinner`) for non-React code paths, backed by Ink renders that unmount automatically on resolve
- **`termui/svelte`** — Svelte action and store adapters for embedding TermUI renders inside Svelte-based CLIs
- **`termui/vue`** — Vue composables and plugin for TermUI theme access and component mounting in Vue-based CLIs

#### New Components

- **`MultiProgress`** (`termui/components/feedback`) — stacked progress bar list with per-item labels, values, and colours; supports dynamic add/remove
- **`NotificationBadge`** (`termui/components/overlays`) — inline badge with unread count, dot indicator variant, and theme-aware colour mapping for info/success/warning/error
- **`NotificationCenter`** (`termui/components/overlays`) — scrollable overlay that lists notifications with timestamps, mark-as-read, and dismiss actions; opens via `useNotifications` hook

#### New CLI Commands

- **`npx termui docs <component>`** — fetches and renders the component's registry manifest, props table, and usage example inline in the terminal
- **`npx termui publish`** — validates a local component against the registry schema and opens a pre-filled GitHub PR against the community registry; falls back to printed instructions if `termui/github` is not installed

#### New Registry Components (13)

`chat-message`, `chat-thread`, `diff-view`, `file-change`, `model-selector`, `multi-progress`, `notification-center`, `streaming-text`, `thinking-block`, `token-usage`, `tool-approval`, `tool-call`

Each ships a `registry.json` manifest with `name`, `version`, `description`, `files`, `dependencies`, and `devDependencies` so `npx termui add` can pull them individually.

#### New `@termui/types` Package

- Centralised TypeScript types for themes, components, hooks, registry manifests, and adapter contracts
- All packages now import shared types from `@termui/types` instead of re-declaring them locally

#### New Examples

- `examples/with-chalk` — themed Chalk usage
- `examples/with-commander` — Commander CLI with TermUI help
- `examples/with-inquirer` — Inquirer prompts via TermUI
- `examples/with-meow` — meow CLI with styled flags
- `examples/with-ora` — ora spinner integration
- `examples/with-github` — GitHub API example using `termui/github`
- `examples/with-keychain` — OS keychain access via `termui/keychain`
- `examples/ai-demo` — agent shell with streaming output and tool-call panels

#### New Docs

- `docs/adapters.md` — full guide for every adapter with install, usage, and migration from the original library
- `docs/ai.md` — AI component and hook reference including `useChat`, `useCompletion`, and all AI UI components
- `docs/templates.md` — template and layout pattern cookbook

#### Infrastructure

- **Changeset tooling** — `.changeset/` directory and `pnpm changeset version` workflow for automated version management
- **Release workflow** — `.github/workflows/release.yml` automates publishing on version tag push
- **Release template** — `.github/RELEASE_TEMPLATE.md` standardises GitHub release notes
- **`CONTRIBUTING_COMPONENTS.md`** — step-by-step guide for contributing new components to the registry
- **`GOVERNANCE.md`** — project governance model, maintainer responsibilities, and RFC process

#### Testing

- Comprehensive test files added for: AI components, charts, data components, feedback components, overlays, selection components, templates, typography, utility, CLI commands, and adapter integrations
- `packages/testing` — new `cli.ts` test utilities, `matchers.ts` custom Vitest matchers, and `snapshot.ts` terminal snapshot helpers

### Changed

- `registry/schema.json` expanded: added `templates`, `examples`, `adapters`, and `ai` component categories; `files` array now accepts an `optional: true` flag; `peer` dependencies field added alongside `dependencies`
- All package versions aligned to `1.3.0`

---

## [1.2.0] - 2026-03-25

### Added - Phase 6: AI CLI Builder

#### Tier 1 - Core Primitives

- **`StreamingText`** (`termui/components/typography`) - renders LLM token streams in real time; accepts a controlled `text` prop, an `AsyncIterable<string>` via `stream`, a blinking `cursor`, and a typing `animate`/`speed` mode for pre-buffered responses
- **`Markdown` streaming mode** - new `streaming` and `cursor` props on the existing component; partial code fences are closed gracefully so the component never crashes mid-stream
- **`DiffView`** (`termui/components/data`) - unified, split, and inline diff views with an internal LCS algorithm (no extra dependency); supports `context` lines, `showLineNumbers`, and coloured `+`/`-` lines with `@@` hunk headers

#### Tier 2 - Chat UI Components

- **`ChatMessage` + `ChatThread`** (`termui/components/ai`) - role-based message styling (user/assistant/system/error), animated `...` typing indicator while `streaming`, collapsible system messages, and optional `autoScroll`
- **`ToolCall`** - status icons for pending/running/success/error states, live elapsed timer, and collapsible args and result display
- **`ThinkingBlock`** - collapsible chain-of-thought block; shows token count and duration when collapsed; `streaming` prop shows a pulsing indicator
- **`ToolApproval`** - risk-level border colour (green/yellow/red), `y`/`n`/`a` keybindings, and a countdown timer that auto-denies on timeout

#### Tier 3 - AI Integration Layer

- **`TokenUsage` + `ContextMeter`** - compact token and cost display (`1.2k in / 850 out - $0.003`) with a threshold-aware progress meter (warn/critical colour steps)
- **`ModelSelector`** - built on `Select`; supports provider grouping, context window size, and provider badges
- **`FileChange`** - file list with M/A/D icons, keyboard navigation, and inline `DiffView` expansion per file
- **`useChat` + `useCompletion`** (`termui/ai`) - provider-agnostic streaming hooks for Anthropic, OpenAI, Ollama, and custom `fetchFn`; `tokenUsage` is populated from each provider's native usage events

#### Tier 4 - Ecosystem

- **`createConversationStore`** (`termui/conversation-store`) - JSONL/JSON persistence with `save`/`load`/`list`/`delete`/`search`; auto-titles from the first user message

#### New exports

- `termui/components/ai` - all AI UI components
- `termui/ai` - `useChat`, `useCompletion`
- `termui/conversation-store` - `createConversationStore`

### Fixed

- `useChat` history bug: replaced the `setMessages` functional-updater capture pattern with a `messagesRef` that is updated synchronously; the stream now always receives the full, correct message list on every turn including the first
- `tokenUsage` never updated: `useChat` now passes a `setTokenUsage` callback into each provider stream; Anthropic reads `message_start`/`message_delta` usage events, OpenAI enables `stream_options: { include_usage: true }`, Ollama reads `prompt_eval_count`/`eval_count` from the done line
- `DiffView` inline mode was identical to unified; replaced with a proper `InlineView` that renders all ops linearly without hunk headers
- DTS build failure (`TS2307`) for `@anthropic-ai/sdk` and `openai`: dynamic imports now use a variable specifier so tsc does not attempt static module resolution during declaration emit
- `tsconfig.json` was missing path entries for `@termui/components/ai`, `@termui/adapters/ai`, and `@termui/adapters/conversation-store`; added all three so the root DTS build resolves them correctly

---

## [1.1.7] - 2026-03-24

### Performance

- **Tree-shaking** — added `"sideEffects": false` to all four packages (`termui`, `@termui/core`, `@termui/components`, `@termui/adapters`); bundlers can now safely drop any module that is not imported
- **Component category sub-exports** — 12 new granular entry points (`termui/components/layout`, `/typography`, `/input`, `/selection`, `/data`, `/feedback`, `/navigation`, `/overlays`, `/forms`, `/utility`, `/charts`, `/templates`) so users without a bundler can import only the slice they need; corresponding sub-exports added to `@termui/components` package as well
- **BigText font encoding** — replaced verbose nested `number[][]` arrays (300+ lines) with packed 3-bit row integers in a separate `BigText.font.ts`; font data is ~60% smaller before gzip

### Build

- **`tsconfig.build.json`** — new production tsconfig that extends the root and sets `declarationMap: false` and `sourceMap: false`; tsup now uses it for all builds, eliminating ~232 unnecessary `.d.ts.map` files from the published dist
- **Adapter sourcemaps removed** — `packages/adapters/tsup.config.ts` was incorrectly setting `sourcemap: true`; corrected to `false` to match the rest of the build
- **`"files"` field** added to `packages/core`, `packages/components`, and `packages/cli` — npm now only publishes `dist/` and `README.md`, not source files or config

### Refactoring

- **QRCode encoder extracted** to `utility/qrEncoder.ts` — ~420 lines of pure GF(256)/Reed-Solomon/matrix logic separated from the React component; GF lookup tables are now lazy-initialised on first call (removing a module-level IIFE that conflicted with `sideEffects: false`)
- **Shared chart utilities** — `normalize`, `clamp`, `padEnd`, `padStart` extracted to `charts/utils.ts`; `LineChart`, `Sparkline`, `Gauge`, and `BarChart` all import from it
- **Shared time formatters** — `formatElapsed` and `formatTime` (plus `pad` helper) extracted to `utility/formatters.ts`; `Stopwatch` and `Timer` import from it instead of each defining their own
- **`EmbeddedTerminal`** — added explicit comment on the `import('node-pty')` dynamic import so bundlers are not tempted to inline it

---

## [1.1.3] — 2026-03-23

### Fixed

- **CLI — Duplicate logo in interactive menu**: `add`, `init`, and `list` commands no longer re-print the logo and intro line when invoked from the interactive menu (`npx termui` with no args); added `skipHeader` option to each command

**Testing — Full test suite for `@termui/testing`**

- Added 37 tests across 4 files: `screen`, `waitFor`, `fireEvent`, and `renderToString`/`createTestRenderer`
- Added `vitest.config.ts` to `@termui/testing` package
- Fixed stale registry version assertion in CLI tests (`0.1.0` → `1.0.0`)

---

## [1.1.2] — 2026-03-23

### Fixed

- Bumped `packages/cli` version to `1.1.2` to stay in sync with root

---

## [1.1.1] — 2026-03-23

### Changed

**CLI — Interactive mode when run with no arguments**

- `npx termui` (no args) now launches a full interactive menu instead of printing static help
- Top-level `select` prompt: Add a component · Use a template · Initialize project · Change theme · Preview gallery · Browse all components · Dev mode · Show help
- **Add a component flow**: category select (12 categories with emoji icons and component counts) → `multiselect` of components in that category → installs chosen components
- **Use a template flow**: `multiselect` of all template-category components → installs chosen templates
- All other menu options delegate directly to the existing command handlers (`init`, `theme`, `preview`, `list`, `dev`)
- `npx termui help` still prints the flat text help unchanged; all direct commands (`npx termui add <name>`, etc.) are unaffected

---

## [1.1.0] — 2026-03-23

### Added

**Templates (9 new components)**

- `SplashScreen` — styled startup banner with big ASCII art title, alternating row colors for depth, subtitle, OSC 8 author hyperlink, and optional status line; install via `npx termui add splash-screen`
- `InfoBox` — bordered info panel with `Header` (icon + label + version), `Row`, and `TreeRow` (`└ key: value`) sub-components; install via `npx termui add info-box`
- `BulletList` — nested structured content with `●`/`└`/`□` prefixes; sub-components: `Item`, `Sub`, `TreeItem`, `CheckItem`; install via `npx termui add bullet-list`
- `AppShell` — full-screen TUI layout with `Header`, `Tip`, `Input`, `Content` (scrollable), and `Hints` footer; pairs with `InfoBox` and `BulletList`; install via `npx termui add app-shell`
- `WelcomeScreen` — two-panel welcome dashboard with titled border (`── AppName v1.0 ──`), `Left`/`Right` panels, `Greeting`, `Logo`, `Meta`, and `Section` sub-components; install via `npx termui add welcome-screen`
- `LoginFlow` — full-page onboarding/auth screen with `Announcement` banner, big ASCII title, `Description` paragraphs, and `Select` list with `›` cursor + number key shortcuts; install via `npx termui add login-flow`
- `UsageMonitor` — real-time resource dashboard with `Header` (◆✦ decorator + ═══ separator), `Tags` bracket display, `Section`, `Metric` (progress bars + status dots), `DistributionMetric` (multi-color segmented bar), `Stats`, `Predictions`, and live-clock `StatusBar`; driven by `refreshInterval` + `useInterval`; install via `npx termui add usage-monitor`
- `SetupFlow` — `@clack/prompts`-style sequential step flow with `◇`/`◆`/`│` visual language, colored pill `Badge`, `Step` (status icons: ◇/◆/✓/✗), `Spinner`, and `MultiSelect` with space-to-toggle; install via `npx termui add setup-flow`
- `HelpScreen` — static CLI help screen with figlet banner, tagline, usage line, description, and auto-aligned `Section`/`Row` columns (flagWidth auto-detected); install via `npx termui add help-screen`

**Data Display**

- `DataGrid` — advanced data grid extending `Table` with column sorting, global filter (`/` key), pagination (`n`/`p`), optional row numbers, and custom cell renderers; install via `npx termui add data-grid`

**Registry**

- Registry updated to v1.1.0 with all 10 new components (101 total)
- Templates category added to `npx termui preview` catalog with full usage examples

## [1.0.2] — 2026-03-23

### Fixed

- Added missing `bin` field to root `package.json` so `npx termui` works
- Wired CLI entry point into the tsup build (`dist/cli.js` with shebang banner)
- Fixed `package.json` path resolution for `--version` in bundled CLI
- Added `semver` and `latest-version` as runtime dependencies

## [1.0.0] — 2026-03-23

### Added

**Phase 3 — Charts (6 components)**

- `Sparkline` — inline Unicode braille chart
- `BarChart` — horizontal and vertical bar chart
- `LineChart` — ASCII line chart with axes and multi-series
- `PieChart` — Unicode block pie chart with legend
- `HeatMap` — grid heatmap with color intensity scale
- `Gauge` — arc/speedometer gauge meter

**Phase 3 — Utility (10 components)**

- `Timer` — countdown with pause/resume
- `Stopwatch` — count-up with laps
- `Clock` — real-time display (12h/24h, optional date)
- `Clipboard` — copy-to-clipboard with feedback
- `KeyboardShortcuts` — formatted shortcut reference table
- `Help` — auto-generated help from keybindings
- `ErrorBoundary` — React error boundary with terminal display
- `Log` — scrolling log viewer with severity levels
- `Image` — iTerm2/Kitty protocol + ASCII fallback
- `QRCode` — self-contained Unicode block QR generator

**Phase 3 — Dev Tools**

- `npx termui dev` — hot-reload watch mode (restarts preview on file change)
- `@termui/testing` — headless testing package: `renderToString`, `createTestRenderer`, `screen`, `fireEvent`, `waitFor`
- `useRenderCount()` hook — tracks render count per component
- `useRenderTime()` hook — measures render duration (last/total/count)
- `Profiler` component — React.Profiler wrapper with live stats overlay

**Phase 3 — Templates (4 starter apps)**

- `templates/cli-tool` — prompts, spinners, menu navigation
- `templates/dashboard` — KPI cards, sparklines, live table, 1.5s auto-refresh
- `templates/form-wizard` — 4-step form with validation and progress bar
- `templates/file-manager` — two-panel commander-style file browser

**Phase 2 — Props Playground**

- `p` from preview list/detail enters playground mode
- Live JSX codegen as you edit props
- Boolean toggle (Space), enum cycle (←→), string/number edit (Enter)

**Registry & CDN**

- GitHub Pages CDN at `https://arindam200.github.io/termui`
- jsDelivr fallback at `https://cdn.jsdelivr.net/gh/arindam200/termui@main/registry`
- Embedded offline fallback with all 91 components
- `publish-registry.yml` GitHub Actions — auto-deploys on push to main

### Changed

- Component count: 19 → 75 → 91
- Registry schema version: 0.1.0 → 1.0.0
- All package versions bumped to 1.0.0

## [0.1.5] — 2026-02

### Added

- Phase 2: 56 additional components (typography, input, selection, data, feedback, navigation, overlays, forms)
- 8 themes (dracula, nord, catppuccin, monokai, solarized, tokyo-night, one-dark)
- Library adapters: termui/clack, termui/picocolors, termui/gray-matter, termui/args, termui/git, termui/github, termui/keychain, termui/pty, termui/completion, termui/link
- Additional CLI commands: diff, update, theme
- `npx termui preview` — interactive component gallery with 90+ components

## [0.1.0] — 2026-01

### Added

- Initial release with 19 core components
- React/Ink renderer, Yoga flexbox layout
- ThemeProvider + Default/Dracula/Nord themes
- CLI tool: init, add, list
- Registry with GitHub Pages CDN
