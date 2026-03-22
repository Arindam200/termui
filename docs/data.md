---
title: "Data Display Components"
---

# Data Display Components

## Table

Sortable, filterable, paginated data table with column config.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `columns` | `ColumnDef[]` | `—` | ✓ |
| `data` | `Record<string, unknown>[]` | `—` | ✓ |
| `pageSize` | `number` | `10` | — |
| `sortable` | `boolean` | `true` | — |
| `filterable` | `boolean` | `false` | — |
| `onRowSelect` | `(row: Record<string, unknown>) => void` | `—` | — |

**Usage:**
```tsx
import { Table } from 'termui/components'

<Table
  columns={[{ key: 'name', header: 'Name' }]}
  data={[{ name: 'Alice' }, { name: 'Bob' }]}
  pageSize={5}
/>
```

---

## DataGrid

Editable data grid with inline cell editing.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `columns` | `GridColumn[]` | `—` | ✓ |
| `data` | `Record<string, unknown>[]` | `—` | ✓ |
| `onCellChange` | `(row: number, col: string, value: unknown) => void` | `—` | — |
| `editable` | `boolean` | `false` | — |

**Usage:**
```tsx
import { DataGrid } from 'termui/components'

<DataGrid columns={cols} data={rows} editable />
```

---

## List

Navigable list with optional filtering and item selection.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `items` | `ListItem[]` | `—` | ✓ |
| `onSelect` | `(item: ListItem) => void` | `—` | — |
| `filterable` | `boolean` | `false` | — |
| `renderItem` | `(item: ListItem, active: boolean) => ReactNode` | `—` | — |

**Usage:**
```tsx
import { List } from 'termui/components'

<List
  items={[{ id: '1', label: 'Item 1' }]}
  onSelect={handleSelect}
/>
```

---

## VirtualList

Virtualized list for 10k+ items with a fixed viewport.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `items` | `T[]` | `—` | ✓ |
| `height` | `number` | `—` | ✓ |
| `renderItem` | `(item: T, index: number) => ReactNode` | `—` | ✓ |
| `onSelect` | `(item: T) => void` | `—` | — |

**Usage:**
```tsx
import { VirtualList } from 'termui/components'

<VirtualList
  items={largeArray}
  height={20}
  renderItem={(item) => <Text>{item.name}</Text>}
/>
```

---

## Tree

Expandable/collapsible tree view.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `nodes` | `TreeNode[]` | `—` | ✓ |
| `onSelect` | `(node: TreeNode) => void` | `—` | — |
| `expandedByDefault` | `boolean` | `false` | — |
| `renderLabel` | `(node: TreeNode) => ReactNode` | `—` | — |

**Usage:**
```tsx
import { Tree } from 'termui/components'

<Tree nodes={treeData} onSelect={handleSelect} />
```

---

## DirectoryTree

Filesystem browser tree using glob patterns.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `root` | `string` | `—` | ✓ |
| `onSelect` | `(path: string) => void` | `—` | — |
| `showHidden` | `boolean` | `false` | — |
| `filter` | `string` | `—` | — |

**Usage:**
```tsx
import { DirectoryTree } from 'termui/components'

<DirectoryTree
  root={process.cwd()}
  onSelect={(path) => console.log(path)}
/>
```

---

## KeyValue

Aligned key-value pair display.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `data` | `Record<string, ReactNode>` | `—` | ✓ |
| `keyWidth` | `number` | `—` | — |
| `separator` | `string` | `':'` | — |
| `keyColor` | `string` | `—` | — |

**Usage:**
```tsx
import { KeyValue } from 'termui/components'

<KeyValue
  data={{ version: '1.0.0', author: 'Alice' }}
  keyColor="cyan"
/>
```

---

## Definition

Term-description pair list (like a glossary).

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `items` | `DefinitionItem[]` | `—` | ✓ |
| `termWidth` | `number` | `—` | — |
| `termColor` | `string` | `—` | — |

**Usage:**
```tsx
import { Definition } from 'termui/components'

<Definition
  items={[{ term: '--verbose', description: 'Enable verbose output' }]}
/>
```

---

## Card

Bordered card with header, body, and footer slots.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `title` | `string` | `—` | — |
| `footer` | `ReactNode` | `—` | — |
| `borderStyle` | `'single' | 'double' | 'round' | 'bold'` | `—` | — |
| `borderColor` | `string` | `—` | — |
| `padding` | `number` | `1` | — |

**Usage:**
```tsx
import { Card } from 'termui/components'

<Card title="Summary" borderStyle="round">
  <Text>Card content here</Text>
</Card>
```

---

## Panel

Titled panel with a border and optional padding.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `title` | `string` | `—` | — |
| `borderStyle` | `'single' | 'double' | 'round' | 'bold'` | `—` | — |
| `borderColor` | `string` | `—` | — |
| `paddingX` | `number` | `1` | — |
| `paddingY` | `number` | `0` | — |

**Usage:**
```tsx
import { Panel } from 'termui/components'

<Panel title="Output" borderStyle="round" borderColor="cyan">
  <Text>Content</Text>
</Panel>
```

---

## GitStatus

Displays git status output in a structured, colored layout.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `cwd` | `string` | `process.cwd()` | — |
| `showBranch` | `boolean` | `true` | — |
| `showUntracked` | `boolean` | `true` | — |

**Usage:**
```tsx
import { GitStatus } from 'termui/components'

<GitStatus cwd={process.cwd()} />
```
