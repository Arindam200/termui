---
title: 'Overlays Components'
---

# Overlays Components

## Modal

Focus-trapped overlay with Esc to close.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `open` | `boolean` | `—` | ✓ |
| `onClose` | `() => void` | `—` | ✓ |
| `title` | `string` | `—` | — |
| `children` | `ReactNode` | `—` | — |
| `width` | `number` | `—` | — |
| `closeHint` | `string | false` | `'Esc to close'` | — |

**Usage:**

```tsx
import { Modal } from 'termui/components';

<Modal open={showModal} onClose={() => setShow(false)} title="Confirm">
  <Text>Are you sure?</Text>
</Modal>;
```

---

## Dialog

Confirm dialog with OK/Cancel buttons.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `title` | `string` | `—` | — |
| `children` | `ReactNode` | `—` | ✓ |
| `confirmLabel` | `string` | `'OK'` | — |
| `cancelLabel` | `string` | `'Cancel'` | — |
| `onConfirm` | `() => void` | `—` | — |
| `onCancel` | `() => void` | `—` | — |
| `variant` | `'default' | 'danger'` | `'default'` | — |
| `isOpen` | `boolean` | `false` | — |

**Usage:**

```tsx
import { Dialog } from 'termui/components';

<Dialog
  title="Delete file?"
  variant="danger"
  isOpen={open}
  onConfirm={deleteFile}
  onCancel={() => setOpen(false)}
>
  This cannot be undone.
</Dialog>;
```

---

## Drawer

Slide-in panel from any edge (top/right/bottom/left).

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `open` | `boolean` | `—` | ✓ |
| `onClose` | `() => void` | `—` | ✓ |
| `position` | `'top' | 'right' | 'bottom' | 'left'` | `'right'` | — |
| `children` | `ReactNode` | `—` | — |
| `title` | `string` | `—` | — |
| `size` | `number` | `—` | — |

**Usage:**

```tsx
import { Drawer } from 'termui/components';

<Drawer open={drawerOpen} onClose={() => setDrawer(false)} position="right" title="Settings">
  <SettingsForm />
</Drawer>;
```

---

## Tooltip

Contextual tooltip rendered above/below/left/right of its trigger.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `content` | `string` | `—` | ✓ |
| `position` | `'top' | 'bottom' | 'left' | 'right'` | `'top'` | — |
| `isVisible` | `boolean` | `—` | — |
| `borderStyle` | `'single' | 'double' | 'round' | 'bold'` | `—` | — |

**Usage:**

```tsx
import { Tooltip } from 'termui/components';

<Tooltip content="Click to copy" position="top">
  <Text>[ Copy ]</Text>
</Tooltip>;
```

---

## Popover

Positioned overlay panel anchored to a trigger element.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `content` | `ReactNode` | `—` | ✓ |
| `isOpen` | `boolean` | `—` | ✓ |
| `onClose` | `() => void` | `—` | — |
| `position` | `'top' | 'bottom' | 'left' | 'right'` | `'bottom'` | — |

**Usage:**

```tsx
import { Popover } from 'termui/components';

<Popover isOpen={open} onClose={() => setOpen(false)} content={<MenuItems />}>
  <Text>[ Open ]</Text>
</Popover>;
```
