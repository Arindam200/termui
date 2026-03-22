---
title: "Utility Components"
---

# Utility Components

## Timer

Countdown timer with configurable duration and callbacks.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `duration` | `number` | `—` | ✓ |
| `onComplete` | `() => void` | `—` | — |
| `autoStart` | `boolean` | `true` | — |
| `format` | `string` | `'mm:ss'` | — |

**Usage:**
```tsx
import { Timer } from 'termui/components'

<Timer duration={60000} onComplete={() => console.log('Done!')} />
```

---

## Stopwatch

Elapsed time stopwatch with start/stop/reset.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `autoStart` | `boolean` | `false` | — |
| `format` | `string` | `'hh:mm:ss.ms'` | — |

**Usage:**
```tsx
import { Stopwatch } from 'termui/components'

<Stopwatch autoStart />
```

---

## Clock

Live clock with configurable format.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `format` | `string` | `'HH:mm:ss'` | — |
| `timezone` | `string` | `—` | — |
| `color` | `string` | `—` | — |

**Usage:**
```tsx
import { Clock } from 'termui/components'

<Clock format="HH:mm:ss" color="cyan" />
```

---

## Clipboard

OSC 52 clipboard write button.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `string` | `—` | ✓ |
| `label` | `string` | `'Copy'` | — |
| `onCopy` | `() => void` | `—` | — |

**Usage:**
```tsx
import { Clipboard } from 'termui/components'

<Clipboard value={apiKey} label="Copy API Key" />
```

---

## KeyboardShortcuts

Displays registered keyboard shortcuts in a formatted table.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `shortcuts` | `Shortcut[]` | `—` | ✓ |
| `title` | `string` | `—` | — |
| `columns` | `number` | `2` | — |

**Usage:**
```tsx
import { KeyboardShortcuts } from 'termui/components'

<KeyboardShortcuts
  shortcuts={[
    { keys: ['Ctrl', 'S'], description: 'Save' },
    { keys: ['q'], description: 'Quit' },
  ]}
/>
```

---

## Help

Context-sensitive help panel with keyboard shortcuts.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `isOpen` | `boolean` | `—` | ✓ |
| `onClose` | `() => void` | `—` | ✓ |
| `shortcuts` | `Shortcut[]` | `—` | ✓ |
| `title` | `string` | `'Keyboard Shortcuts'` | — |

**Usage:**
```tsx
import { Help } from 'termui/components'

<Help isOpen={showHelp} onClose={() => setHelp(false)} shortcuts={shortcuts} />
```

---

## ErrorBoundary

Catches render errors and shows a formatted error screen.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `fallback` | `ReactNode | ((error: Error) => ReactNode)` | `—` | — |
| `onError` | `(error: Error) => void` | `—` | — |

**Usage:**
```tsx
import { ErrorBoundary } from 'termui/components'

<ErrorBoundary fallback={<Text color="red">Something went wrong</Text>}>
  <MyApp />
</ErrorBoundary>
```

---

## Log

Scrollable log output with level-colored rows.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `entries` | `LogEntry[]` | `—` | ✓ |
| `height` | `number` | `10` | — |
| `follow` | `boolean` | `true` | — |
| `showTimestamp` | `boolean` | `true` | — |

**Usage:**
```tsx
import { Log } from 'termui/components'

<Log entries={logLines} height={15} follow />
```

---

## Image

Renders images in terminals supporting Sixel or block characters.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `src` | `string` | `—` | ✓ |
| `width` | `number` | `—` | — |
| `height` | `number` | `—` | — |
| `fallback` | `ReactNode` | `—` | — |

**Usage:**
```tsx
import { Image } from 'termui/components'

<Image src="./logo.png" width={20} />
```

---

## QRCode

Renders a QR code using Unicode block characters.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `string` | `—` | ✓ |
| `size` | `number` | `21` | — |
| `color` | `string` | `'white'` | — |

**Usage:**
```tsx
import { QRCode } from 'termui/components'

<QRCode value="https://termui.dev" />
```

---

## EmbeddedTerminal

Spawns a real PTY inside a TermUI Box (via termui/pty).

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `command` | `string` | `—` | ✓ |
| `args` | `string[]` | `—` | — |
| `width` | `number` | `80` | — |
| `height` | `number` | `20` | — |
| `onExit` | `(code: number) => void` | `—` | — |

**Usage:**
```tsx
import { EmbeddedTerminal } from 'termui/components'

<EmbeddedTerminal
  command="npm"
  args={['install']}
  width={80} height={20}
  onExit={(code) => console.log('Exit:', code)}
/>
```

---

## Profiler

React.Profiler wrapper that overlays live render timing stats.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `id` | `string` | `—` | ✓ |
| `children` | `ReactNode` | `—` | ✓ |
| `show` | `boolean` | `true` | — |

**Usage:**
```tsx
import { Profiler } from 'termui/components'

<Profiler id="MyList" show>
  <MyList items={data} />
</Profiler>
```
