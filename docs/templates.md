---
title: 'Template Components'
---

# Template Components

Templates are opinionated full-screen layouts and UI patterns inspired by real-world CLI tools. Each template composes multiple primitives into a polished, ready-to-use screen or section that you can drop into your app and customize.

---

## SplashScreen

Renders a large ASCII title using `BigText`, with optional subtitle, author attribution, and a custom status line. Use it as the first frame of your CLI app.

**Props:**

| Prop            | Type                              | Default       | Required |
| --------------- | --------------------------------- | ------------- | -------- |
| `title`         | `string`                          | —             | ✓        |
| `font`          | `'block' \| 'simple'`             | `'block'`     | —        |
| `titleColor`    | `string`                          | theme primary | —        |
| `titleColorAlt` | `string`                          | —             | —        |
| `subtitle`      | `string`                          | —             | —        |
| `subtitleDim`   | `boolean`                         | `true`        | —        |
| `author`        | `{ name: string; href?: string }` | —             | —        |
| `statusLine`    | `ReactNode`                       | —             | —        |
| `padding`       | `number`                          | `2`           | —        |

**Usage:**

```tsx
import { SplashScreen } from 'termui/components';

<SplashScreen
  title="myapp"
  titleColor="cyan"
  titleColorAlt="blue"
  subtitle="The fastest way to ship CLI tools"
  author={{ name: 'Arindam', href: 'https://studio1hq.com' }}
  statusLine={<Text dimColor>v1.0.0 — press any key to continue</Text>}
/>;
```

```sh
npx termui add splash-screen
```

---

## AppShell

A full-screen application shell with composable slots for a header, scrollable content area, command input, contextual hints, and tips. Handles keyboard navigation and scroll state internally.

**Props (root):**

| Prop         | Type        | Default | Required |
| ------------ | ----------- | ------- | -------- |
| `children`   | `ReactNode` | —       | ✓        |
| `fullscreen` | `boolean`   | —       | —        |

**Sub-components:**

| Sub-component      | Key props                                                                              |
| ------------------ | -------------------------------------------------------------------------------------- |
| `AppShell.Header`  | `children`                                                                             |
| `AppShell.Content` | `children`, `height` (default `20`), `autoscroll`                                      |
| `AppShell.Input`   | `value`, `onChange`, `onSubmit`, `placeholder`, `prefix`, `borderStyle`, `borderColor` |
| `AppShell.Hints`   | `items: string[]`, `children`                                                          |
| `AppShell.Tip`     | `children`                                                                             |

**Usage:**

```tsx
import { AppShell } from 'termui/components';

<AppShell>
  <AppShell.Header>
    <Text bold>My CLI App</Text>
  </AppShell.Header>
  <AppShell.Content height={18}>
    {messages.map((m, i) => (
      <Text key={i}>{m}</Text>
    ))}
  </AppShell.Content>
  <AppShell.Input
    placeholder="Type a command..."
    prefix=">"
    onSubmit={(val) => handleCommand(val)}
  />
  <AppShell.Hints items={['↑↓ scroll', 'Enter submit', 'q quit']} />
</AppShell>;
```

```sh
npx termui add app-shell
```

---

## WelcomeScreen

A two-panel welcome screen with a titled border, a left panel for branding or a logo, and a right panel for sections, quick-start info, or metadata. Modelled after tools like Claude Code and GitHub Copilot CLI.

**Props (root):**

| Prop           | Type                                        | Default       | Required |
| -------------- | ------------------------------------------- | ------------- | -------- |
| `appName`      | `string`                                    | —             | ✓        |
| `children`     | `ReactNode`                                 | —             | ✓        |
| `appNameColor` | `string`                                    | theme primary | —        |
| `version`      | `string`                                    | —             | —        |
| `borderStyle`  | `'single' \| 'round' \| 'double' \| 'bold'` | `'single'`    | —        |
| `leftWidth`    | `number`                                    | `26`          | —        |

**Sub-components:**

| Sub-component            | Key props                                               |
| ------------------------ | ------------------------------------------------------- |
| `WelcomeScreen.Left`     | `children`                                              |
| `WelcomeScreen.Right`    | `children`                                              |
| `WelcomeScreen.Greeting` | `children`, `bold`, `color`                             |
| `WelcomeScreen.Logo`     | `children`, `align`                                     |
| `WelcomeScreen.Meta`     | `items: string[]`, `separator`, `stack`, `dim`, `color` |
| `WelcomeScreen.Section`  | `title`, `titleColor`, `children`                       |

**Usage:**

```tsx
import { WelcomeScreen } from 'termui/components';

<WelcomeScreen appName="myapp" version="v2.1.0">
  <WelcomeScreen.Left>
    <WelcomeScreen.Logo>{'  ██╗\n  ╚═╝'}</WelcomeScreen.Logo>
    <WelcomeScreen.Meta items={['TypeScript', 'MIT']} dim />
  </WelcomeScreen.Left>
  <WelcomeScreen.Right>
    <WelcomeScreen.Greeting>Good morning, Arindam</WelcomeScreen.Greeting>
    <WelcomeScreen.Section title="Quick Start">
      Run `myapp init` to get started.
    </WelcomeScreen.Section>
  </WelcomeScreen.Right>
</WelcomeScreen>;
```

```sh
npx termui add welcome-screen
```

---

## LoginFlow

An authentication screen with a large BigText title, an announcement banner, a description, and a keyboard-navigable option selector with number-key shortcuts.

**Props (root):**

| Prop         | Type          | Default       | Required |
| ------------ | ------------- | ------------- | -------- |
| `children`   | `ReactNode`   | —             | ✓        |
| `title`      | `string`      | —             | —        |
| `titleFont`  | `BigTextFont` | `'block'`     | —        |
| `titleColor` | `string`      | theme primary | —        |
| `padding`    | `number`      | `2`           | —        |

**Sub-components:**

| Sub-component            | Key props                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `LoginFlow.Announcement` | `children`, `icon`, `iconColor`, `borderStyle`, `borderColor`                                   |
| `LoginFlow.Description`  | `children`, `bold`, `dim`, `color`                                                              |
| `LoginFlow.Select`       | `options: string[]`, `onSelect`, `label`, `cursor`, `cursorColor`, `activeColor`, `keyboardNav` |

**Usage:**

```tsx
import { LoginFlow } from 'termui/components';

<LoginFlow title="auth" titleColor="cyan">
  <LoginFlow.Announcement icon="★" iconColor="yellow">
    New: API key authentication is now available
  </LoginFlow.Announcement>
  <LoginFlow.Description dim>Choose how you want to sign in:</LoginFlow.Description>
  <LoginFlow.Select
    label="Authentication method"
    options={['Browser (OAuth)', 'API key', 'SSO / Enterprise']}
    onSelect={(i) => handleAuth(i)}
  />
</LoginFlow>;
```

```sh
npx termui add login-flow
```

---

## SetupFlow

A step-by-step setup wizard with connectors between steps, animated spinners, status icons per step, and a multi-select checklist. Modelled after the Clack CLI library style.

**Props (root):**

| Prop             | Type          | Default     | Required |
| ---------------- | ------------- | ----------- | -------- |
| `children`       | `ReactNode`   | —           | ✓        |
| `title`          | `string`      | —           | —        |
| `titleFont`      | `BigTextFont` | `'block'`   | —        |
| `titleColor`     | `string`      | `'#888888'` | —        |
| `connectorChar`  | `string`      | `'│'`       | —        |
| `connectorColor` | `string`      | theme muted | —        |

**Sub-components:**

| Sub-component           | Key props                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `SetupFlow.Badge`       | `label`, `bg`, `color`                                                                                |
| `SetupFlow.Step`        | `children`, `status` (`'done' \| 'active' \| 'pending' \| 'success' \| 'error'`), `icon`, `iconColor` |
| `SetupFlow.Spinner`     | `label`                                                                                               |
| `SetupFlow.MultiSelect` | `label`, `options`, `values`, `onChange`, `onSubmit`, `hint`, `checkedChar`, `uncheckedChar`          |

**Usage:**

```tsx
import { SetupFlow } from 'termui/components';

<SetupFlow title="setup">
  <SetupFlow.Badge label="WELCOME" bg="cyan" color="black" />
  <SetupFlow.Step status="success">Project directory created</SetupFlow.Step>
  <SetupFlow.Step status="active">Installing dependencies</SetupFlow.Step>
  <SetupFlow.Spinner label="Resolving packages..." />
  <SetupFlow.MultiSelect
    label="Select features to enable"
    hint="Space to toggle, Enter to confirm"
    options={[
      { value: 'ts', label: 'TypeScript' },
      { value: 'lint', label: 'ESLint', description: 'recommended' },
    ]}
    onSubmit={(vals) => configureFeatures(vals)}
  />
</SetupFlow>;
```

```sh
npx termui add setup-flow
```

---

## UsageMonitor

A live dashboard for displaying resource and quota metrics with progress bars, multi-segment distribution bars, stat rows, predictions, and a real-time status bar. Re-renders on a configurable interval.

**Props (root):**

| Prop              | Type        | Default | Required |
| ----------------- | ----------- | ------- | -------- |
| `children`        | `ReactNode` | —       | ✓        |
| `refreshInterval` | `number`    | `1000`  | —        |
| `separatorChar`   | `string`    | `'─'`   | —        |

**Sub-components:**

| Sub-component                     | Key props                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------ |
| `UsageMonitor.Header`             | `title`, `titleColor`, `decorator`, `separatorChar`                            |
| `UsageMonitor.Tags`               | `items: string[]`, `bracketColor`, `separatorColor`                            |
| `UsageMonitor.Section`            | `title`, `icon`, `subtitle`, `children`                                        |
| `UsageMonitor.Metric`             | `label`, `value`, `max`, `percent`, `status`, `format`, `barWidth`, `formatFn` |
| `UsageMonitor.DistributionMetric` | `label`, `segments` (`{ label, percent, color }[]`), `barWidth`                |
| `UsageMonitor.StatRow`            | `label`, `value`, `valueSuffix`, `valueColor`, `icon`                          |
| `UsageMonitor.Prediction`         | `label`, `value`, `valueColor`                                                 |
| `UsageMonitor.StatusBar`          | `clock`, `sessionLabel`, `exitHint`, `statusDot`                               |

**Usage:**

```tsx
import { UsageMonitor } from 'termui/components';

<UsageMonitor refreshInterval={2000}>
  <UsageMonitor.Header title="API Usage Dashboard" titleColor="cyan" />
  <UsageMonitor.Tags items={['claude-3-5-sonnet', 'Pro plan', 'Active']} />
  <UsageMonitor.Section title="Token Usage" icon="◆">
    <UsageMonitor.Metric
      label="Input tokens"
      value={42000}
      max={100000}
      percent={42}
      status="green"
      format="number"
    />
    <UsageMonitor.Metric
      label="Cost"
      value={1.26}
      max={5.0}
      percent={25.2}
      status="yellow"
      format="currency"
    />
  </UsageMonitor.Section>
  <UsageMonitor.StatusBar clock sessionLabel="Session #42" exitHint="q to quit" />
</UsageMonitor>;
```

```sh
npx termui add usage-monitor
```

---

## BulletList

A structured list component with bullet items, nested sub-items, tree-style child rows, and checkbox items for checklists.

**Props (root):**

| Prop       | Type        | Default | Required |
| ---------- | ----------- | ------- | -------- |
| `children` | `ReactNode` | —       | ✓        |

**Sub-components:**

| Sub-component          | Key props                            |
| ---------------------- | ------------------------------------ |
| `BulletList.Item`      | `label`, `bold`, `color`, `children` |
| `BulletList.Sub`       | `children`                           |
| `BulletList.TreeItem`  | `label`, `color`                     |
| `BulletList.CheckItem` | `label`, `done`, `color`             |

**Usage:**

```tsx
import { BulletList } from 'termui/components';

<BulletList>
  <BulletList.Item label="Core packages" bold>
    <BulletList.Sub>
      <BulletList.TreeItem label="@termui/core" />
      <BulletList.TreeItem label="@termui/components" />
    </BulletList.Sub>
  </BulletList.Item>
  <BulletList.Item label="Setup checklist">
    <BulletList.Sub>
      <BulletList.CheckItem label="Initialize project" done />
      <BulletList.CheckItem label="Add components" />
    </BulletList.Sub>
  </BulletList.Item>
</BulletList>;
```

```sh
npx termui add bullet-list
```

---

## InfoBox

A bordered box for presenting structured metadata: a header with icon, version badge, and description; key-value rows; and tree rows for hierarchical data.

**Props (root):**

| Prop          | Type                                        | Default      | Required |
| ------------- | ------------------------------------------- | ------------ | -------- |
| `children`    | `ReactNode`                                 | —            | ✓        |
| `borderStyle` | `'single' \| 'round' \| 'double' \| 'bold'` | `'single'`   | —        |
| `borderColor` | `string`                                    | theme border | —        |
| `padding`     | `[number, number]`                          | `[0, 1]`     | —        |
| `width`       | `number \| 'full'`                          | —            | —        |

**Sub-components:**

| Sub-component     | Key props                                                              |
| ----------------- | ---------------------------------------------------------------------- |
| `InfoBox.Header`  | `label`, `icon`, `iconColor`, `description`, `version`, `versionColor` |
| `InfoBox.Row`     | `label`, `value`, `valueDetail`, `valueColor`, `bold`, `color`         |
| `InfoBox.TreeRow` | same as `Row` — renders with `└ ` prefix                               |

**Usage:**

```tsx
import { InfoBox } from 'termui/components';

<InfoBox borderStyle="round" width={40}>
  <InfoBox.Header
    icon="◆"
    iconColor="cyan"
    label="myapp"
    description="CLI toolkit"
    version="v1.4.0"
  />
  <InfoBox.Row label="Author" value="Arindam" />
  <InfoBox.Row label="License" value="MIT" valueDetail="Open source" />
  <InfoBox.TreeRow label="Homepage" value="studio1hq.com" valueColor="cyan" />
</InfoBox>;
```

```sh
npx termui add info-box
```

---

## HelpScreen

A full help page with a BigText title, tagline, usage string, and auto-aligned flag/description rows grouped into named sections. Column width is computed automatically from the longest flag.

**Props (root):**

| Prop          | Type          | Default       | Required |
| ------------- | ------------- | ------------- | -------- |
| `title`       | `string`      | —             | ✓        |
| `children`    | `ReactNode`   | —             | ✓        |
| `font`        | `BigTextFont` | `'block'`     | —        |
| `titleColor`  | `string`      | theme primary | —        |
| `tagline`     | `string`      | —             | —        |
| `usage`       | `string`      | —             | —        |
| `description` | `string`      | —             | —        |
| `columnGap`   | `number`      | `4`           | —        |
| `flagWidth`   | `number`      | auto          | —        |

**Sub-components:**

| Sub-component        | Key props                                              |
| -------------------- | ------------------------------------------------------ |
| `HelpScreen.Section` | `label`, `labelColor`, `children`                      |
| `HelpScreen.Row`     | `flag`, `description`, `flagColor`, `descriptionColor` |

**Usage:**

```tsx
import { HelpScreen } from 'termui/components';

<HelpScreen
  title="myapp"
  tagline="The fastest way to ship CLI tools"
  usage="myapp <command> [flags]"
>
  <HelpScreen.Section label="Commands">
    <HelpScreen.Row flag="init" description="Initialise a new project" />
    <HelpScreen.Row flag="add <component>" description="Copy a component into your project" />
    <HelpScreen.Row flag="preview" description="Launch the interactive gallery" />
  </HelpScreen.Section>
  <HelpScreen.Section label="Global flags">
    <HelpScreen.Row flag="--help, -h" description="Show this help screen" />
    <HelpScreen.Row flag="--version, -v" description="Print version number" />
  </HelpScreen.Section>
</HelpScreen>;
```

```sh
npx termui add help-screen
```
