# Component Picker

Map user needs to exact TermUI components. Use this to decide what to `npx termui add`.

---

## "I need to show a list of things"

| What they need | Component | Registry name |
|----------------|-----------|---------------|
| Simple list, <100 items | `List` | `list` |
| Thousands of items | `VirtualList` | `virtual-list` |
| Tabular data with columns | `Table` | `table` |
| Table with inline editing | `DataGrid` | `data-grid` |
| Nested/hierarchical data | `Tree` | `tree` |
| File system tree | `DirectoryTree` | `directory-tree` |
| Key-value pairs | `KeyValue` | `key-value` |

**Table** is the go-to for structured data. It handles sorting (`sortable`) and row selection (`selectable` + `onSelect`). Use `VirtualList` only when the dataset is genuinely large.

---

## "I need the user to type something"

| What they need | Component | Registry name |
|----------------|-----------|---------------|
| Any text | `TextInput` | `text-input` |
| Multi-line text | `TextArea` | `text-area` |
| Password / secret | `PasswordInput` | `password-input` |
| Numbers only | `NumberInput` | `number-input` |
| Search bar | `SearchInput` | `search-input` |
| File path with tab-complete | `PathInput` | `path-input` |
| Email | `EmailInput` | `email-input` |
| Formatted mask (phone, date) | `MaskedInput` | `masked-input` |

---

## "I need the user to pick from options"

| What they need | Component | Registry name |
|----------------|-----------|---------------|
| Pick one from a list | `Select` | `select` |
| Pick multiple | `MultiSelect` | `multi-select` |
| Yes/No single checkbox | `Checkbox` | `checkbox` |
| Multiple checkboxes | `CheckboxGroup` | `checkbox-group` |
| Radio buttons (pick one, styled) | `RadioGroup` | `radio-group` |
| On/off switch | `Toggle` | `toggle` |
| Hierarchical tree select | `TreeSelect` | `tree-select` |
| Free-form tags | `TagInput` | `tag-input` |

**Select** is the default. It navigates with arrow keys, confirms with Enter.

---

## "I need to show progress or loading"

| What they need | Component | Registry name |
|----------------|-----------|---------------|
| Spinning "loading" indicator | `Spinner` | `spinner` |
| Linear progress bar | `ProgressBar` | `progress-bar` |
| Circular/arc progress | `ProgressCircle` | `progress-circle` |
| Content placeholder while loading | `Skeleton` | `skeleton` |

Use `Spinner` for indeterminate work (fetching, running a command). Use `ProgressBar` when you know the total (e.g., installing N packages, step M of N).

---

## "I need to show status, alerts, or notifications"

| What they need | Component | Registry name |
|----------------|-----------|---------------|
| Inline alert box | `Alert` | `alert` |
| One-liner with status icon | `StatusMessage` | `status-message` |
| Auto-dismissing notification | `Toast` | `toast` |
| Full-width announcement | `Banner` | `banner` |

**Alert** variants: `'success'`, `'error'`, `'warning'`, `'info'`.

---

## "I need charts or metrics"

| What they need | Component | Registry name |
|----------------|-----------|---------------|
| Inline trend line | `Sparkline` | `sparkline` |
| Bar chart | `BarChart` | `bar-chart` |
| Line chart | `LineChart` | `line-chart` |
| Pie / donut chart | `PieChart` | `pie-chart` |
| Activity heatmap | `HeatMap` | `heat-map` |
| Single metric gauge | `Gauge` | `gauge` |

---

## "I need a form"

| What they need | Component | Registry name |
|----------------|-----------|---------------|
| Form with validation | `Form` + `FormField` | `form` |
| Multi-step form | `Wizard` | `wizard` |
| Yes/No confirmation | `Confirm` | `confirm` |
| Date entry | `DatePicker` | `date-picker` |
| Time entry | `TimePicker` | `time-picker` |
| File browser picker | `FilePicker` | `file-picker` |

**Form** submits with `Ctrl+S`. Wrap any input component in `FormField` to get labels, hints, and validation errors.

---

## "I need navigation between views"

| What they need | Component | Registry name |
|----------------|-----------|---------------|
| Tab bar | `Tabs` | `tabs` |
| Breadcrumb path | `Breadcrumb` | `breadcrumb` |
| Page numbers | `Pagination` | `pagination` |
| Cmd+K style palette | `CommandPalette` | `command-palette` |
| Vertical menu | `Menu` | `menu` |
| Side navigation | `Sidebar` | `sidebar` |

---

## "I need a full-screen layout"

| Pattern | Template | Registry name |
|---------|----------|---------------|
| App with header/footer + content | `AppShell` | `app-shell` |
| Splash / intro screen | `SplashScreen` | `splash-screen` |
| Welcome dashboard (2 panels) | `WelcomeScreen` | `welcome-screen` |
| Login / auth screen | `LoginFlow` | `login-flow` |
| Sequential setup steps | `SetupFlow` | `setup-flow` |
| Real-time resource monitor | `UsageMonitor` | `usage-monitor` |
| Info panel with rows | `InfoBox` | `info-box` |
| Bullet list content | `BulletList` | `bullet-list` |
| Full keyboard shortcut screen | `HelpScreen` | `help-screen` |

**AppShell** is the backbone of most multi-screen apps. It has compound sub-components:
- `AppShell.Header` — top bar
- `AppShell.Tip` — tip text below header
- `AppShell.Input` — bottom command input
- `AppShell.Content` — scrollable main area
- `AppShell.Hints` — keyboard hint footer

---

## "I need overlays / dialogs"

| What they need | Component | Registry name |
|----------------|-----------|---------------|
| Full-screen overlay | `Modal` | `modal` |
| Centered dialog | `Dialog` | `dialog` |
| Side drawer | `Drawer` | `drawer` |
| Hover tooltip | `Tooltip` | `tooltip` |
| Floating panel | `Popover` | `popover` |

---

## "I need timers or live data"

Use hooks, not components, for time-based updates:

```tsx
import { useInterval, useAsync, useTerminal } from 'termui/core';

// Poll every second
useInterval(() => setMetrics(readMetrics()), 1000);

// One-shot async load
const { data, loading, error } = useAsync(() => fetchData(), []);
```

For real-time resource display, use the `UsageMonitor` template — it handles the polling and layout for you.

---

## Typography

| What they need | Component |
|----------------|-----------|
| Default text | `<Text>` from `ink` (no need to add — always available) |
| Section heading | `Heading` |
| Code block | `Code` |
| Color-to-color gradient | `Gradient` |
| ASCII art large text | `BigText` |
| Numeric display (clock, counter) | `Digits` |
| Clickable hyperlink | `Link` |
| Inline pill | `Badge` |
| Removable tag | `Tag` |
| Markdown text | `Markdown` |
| Pretty-printed JSON | `JSONView` |
