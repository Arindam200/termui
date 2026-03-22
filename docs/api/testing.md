---
title: '@termui/testing'
---

# @termui/testing

Headless testing utilities for TermUI components. Captures Ink render output as plain text for use with Vitest, Jest, or any assertion library.

## Installation

```sh
pnpm add -D @termui/testing
```

---

## `renderToString(element, options?)`

Renders a React element headlessly and returns the plain-text output (ANSI stripped).

```ts
renderToString(element: ReactElement, options?: {
  cols?: number;    // terminal width (default: 80)
  rows?: number;    // terminal height (default: 24)
  waitMs?: number;  // settle time in ms (default: 50)
}): Promise<string>
```

**Example:**

```tsx
import { renderToString } from '@termui/testing';
import { Spinner } from '@termui/components';

const output = await renderToString(<Spinner style="dots" />);
expect(output).toContain('⠋');
```

---

## `createTestRenderer(options?)`

Creates a reusable renderer. Better for multi-step interaction tests.

```ts
createTestRenderer(options?: { cols?: number; rows?: number }): {
  render(element: ReactElement): RenderResult;
  cleanup(): void;
}
```

**`RenderResult`:**
| Property | Type | Description |
|----------|------|-------------|
| `output` | `string` | ANSI-stripped output |
| `rawOutput` | `string` | Raw output with ANSI codes |
| `rerender()` | `() => RenderResult` | Re-read current output |
| `unmount()` | `() => void` | Unmount the component |
| `instance` | `Instance` | Underlying Ink instance |

---

## `screen`

Query helpers for plain-text output.

| Method         | Signature                          | Description                                      |
| -------------- | ---------------------------------- | ------------------------------------------------ |
| `getByText`    | `(text, output) => string`         | Returns first matching line; throws if not found |
| `queryByText`  | `(text, output) => string \| null` | Returns first matching line or null              |
| `getAllByText` | `(text, output) => string[]`       | Returns all matching lines                       |
| `hasText`      | `(text, output) => boolean`        | True if any line matches                         |
| `countByText`  | `(text, output) => number`         | Count of matching lines                          |
| `getLines`     | `(output) => string[]`             | Trimmed non-empty lines                          |

Accepts `string` or `RegExp` for `text`.

---

## `fireEvent`

Simulate keyboard input.

```ts
fireEvent.key('up' | 'down' | 'enter' | 'escape' | 'tab' | 'space' | ...)
fireEvent.type(text: string)
fireEvent.press(char: string)
```

Named keys: `up`, `down`, `left`, `right`, `enter`, `return`, `tab`, `backspace`, `delete`, `escape`, `space`, `ctrlC`, `ctrlN`, `ctrlP`, `ctrlS`, `ctrlZ`, `home`, `end`, `pageUp`, `pageDown`

---

## `waitFor(fn, options?)`

Polls an assertion until it passes or times out.

```ts
waitFor(fn: () => void | Promise<void>, options?: {
  timeout?: number;   // ms (default: 1000)
  interval?: number;  // ms (default: 50)
}): Promise<void>
```

**Example:**

```tsx
await waitFor(() => {
  expect(result.rerender().output).toContain('Loading complete');
});
```

---

## Full Example

```tsx
import { describe, it, expect, afterEach } from 'vitest';
import React, { useState } from 'react';
import { Text } from 'ink';
import { createTestRenderer, screen, fireEvent, waitFor } from '@termui/testing';

describe('Counter', () => {
  const { render, cleanup } = createTestRenderer();
  afterEach(cleanup);

  it('renders initial count', async () => {
    const result = render(<Counter initialCount={0} />);
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.hasText('Count: 0', result.output)).toBe(true);
  });
});
```
