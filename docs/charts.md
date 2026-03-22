---
title: "Charts Components"
---

# Charts Components

## Sparkline

Inline Unicode braille sparkline chart for numeric series.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `data` | `number[]` | `—` | ✓ |
| `color` | `string` | `—` | — |
| `height` | `number` | `1` | — |

**Usage:**
```tsx
import { Sparkline } from 'termui/components'

<Sparkline data={[1, 3, 2, 8, 5, 6]} color="green" />
```

---

## BarChart

Horizontal or vertical bar chart.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `data` | `{ label: string; value: number }[]` | `—` | ✓ |
| `direction` | `'horizontal' | 'vertical'` | `'horizontal'` | — |
| `color` | `string` | `—` | — |
| `maxWidth` | `number` | `40` | — |
| `showValues` | `boolean` | `true` | — |

**Usage:**
```tsx
import { BarChart } from 'termui/components'

<BarChart
  data={[{ label: 'A', value: 10 }, { label: 'B', value: 25 }]}
  color="cyan"
/>
```

---

## LineChart

ASCII line chart with axes and multi-series support.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `series` | `Series[]` | `—` | ✓ |
| `width` | `number` | `60` | — |
| `height` | `number` | `15` | — |
| `showAxes` | `boolean` | `true` | — |
| `showLegend` | `boolean` | `true` | — |

**Usage:**
```tsx
import { LineChart } from 'termui/components'

<LineChart
  series={[{ name: 'CPU', data: cpuData, color: 'cyan' }]}
  width={60} height={15}
/>
```

---

## PieChart

Unicode block pie chart with a legend.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `data` | `{ label: string; value: number; color?: string }[]` | `—` | ✓ |
| `showLegend` | `boolean` | `true` | — |
| `size` | `number` | `10` | — |

**Usage:**
```tsx
import { PieChart } from 'termui/components'

<PieChart
  data={[
    { label: 'JS', value: 60, color: 'yellow' },
    { label: 'TS', value: 40, color: 'cyan' },
  ]}
/>
```

---

## HeatMap

Grid-based heat map with color intensity scaling.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `data` | `number[][]` | `—` | ✓ |
| `colorScale` | `string[]` | `—` | — |
| `rowLabels` | `string[]` | `—` | — |
| `colLabels` | `string[]` | `—` | — |

**Usage:**
```tsx
import { HeatMap } from 'termui/components'

<HeatMap
  data={matrix}
  rowLabels={['Mon', 'Tue', 'Wed']}
  colLabels={['08:00', '12:00', '16:00']}
/>
```

---

## Gauge

Speedometer-style gauge meter.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `number` | `—` | ✓ |
| `max` | `number` | `100` | — |
| `label` | `string` | `—` | — |
| `color` | `string` | `—` | — |
| `width` | `number` | `30` | — |

**Usage:**
```tsx
import { Gauge } from 'termui/components'

<Gauge value={72} max={100} label="CPU" color="yellow" />
```
