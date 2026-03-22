---
title: Core Hooks
---

# Core Hooks

All hooks are exported from `@termui/core`.

## `useInput(handler, options?)`

Listen for keyboard input.

```ts
useInput((input: string, key: Key) => void, options?: { isActive?: boolean })
```

**`Key` object:**
| Field | Type | Description |
|-------|------|-------------|
| `upArrow` | `boolean` | ↑ arrow |
| `downArrow` | `boolean` | ↓ arrow |
| `leftArrow` | `boolean` | ← arrow |
| `rightArrow` | `boolean` | → arrow |
| `return` | `boolean` | Enter |
| `escape` | `boolean` | Esc |
| `ctrl` | `boolean` | Ctrl modifier |
| `shift` | `boolean` | Shift modifier |
| `tab` | `boolean` | Tab |
| `backspace` | `boolean` | Backspace |
| `delete` | `boolean` | Delete |
| `pageUp` | `boolean` | Page Up |
| `pageDown` | `boolean` | Page Down |

---

## `useFocus(options?)`

Manage focus for a single component.

```ts
useFocus(options?: { isActive?: boolean; autoFocus?: boolean; id?: string })
// Returns: { isFocused: boolean }
```

---

## `useFocusManager()`

Programmatic focus control.

```ts
useFocusManager()
// Returns: { focusNext, focusPrevious, focus(id), disableFocus, enableFocus }
```

---

## `useTheme()`

Access the active theme tokens.

```ts
useTheme()
// Returns: Theme (colors, borders, spacing, typography)
```

---

## `useTerminal()`

Read terminal capabilities.

```ts
useTerminal()
// Returns: { cols, rows, colorDepth, supportsUnicode, supportsHyperlinks }
```

---

## `useAnimation(frameRate?)`

Frame counter at configurable FPS (default 30).

```ts
useAnimation(fps?: number)
// Returns: number (current frame index)
```

---

## `useInterval(callback, delay)`

React-safe `setInterval` with automatic cleanup.

```ts
useInterval(callback: () => void, delay: number | null)
```

---

## `useClipboard()`

OSC 52 clipboard read/write.

```ts
useClipboard()
// Returns: { copy(text: string): void, paste(): Promise<string> }
```

---

## `useKeymap(bindings)`

Declarative keybinding registration.

```ts
useKeymap(bindings: KeyBinding[])
// KeyBinding: { key: string; ctrl?: boolean; action: () => void; description?: string }
```

---

## `useMouse(handler)`

Mouse click, scroll, and drag events.

```ts
useMouse((event: MouseEvent) => void)
// MouseEvent: { x, y, button, type: 'click' | 'scroll' | 'drag' }
```

---

## `useResize(callback, options?)`

Terminal resize callback with debounce.

```ts
useResize((size: TerminalSize) => void, options?: { debounce?: number })
// TerminalSize: { cols, rows }
```

---

## `useAsync(asyncFn, deps?)`

Async data loading with loading/error/data states.

```ts
useAsync<T>(fn: () => Promise<T>, deps?: unknown[])
// Returns: { data: T | null, loading: boolean, error: Error | null, reload: () => void }
```

---

## `useRenderCount()`

Returns the number of times the component has rendered. For development use.

```ts
useRenderCount(): number
```

---

## `useRenderTime()`

Tracks render timing. For development / performance profiling.

```ts
useRenderTime(): { lastRenderMs: number; totalMs: number; count: number }
```
