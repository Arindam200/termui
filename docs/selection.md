---
title: "Selection Components"
---

# Selection Components

## Select

Single-select dropdown with keyboard search and grouping.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `options` | `SelectOption[]` | `—` | ✓ |
| `value` | `string` | `—` | — |
| `onChange` | `(value: string) => void` | `—` | — |
| `onSubmit` | `(value: string) => void` | `—` | — |
| `placeholder` | `string` | `—` | — |
| `searchable` | `boolean` | `false` | — |

**Usage:**
```tsx
import { Select } from 'termui/components'

<Select
  options={[
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ]}
  onChange={handleChange}
/>
```

---

## MultiSelect

Multi-select list with Space to toggle, Enter to submit.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `options` | `MultiSelectOption[]` | `—` | ✓ |
| `value` | `T[]` | `—` | — |
| `onChange` | `(values: T[]) => void` | `—` | — |
| `onSubmit` | `(values: T[]) => void` | `—` | — |
| `cursor` | `string` | `'›'` | — |
| `checkmark` | `string` | `'◉'` | — |
| `height` | `number` | `—` | — |

**Usage:**
```tsx
import { MultiSelect } from 'termui/components'

<MultiSelect
  options={options}
  onChange={setSelected}
  onSubmit={handleSubmit}
/>
```

---

## RadioGroup

Mutually-exclusive radio button group.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `options` | `RadioOption[]` | `—` | ✓ |
| `value` | `T` | `—` | — |
| `onChange` | `(value: T) => void` | `—` | — |
| `cursor` | `string` | `'›'` | — |

**Usage:**
```tsx
import { RadioGroup } from 'termui/components'

<RadioGroup
  options={[
    { value: 'light', label: 'Light mode' },
    { value: 'dark', label: 'Dark mode' },
  ]}
  onChange={setTheme}
/>
```

---

## Checkbox

Single checkbox with indeterminate state support.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `checked` | `boolean` | `—` | ✓ |
| `onChange` | `(checked: boolean) => void` | `—` | — |
| `label` | `string` | `—` | — |
| `indeterminate` | `boolean` | `—` | — |
| `disabled` | `boolean` | `—` | — |

**Usage:**
```tsx
import { Checkbox } from 'termui/components'

<Checkbox
  checked={accepted}
  onChange={setAccepted}
  label="I accept the terms"
/>
```

---

## CheckboxGroup

Group of checkboxes with optional min/max selection constraints.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `options` | `CheckboxGroupOption[]` | `—` | ✓ |
| `value` | `string[]` | `—` | — |
| `onChange` | `(values: string[]) => void` | `—` | — |
| `label` | `string` | `—` | — |
| `min` | `number` | `—` | — |
| `max` | `number` | `—` | — |

**Usage:**
```tsx
import { CheckboxGroup } from 'termui/components'

<CheckboxGroup
  label="Features"
  options={featureOptions}
  onChange={setFeatures}
  min={1} max={3}
/>
```

---

## Toggle

On/off toggle switch.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `boolean` | `—` | ✓ |
| `onChange` | `(value: boolean) => void` | `—` | — |
| `label` | `string` | `—` | — |
| `onLabel` | `string` | `'ON'` | — |
| `offLabel` | `string` | `'OFF'` | — |

**Usage:**
```tsx
import { Toggle } from 'termui/components'

<Toggle
  value={enabled}
  onChange={setEnabled}
  label="Notifications"
/>
```

---

## TreeSelect

Hierarchical tree selection with expand/collapse.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `nodes` | `TreeSelectNode[]` | `—` | ✓ |
| `value` | `T` | `—` | — |
| `onChange` | `(value: T) => void` | `—` | — |
| `expandedByDefault` | `boolean` | `false` | — |

**Usage:**
```tsx
import { TreeSelect } from 'termui/components'

<TreeSelect
  nodes={treeData}
  onChange={setValue}
  expandedByDefault
/>
```

---

## TagInput

Multi-tag input — type and press Enter to add, Backspace to remove.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `string[]` | `—` | — |
| `onChange` | `(tags: string[]) => void` | `—` | — |
| `placeholder` | `string` | `'Type and press Enter…'` | — |
| `maxTags` | `number` | `—` | — |

**Usage:**
```tsx
import { TagInput } from 'termui/components'

<TagInput
  value={tags}
  onChange={setTags}
  maxTags={5}
/>
```

---

## ColorPicker

Color palette picker with hex/RGB input.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `string` | `—` | — |
| `onChange` | `(color: string) => void` | `—` | — |
| `palette` | `string[]` | `—` | — |
| `format` | `'hex' | 'rgb'` | `'hex'` | — |

**Usage:**
```tsx
import { ColorPicker } from 'termui/components'

<ColorPicker
  value={color}
  onChange={setColor}
/>
```
