---
title: 'Layout Components'
---

# Layout Components

## Box

Enhanced flexbox container with border presets and Yoga layout.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `flexDirection` | `'row' | 'column'` | `'column'` | — |
| `gap` | `number` | `—` | — |
| `borderStyle` | `'single' | 'double' | 'round' | 'bold'` | `—` | — |
| `borderColor` | `string` | `—` | — |
| `padding` | `number` | `—` | — |
| `paddingX` | `number` | `—` | — |
| `paddingY` | `number` | `—` | — |
| `width` | `number | string` | `—` | — |
| `height` | `number | string` | `—` | — |
| `alignItems` | `'flex-start' | 'center' | 'flex-end'` | `—` | — |
| `justifyContent` | `'flex-start' | 'center' | 'flex-end' | 'space-between'` | `—` | — |

**Usage:**

```tsx
import { Box } from 'termui/components';

<Box flexDirection="column" borderStyle="round" padding={1}>
  <Text>Content here</Text>
</Box>;
```

---

## Stack

Vertical or horizontal stack with configurable gap.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `direction` | `'row' | 'column'` | `'column'` | — |
| `gap` | `number` | `1` | — |
| `align` | `'flex-start' | 'center' | 'flex-end'` | `—` | — |

**Usage:**

```tsx
import { Stack } from 'termui/components';

<Stack direction="column" gap={1}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Stack>;
```

---

## Grid

Rows × columns grid layout.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `columns` | `number` | `—` | ✓ |
| `gap` | `number` | `1` | — |

**Usage:**

```tsx
import { Grid } from 'termui/components';

<Grid columns={3} gap={1}>
  <Text>A</Text>
  <Text>B</Text>
  <Text>C</Text>
</Grid>;
```

---

## ScrollView

Scrollable container with an optional scrollbar indicator.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `height` | `number` | `—` | ✓ |
| `showScrollbar` | `boolean` | `true` | — |

**Usage:**

```tsx
import { ScrollView } from 'termui/components';

<ScrollView height={10}>{longContent}</ScrollView>;
```

---

## Divider

Horizontal rule / divider with optional label.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `label` | `string` | `—` | — |
| `color` | `string` | `—` | — |
| `char` | `string` | `'─'` | — |

**Usage:**

```tsx
import { Divider } from 'termui/components';

<Divider label="Section" />;
```

---

## Spacer

Flexible empty space for pushing content apart.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `size` | `number` | `1` | — |

**Usage:**

```tsx
import { Spacer } from 'termui/components';

<Box flexDirection="row">
  <Text>Left</Text>
  <Spacer />
  <Text>Right</Text>
</Box>;
```

---

## Columns

Equal-width or custom-width column layout.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `widths` | `number[]` | `—` | — |
| `gap` | `number` | `1` | — |

**Usage:**

```tsx
import { Columns } from 'termui/components';

<Columns widths={[20, 40]}>
  <Text>Left</Text>
  <Text>Right</Text>
</Columns>;
```

---

## Center

Centers children horizontally and/or vertically.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `horizontal` | `boolean` | `true` | — |
| `vertical` | `boolean` | `false` | — |

**Usage:**

```tsx
import { Center } from 'termui/components';

<Center>
  <Text>Centered content</Text>
</Center>;
```

---

## AspectRatio

Maintains a fixed aspect ratio for its child.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `ratio` | `number` | `—` | ✓ |
| `width` | `number` | `—` | — |

**Usage:**

```tsx
import { AspectRatio } from 'termui/components';

<AspectRatio ratio={16 / 9} width={40}>
  <Box borderStyle="single" />
</AspectRatio>;
```
