# TermUI Compatibility

## Minimum Requirements

| Requirement | Minimum                             |
| ----------- | ----------------------------------- |
| Node.js     | 18.0.0                              |
| Windows     | Windows 10 1903+ (ConPTY)           |
| macOS       | 10.15 Catalina                      |
| Linux       | Any modern distro with UTF-8 locale |

---

## Terminal × OS × Feature Matrix

| Terminal            | Platform        | Unicode | TrueColor | 256-color | Mouse | Hyperlinks | ConPTY |
| ------------------- | --------------- | ------- | --------- | --------- | ----- | ---------- | ------ |
| Windows Terminal    | Windows         | ✓       | ✓         | ✓         | ✓     | ✗          | ✓      |
| VS Code Terminal    | All             | ✓       | ✓         | ✓         | ✓     | ✓          | —      |
| iTerm2              | macOS           | ✓       | ✓         | ✓         | ✓     | ✓          | —      |
| Terminal.app        | macOS           | ✓       | ✗         | ✓         | ✗     | ✗          | —      |
| Kitty               | Linux/macOS     | ✓       | ✓         | ✓         | ✓     | ✓          | —      |
| Alacritty           | Linux/macOS/Win | ✓       | ✓         | ✓         | ✓     | ✗          | —      |
| WezTerm             | All             | ✓       | ✓         | ✓         | ✓     | ✓          | —      |
| Hyper               | All             | ✓       | ✓         | ✓         | ✓     | ✗          | —      |
| GNOME Terminal      | Linux           | ✓       | ✓         | ✓         | ✓     | ✗          | —      |
| xterm               | Linux           | ✓       | ✗         | ✓         | ✓     | ✗          | —      |
| tmux (pass-through) | Unix            | ✓       | ✓\*       | ✓         | ✓     | ✗          | —      |
| Git Bash (MSYS2)    | Windows         | partial | ✗         | ✗         | ✗     | ✗          | ✗      |
| CMD.exe             | Windows         | ✗       | ✗         | ✗         | ✗     | ✗          | ✗      |
| PowerShell (legacy) | Windows         | ✗       | ✗         | ✗         | ✗     | ✗          | ✗      |
| WSL (any distro)    | Windows         | ✓       | ✓         | ✓         | ✓     | ✓          | —      |

> \* tmux requires `set -g default-terminal "tmux-256color"` and `set -ga terminal-overrides ",*:Tc"` for true-color pass-through.

---

## Environment Variable Overrides

| Variable        | Effect                                                                              |
| --------------- | ----------------------------------------------------------------------------------- |
| `NO_COLOR=1`    | Disables all ANSI color output (respects [no-color.org](https://no-color.org))      |
| `FORCE_COLOR=1` | Forces 16-color output even in non-TTY environments                                 |
| `FORCE_COLOR=2` | Forces 256-color output                                                             |
| `FORCE_COLOR=3` | Forces true-color (24-bit) output                                                   |
| `NO_UNICODE=1`  | Forces ASCII fallbacks for all components (borders, spinners, icons, progress bars) |
| `NO_MOTION=1`   | Disables all animations (reduced motion)                                            |
| `CI=1`          | Implies `NO_MOTION=1`; also disables interactive prompts                            |

---

## Signal Handling

| Signal               | macOS/Linux       | Windows                                                 |
| -------------------- | ----------------- | ------------------------------------------------------- |
| `SIGINT` (Ctrl+C)    | ✓                 | ✓ via ConPTY                                            |
| `SIGTERM`            | ✓                 | ✗ — not supported; use `process.on('exit')` as fallback |
| `SIGHUP`             | ✓ (config reload) | ✗ — not supported; use file-watcher or IPC              |
| `process.on('exit')` | ✓                 | ✓                                                       |

Use `onProcessExit()` from `termui/args` for a cross-platform exit handler that works on all three platforms:

```ts
import { onProcessExit } from 'termui/args';

const dispose = onProcessExit(() => {
  cleanup();
});
```

---

## ASCII Fallback Mode (`NO_UNICODE=1`)

When `NO_UNICODE=1` is set (or the terminal reports no Unicode support), TermUI
replaces all Unicode glyphs with plain ASCII equivalents:

| Component               | Unicode      | ASCII      |
| ----------------------- | ------------ | ---------- |
| `Spinner`               | `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` | `\|/-\\`   |
| `ProgressBar` fill      | `█`          | `#`        |
| `ProgressBar` empty     | `░`          | `.`        |
| `ProgressCircle` (sm)   | `○◔◑◕●`      | `[##  ]`   |
| `ProgressCircle` (md)   | `⟨75%⟩`      | `[75%]`    |
| `StatusMessage` success | `✓`          | `OK`       |
| `StatusMessage` error   | `✗`          | `ERR`      |
| `StatusMessage` warning | `⚠`          | `!`        |
| `StatusMessage` info    | `ℹ`          | `i`        |
| `StatusMessage` pending | `○`          | `.`        |
| Box borders             | `┌─┐│└─┘`    | `+-+\|+-+` |

You can also force ASCII mode in code via the `noUnicode` prop on `ThemeProvider`:

```tsx
<ThemeProvider noUnicode>
  <App />
</ThemeProvider>
```

---

## Color Depth Downsampling

TermUI auto-detects color depth and provides utilities to downsample:

```ts
import { downsampleColor, nearestAnsi256, nearestAnsi16 } from 'termui';

// Returns the appropriate ANSI escape for the terminal's color depth
downsampleColor('#ff6b6b', 'truecolor'); // → \x1b[38;2;255;107;107m
downsampleColor('#ff6b6b', '256'); // → \x1b[38;5;203m
downsampleColor('#ff6b6b', '16'); // → \x1b[91m  (nearest bright red)
downsampleColor('#ff6b6b', 'none'); // → ''
```

---

## Known Limitations by Platform

### Windows (CMD / PowerShell without Windows Terminal)

- No Unicode box-drawing characters — enable `NO_UNICODE=1` or use `<ThemeProvider noUnicode>`
- No ANSI color support before Windows 10 1903
- `SIGTERM` / `SIGHUP` not available — use `onProcessExit()` instead
- Emoji in spinner frames (`clock`, `earth` styles) may render as `??` — switch to `line` or `dots` style

### Git Bash / MSYS2 on Windows

- Partial Unicode — Latin scripts work but box-drawing is unreliable
- `CLICOLOR` respected but `FORCE_COLOR` may be needed for consistent output
- PTY spawning (`node-pty`) requires a native build matching Node.js ABI

### tmux / screen

- True-color pass-through requires explicit configuration (see matrix note above)
- Mouse events may be intercepted by the multiplexer

### CI environments

- `CI=1` auto-sets `NO_MOTION=1`; set `FORCE_COLOR=1` if you need colored output in CI logs
- GitHub Actions Windows runners support ANSI via ConPTY

---

## Tested Platforms (CI Matrix)

| OS               | Node.js versions |
| ---------------- | ---------------- |
| `ubuntu-latest`  | 18, 20, 22       |
| `macos-latest`   | 18, 20, 22       |
| `windows-latest` | 20               |
