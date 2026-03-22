# Changelog

All notable changes to TermUI are documented here.

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
