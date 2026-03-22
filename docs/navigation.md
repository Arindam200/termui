---
title: 'Navigation Components'
---

# Navigation Components

## Tabs

Horizontal tab bar with keyboard navigation (← →).

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `tabs` | `Tab[]` | `—` | ✓ |
| `defaultTab` | `string` | `—` | — |
| `activeTab` | `string` | `—` | — |
| `onTabChange` | `(key: string) => void` | `—` | — |
| `borderStyle` | `'single' | 'double' | 'round' | 'bold'` | `—` | — |

**Usage:**

```tsx
import { Tabs } from 'termui/components';

<Tabs
  tabs={[
    { key: 'home', label: 'Home', content: <Home /> },
    { key: 'settings', label: 'Settings', content: <Settings /> },
  ]}
/>;
```

---

## TabbedContent

Tabs + content panels with shared keyboard control.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `tabs` | `Tab[]` | `—` | ✓ |
| `activeTab` | `string` | `—` | — |
| `onTabChange` | `(key: string) => void` | `—` | — |

**Usage:**

```tsx
import { TabbedContent } from 'termui/components';

<TabbedContent tabs={tabs} />;
```

---

## Breadcrumb

Navigation breadcrumb trail with ← to go back.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `items` | `BreadcrumbItem[]` | `—` | ✓ |
| `separator` | `string` | `'›'` | — |
| `activeKey` | `string` | `—` | — |

**Usage:**

```tsx
import { Breadcrumb } from 'termui/components';

<Breadcrumb
  items={[
    { key: 'home', label: 'Home' },
    { key: 'docs', label: 'Docs' },
    { key: 'api', label: 'API Reference' },
  ]}
/>;
```

---

## Pagination

Page navigator with ← → keys and smart ellipsis.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `total` | `number` | `—` | ✓ |
| `current` | `number` | `—` | ✓ |
| `onChange` | `(page: number) => void` | `—` | — |
| `siblings` | `number` | `1` | — |
| `showEdges` | `boolean` | `true` | — |

**Usage:**

```tsx
import { Pagination } from 'termui/components';

<Pagination total={20} current={page} onChange={setPage} />;
```

---

## CommandPalette

VS Code-style Ctrl+P command palette with fuzzy search.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `commands` | `Command[]` | `—` | ✓ |
| `isOpen` | `boolean` | `—` | ✓ |
| `onClose` | `() => void` | `—` | ✓ |
| `onSelect` | `(command: Command) => void` | `—` | ✓ |
| `placeholder` | `string` | `'Search commands…'` | — |

**Usage:**

```tsx
import { CommandPalette } from 'termui/components';

<CommandPalette
  commands={cmds}
  isOpen={open}
  onClose={() => setOpen(false)}
  onSelect={runCommand}
/>;
```

---

## Menu

Vertical menu with nested submenus and keyboard nav.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `items` | `MenuItem[]` | `—` | ✓ |
| `onSelect` | `(item: MenuItem) => void` | `—` | — |
| `title` | `string` | `—` | — |

**Usage:**

```tsx
import { Menu } from 'termui/components';

<Menu items={menuItems} onSelect={(item) => console.log(item.key)} />;
```

---

## Sidebar

Collapsible navigation sidebar with nested items.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `items` | `SidebarItem[]` | `—` | ✓ |
| `activeKey` | `string` | `—` | — |
| `onSelect` | `(key: string) => void` | `—` | — |
| `collapsed` | `boolean` | `false` | — |
| `width` | `number` | `24` | — |
| `title` | `string` | `—` | — |

**Usage:**

```tsx
import { Sidebar } from 'termui/components';

<Sidebar items={navItems} activeKey={current} onSelect={navigate} title="Navigation" />;
```
