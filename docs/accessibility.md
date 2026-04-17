---
title: Accessibility
---

# Accessibility

TermUI is built for keyboard-only environments. Every interactive component is navigable without a pointer device. The framework provides focus trapping, standardized keyboard navigation, reduced motion support, and ARIA annotation helpers.

---

## Overview

| Concern             | Mechanism                                                   |
| ------------------- | ----------------------------------------------------------- |
| Focus management    | Ink `useFocus` / `useFocusManager` + `useFocusTrap`         |
| List navigation     | `useKeyboardNavigation`                                     |
| Screen reader hints | `AriaProps` (`aria-label`, `aria-description`, `aria-live`) |
| Reduced motion      | `useMotion()` / `NO_MOTION=1` env var                       |

---

## Focus Management

Ink assigns focus by string IDs. Each focusable component calls `useFocus({ id: '...' })` and receives an `isFocused` boolean. `useFocusManager` lets you move focus programmatically.

```ts
import { useFocus, useFocusManager } from 'termui';

// In a component:
const { isFocused } = useFocus({ id: 'my-button', autoFocus: true });

// Programmatically:
const { focus, focusNext, focusPrevious } = useFocusManager();
focus('my-button');
```

**`useFocus` options:**

| Option      | Type      | Default | Description                                            |
| ----------- | --------- | ------- | ------------------------------------------------------ |
| `id`        | `string`  | —       | Unique ID used to target this element programmatically |
| `isActive`  | `boolean` | `true`  | Whether this element can receive focus                 |
| `autoFocus` | `boolean` | `false` | Focus this element on mount                            |

**`useFocusManager` returns:**

| Method            | Description                                   |
| ----------------- | --------------------------------------------- |
| `focus(id)`       | Move focus to the element with the given ID   |
| `focusNext()`     | Move focus to the next registered element     |
| `focusPrevious()` | Move focus to the previous registered element |
| `enableFocus()`   | Re-enable the focus system                    |
| `disableFocus()`  | Disable the focus system                      |

---

## `useFocusTrap`

Traps Tab / Shift+Tab focus within a set of components. When active, focus cycles through `focusableIds` and cannot escape to the rest of the app. Intended for Modal, Dialog, Drawer, CommandPalette, and similar overlays.

```ts
useFocusTrap(options: {
  focusableIds: string[];  // ordered list of IDs matching useFocus({ id })
  isActive?: boolean;      // default: true — set false when the overlay closes
}): void
```

**Options:**

| Option         | Type       | Default  | Description                                   |
| -------------- | ---------- | -------- | --------------------------------------------- |
| `focusableIds` | `string[]` | required | Ordered list of focusable IDs within the trap |
| `isActive`     | `boolean`  | `true`   | Whether the trap is currently active          |

When `isActive` becomes `true`, focus jumps to `focusableIds[0]` automatically. Set `isActive: false` when the container unmounts or hides to release focus.

**Example — Modal with focus trap:**

```tsx
import { useFocusTrap, useFocus, useInput } from 'termui';
import { Box, Text } from 'ink';

function ConfirmModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useFocusTrap({
    focusableIds: ['modal-confirm', 'modal-cancel'],
    isActive: isOpen,
  });

  const { isFocused: confirmFocused } = useFocus({ id: 'modal-confirm' });
  const { isFocused: cancelFocused } = useFocus({ id: 'modal-cancel' });

  useInput(
    (_, key) => {
      if (key.escape) onClose();
    },
    { isActive: isOpen }
  );

  if (!isOpen) return null;

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text>Are you sure?</Text>
      <Text color={confirmFocused ? 'cyan' : 'gray'}>[Yes]</Text>
      <Text color={cancelFocused ? 'cyan' : 'gray'}>[No]</Text>
    </Box>
  );
}
```

---

## `useKeyboardNavigation`

Standard keyboard navigation for list-style interactive components. Handles ↑↓ arrows, Home/End, Page Up/Down, Enter/Space to select, and Escape to dismiss. All interactive list components (Select, Menu, Tabs, CommandPalette, etc.) use this hook internally.

```ts
useKeyboardNavigation(options: {
  itemCount: number;
  defaultIndex?: number;            // default: 0
  loop?: boolean;                   // default: true
  pageSize?: number;                // items to jump on Page Up/Down, default: 10
  onSelect?: (index: number) => void;
  onDismiss?: () => void;
  isActive?: boolean;               // default: true
}): { activeIndex: number; setActiveIndex: (index: number) => void }
```

**Options:**

| Option         | Type                      | Default  | Description                          |
| -------------- | ------------------------- | -------- | ------------------------------------ |
| `itemCount`    | `number`                  | required | Total number of items in the list    |
| `defaultIndex` | `number`                  | `0`      | Initial active index                 |
| `loop`         | `boolean`                 | `true`   | Wrap around at the ends              |
| `pageSize`     | `number`                  | `10`     | Items to jump on Page Up / Page Down |
| `onSelect`     | `(index: number) => void` | —        | Called on Enter or Space             |
| `onDismiss`    | `() => void`              | —        | Called on Escape                     |
| `isActive`     | `boolean`                 | `true`   | Whether keyboard handling is active  |

**Return value:**

| Field            | Type                      | Description                                                |
| ---------------- | ------------------------- | ---------------------------------------------------------- |
| `activeIndex`    | `number`                  | Currently highlighted index                                |
| `setActiveIndex` | `(index: number) => void` | Programmatically move to an index (clamped to valid range) |

**Example — custom list component:**

```tsx
import { useKeyboardNavigation } from 'termui';
import { Box, Text } from 'ink';

function FileList({ files }: { files: string[] }) {
  const { activeIndex } = useKeyboardNavigation({
    itemCount: files.length,
    onSelect: (i) => openFile(files[i]!),
    onDismiss: () => setOpen(false),
  });

  return (
    <Box flexDirection="column">
      {files.map((file, i) => (
        <Text key={file} color={i === activeIndex ? 'cyan' : undefined}>
          {i === activeIndex ? '> ' : '  '}
          {file}
        </Text>
      ))}
    </Box>
  );
}
```

---

## Overlay Accessibility

`Modal` and `Drawer` accept a `focusableIds` prop that activates `useFocusTrap` automatically — no need to call the hook manually when using these components.

```tsx
<Modal isOpen={open} onClose={() => setOpen(false)} focusableIds={['ok-btn', 'cancel-btn']}>
  <Button id="ok-btn">OK</Button>
  <Button id="cancel-btn">Cancel</Button>
</Modal>
```

When `isOpen` transitions to `false`, the trap releases and focus returns to the previously focused element.

---

## ARIA Annotations

Overlay components accept `AriaProps` for screen reader hints, rendered as ANSI escape annotations where the terminal supports them.

```ts
interface AriaProps {
  'aria-label'?: string;
  'aria-description'?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
}
```

**Supported on:** `Modal`, `Drawer`, `Toast`, `Alert`, `Badge`, `Tooltip`

**Example:**

```tsx
<Modal
  isOpen={open}
  onClose={onClose}
  aria-label="Delete confirmation"
  aria-description="Confirm that you want to permanently delete this file"
>
  ...
</Modal>

<Toast message="File deleted" aria-live="assertive" />
```

Use `aria-live="assertive"` for urgent messages (errors, destructive confirmations). Use `"polite"` for non-urgent updates (save confirmations, background task completions).

---

## Reduced Motion

Use `useMotion()` to read the reduced-motion preference and skip animations accordingly.

```ts
import { useMotion } from 'termui';

const { reduced } = useMotion();
```

**Triggers for `reduced: true`:**

| Trigger                         | Description                             |
| ------------------------------- | --------------------------------------- |
| `NO_MOTION=1`                   | Environment variable                    |
| `CI=true`                       | CI environment (detected automatically) |
| `<ThemeProvider reducedMotion>` | Prop on the root provider               |

**Example:**

```tsx
import { useMotion } from 'termui';
import { Spinner } from 'termui';
import { Text } from 'ink';

function LoadingIndicator() {
  const { reduced } = useMotion();
  if (reduced) return <Text>[loading...]</Text>;
  return <Spinner />;
}
```

---

## Keyboard Conventions

Standard key bindings used consistently across all TermUI components:

| Key         | Action                                     |
| ----------- | ------------------------------------------ |
| `Tab`       | Move focus to next focusable element       |
| `Shift+Tab` | Move focus to previous focusable element   |
| `↑` / `↓`   | Navigate list items                        |
| `Home`      | Jump to first item                         |
| `End`       | Jump to last item                          |
| `Page Up`   | Jump up by `pageSize` items (default 10)   |
| `Page Down` | Jump down by `pageSize` items (default 10) |
| `Enter`     | Select / confirm focused item              |
| `Space`     | Toggle or select focused item              |
| `Esc`       | Close overlay / dismiss / cancel           |

All interactive components in TermUI follow these conventions. When building custom components, use `useKeyboardNavigation` and `useFocusTrap` to stay consistent with this contract.
