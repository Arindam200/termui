---
title: CLI Reference
---

# CLI Reference

## Commands

### `npx termui init`

Initialize TermUI in your project. Creates `termui.config.json` and `components/ui/` directory.

```sh
npx termui init
```

---

### `npx termui add <component>`

Add one or more components from the registry.

```sh
npx termui add spinner
npx termui add table select progress-bar
npx termui add --all   # install all 101 components
```

---

### `npx termui list`

List all available components with install status.

```sh
npx termui list
```

---

### `npx termui update <component>`

Re-download a component from the registry (overwrites local copy).

```sh
npx termui update spinner
```

---

### `npx termui diff <component>`

Show diff between your local component and the registry version.

```sh
npx termui diff table
```

---

### `npx termui theme [name]`

List available themes or apply one to your project.

```sh
npx termui theme           # list themes
npx termui theme dracula   # apply Dracula theme
```

Available themes: `default`, `dracula`, `nord`, `catppuccin`, `monokai`, `solarized`, `tokyo-night`, `one-dark`

---

### `npx termui preview`

Interactive component gallery in the terminal. Browse all 101 components with live prop editing.

```sh
npx termui preview
```

**Keybindings:**

- `↑↓` / `jk` — navigate list
- `→` / `Enter` / `l` — select / drill in
- `←` / `Esc` / `h` — back
- `p` — Props Playground (live JSX codegen)
- `q` — quit

---

### `npx termui dev`

Watch mode — monitors your component directory and hot-reloads the preview on file changes.

```sh
npx termui dev
npx termui dev --dir ./src/components
```

---

### `npx termui mcp`

Start the TermUI MCP server over stdio. Exposes five tools to AI assistants (Claude Code, Cursor, GitHub Copilot):

```sh
npx termui mcp
npx termui mcp --help
```

| Tool exposed         | Description                                     |
| -------------------- | ----------------------------------------------- |
| `list_components`    | Browse all components grouped by category       |
| `add_component`      | Install component(s) into the current project   |
| `get_component_docs` | Full props + usage for a specific component     |
| `search_components`  | Keyword search over the registry                |
| `get_theme_tokens`   | List available themes and their token structure |

---

### `npx termui add mcp`

Install the MCP server config into an AI tool. Prompts for the installation scope:

```sh
npx termui add mcp
```

| Scope                   | File written                                                              |
| ----------------------- | ------------------------------------------------------------------------- |
| Local project           | `.mcp.json` (Claude Code project scope — auto-detected)                   |
| Global — Claude Code    | `~/.claude/settings.json`                                                 |
| Global — Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) |

After installing, restart your AI tool. Claude Code auto-detects `.mcp.json`; Claude Desktop requires a restart.
