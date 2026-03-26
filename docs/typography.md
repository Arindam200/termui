---
title: 'Typography Components'
---

# Typography Components

## Text

Rich inline text with bold, italic, color, and dimming support.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `bold` | `boolean` | `—` | — |
| `italic` | `boolean` | `—` | — |
| `color` | `string` | `—` | — |
| `dimColor` | `boolean` | `—` | — |
| `underline` | `boolean` | `—` | — |
| `strikethrough` | `boolean` | `—` | — |
| `wrap` | `'wrap' | 'truncate' | 'truncate-end'` | `—` | — |

**Usage:**

```tsx
import { Text } from 'termui/components';

<Text bold color="cyan">
  Hello, world!
</Text>;
```

---

## Heading

Section heading with h1–h4 levels and optional figlet ASCII art.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `string` | `—` | ✓ |
| `level` | `1 | 2 | 3 | 4` | `1` | — |
| `ascii` | `boolean` | `false` | — |
| `font` | `string` | `'Standard'` | — |
| `color` | `string` | `—` | — |

**Usage:**

```tsx
import { Heading } from 'termui/components'

<Heading level={1} color="cyan">My CLI Tool</Heading>
<Heading level={1} ascii font="Big">TITLE</Heading>
```

---

## Code

Syntax-highlighted code block with 50+ language support.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `string` | `—` | ✓ |
| `language` | `string` | `'text'` | — |
| `showLineNumbers` | `boolean` | `false` | — |
| `theme` | `string` | `'auto'` | — |

**Usage:**

```tsx
import { Code } from 'termui/components';

<Code language="typescript">{'const x: number = 42;'}</Code>;
```

---

## Link

Clickable hyperlink using OSC 8 terminal hyperlink protocol.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `href` | `string` | `—` | ✓ |
| `children` | `ReactNode` | `—` | ✓ |
| `color` | `string` | `—` | — |

**Usage:**

```tsx
import { Link } from 'termui/components';

<Link href="https://termui.dev" color="cyan">
  termui.dev
</Link>;
```

---

## Badge

Semantic status badge with color presets.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `variant` | `'default' | 'success' | 'warning' | 'error' | 'info'` | `'default'` | — |
| `color` | `string` | `—` | — |

**Usage:**

```tsx
import { Badge } from 'termui/components'

<Badge variant="success">Deployed</Badge>
<Badge variant="error">Failed</Badge>
```

---

## Tag

Removable chip/tag with optional close callback.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `onRemove` | `() => void` | `—` | — |
| `color` | `string` | `—` | — |

**Usage:**

```tsx
import { Tag } from 'termui/components';

<Tag onRemove={() => remove('typescript')}>typescript</Tag>;
```

---

## Markdown

Full Markdown renderer — headings, bold, italic, code, lists, links.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `string` | `—` | ✓ |
| `theme` | `MarkdownTheme` | `—` | — |

**Usage:**

```tsx
import { Markdown } from 'termui/components';

<Markdown>{'# Hello\n\nThis is **bold** text.'}</Markdown>;
```

---

## JSON

Pretty-print JSON with syntax coloring and collapsible nodes.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `unknown` | `—` | ✓ |
| `indent` | `number` | `2` | — |
| `collapsed` | `boolean` | `false` | — |

**Usage:**

```tsx
import { JSONView } from 'termui/components';

<JSONView value={{ name: 'Alice', age: 30 }} />;
```

---

## Gradient

Renders text with a smooth color gradient.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `string` | `—` | ✓ |
| `colors` | `string[]` | `—` | ✓ |

**Usage:**

```tsx
import { Gradient } from 'termui/components';

<Gradient colors={['#ff6b6b', '#4ecdc4']}>Gradient Text</Gradient>;
```

---

## BigText

Renders large ASCII-art text using figlet fonts.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `string` | `—` | ✓ |
| `font` | `string` | `'Standard'` | — |
| `color` | `string` | `—` | — |

**Usage:**

```tsx
import { BigText } from 'termui/components';

<BigText font="Big" color="cyan">
  HELLO
</BigText>;
```

---

## Digits

Renders numbers using box-drawing characters.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `number | string` | `—` | ✓ |
| `color` | `string` | `—` | — |
| `size` | `number` | `1` | — |

**Usage:**

```tsx
import { Digits } from 'termui/components';

<Digits value={42} color="green" />;
```

---

## StreamingText

Renders text that arrives incrementally — from an `AsyncIterable<string>` stream or via a typing animation. Shows a blinking `▌` cursor while streaming.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `—` | Controlled text (static or with `animate`) |
| `stream` | `AsyncIterable<string>` | `—` | Live token stream; component manages state internally |
| `cursor` | `boolean` | `true` | Show blinking ▌ cursor while streaming |
| `animate` | `boolean` | `false` | Typing animation for pre-buffered `text` |
| `speed` | `number` | `30` | Typing speed in ms per character |
| `onComplete` | `(text: string) => void` | `—` | Called when streaming or animation completes |
| `cursorColor` | `string` | theme primary | Cursor color |

**Usage — typing animation:**

```tsx
import { StreamingText } from 'termui/components';

<StreamingText text="Hello, world!" animate speed={40} />;
```

**Usage — live AI token stream:**

```tsx
import { StreamingText } from 'termui/components';

async function* tokenStream() {
  for (const chunk of ['Hello', ', ', 'world', '!']) {
    await new Promise((r) => setTimeout(r, 80));
    yield chunk;
  }
}

<StreamingText stream={tokenStream()} onComplete={(t) => console.log('done:', t)} />;
```
