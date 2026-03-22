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
npx termui add --all   # install all 91 components
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

Interactive component gallery in the terminal. Browse all 91+ components with live prop editing.

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
