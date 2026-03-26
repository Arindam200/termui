# TermUI Component Reference

Full props for all 101 components. Components are copied into your project via `npx termui add <name>`.

---

## Table of Contents

1. [Layout](#layout)
2. [Typography](#typography)
3. [Input](#input)
4. [Selection](#selection)
5. [Data Display](#data-display)
6. [Feedback](#feedback)
7. [Navigation](#navigation)
8. [Overlays](#overlays)
9. [Forms](#forms)
10. [Charts](#charts)
11. [Utility](#utility)
12. [Templates](#templates)
13. [AI Components](#ai-components)

---

## Layout

### `Box`

Ink's core layout primitive. All Ink/Yoga flexbox props apply.

```tsx
<Box flexDirection="column" gap={1} padding={2} width={40} borderStyle="round">
  {children}
</Box>
```

### `Stack`

Vertical stack with consistent spacing.

```tsx
<Stack gap={1}>{children}</Stack>
```

### `Grid`

CSS grid-like layout for terminal columns.

```tsx
<Grid columns={3} gap={2}>
  {children}
</Grid>
```

### `ScrollView`

Scrollable container. Arrow keys or mouse wheel to scroll.

```tsx
<ScrollView height={20}>{children}</ScrollView>
```

### `Columns`

Horizontal columns with configurable widths.

```tsx
<Columns widths={[30, 70]}>
  <Left />
  <Right />
</Columns>
```

### `Center`

Centers content horizontally/vertically.

```tsx
<Center horizontal vertical>
  {children}
</Center>
```

### `Divider`

Horizontal rule.

```tsx
<Divider label="Section" char="─" color="#4B5563" />
```

### `Spacer`

Fills remaining space (flex: 1).

```tsx
<Box flexDirection="row">
  <Left />
  <Spacer />
  <Right />
</Box>
```

### `AspectRatio`

Maintains aspect ratio of children.

```tsx
<AspectRatio ratio={16 / 9}>{children}</AspectRatio>
```

---

## Typography

### `Text`

Ink's base text. Accepts `color`, `bold`, `italic`, `dimColor`, `underline`, `strikethrough`, `inverse`.

### `Heading`

Styled heading with level.

```tsx
<Heading level={1}>Title</Heading> // level: 1-4
```

### `Code`

Inline or block code with syntax highlighting hint.

```tsx
<Code language="typescript">{codeString}</Code>
```

### `Link`

OSC 8 terminal hyperlink.

```tsx
<Link url="https://example.com">Click here</Link>
```

### `Badge`

Inline pill badge.

```tsx
<Badge variant="success">v1.0</Badge>
// variant: 'default'|'success'|'warning'|'error'|'info'|'secondary'
```

### `Tag`

Removable tag chip.

```tsx
<Tag onRemove={() => removeTag(id)}>typescript</Tag>
```

### `Markdown`

Renders markdown in the terminal. Supports a `streaming` prop for live LLM output.

```tsx
<Markdown>{markdownString}</Markdown>

// Streaming LLM output — handles partial code fences, appends cursor
<Markdown streaming cursor="▌">{partialFromLLM}</Markdown>
```

### `StreamingText`

Token-by-token streaming text with optional blinking cursor. For LLM output.

```tsx
// Controlled — re-render as tokens arrive
<StreamingText text={partialResponse} cursor="▌" />

// From AsyncIterable
<StreamingText stream={tokenStream} onComplete={(full) => save(full)} />

// Typing animation for pre-buffered text
<StreamingText text={fullText} animate speed={30} />
```

### `JSON` (JSONView)

Pretty-printed, color-coded JSON.

```tsx
<JSONView data={myObject} indent={2} />
```

### `Gradient`

Text with gradient color effect.

```tsx
<Gradient colors={['#7C3AED', '#EC4899']}>Gradient text</Gradient>
```

### `BigText`

ASCII art text (figlet-style).

```tsx
<BigText font="block" color="#7C3AED">
  HELLO
</BigText>
// font: 'block'|'simple'
```

### `Digits`

Large digit display (for numbers/clocks).

```tsx
<Digits value={42} color="#7C3AED" />
```

---

## Input

All inputs support controlled (`value` + `onChange`) or uncontrolled mode.

### `TextInput`

```tsx
<TextInput
  value={val}
  onChange={setVal}
  onSubmit={(v) => handleSubmit(v)}
  placeholder="Type here…"
  label="Name"
  width={40}
  bordered // default true
  borderStyle="round"
  validate={(v) => (v.length < 2 ? 'Too short' : null)}
  cursor="█" // default
  autoFocus
  id="name-input"
/>
```

### `TextArea`

Multi-line text input.

```tsx
<TextArea
  value={val}
  onChange={setVal}
  onSubmit={handleSubmit}
  placeholder="Enter description…"
  label="Description"
  width={60}
  height={8}
/>
```

### `PasswordInput`

TextInput with masked characters.

```tsx
<PasswordInput value={pw} onChange={setPw} onSubmit={handleLogin} label="Password" />
```

### `NumberInput`

Numeric input with increment/decrement (arrow keys).

```tsx
<NumberInput value={num} onChange={setNum} min={0} max={100} step={5} label="Port" />
```

### `SearchInput`

TextInput with a search icon.

```tsx
<SearchInput value={query} onChange={setQuery} onSubmit={search} placeholder="Search…" />
```

### `MaskedInput`

Input with a format mask.

```tsx
<MaskedInput mask="(___) ___-____" value={phone} onChange={setPhone} label="Phone" />
```

### `EmailInput`

TextInput with email validation built-in.

```tsx
<EmailInput value={email} onChange={setEmail} onSubmit={submit} label="Email" />
```

### `PathInput`

Filesystem path input with tab completion.

```tsx
<PathInput value={path} onChange={setPath} onSubmit={handlePath} label="Output dir" />
```

---

## Selection

### `Select`

Arrow-key navigated list. Press Enter to confirm.

```tsx
<Select
  label="Choose:"
  options={[
    { value: 'a', label: 'Option A', hint: 'recommended' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Disabled', disabled: true },
  ]}
  value={selected}
  onChange={setSelected}
  onSubmit={handleSubmit}
  cursor="›"
  cursorColor={theme.colors.primary}
/>
```

### `MultiSelect`

Spacebar to toggle, Enter to confirm.

```tsx
<MultiSelect
  label="Select features:"
  options={options}
  value={selectedValues}
  onChange={setSelectedValues}
  onSubmit={handleSubmit}
  checkChar="◆"
  uncheckChar="◇"
/>
```

### `RadioGroup`

Single-select with visual radio buttons.

```tsx
<RadioGroup
  options={[
    { value: 'npm', label: 'npm' },
    { value: 'pnpm', label: 'pnpm' },
  ]}
  value={pm}
  onChange={setPm}
  label="Package manager"
/>
```

### `Checkbox`

Single boolean checkbox.

```tsx
<Checkbox checked={checked} onChange={setChecked} label="Enable telemetry" />
```

### `CheckboxGroup`

Multiple checkboxes as a group.

```tsx
<CheckboxGroup options={options} value={checked} onChange={setChecked} label="Plugins" />
```

### `Toggle`

Boolean on/off switch.

```tsx
<Toggle value={on} onChange={setOn} label="Dark mode" onLabel="On" offLabel="Off" />
```

### `TreeSelect`

Hierarchical select with expand/collapse.

```tsx
<TreeSelect
  tree={[{ id: 'root', label: 'src', children: [{ id: 'index', label: 'index.ts' }] }]}
  onSelect={(node) => openFile(node.id)}
/>
```

### `TagInput`

Free-form tag entry with comma/Enter to add, Backspace to remove.

```tsx
<TagInput tags={tags} onChange={setTags} placeholder="Add tag…" label="Labels" />
```

### `ColorPicker`

Terminal color picker (hex or palette).

```tsx
<ColorPicker value={color} onChange={setColor} label="Accent color" />
```

---

## Data Display

### `Table`

Sortable, selectable data table.

```tsx
<Table
  data={rows}
  columns={[
    { key: 'name', header: 'Name', align: 'left' },
    { key: 'size', header: 'Size', align: 'right', width: 10 },
  ]}
  sortable
  selectable
  onSelect={(row) => console.log(row)}
  maxRows={20}
  borderStyle="round"
  columnSeparator=" │ "
  rowSeparatorChar="─"
/>
// Keys: ↑↓ navigate, s = sort by focused column, Enter = select
```

### `DataGrid`

Table with inline cell editing.

```tsx
<DataGrid data={rows} columns={columns} onEdit={(row, col, val) => updateCell(row, col, val)} />
```

### `List`

Simple scrollable list.

```tsx
<List
  items={['Item 1', 'Item 2']}
  onSelect={(item, idx) => handleSelect(item)}
  renderItem={(item, isActive) => <Text bold={isActive}>{item}</Text>}
/>
```

### `VirtualList`

Virtualized list — renders only visible rows. Use for thousands of items.

```tsx
<VirtualList
  items={largeArray}
  itemHeight={1}
  height={20}
  renderItem={(item) => <Text>{item}</Text>}
/>
```

### `Tree`

Collapsible tree view.

```tsx
<Tree
  nodes={[{ id: '1', label: 'Root', children: [{ id: '2', label: 'Child' }] }]}
  onSelect={(node) => console.log(node)}
/>
```

### `DirectoryTree`

File system directory tree (reads real paths).

```tsx
<DirectoryTree path="/Users/me/project" onSelect={(filePath) => openFile(filePath)} />
```

### `KeyValue`

Labeled value pairs.

```tsx
<KeyValue data={{ Version: '1.2.3', Author: 'Arindam', License: 'MIT' }} />
```

### `Definition`

Glossary-style term/definition list.

```tsx
<Definition items={[{ term: 'ESM', definition: 'ECMAScript Modules' }]} />
```

### `Card`

Bordered content card.

```tsx
<Card title="Summary" borderStyle="round">
  {children}
</Card>
```

### `Panel`

Section with optional header/footer.

```tsx
<Panel header={<Text bold>Title</Text>} footer={<Text dimColor>footer text</Text>}>
  {children}
</Panel>
```

### `DiffView`

Unified or split diff with syntax highlighting.

```tsx
<DiffView
  oldText={originalCode}
  newText={modifiedCode}
  filename="src/index.ts"
  language="typescript"
  mode="unified" // 'unified'|'split'|'inline'
  context={3} // lines of context around each hunk
  showLineNumbers
/>
```

---

## Feedback

### `Spinner`

Animated loading indicator.

```tsx
<Spinner
  style="dots" // 'dots'|'line'|'star'|'clock'|'bounce'|'bar'|'arc'|'arrow'|'toggle'|'box'|'pipe'|'earth'
  label="Loading…"
  color="#7C3AED"
  fps={12}
  frames={['⠋', '⠙', '⠹']} // custom frames override style
/>
```

### `ProgressBar`

Linear progress bar.

```tsx
<ProgressBar
  value={72} // 0-100, or current when total is set
  total={100} // optional: enables value/total display
  width={30}
  showPercent
  fillChar="█"
  emptyChar="░"
  color="#7C3AED"
  label="Installing"
/>
```

### `ProgressCircle`

Arc-style progress indicator.

```tsx
<ProgressCircle value={75} label="CPU" color="#7C3AED" size={5} />
```

### `Alert`

Inline alert box.

```tsx
<Alert variant="success" title="Done!">Operation completed successfully.</Alert>
<Alert variant="error" title="Failed">Could not connect to server.</Alert>
<Alert variant="warning" title="Warning">Deprecated API detected.</Alert>
<Alert variant="info" title="Note">Deployment will take ~2 minutes.</Alert>
// variant: 'success'|'error'|'warning'|'info'|'default'
```

### `Toast`

Ephemeral notification that auto-dismisses.

```tsx
<Toast message="Copied!" variant="success" duration={2000} onDismiss={() => setToast(null)} />
```

### `Banner`

Full-width announcement banner.

```tsx
<Banner variant="warning" dismissible onDismiss={hideBanner}>
  New version available: run `npx termui@latest`
</Banner>
```

### `Skeleton`

Loading placeholder (animated shimmer).

```tsx
<Skeleton width={30} height={3} />
```

### `StatusMessage`

One-liner status with icon.

```tsx
<StatusMessage variant="info">Watching for changes…</StatusMessage>
<StatusMessage variant="success">Build complete (2.3s)</StatusMessage>
```

---

## Navigation

### `Tabs`

Tab bar with keyboard navigation (← → or Tab/Shift+Tab).

```tsx
<Tabs
  tabs={[
    { key: 'logs', label: 'Logs', content: <LogView /> },
    { key: 'metrics', label: 'Metrics', content: <MetricsView /> },
  ]}
  defaultTab="logs"
  activeTab={tab}
  onTabChange={setTab}
  borderStyle="single"
/>
```

### `TabbedContent`

Like `Tabs` but renders all tab content simultaneously (only shows active).

### `Breadcrumb`

Path breadcrumb trail.

```tsx
<Breadcrumb items={['Home', 'Projects', 'My App']} separator="/" />
```

### `Pagination`

Page number navigation.

```tsx
<Pagination page={page} totalPages={10} onChange={setPage} />
```

### `CommandPalette`

Searchable command palette (Ctrl+K style).

```tsx
<CommandPalette
  commands={[
    { label: 'Open file', action: openFile },
    { label: 'Git status', action: gitStatus },
  ]}
  onClose={() => setPaletteOpen(false)}
/>
```

### `Menu`

Vertical dropdown/context menu.

```tsx
<Menu
  items={[
    { label: 'Edit', action: edit },
    { label: 'Delete', action: del, variant: 'danger' },
  ]}
  onClose={() => setMenuOpen(false)}
/>
```

### `Sidebar`

Collapsible side navigation.

```tsx
<Sidebar
  items={[
    { key: 'dashboard', label: 'Dashboard', icon: '◆' },
    { key: 'settings', label: 'Settings' },
  ]}
  activeKey={route}
  onSelect={setRoute}
  collapsed={sidebarCollapsed}
/>
```

---

## Overlays

All overlays render on top of existing content.

### `Modal`

Full-screen modal dialog.

```tsx
<Modal title="Confirm" onClose={() => setOpen(false)} isOpen={open}>
  <Text>Are you sure?</Text>
  <Button onPress={confirm}>Yes</Button>
</Modal>
```

### `Dialog`

Smaller centered dialog.

```tsx
<Dialog
  title="Delete project?"
  onConfirm={del}
  onCancel={() => setOpen(false)}
  confirmLabel="Delete"
/>
```

### `Drawer`

Slide-in panel from edge.

```tsx
<Drawer position="right" isOpen={open} onClose={() => setOpen(false)} width={40}>
  {children}
</Drawer>
// position: 'left'|'right'|'bottom'
```

### `Tooltip`

Hover/focus tooltip.

```tsx
<Tooltip content="Press Enter to confirm">
  <Text>Submit</Text>
</Tooltip>
```

### `Popover`

Floating content panel attached to a trigger.

```tsx
<Popover content={<KeyValue data={details} />} isOpen={showPopover}>
  <Text>Details ▾</Text>
</Popover>
```

---

## Forms

### `Form`

Form context with validation and Ctrl+S to submit.

```tsx
<Form
  onSubmit={(values) => handleSubmit(values)}
  initialValues={{ env: 'production' }}
  fields={[{ name: 'env', validate: (v) => (v ? null : 'Required') }]}
>
  <FormField name="env" label="Environment">
    <Select options={envOptions} />
  </FormField>
  <FormField name="port" label="Port">
    <NumberInput min={1} max={65535} />
  </FormField>
</Form>
```

### `FormField`

Labeled field wrapper — connects to `Form` context via `name`.

```tsx
<FormField name="username" label="Username" hint="Must be lowercase">
  <TextInput />
</FormField>
```

### `Wizard`

Multi-step form wizard.

```tsx
<Wizard
  steps={[
    { title: 'Setup', content: <SetupStep /> },
    { title: 'Config', content: <ConfigStep /> },
    { title: 'Deploy', content: <DeployStep /> },
  ]}
  onComplete={(allValues) => finalize(allValues)}
/>
```

### `Confirm`

Yes/No confirmation prompt.

```tsx
<Confirm
  message="Delete all files?"
  onConfirm={() => deleteAll()}
  onCancel={() => setShowing(false)}
  confirmLabel="Yes, delete"
  cancelLabel="Cancel"
  destructive // highlights confirm in red
/>
```

### `DatePicker`

Calendar date picker.

```tsx
<DatePicker value={date} onChange={setDate} label="Start date" format="YYYY-MM-DD" />
```

### `TimePicker`

Time picker (hours/minutes).

```tsx
<TimePicker value={time} onChange={setTime} label="Start time" use24h />
```

### `FilePicker`

Filesystem file browser.

```tsx
<FilePicker
  cwd={process.cwd()}
  onSelect={(filePath) => handleFile(filePath)}
  filter={(name) => name.endsWith('.json')}
/>
```

---

## Charts

All charts accept an optional `color` prop (uses `theme.colors.primary` by default).

### `Sparkline`

Inline mini line chart for trends.

```tsx
<Sparkline data={[10, 25, 18, 42, 37]} width={20} color="#7C3AED" />
```

### `BarChart`

Horizontal or vertical bar chart.

```tsx
<BarChart
  data={[
    { label: 'Mon', value: 42 },
    { label: 'Tue', value: 87 },
    { label: 'Wed', value: 56 },
  ]}
  title="Daily deploys"
  orientation="vertical" // 'horizontal'|'vertical'
  height={10}
  color="#7C3AED"
  showValues
/>
```

### `LineChart`

ASCII line chart.

```tsx
<LineChart
  data={[
    { x: 0, y: 10 },
    { x: 1, y: 25 },
    { x: 2, y: 18 },
  ]}
  title="Latency"
  width={40}
  height={10}
  xLabel="Time (s)"
  yLabel="ms"
/>
```

### `PieChart`

Pie/donut chart with legend.

```tsx
<PieChart
  data={[
    { label: 'JS', value: 60 },
    { label: 'TS', value: 30 },
    { label: 'CSS', value: 10 },
  ]}
  title="Language breakdown"
  donut
/>
```

### `HeatMap`

Grid heatmap (like GitHub contributions).

```tsx
<HeatMap
  data={weeklyData} // 2D array of numbers
  rows={7}
  cols={52}
  title="Activity"
/>
```

### `Gauge`

Semicircle gauge for single metrics.

```tsx
<Gauge
  value={72}
  min={0}
  max={100}
  label="Memory"
  unit="%"
  warningThreshold={80}
  dangerThreshold={95}
/>
```

---

## Utility

### `Timer`

Countdown timer.

```tsx
<Timer duration={60000} onExpire={() => handleTimeout()} autoStart label="Session expires in:" />
```

### `Stopwatch`

Elapsed time display.

```tsx
<Stopwatch autoStart showMilliseconds />
```

### `Clock`

Live clock display.

```tsx
<Clock format="HH:mm:ss" timezone="America/New_York" />
```

### `Log`

Scrollable log viewer with level filtering.

```tsx
<Log
  entries={[{ level: 'info', message: 'Server started', timestamp: new Date() }]}
  maxLines={100}
  showTimestamps
  showLevel
/>
```

### `Image`

Renders an image using terminal graphics (sixel/block chars).

```tsx
<Image src="/path/to/image.png" width={40} />
```

### `QRCode`

Renders a QR code using Unicode block characters.

```tsx
<QRCode value="https://example.com" size={20} />
```

### `KeyboardShortcuts`

Shortcut reference table.

```tsx
<KeyboardShortcuts
  shortcuts={[
    { key: 'q', description: 'Quit' },
    { key: 'r', description: 'Refresh' },
    { key: '↑↓', description: 'Navigate' },
  ]}
/>
```

### `Help`

Help panel that reads from keybindings config.

```tsx
<Help shortcuts={shortcuts} title="Keyboard Shortcuts" />
```

### `ErrorBoundary`

Catches React errors and renders a fallback.

```tsx
<ErrorBoundary
  fallback={
    <Alert variant="error" title="Crashed">
      Something went wrong.
    </Alert>
  }
>
  <RiskyComponent />
</ErrorBoundary>
```

### `Clipboard`

Clipboard read/write UI trigger.

```tsx
<Clipboard value="text to copy" label="Copy API key" />
```

---

## Templates

High-level, full-screen templates for common TUI patterns.

### `SplashScreen`

ASCII art splash/intro screen.

```tsx
<SplashScreen
  title="MYAPP"
  font="block" // 'block'|'simple'
  titleColor="#7C3AED"
  titleColorAlt="#8B5CF6" // alternates rows for gradient effect
  subtitle="v1.0.0 — fast terminal tools"
  subtitleDim
  author={{ name: 'Arindam Majumder', href: 'https://arindammajumder.com' }}
  statusLine={<Spinner label="Loading…" />}
  padding={2}
/>
```

### `AppShell`

Full-screen TUI layout with header, footer, and scrollable content area.

```tsx
<AppShell
  header={<Text bold>My App v1.0</Text>}
  footer={<Text dimColor>q: quit r: refresh ?: help</Text>}
  tipBar={<Text dimColor>Tip: Press ? for help</Text>}
>
  <BulletList items={results} />
</AppShell>
```

### `WelcomeScreen`

Two-panel welcome dashboard (logo left, sections right).

```tsx
<WelcomeScreen appName="MyApp" version="1.0.0">
  <WelcomeScreen.Left>
    <WelcomeScreen.Greeting>Welcome back, Arindam!</WelcomeScreen.Greeting>
    <WelcomeScreen.Logo>
      <BigText font="block">MA</BigText>
    </WelcomeScreen.Logo>
    <WelcomeScreen.Meta data={{ Plan: 'Pro', Org: 'Studio1hq' }} />
  </WelcomeScreen.Left>
  <WelcomeScreen.Right>
    <WelcomeScreen.Section title="Recent Projects">
      <List items={projects} />
    </WelcomeScreen.Section>
  </WelcomeScreen.Right>
</WelcomeScreen>
```

### `LoginFlow`

Full-page auth/onboarding screen with announcement banner, figlet title, description, and numbered select.

```tsx
<LoginFlow
  title="MYAPP"
  announcement={{ icon: '◆', message: 'New: v2.0 available with better performance' }}
  description={['Choose how you'd like to authenticate.']}
  options={[
    { value: 'oauth', label: 'Continue with GitHub' },
    { value: 'token', label: 'Use API token' },
  ]}
  onSelect={(val) => handleAuth(val)}
/>
```

### `SetupFlow`

Sequential step-by-step setup flow (@clack/prompts visual language).

```tsx
<SetupFlow>
  <SetupFlow.Badge variant="success">v2.0</SetupFlow.Badge>
  <SetupFlow.Step label="Check Node.js version" status="done" />
  <SetupFlow.Step label="Install dependencies" status="active">
    <SetupFlow.Spinner label="npm install…" />
  </SetupFlow.Step>
  <SetupFlow.Step label="Configure project" status="pending" />
</SetupFlow>
// status: 'done'|'active'|'pending'|'error'
```

### `UsageMonitor`

Real-time resource dashboard (CPU, memory, etc.).

```tsx
<UsageMonitor
  title="SYSTEM MONITOR"
  refreshInterval={1000}
  metrics={[
    {
      label: 'CPU',
      value: cpuPct,
      max: 100,
      unit: '%',
      color: '#7C3AED',
      status: cpuPct > 80 ? 'warn' : 'ok',
    },
    { label: 'Memory', value: memUsed, max: memTotal, unit: 'GB', color: '#10B981' },
  ]}
  distribution={{
    label: 'Disk',
    segments: [
      { label: 'Used', value: 60, color: '#7C3AED' },
      { label: 'Free', value: 40 },
    ],
  }}
  predictions={[{ label: 'Est. completion', value: '4m 30s', color: '#10B981' }]}
  statusBar={{ clock: true, session: 'Production', exitHint: 'q: quit' }}
/>
```

### `InfoBox`

Bordered info panel with header and tree rows.

```tsx
<InfoBox>
  <InfoBox.Header icon="◆" label="MyApp" version="1.2.0" />
  <InfoBox.Row label="Author" value="Arindam Majumder" />
  <InfoBox.TreeRow label="Repository" value="github.com/user/myapp" />
</InfoBox>
```

### `BulletList`

Hierarchical bullet list with ●/└/□ prefixes.

```tsx
<BulletList
  items={[
    { text: 'Top level item', bullet: '●' },
    { text: 'Sub item', bullet: '└', indent: 1 },
    { text: 'Checkbox item', bullet: '□', indent: 1 },
  ]}
/>
```

### `HelpScreen`

Full-screen keyboard shortcut reference.

```tsx
<HelpScreen
  title="Help — MyApp"
  sections={[
    { heading: 'Navigation', shortcuts: [{ key: '↑↓', description: 'Move up/down' }] },
    {
      heading: 'Actions',
      shortcuts: [
        { key: 'Enter', description: 'Select' },
        { key: 'q', description: 'Quit' },
      ],
    },
  ]}
  onClose={() => setHelp(false)}
/>
```

---

## AI Components

Install: `npx termui add chat-thread tool-call thinking-block tool-approval token-usage model-selector file-change`

### `ChatThread` + `ChatMessage`

Scrollable chat history. `ChatMessage` handles per-role styling.

```tsx
<ChatThread maxHeight={30} autoScroll>
  <ChatMessage role="user" name="You">
    Explain React hooks
  </ChatMessage>
  <ChatMessage role="assistant" name="Claude" streaming>
    <StreamingText text={response} cursor="▌" />
  </ChatMessage>
  <ChatMessage role="system" collapsed>
    You are a helpful assistant…
  </ChatMessage>
  <ChatMessage role="error">Rate limit exceeded. Retry in 10s.</ChatMessage>
</ChatThread>
// role: 'user'|'assistant'|'system'|'error'
// streaming: shows ●●● typing indicator until false
// collapsed: system messages hidden until Enter/Space
```

### `ToolCall`

Visualize agent tool calls with status, args, and collapsible result.

```tsx
<ToolCall
  name="read_file"
  args={{ path: '/src/index.ts', lines: '1-50' }}
  status="success" // 'pending'|'running'|'success'|'error'
  result={fileContents}
  duration={230}
  collapsible
  defaultCollapsed={false}
/>
// pending  → dim icon + tool name + args summary
// running  → spinner + elapsed ms
// success  → green ✓ + collapsible result
// error    → red ✗ + error message
```

### `ThinkingBlock`

Extended thinking / chain-of-thought display. Collapsible, shows token count.

```tsx
<ThinkingBlock
  content={thinkingTokens}
  streaming
  defaultCollapsed={true}
  label="Reasoning"
  tokenCount={1247}
/>
// Collapsed: ▶ Reasoning (1,247 tokens)
// Keys: Space/Enter toggle
```

### `ToolApproval`

Interactive permission gate for risky AI actions.

```tsx
<ToolApproval
  name="run_command"
  description="Run shell command"
  args={{ command: 'rm -rf node_modules && npm install' }}
  risk="medium" // 'low'|'medium'|'high' — affects border color
  onApprove={() => runCommand()}
  onDeny={() => skipCommand()}
  onAlwaysAllow={() => setAlwaysAllow(true)}
  timeout={30} // auto-deny after N seconds
/>
// Keys: y approve, n deny, a always-allow
```

### `TokenUsage`

Compact inline token + cost display.

```tsx
<TokenUsage prompt={1200} completion={850} model="claude-sonnet-4-6" showCost />
// ⟨ 1.2k in / 850 out · $0.003 ⟩
```

### `ContextMeter`

Progress bar for context window usage with semantic color thresholds.

```tsx
<ContextMeter
  used={45000}
  limit={200000}
  label="Context"
  showPercent
  warnAt={80} // yellow at 80%
  criticalAt={95} // red at 95%
/>
// Context ████████░░░░░░░ 22% (45k / 200k)
```

### `ModelSelector`

Provider-grouped model picker built on `<Select>`.

```tsx
<ModelSelector
  models={[
    { id: 'claude-sonnet-4-6', name: 'Claude Sonnet', provider: 'anthropic', context: 200000 },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', context: 128000 },
    { id: 'llama3:70b', name: 'Llama 3 70B', provider: 'ollama', context: 8192 },
  ]}
  selected={currentModel}
  onSelect={setModel}
  showContext
  showProvider
  groupByProvider
/>
```

### `FileChange`

AI-proposed file edits — tree view with per-file diff expansion and accept/reject.

```tsx
<FileChange
  changes={[
    { path: 'src/index.ts', type: 'modify', diff: unifiedDiff },
    { path: 'src/utils.ts', type: 'create', content: newContent },
    { path: 'old.ts', type: 'delete' },
  ]}
  onAccept={(path) => applyChange(path)}
  onReject={(path) => rejectChange(path)}
  onAcceptAll={() => applyAll()}
/>
// type icons: M modified (yellow), A added (green), D deleted (red)
// Keys: ↑↓ navigate, Enter expand inline DiffView, y accept, n reject
```
