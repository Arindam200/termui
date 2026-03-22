---
title: 'Forms Components'
---

# Forms Components

## Form

Form context with validation, dirty tracking. Ctrl+S to submit.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `children` | `ReactNode` | `—` | ✓ |
| `onSubmit` | `(values: Record<string, unknown>) => void` | `—` | ✓ |
| `initialValues` | `Record<string, unknown>` | `—` | — |
| `fields` | `FormField[]` | `—` | — |

**Usage:**

```tsx
import { Form, FormField, TextInput } from 'termui/components';

<Form
  onSubmit={(values) => console.log(values)}
  fields={[{ name: 'name', validate: (v) => (v ? null : 'Required') }]}
>
  <FormField name="name" label="Name">
    <TextInput value={name} onChange={setName} />
  </FormField>
</Form>;
```

---

## FormField

Label + error wrapper for form inputs.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `name` | `string` | `—` | ✓ |
| `label` | `string` | `—` | — |
| `children` | `ReactNode` | `—` | ✓ |
| `error` | `string` | `—` | — |
| `hint` | `string` | `—` | — |
| `required` | `boolean` | `—` | — |

**Usage:**

```tsx
import { FormField } from 'termui/components';

<FormField name="email" label="Email" required>
  <EmailInput value={email} onChange={setEmail} />
</FormField>;
```

---

## Wizard

Multi-step form wizard with validation per step.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `steps` | `WizardStep[]` | `—` | ✓ |
| `onComplete` | `(completedSteps: string[]) => void` | `—` | — |
| `onCancel` | `() => void` | `—` | — |
| `showProgress` | `boolean` | `true` | — |

**Usage:**

```tsx
import { Wizard } from 'termui/components';

<Wizard
  steps={[
    { key: 'name', title: 'Name', content: <NameStep /> },
    { key: 'email', title: 'Email', content: <EmailStep /> },
  ]}
  onComplete={(steps) => console.log('Done!', steps)}
/>;
```

---

## Confirm

Yes/No inline confirmation prompt.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `message` | `string` | `—` | ✓ |
| `onConfirm` | `() => void` | `—` | — |
| `onCancel` | `() => void` | `—` | — |
| `confirmLabel` | `string` | `'Yes'` | — |
| `cancelLabel` | `string` | `'No'` | — |
| `defaultValue` | `boolean` | `false` | — |
| `variant` | `'default' | 'danger'` | `'default'` | — |

**Usage:**

```tsx
import { Confirm } from 'termui/components';

<Confirm
  message="Delete this file?"
  variant="danger"
  onConfirm={deleteFile}
  onCancel={() => setShow(false)}
/>;
```

---

## DatePicker

Date picker with month/day/year spinners. Tab to switch fields.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `Date` | `—` | — |
| `onChange` | `(date: Date) => void` | `—` | — |
| `onSubmit` | `(date: Date) => void` | `—` | — |
| `label` | `string` | `—` | — |
| `minDate` | `Date` | `—` | — |
| `maxDate` | `Date` | `—` | — |
| `autoFocus` | `boolean` | `false` | — |

**Usage:**

```tsx
import { DatePicker } from 'termui/components';

<DatePicker value={date} onChange={setDate} onSubmit={handleSubmit} label="Select date" />;
```

---

## TimePicker

Time picker with hours/minutes spinners. Supports 12h and 24h.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `{ hours: number; minutes: number }` | `—` | — |
| `onChange` | `(time: { hours: number; minutes: number }) => void` | `—` | — |
| `label` | `string` | `—` | — |
| `format` | `12 | 24` | `24` | — |
| `autoFocus` | `boolean` | `false` | — |

**Usage:**

```tsx
import { TimePicker } from 'termui/components';

<TimePicker value={time} onChange={setTime} format={12} label="Select time" />;
```

---

## FilePicker

File selection dialog with directory browsing.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `string` | `—` | — |
| `onChange` | `(path: string) => void` | `—` | — |
| `onSubmit` | `(path: string) => void` | `—` | — |
| `root` | `string` | `process.cwd()` | — |
| `filter` | `string` | `—` | — |
| `showHidden` | `boolean` | `false` | — |

**Usage:**

```tsx
import { FilePicker } from 'termui/components';

<FilePicker onSubmit={(path) => console.log(path)} filter="*.json" />;
```
