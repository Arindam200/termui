---
title: "Feedback Components"
---

# Feedback Components

## Spinner

Animated loading spinner with 12+ animation styles.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `label` | `string` | `—` | — |
| `style` | `'dots' | 'line' | 'circle' | 'bounce' | 'clock' | ...` | `'dots'` | — |
| `color` | `string` | `—` | — |
| `fps` | `number` | `12` | — |

**Usage:**
```tsx
import { Spinner } from 'termui/components'

<Spinner label="Loading..." style="dots" color="cyan" />
```

---

## ProgressBar

Determinate progress bar with optional ETA display.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `number` | `—` | ✓ |
| `max` | `number` | `100` | — |
| `width` | `number` | `40` | — |
| `label` | `string` | `—` | — |
| `showPercent` | `boolean` | `true` | — |
| `showEta` | `boolean` | `false` | — |
| `color` | `string` | `—` | — |

**Usage:**
```tsx
import { ProgressBar } from 'termui/components'

<ProgressBar value={progress} max={100} label="Installing" showEta />
```

---

## ProgressCircle

Circular progress indicator using Unicode braille characters.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `number` | `—` | ✓ |
| `max` | `number` | `100` | — |
| `color` | `string` | `—` | — |
| `label` | `string` | `—` | — |

**Usage:**
```tsx
import { ProgressCircle } from 'termui/components'

<ProgressCircle value={75} label="75%" color="green" />
```

---

## StatusMessage

Inline status with icon — success, error, warning, info.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `variant` | `'success' | 'error' | 'warning' | 'info'` | `—` | ✓ |
| `icon` | `string` | `—` | — |

**Usage:**
```tsx
import { StatusMessage } from 'termui/components'

<StatusMessage variant="success">Deployed successfully</StatusMessage>
<StatusMessage variant="error">Build failed</StatusMessage>
```

---

## Toast

Auto-dismissing notification with configurable duration.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `message` | `string` | `—` | ✓ |
| `variant` | `'default' | 'success' | 'error' | 'warning'` | `'default'` | — |
| `duration` | `number` | `3000` | — |
| `onDismiss` | `() => void` | `—` | — |

**Usage:**
```tsx
import { Toast } from 'termui/components'

<Toast
  message="Saved!"
  variant="success"
  duration={2000}
  onDismiss={() => setShow(false)}
/>
```

---

## Alert

Success / error / warning / info alert box.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `variant` | `'success' | 'error' | 'warning' | 'info'` | `'info'` | — |
| `title` | `string` | `—` | — |
| `icon` | `string` | `—` | — |

**Usage:**
```tsx
import { Alert } from 'termui/components'

<Alert variant="warning" title="Heads up">
  This action cannot be undone.
</Alert>
```

---

## Banner

Full-width announcement banner.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `variant` | `'default' | 'success' | 'error' | 'warning' | 'info'` | `—` | — |
| `icon` | `string` | `—` | — |
| `dismissible` | `boolean` | `false` | — |

**Usage:**
```tsx
import { Banner } from 'termui/components'

<Banner variant="info" icon="ℹ">
  New version available: v2.0.0
</Banner>
```

---

## Skeleton

Shimmer placeholder shown while content loads.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `width` | `number | string` | `—` | ✓ |
| `height` | `number` | `1` | — |
| `animated` | `boolean` | `true` | — |

**Usage:**
```tsx
import { Skeleton } from 'termui/components'

{loading ? <Skeleton width={30} height={3} /> : <Content />}
```
