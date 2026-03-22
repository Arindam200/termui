---
title: 'Input Components'
---

# Input Components

## TextInput

Single-line input with placeholder, validation, and optional masking.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `string` | `—` | ✓ |
| `onChange` | `(value: string) => void` | `—` | ✓ |
| `onSubmit` | `(value: string) => void` | `—` | — |
| `placeholder` | `string` | `—` | — |
| `mask` | `string` | `—` | — |
| `focus` | `boolean` | `—` | — |
| `validate` | `(value: string) => string | null` | `—` | — |

**Usage:**

```tsx
import { TextInput } from 'termui/components';

const [value, setValue] = useState('');
<TextInput
  value={value}
  onChange={setValue}
  onSubmit={(v) => console.log(v)}
  placeholder="Enter name..."
/>;
```

---

## TextArea

Multi-line text editor with scrolling and line wrapping.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `string` | `—` | ✓ |
| `onChange` | `(value: string) => void` | `—` | ✓ |
| `placeholder` | `string` | `—` | — |
| `rows` | `number` | `5` | — |
| `focus` | `boolean` | `—` | — |

**Usage:**

```tsx
import { TextArea } from 'termui/components';

<TextArea value={text} onChange={setText} placeholder="Write here..." rows={6} />;
```

---

## PasswordInput

Masked password input with reveal toggle.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `string` | `—` | ✓ |
| `onChange` | `(value: string) => void` | `—` | ✓ |
| `onSubmit` | `(value: string) => void` | `—` | — |
| `placeholder` | `string` | `'Password...'` | — |
| `mask` | `string` | `'•'` | — |
| `showToggle` | `boolean` | `true` | — |

**Usage:**

```tsx
import { PasswordInput } from 'termui/components';

<PasswordInput value={pass} onChange={setPass} placeholder="Enter password..." />;
```

---

## NumberInput

Numeric input with ↑↓ increment/decrement and min/max clamping.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `number` | `—` | ✓ |
| `onChange` | `(value: number) => void` | `—` | ✓ |
| `min` | `number` | `—` | — |
| `max` | `number` | `—` | — |
| `step` | `number` | `1` | — |

**Usage:**

```tsx
import { NumberInput } from 'termui/components';

<NumberInput value={count} onChange={setCount} min={0} max={100} />;
```

---

## SearchInput

Fuzzy-search input with autocomplete dropdown.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `string` | `—` | ✓ |
| `onChange` | `(value: string) => void` | `—` | ✓ |
| `onSelect` | `(item: string) => void` | `—` | — |
| `options` | `string[]` | `—` | ✓ |
| `placeholder` | `string` | `—` | — |
| `maxResults` | `number` | `5` | — |

**Usage:**

```tsx
import { SearchInput } from 'termui/components';

<SearchInput
  value={query}
  onChange={setQuery}
  onSelect={handleSelect}
  options={['Apple', 'Banana', 'Cherry']}
/>;
```

---

## MaskedInput

Format-constrained input for phone, date, credit card patterns.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `string` | `—` | ✓ |
| `onChange` | `(value: string) => void` | `—` | ✓ |
| `mask` | `string` | `—` | ✓ |
| `placeholder` | `string` | `—` | — |

**Usage:**

```tsx
import { MaskedInput } from 'termui/components';

<MaskedInput value={phone} onChange={setPhone} mask="(999) 999-9999" />;
```

---

## EmailInput

Email input with domain autocomplete and inline validation.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `string` | `—` | ✓ |
| `onChange` | `(value: string) => void` | `—` | ✓ |
| `onSubmit` | `(value: string) => void` | `—` | — |
| `suggestions` | `string[]` | `['gmail.com', 'yahoo.com', ...]` | — |

**Usage:**

```tsx
import { EmailInput } from 'termui/components';

<EmailInput value={email} onChange={setEmail} onSubmit={handleSubmit} />;
```

---

## PathInput

Filesystem path input with Tab autocomplete.

**Props:**
| Prop | Type | Default | Required |
|------|------|---------|----------|
| `value` | `string` | `—` | ✓ |
| `onChange` | `(value: string) => void` | `—` | ✓ |
| `onSubmit` | `(value: string) => void` | `—` | — |
| `cwd` | `string` | `process.cwd()` | — |
| `showHidden` | `boolean` | `false` | — |

**Usage:**

```tsx
import { PathInput } from 'termui/components';

<PathInput value={path} onChange={setPath} onSubmit={handleSubmit} />;
```
