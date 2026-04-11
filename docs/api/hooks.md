---
title: Core Hooks
---

# Core Hooks

All hooks are exported from `termui`.

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

## `useKeyboardNavigation(options)`

Standard keyboard navigation for list-style interactive components. Handles ↑↓ arrows, Home/End, Page Up/Down, Enter/Space to select, and Escape to dismiss. All interactive list components (Select, Menu, Tabs, CommandPalette, etc.) should use this hook for consistent behaviour.

```ts
useKeyboardNavigation(options: {
  itemCount: number;
  defaultIndex?: number;  // default: 0
  loop?: boolean;          // default: true
  pageSize?: number;       // items to jump on Page Up/Down, default: 10
  onSelect?: (index: number) => void;
  onDismiss?: () => void;
  isActive?: boolean;      // default: true
}): { activeIndex: number; setActiveIndex: (index: number) => void }
```

**Example:**

```tsx
function MyMenu({ items }: { items: string[] }) {
  const { activeIndex } = useKeyboardNavigation({
    itemCount: items.length,
    onSelect: (i) => console.log('selected:', items[i]),
    onDismiss: () => setOpen(false),
  });

  return (
    <Box flexDirection="column">
      {items.map((item, i) => (
        <Text key={item} color={i === activeIndex ? 'cyan' : undefined}>{item}</Text>
      ))}
    </Box>
  );
}
```

---

## `useFocusTrap(options)`

Traps Tab / Shift+Tab focus within a set of focusable components. Use in Modal, Dialog, Drawer, CommandPalette, and any other overlay that should prevent focus from escaping.

```ts
useFocusTrap(options: {
  focusableIds: string[];   // ordered list of IDs matching useFocus({ id })
  isActive?: boolean;       // default: true — set false when overlay closes
}): void
```

**Example:**

```tsx
function Modal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useFocusTrap({
    focusableIds: ['modal-confirm', 'modal-cancel'],
    isActive: isOpen,
  });

  const { isFocused: confirmFocused } = useFocus({ id: 'modal-confirm' });
  const { isFocused: cancelFocused } = useFocus({ id: 'modal-cancel' });

  useInput((_, key) => { if (key.escape) onClose(); }, { isActive: isOpen });

  return (
    <Box flexDirection="column">
      <Text>Confirm this action?</Text>
      <Text color={confirmFocused ? 'cyan' : 'gray'}>[Yes]</Text>
      <Text color={cancelFocused ? 'cyan' : 'gray'}>[No]</Text>
    </Box>
  );
}
```

---

## `useFocusManager()`

Programmatic focus control.

```ts
useFocusManager();
// Returns: { focusNext, focusPrevious, focus(id), disableFocus, enableFocus }
```

---

## `useTheme()`

Access the active theme tokens.

```ts
useTheme();
// Returns: Theme (colors, borders, spacing, typography)
```

---

## `useTerminal()`

Read terminal capabilities.

```ts
useTerminal();
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
useClipboard();
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

---

## `useMotion()`

Returns the reduced-motion preference. Reads `NO_MOTION=1` or `CI=true` env vars and the optional `reducedMotion` prop on `ThemeProvider`.

```ts
useMotion(): { reduced: boolean }
```

**Example:**

```tsx
const { reduced } = useMotion();
if (reduced) return <Text>[loading]</Text>;
return <Spinner />;
```

---

## `useNotifications()` / `useNotificationsProvider()`

In-app notification queue. Call `useNotificationsProvider()` once in a parent component and `useNotifications()` anywhere in the tree to push notifications.

```ts
useNotificationsProvider(): {
  value: NotificationsContextValue;
}

useNotifications(): {
  notifications: Notification[];
  notify(opts: Omit<Notification, 'id' | 'timestamp' | 'read'>): string;
  dismiss(id: string): void;
  markRead(id: string): void;
  clear(): void;
}
```

**Example:**

```tsx
// In root component:
const { value } = useNotificationsProvider();
return (
  <NotificationsContext.Provider value={value}>
    <App />
    <NotificationCenter />
  </NotificationsContext.Provider>
);

// Anywhere in the tree:
const { notify } = useNotifications();
notify({ title: 'Done!', variant: 'success', duration: 3000 });
```
