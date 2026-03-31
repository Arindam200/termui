/**
 * TermUI Full Component Demo
 * All 13 categories — every component in the library
 * Press [ ] to switch tabs · Esc to quit
 */
import React, { useState } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import {
  ThemeProvider,
  useTheme,
  useThemeUpdater,
  useInterval,
  defaultTheme,
  draculaTheme,
  nordTheme,
  catppuccinTheme,
  monokaiTheme,
  solarizedTheme,
  tokyoNightTheme,
  oneDarkTheme,
} from 'termui';

import {
  // Layout
  Stack,
  Divider,
  Grid,
  Columns,
  Center,
  ScrollView,
  // Typography
  Heading,
  BigText,
  Digits,
  Code,
  Gradient,
  Badge,
  Tag,
  Link,
  Markdown,
  StreamingText,
  // Input
  TextInput,
  PasswordInput,
  NumberInput,
  SearchInput,
  TextArea,
  EmailInput,
  MaskedInput,
  // Selection
  Select,
  MultiSelect,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  TagInput,
  ColorPicker,
  TreeSelect,
  // Data
  Table,
  DataGrid,
  List,
  Card,
  KeyValue,
  Definition,
  JSONView,
  DiffView,
  Tree,
  DirectoryTree,
  GitStatus,
  // Feedback
  Spinner,
  ProgressBar,
  ProgressCircle,
  Alert,
  Banner,
  StatusMessage,
  Toast,
  Skeleton,
  MultiProgress,
  // Navigation
  Breadcrumb,
  Pagination,
  Menu,
  Sidebar,
  CommandPalette,
  // Overlays
  Modal,
  Dialog,
  Drawer,
  Tooltip,
  NotificationBadge,
  // Forms
  Wizard,
  Confirm,
  DatePicker,
  TimePicker,
  FilePicker,
  Form,
  FormField,
  // Utility
  Panel,
  Toggle,
  Clock,
  Timer,
  Stopwatch,
  Clipboard,
  KeyboardShortcuts,
  Help,
  Log,
  QRCode,
  // Charts
  BarChart,
  LineChart,
  PieChart,
  Sparkline,
  Gauge,
  HeatMap,
  // Templates
  InfoBox,
  BulletList,
  HelpScreen,
  // AI
  ChatMessage,
  ChatThread,
  ToolCall,
  ThinkingBlock,
  ToolApproval,
  TokenUsage,
  ContextMeter,
  ModelSelector,
  FileChange,
} from 'termui/components';

// ─── Themes ──────────────────────────────────────────────────────────────────

const THEMES = [
  { value: 'default', label: 'Default', theme: defaultTheme },
  { value: 'dracula', label: 'Dracula', theme: draculaTheme },
  { value: 'nord', label: 'Nord', theme: nordTheme },
  { value: 'catppuccin', label: 'Catppuccin', theme: catppuccinTheme },
  { value: 'monokai', label: 'Monokai', theme: monokaiTheme },
  { value: 'solarized', label: 'Solarized', theme: solarizedTheme },
  { value: 'tokyonight', label: 'Tokyo Night', theme: tokyoNightTheme },
  { value: 'onedark', label: 'One Dark', theme: oneDarkTheme },
];

// ─── Tab 1: Feedback ─────────────────────────────────────────────────────────

function FeedbackTab({ progress }: { progress: number }) {
  const theme = useTheme();
  const multiItems = [
    {
      id: '1',
      label: 'Compile TypeScript',
      value: 100,
      total: 100,
      status: 'done' as const,
      statusText: '2.1s',
    },
    { id: '2', label: 'Bundle assets', value: progress, total: 100, status: 'running' as const },
    { id: '3', label: 'Run tests', value: 0, total: 100, status: 'pending' as const },
    { id: '4', label: 'Deploy', value: 0, total: 100, status: 'pending' as const },
  ];

  return (
    <ScrollView height={22}>
      <Stack direction="vertical" gap={1}>
        <Panel title="Spinners">
          <Box gap={3}>
            <Spinner style="dots" label="dots" />
            <Spinner style="arc" label="arc" />
            <Spinner style="star" label="star" />
            <Spinner style="bounce" label="bounce" />
            <Spinner style="earth" label="earth" fps={3} />
          </Box>
        </Panel>

        <Panel title="Progress Bar">
          <ProgressBar
            value={progress}
            total={100}
            label={`Building… ${progress}%`}
            color={theme.colors.primary}
          />
        </Panel>

        <Panel title="Multi Progress">
          <MultiProgress items={multiItems} barWidth={18} compact />
        </Panel>

        <Panel title="Progress Circles">
          <Box gap={4}>
            <ProgressCircle value={25} showPercent />
            <ProgressCircle value={progress} showPercent />
            <ProgressCircle value={100} showPercent />
          </Box>
        </Panel>

        <Panel title="Status Messages">
          <Stack direction="vertical" gap={0}>
            <StatusMessage variant="success">Deployed to production</StatusMessage>
            <StatusMessage variant="error">Connection refused on port 3000</StatusMessage>
            <StatusMessage variant="warning">Node.js 16 reaches EOL soon</StatusMessage>
            <StatusMessage variant="loading">Fetching dependencies…</StatusMessage>
            <StatusMessage variant="pending">Awaiting approval</StatusMessage>
          </Stack>
        </Panel>

        <Panel title="Alerts">
          <Stack direction="vertical" gap={1}>
            <Alert variant="success" title="Deploy succeeded">
              All health checks passed.
            </Alert>
            <Alert variant="warning" title="Rate limit approaching">
              90% of API quota used.
            </Alert>
            <Alert variant="error" title="Build failed">
              TypeScript errors in 3 files.
            </Alert>
            <Alert variant="info" title="Update available">
              TermUI v0.3.0 is out.
            </Alert>
          </Stack>
        </Panel>

        <Panel title="Banners">
          <Stack direction="vertical" gap={1}>
            <Banner variant="info" title="Info">
              This is an informational banner.
            </Banner>
            <Banner variant="warning" dismissible>
              This is a dismissible warning banner.
            </Banner>
            <Banner variant="success">Operation completed successfully.</Banner>
          </Stack>
        </Panel>

        <Panel title="Toast">
          <Toast message="Package installed successfully!" variant="success" duration={99999} />
        </Panel>

        <Panel title="Skeleton Loader">
          <Stack direction="vertical" gap={0}>
            <Skeleton width={36} />
            <Skeleton width={28} />
            <Skeleton width={32} />
          </Stack>
        </Panel>

        <Panel title="Badges">
          <Box gap={2}>
            <Badge variant="success">stable</Badge>
            <Badge variant="warning">beta</Badge>
            <Badge variant="error">deprecated</Badge>
            <Badge variant="info">new</Badge>
            <Badge variant="default">v1.0.0</Badge>
          </Box>
        </Panel>
      </Stack>
    </ScrollView>
  );
}

// ─── Tab 2: Typography ───────────────────────────────────────────────────────

const CODE_SAMPLE = `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}`;

const MD_SAMPLE = `## Features
- **Bold text** and *italic text*
- Inline \`code\` blocks
- [Links](https://termui.dev) with URLs`;

function TypographyTab() {
  const theme = useTheme();
  return (
    <ScrollView height={22}>
      <Stack direction="vertical" gap={1}>
        <Panel title="BigText">
          <BigText color={theme.colors.primary}>TermUI</BigText>
        </Panel>

        <Panel title="Digits (7-segment)">
          <Digits value="12:34:56" size="md" color={theme.colors.accent} />
        </Panel>

        <Panel title="Headings">
          <Stack direction="vertical" gap={0}>
            <Heading level={1}>Level 1 — Page Title</Heading>
            <Heading level={2}>Level 2 — Section</Heading>
            <Heading level={3}>Level 3 — Subsection</Heading>
            <Heading level={4}>Level 4 — Detail</Heading>
          </Stack>
        </Panel>

        <Panel title="Gradient Text">
          <Stack direction="vertical" gap={0}>
            <Gradient colors={['#FF6B6B', '#FFE66D', '#6BCB77']}>
              The quick brown fox jumps over the lazy dog
            </Gradient>
            <Gradient colors={['#4ECDC4', '#556270']} bold>
              TermUI — Beautiful terminal interfaces
            </Gradient>
            <Gradient colors={['#a18cd1', '#fbc2eb']}>Built with React + Ink</Gradient>
          </Stack>
        </Panel>

        <Panel title="Code Block (TSX)">
          <Code language="tsx">{CODE_SAMPLE}</Code>
        </Panel>

        <Panel title="Markdown">
          <Markdown>{MD_SAMPLE}</Markdown>
        </Panel>

        <Panel title="Streaming Text (animated)">
          <StreamingText
            text="This text streams in character by character like an AI response..."
            animate
            speed={25}
            cursor
          />
        </Panel>

        <Panel title="Tags">
          <Box gap={2} flexWrap="wrap">
            <Tag variant="default">typescript</Tag>
            <Tag variant="default">react</Tag>
            <Tag variant="outline">terminal</Tag>
            <Tag variant="outline">open-source</Tag>
            <Tag onRemove={() => {}}>removable ×</Tag>
          </Box>
        </Panel>

        <Panel title="Link">
          <Stack direction="vertical" gap={0}>
            <Link href="https://termui.dev">TermUI Documentation</Link>
            <Link href="https://github.com/termui" showHref>
              GitHub Repository
            </Link>
          </Stack>
        </Panel>
      </Stack>
    </ScrollView>
  );
}

// ─── Tab 3: Inputs ───────────────────────────────────────────────────────────

function InputsTab() {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [count, setCount] = useState(8);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('');
  const [masked, setMasked] = useState('');

  const SEARCH_OPTIONS = [
    'react',
    'react-dom',
    '@types/react',
    'react-query',
    'react-hook-form',
    'react-router',
  ];

  return (
    <ScrollView height={22}>
      <Stack direction="vertical" gap={1}>
        <Text color={theme.colors.mutedForeground} dimColor>
          Tab to move between inputs · ↑↓ for number · Esc quits
        </Text>

        <Panel title="Text Input">
          <TextInput
            value={text}
            onChange={setText}
            placeholder="Type something…"
            label="Name"
            autoFocus
            width={36}
          />
        </Panel>

        <Panel title="Email Input">
          <EmailInput
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            label="Email"
            width={36}
          />
        </Panel>

        <Panel title="Password Input (Ctrl+H to reveal)">
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Enter password…"
            label="Password"
            showToggle
          />
        </Panel>

        <Panel title="Number Input (↑↓ to step)">
          <NumberInput
            value={count}
            onChange={setCount}
            min={1}
            max={32}
            step={1}
            label="Workers"
          />
        </Panel>

        <Panel title="Masked Input (phone)">
          <MaskedInput
            value={masked}
            onChange={setMasked}
            mask="(999) 999-9999"
            placeholder="(555) 000-0000"
            label="Phone"
          />
        </Panel>

        <Panel title="Search Input (type to filter)">
          <SearchInput
            value={search}
            onChange={setSearch}
            options={SEARCH_OPTIONS}
            placeholder="Search packages…"
            maxResults={4}
          />
        </Panel>

        <Panel title="Text Area (multiline)">
          <TextArea
            value={area}
            onChange={setArea}
            placeholder="Enter description…"
            label="Notes"
            rows={4}
          />
        </Panel>
      </Stack>
    </ScrollView>
  );
}

// ─── Tab 4: Selection ────────────────────────────────────────────────────────

function SelectionTab() {
  const theme = useTheme();
  const [framework, setFramework] = useState('react');
  const [features, setFeatures] = useState<string[]>(['ts', 'fmt']);
  const [checked, setChecked] = useState(false);
  const [checkedGroup, setCheckedGroup] = useState<string[]>(['eslint']);
  const [tags, setTags] = useState<string[]>(['termui', 'react']);
  const [color, setColor] = useState('#7c3aed');
  const [treeVal, setTreeVal] = useState('components');

  const FRAMEWORKS = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' },
    { value: 'solid', label: 'SolidJS' },
  ];

  const FEATURES = [
    { value: 'ts', label: 'TypeScript' },
    { value: 'eslint', label: 'ESLint' },
    { value: 'fmt', label: 'Prettier' },
    { value: 'test', label: 'Vitest' },
    { value: 'ci', label: 'GitHub Actions' },
  ];

  const TREE_NODES = [
    {
      value: 'packages',
      label: 'packages/',
      children: [
        { value: 'components', label: 'components/' },
        { value: 'core', label: 'core/' },
        { value: 'cli', label: 'cli/' },
      ],
    },
    {
      value: 'examples',
      label: 'examples/',
      children: [
        { value: 'demo', label: 'demo/' },
        { value: 'ai-demo', label: 'ai-demo/' },
      ],
    },
  ];

  return (
    <ScrollView height={22}>
      <Stack direction="vertical" gap={1}>
        <Text color={theme.colors.mutedForeground} dimColor>
          Space/Enter to select · ↑↓ navigate
        </Text>

        <Box gap={2}>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Select (↑↓ + Enter)">
              <Select options={FRAMEWORKS} value={framework} onChange={setFramework} cursor="›" />
            </Panel>
          </Box>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Radio Group">
              <RadioGroup options={FRAMEWORKS} value={framework} onChange={setFramework} />
            </Panel>
          </Box>
        </Box>

        <Panel title="Multi-Select (Space to toggle)">
          <MultiSelect options={FEATURES} value={features} onChange={setFeatures} height={5} />
        </Panel>

        <Box gap={2}>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Checkbox Group">
              <CheckboxGroup
                label="Dev tools"
                options={FEATURES}
                value={checkedGroup}
                onChange={setCheckedGroup}
              />
            </Panel>
          </Box>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Single Checkbox">
              <Checkbox label="Enable telemetry" checked={checked} onChange={setChecked} />
            </Panel>

            <Panel title="Tag Input (Enter to add)">
              <TagInput value={tags} onChange={setTags} placeholder="Add tag…" maxTags={6} />
            </Panel>
          </Box>
        </Box>

        <Box gap={2}>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Tree Select">
              <TreeSelect
                nodes={TREE_NODES}
                value={treeVal}
                onChange={setTreeVal}
                expandedByDefault
              />
            </Panel>
          </Box>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Color Picker (↑↓←→ + Enter)">
              <ColorPicker value={color} onChange={setColor} autoFocus={false} />
              <Text color={theme.colors.mutedForeground}>
                Selected:{' '}
                <Text color={color} bold>
                  {color}
                </Text>
              </Text>
            </Panel>
          </Box>
        </Box>
      </Stack>
    </ScrollView>
  );
}

// ─── Tab 5: Data ─────────────────────────────────────────────────────────────

type PkgRow = { name: string; version: string; license: string; size: string };

const TABLE_DATA: PkgRow[] = [
  { name: 'react', version: '18.3.1', license: 'MIT', size: '6.9 kB' },
  { name: 'ink', version: '5.0.1', license: 'MIT', size: '89 kB' },
  { name: 'typescript', version: '5.4.5', license: 'Apache', size: '2.1 MB' },
  { name: 'vitest', version: '1.6.0', license: 'MIT', size: '340 kB' },
  { name: 'tsup', version: '8.1.0', license: 'MIT', size: '1.2 MB' },
];

const TABLE_COLS = [
  { key: 'name' as const, header: 'Package', width: 14 },
  { key: 'version' as const, header: 'Version', width: 10 },
  { key: 'license' as const, header: 'License', width: 10 },
  { key: 'size' as const, header: 'Size', width: 8, align: 'right' as const },
];

const JSON_DATA = {
  name: 'termui',
  version: '0.2.0',
  scripts: { build: 'tsup', test: 'vitest', dev: 'tsx watch' },
  dependencies: { ink: '^5.0.0', react: '^18.0.0' },
};

const DIFF_OLD = `import React from 'react';

function Hello({ name }) {
  return <div>Hello, {name}!</div>;
}`;

const DIFF_NEW = `import React from 'react';
import { Text } from 'ink';

function Hello({ name }: { name: string }) {
  return <Text>Hello, {name}!</Text>;
}`;

function DataTab() {
  const theme = useTheme();

  const LIST_ITEMS = [
    {
      key: '1',
      label: 'components/',
      description: '101 UI components',
      color: theme.colors.primary,
    },
    { key: '2', label: 'core/', description: 'hooks, themes, utilities' },
    { key: '3', label: 'cli/', description: 'add, create, preview commands' },
    { key: '4', label: 'adapters/', description: '27 integrations' },
    { key: '5', label: 'testing/', description: 'test utilities for Ink' },
  ];

  const TREE_NODES = [
    {
      key: 'packages',
      label: 'packages',
      icon: '📦',
      children: [
        { key: 'components', label: 'components', icon: '🧩' },
        { key: 'core', label: 'core', icon: '⚙️' },
        { key: 'cli', label: 'cli', icon: '🖥️' },
      ],
    },
    {
      key: 'examples',
      label: 'examples',
      icon: '📚',
      children: [{ key: 'demo', label: 'demo', icon: '🎯' }],
    },
  ];

  return (
    <ScrollView height={22}>
      <Stack direction="vertical" gap={1}>
        <Panel title="Table (↑↓ navigate · S sort)">
          <Table data={TABLE_DATA} columns={TABLE_COLS} sortable selectable maxRows={5} />
        </Panel>

        <Panel title="DataGrid (filterable + sortable)">
          <DataGrid
            data={TABLE_DATA}
            columns={TABLE_COLS}
            pageSize={4}
            showRowNumbers
            borderStyle="single"
          />
        </Panel>

        <Box gap={2}>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="List (↑↓ navigate)">
              <List items={LIST_ITEMS} height={5} />
            </Panel>
          </Box>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Tree (↑↓ + Space)">
              <Tree nodes={TREE_NODES} defaultExpanded={['packages']} />
            </Panel>
          </Box>
        </Box>

        <Box gap={2}>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Card">
              <Card title="Project Stats" subtitle="TermUI monorepo">
                <KeyValue
                  items={[
                    { key: 'Components', value: '101' },
                    { key: 'Themes', value: '8' },
                    { key: 'Hooks', value: '16' },
                    { key: 'Adapters', value: '27' },
                  ]}
                />
              </Card>
            </Panel>
          </Box>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Definition List">
              <Definition
                items={[
                  {
                    term: 'TermUI',
                    description: 'A terminal UI component library built on React + Ink.',
                  },
                  { term: 'Ink', description: 'React renderer for the terminal environment.' },
                ]}
              />
            </Panel>
          </Box>
        </Box>

        <Panel title="JSON View (Space/Enter to collapse)">
          <JSONView data={JSON_DATA} collapsed={false} />
        </Panel>

        <Panel title="Diff View">
          <DiffView
            oldText={DIFF_OLD}
            newText={DIFF_NEW}
            filename="Hello.tsx"
            mode="unified"
            showLineNumbers
          />
        </Panel>

        <Panel title="Git Status">
          <GitStatus branch="feature/full-demo" staged={3} modified={5} ahead={2} behind={0} />
        </Panel>

        <Panel title="Directory Tree (termui root)">
          <DirectoryTree
            rootPath="/Users/arindammajumder/Developer/JavaScript/termi"
            maxDepth={2}
          />
        </Panel>
      </Stack>
    </ScrollView>
  );
}

// ─── Tab 6: Charts ───────────────────────────────────────────────────────────

function ChartsTab({ progress }: { progress: number }) {
  const theme = useTheme();

  const BAR_DATA = [
    { label: 'Mon', value: 42, color: theme.colors.primary },
    { label: 'Tue', value: 67, color: theme.colors.accent },
    { label: 'Wed', value: 53, color: theme.colors.success },
    { label: 'Thu', value: 89, color: theme.colors.warning },
    { label: 'Fri', value: 75, color: theme.colors.info },
    { label: 'Sat', value: 31 },
    { label: 'Sun', value: 20 },
  ];

  const LINE_DATA = [12, 28, 22, 45, 38, 67, 54, 73, 61, 82, 75, 90, 88, progress];

  const PIE_DATA = [
    { label: 'Layout', value: 9 },
    { label: 'Typography', value: 13 },
    { label: 'Input', value: 8 },
    { label: 'Selection', value: 8 },
    { label: 'Data', value: 11 },
    { label: 'Feedback', value: 9 },
    { label: 'Other', value: 43 },
  ];

  const SPARKLINE_DATA = [5, 10, 5, 22, 35, 18, 42, 55, 48, 73, 65, 88, progress];

  const HEATMAP = Array.from({ length: 4 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => Math.round(Math.random() * 100 + (r + c) * 5))
  );

  return (
    <ScrollView height={22}>
      <Stack direction="vertical" gap={1}>
        <Panel title="Bar Chart — horizontal (daily commits)">
          <BarChart data={BAR_DATA} direction="horizontal" width={36} showValues />
        </Panel>

        <Panel title="Bar Chart — vertical">
          <BarChart data={BAR_DATA.slice(0, 5)} direction="vertical" height={8} showValues />
        </Panel>

        <Panel title="Line Chart — request latency (ms)">
          <LineChart
            data={LINE_DATA}
            width={48}
            height={8}
            title="p95 latency"
            showAxes
            color={theme.colors.primary}
          />
        </Panel>

        <Panel title="Pie Chart — components by category">
          <PieChart data={PIE_DATA} radius={5} showLegend showPercentages />
        </Panel>

        <Panel title="Sparkline — CPU over time">
          <Box gap={2} alignItems="center">
            <Sparkline data={SPARKLINE_DATA} width={32} color={theme.colors.accent} label="CPU %" />
            <Sparkline
              data={SPARKLINE_DATA.map((v) => 100 - v)}
              width={32}
              color={theme.colors.warning}
              label="Idle %"
            />
          </Box>
        </Panel>

        <Panel title="Gauge">
          <Box gap={4}>
            <Box flexDirection="column" gap={0}>
              <Text color={theme.colors.mutedForeground}>CPU</Text>
              <Gauge value={65} label="CPU" size="md" color={theme.colors.primary} />
            </Box>
            <Box flexDirection="column" gap={0}>
              <Text color={theme.colors.mutedForeground}>Memory</Text>
              <Gauge value={progress} label="RAM" size="md" color={theme.colors.warning} />
            </Box>
            <Box flexDirection="column" gap={0}>
              <Text color={theme.colors.mutedForeground}>Disk</Text>
              <Gauge value={42} label="Disk" size="sm" />
            </Box>
          </Box>
        </Panel>

        <Panel title="Heat Map — activity grid">
          <HeatMap
            data={HEATMAP}
            rowLabels={['Mon', 'Tue', 'Wed', 'Thu']}
            colLabels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7']}
            showValues={false}
          />
        </Panel>
      </Stack>
    </ScrollView>
  );
}

// ─── Tab 7: Navigation ───────────────────────────────────────────────────────

function NavigationTab() {
  const theme = useTheme();
  const [page, setPage] = useState(3);
  const [sidebarKey, setSidebarKey] = useState('components');
  const [cmdOpen, setCmdOpen] = useState(false);

  const MENU_ITEMS = [
    {
      key: 'file',
      label: 'File',
      icon: '📁',
      children: [
        { key: 'new', label: 'New Project', shortcut: 'Ctrl+N' },
        { key: 'open', label: 'Open…', shortcut: 'Ctrl+O' },
        { key: 'sep1', label: '', separator: true },
        { key: 'quit', label: 'Quit', shortcut: 'Ctrl+Q' },
      ],
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: '✏️',
      children: [
        { key: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
        { key: 'paste', label: 'Paste', shortcut: 'Ctrl+V' },
      ],
    },
    { key: 'help', label: 'Help', icon: '❓' },
  ];

  const SIDEBAR_ITEMS = [
    { key: 'components', label: 'Components', icon: '🧩', badge: '101' },
    { key: 'hooks', label: 'Hooks', icon: '🎣', badge: '16' },
    { key: 'themes', label: 'Themes', icon: '🎨', badge: '8' },
    {
      key: 'adapters',
      label: 'Adapters',
      icon: '🔌',
      badge: '27',
      children: [
        { key: 'git', label: 'git adapter' },
        { key: 'github', label: 'github adapter' },
      ],
    },
  ];

  const COMMANDS = [
    {
      id: 'add',
      label: 'Add component',
      description: 'Install from registry',
      shortcut: 'Ctrl+A',
      group: 'Registry',
      onSelect: () => {},
    },
    {
      id: 'theme',
      label: 'Switch theme',
      description: 'Change color theme',
      group: 'Appearance',
      onSelect: () => setCmdOpen(false),
    },
    {
      id: 'preview',
      label: 'Preview component',
      description: 'Open component gallery',
      group: 'Dev',
      onSelect: () => {},
    },
    {
      id: 'docs',
      label: 'View docs',
      description: 'Open inline documentation',
      group: 'Dev',
      onSelect: () => {},
    },
    {
      id: 'quit',
      label: 'Quit demo',
      description: 'Exit this demo',
      shortcut: 'Esc',
      group: 'App',
      onSelect: () => {},
    },
  ];

  return (
    <ScrollView height={22}>
      <Stack direction="vertical" gap={1}>
        <Text color={theme.colors.mutedForeground} dimColor>
          Navigation components · Press P to open/close command palette
        </Text>

        <Panel title="Breadcrumb">
          <Breadcrumb
            items={[
              { key: 'home', label: 'Home' },
              { key: 'packages', label: 'packages' },
              { key: 'components', label: 'components' },
              { key: 'feedback', label: 'feedback' },
            ]}
            activeKey="feedback"
          />
        </Panel>

        <Panel title="Pagination (←→ to navigate)">
          <Pagination total={12} current={page} onChange={setPage} showEdges siblings={1} />
          <Text color={theme.colors.mutedForeground}>Page {page} of 12</Text>
        </Panel>

        <Box gap={2}>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Menu (↑↓ Enter ← to back)">
              <Menu items={MENU_ITEMS} title="App Menu" onSelect={() => {}} />
            </Panel>
          </Box>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Sidebar (↑↓ Enter Space)">
              <Sidebar
                items={SIDEBAR_ITEMS}
                activeKey={sidebarKey}
                onSelect={setSidebarKey}
                width={22}
                title="Explorer"
              />
            </Panel>
          </Box>
        </Box>

        <Panel title="Command Palette (press P to open)">
          <CommandPalette
            commands={COMMANDS}
            isOpen={cmdOpen}
            onClose={() => setCmdOpen(false)}
            placeholder="Search commands…"
            maxItems={5}
          />
          {!cmdOpen && (
            <Text color={theme.colors.mutedForeground}>
              Press{' '}
              <Text bold color={theme.colors.primary}>
                P
              </Text>{' '}
              to open the command palette
            </Text>
          )}
        </Panel>
      </Stack>
    </ScrollView>
  );
}

// ─── Tab 8: Overlays ─────────────────────────────────────────────────────────

function OverlaysTab() {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(true);

  useInput((input) => {
    if (input === 'm') setModalOpen((v) => !v);
    if (input === 'd') setDialogOpen((v) => !v);
    if (input === 'r') setDrawerOpen((v) => !v);
    if (input === 't') setTooltipVisible((v) => !v);
  });

  return (
    <ScrollView height={22}>
      <Stack direction="vertical" gap={1}>
        <Panel title="Keyboard controls for this tab">
          <Box gap={3}>
            <Text>
              <Text bold color={theme.colors.primary}>
                M
              </Text>{' '}
              — Modal
            </Text>
            <Text>
              <Text bold color={theme.colors.primary}>
                D
              </Text>{' '}
              — Dialog
            </Text>
            <Text>
              <Text bold color={theme.colors.primary}>
                R
              </Text>{' '}
              — Drawer
            </Text>
            <Text>
              <Text bold color={theme.colors.primary}>
                T
              </Text>{' '}
              — Toggle Tooltip
            </Text>
          </Box>
        </Panel>

        <Panel title={`Modal (M to ${modalOpen ? 'close' : 'open'})`}>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Confirm Action"
            width={44}
          >
            <Text>Are you sure you want to deploy to production?</Text>
            <Text color={theme.colors.mutedForeground}>This will affect all users.</Text>
          </Modal>
          {!modalOpen && (
            <Text color={theme.colors.mutedForeground}>Modal is closed. Press M to open.</Text>
          )}
        </Panel>

        <Panel title={`Dialog (D to ${dialogOpen ? 'close' : 'open'})`}>
          <Dialog
            title="Delete project?"
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={() => setDialogOpen(false)}
            onCancel={() => setDialogOpen(false)}
            variant="danger"
            isOpen={dialogOpen}
          >
            <Text>This will permanently delete the project and all its data.</Text>
          </Dialog>
          {!dialogOpen && (
            <Text color={theme.colors.mutedForeground}>Dialog is closed. Press D to open.</Text>
          )}
        </Panel>

        <Panel title={`Drawer (R to ${drawerOpen ? 'close' : 'open'})`}>
          <Drawer
            isOpen={drawerOpen}
            edge="right"
            title="Settings"
            onClose={() => setDrawerOpen(false)}
            width={30}
          >
            <Stack direction="vertical" gap={1}>
              <Text bold>Preferences</Text>
              <Text color={theme.colors.mutedForeground}>Theme: Dracula</Text>
              <Text color={theme.colors.mutedForeground}>Font size: 14px</Text>
            </Stack>
          </Drawer>
          {!drawerOpen && (
            <Text color={theme.colors.mutedForeground}>Drawer is closed. Press R to open.</Text>
          )}
        </Panel>

        <Panel title="Tooltip (T to toggle)">
          <Tooltip
            content="Opens a new project workspace"
            position="top"
            isVisible={tooltipVisible}
          >
            <Text bold color={theme.colors.primary}>
              [ New Project ]
            </Text>
          </Tooltip>
        </Panel>

        <Panel title="Notification Badge">
          <Box gap={3} alignItems="center">
            <Box gap={1}>
              <Text>Inbox</Text>
              <NotificationBadge count={5} />
            </Box>
            <Box gap={1}>
              <Text>Alerts</Text>
              <NotificationBadge count={12} color={theme.colors.warning} />
            </Box>
            <Box gap={1}>
              <Text>Updates</Text>
              <NotificationBadge count={0} />
              <Text color={theme.colors.mutedForeground}>(hidden when 0)</Text>
            </Box>
          </Box>
        </Panel>
      </Stack>
    </ScrollView>
  );
}

// ─── Tab 9: Forms ────────────────────────────────────────────────────────────

function FormsTab() {
  const theme = useTheme();
  const [wizardDone, setWizardDone] = useState(false);
  const [confirmAnswer, setConfirmAnswer] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState({ hours: 9, minutes: 30 });
  const [selectedFile, setSelectedFile] = useState<string>('');

  const WIZARD_STEPS = [
    {
      key: 'project',
      title: 'Step 1: Project Name',
      content: (
        <Stack direction="vertical" gap={0}>
          <Text>Enter your project configuration.</Text>
          <Text color={theme.colors.mutedForeground}>Press → or Tab to advance</Text>
        </Stack>
      ),
    },
    {
      key: 'framework',
      title: 'Step 2: Choose Framework',
      content: (
        <Stack direction="vertical" gap={0}>
          <Text>Select a frontend framework.</Text>
          <Text color={theme.colors.mutedForeground}>React, Vue, Svelte, etc.</Text>
        </Stack>
      ),
    },
    {
      key: 'deploy',
      title: 'Step 3: Deploy Target',
      content: (
        <Stack direction="vertical" gap={0}>
          <Text>Where should we deploy?</Text>
          <Text color={theme.colors.mutedForeground}>Vercel, Netlify, or custom.</Text>
        </Stack>
      ),
    },
  ];

  if (wizardDone) {
    return (
      <Box paddingY={1}>
        <Alert variant="success" title="Wizard complete!">
          All steps completed successfully.
        </Alert>
      </Box>
    );
  }

  return (
    <ScrollView height={22}>
      <Stack direction="vertical" gap={1}>
        <Text color={theme.colors.mutedForeground} dimColor>
          Forms & pickers · ↑↓←→ navigate · Enter confirm
        </Text>

        <Panel title="Wizard (→/Tab to advance, ←/Shift+Tab to go back)">
          <Wizard steps={WIZARD_STEPS} showProgress onComplete={() => setWizardDone(true)} />
        </Panel>

        <Panel title="Confirm Dialog (←→ + Enter, or Y/N)">
          <Confirm
            message="Deploy to production?"
            confirmLabel="Yes, deploy"
            cancelLabel="Cancel"
            variant="danger"
            onConfirm={() => setConfirmAnswer('Confirmed ✓')}
            onCancel={() => setConfirmAnswer('Cancelled')}
          />
          {confirmAnswer && <Text color={theme.colors.success}>{confirmAnswer}</Text>}
        </Panel>

        <Box gap={2}>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Date Picker (↑↓←→)">
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                label="Release date"
                autoFocus={false}
              />
            </Panel>
          </Box>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Time Picker (↑↓ + Tab)">
              <TimePicker
                value={selectedTime}
                onChange={setSelectedTime}
                label="Release time"
                format={24}
                autoFocus={false}
              />
            </Panel>
          </Box>
        </Box>

        <Panel title="File Picker (↑↓ navigate, Enter select)">
          <FilePicker
            value={selectedFile}
            onChange={setSelectedFile}
            label="Config file"
            startDir="/Users/arindammajumder/Developer/JavaScript/termi"
            extensions={['.ts', '.tsx', '.json']}
            autoFocus={false}
            maxVisible={5}
          />
          {selectedFile && (
            <Text color={theme.colors.mutedForeground}>Selected: {selectedFile}</Text>
          )}
        </Panel>

        <Panel title="Form (Ctrl+S to submit)">
          <Form
            onSubmit={(v) => console.log('Form submitted', v)}
            initialValues={{ name: '', email: '' }}
          >
            <Stack direction="vertical" gap={1}>
              <FormField label="Full Name" required hint="As it appears on your ID">
                <Text color={theme.colors.mutedForeground}>(TextInput would go here)</Text>
              </FormField>
              <FormField label="Email" required error={undefined}>
                <Text color={theme.colors.mutedForeground}>(EmailInput would go here)</Text>
              </FormField>
            </Stack>
          </Form>
        </Panel>
      </Stack>
    </ScrollView>
  );
}

// ─── Tab 10: Utility ─────────────────────────────────────────────────────────

const LOG_ENTRIES = [
  { level: 'info' as const, message: 'Server started on port 3000', timestamp: new Date() },
  { level: 'debug' as const, message: 'Loaded 47 routes', timestamp: new Date() },
  { level: 'info' as const, message: 'Connected to database', timestamp: new Date() },
  { level: 'warn' as const, message: 'Memory usage above 80%', timestamp: new Date() },
  { level: 'error' as const, message: 'Failed to reach cache server', timestamp: new Date() },
  { level: 'info' as const, message: 'Health check passed', timestamp: new Date() },
  { level: 'debug' as const, message: 'Cache miss for key user:42', timestamp: new Date() },
  { level: 'info' as const, message: 'Request GET /api/v1/users 200 12ms', timestamp: new Date() },
];

function UtilityTab() {
  const theme = useTheme();
  const [toggleA, setToggleA] = useState(true);
  const [toggleB, setToggleB] = useState(false);

  const SHORTCUTS = [
    { key: '[ ]', description: 'Switch tabs', category: 'Navigation' },
    { key: 'Esc', description: 'Quit demo', category: 'Navigation' },
    { key: 'Space', description: 'Toggle timer/stopwatch', category: 'Utility' },
    { key: 'R', description: 'Reset timer/stopwatch', category: 'Utility' },
    { key: 'L', description: 'Lap (stopwatch)', category: 'Utility' },
  ];

  return (
    <ScrollView height={22}>
      <Stack direction="vertical" gap={1}>
        <Box gap={2}>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Clock (live)">
              <Clock format="24h" showSeconds showDate size="sm" />
            </Panel>
          </Box>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Clock (large)">
              <Clock format="12h" showSeconds size="lg" />
            </Panel>
          </Box>
        </Box>

        <Box gap={2}>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Timer (Space start/stop · R reset)">
              <Timer duration={60} label="Countdown" format="ms" color={theme.colors.primary} />
            </Panel>
          </Box>
          <Box flexDirection="column" flexGrow={1}>
            <Panel title="Stopwatch (Space · L lap · R reset)">
              <Stopwatch showLaps color={theme.colors.accent} />
            </Panel>
          </Box>
        </Box>

        <Panel title="Toggles">
          <Stack direction="vertical" gap={0}>
            <Toggle checked={toggleA} onChange={setToggleA} label="Dark mode" />
            <Toggle checked={toggleB} onChange={setToggleB} label="Notifications" />
          </Stack>
        </Panel>

        <Panel title="QR Code">
          <Box gap={4}>
            <Box flexDirection="column" alignItems="center" gap={0}>
              <QRCode value="https://termui.dev" size="sm" label="termui.dev" />
            </Box>
            <Box flexDirection="column" alignItems="center" gap={0}>
              <QRCode value="https://github.com/termui/termui" size="sm" label="GitHub" />
            </Box>
          </Box>
        </Panel>

        <Panel title="Clipboard (press C to copy)">
          <Clipboard value="npx termui add spinner progress-bar" label="Install command" />
        </Panel>

        <Panel title="Log Viewer (↑↓ scroll)">
          <Log entries={LOG_ENTRIES} height={6} showTimestamp follow />
        </Panel>

        <Panel title="Keyboard Shortcuts">
          <KeyboardShortcuts shortcuts={SHORTCUTS} columns={2} title="Demo Controls" />
        </Panel>

        <Panel title="Help (compact keymap)">
          <Help
            keymap={{ '[/]': 'switch tabs', Esc: 'quit', Space: 'toggle', R: 'reset' }}
            compact
            title="Controls"
          />
        </Panel>
      </Stack>
    </ScrollView>
  );
}

// ─── Tab 11: Templates ───────────────────────────────────────────────────────

function TemplatesTab() {
  const theme = useTheme();
  return (
    <ScrollView height={22}>
      <Stack direction="vertical" gap={1}>
        <Panel title="InfoBox (compound component)">
          <InfoBox borderStyle="round" width={48}>
            <InfoBox.Header
              icon="◆"
              iconColor={theme.colors.primary}
              label="TermUI"
              description="Terminal UI framework"
              version="0.2.0"
              versionColor={theme.colors.accent}
            />
            <Divider />
            <InfoBox.Row label="Author" value="Studio1hq.com" valueColor={theme.colors.primary} />
            <InfoBox.Row label="License" value="MIT" />
            <InfoBox.Row
              label="Components"
              value="101"
              valueDetail="across 13 categories"
              valueColor={theme.colors.success}
            />
            <InfoBox.TreeRow label="Latest" value="v0.2.0 — Phase 2 complete" />
          </InfoBox>
        </Panel>

        <Panel title="Bullet List (compound component)">
          <BulletList>
            <BulletList.Item label="Installation" bold>
              <BulletList.Sub>
                <BulletList.TreeItem label="npm install @termui/core @termui/components" />
                <BulletList.TreeItem label="npx termui init" />
              </BulletList.Sub>
            </BulletList.Item>
            <BulletList.Item label="Features">
              <BulletList.Sub>
                <BulletList.CheckItem label="101 components" done />
                <BulletList.CheckItem label="8 built-in themes" done />
                <BulletList.CheckItem label="27 adapters" done />
                <BulletList.CheckItem label="shadcn-style CLI" done />
                <BulletList.CheckItem label="A11y / ARIA support" />
              </BulletList.Sub>
            </BulletList.Item>
          </BulletList>
        </Panel>

        <Panel title="Help Screen (compound component)">
          <HelpScreen title="termui" tagline="Beautiful terminal UIs" usage="npx termui <command>">
            <HelpScreen.Section label="Commands">
              <HelpScreen.Row
                flag="add <component>"
                description="Add a component from the registry"
              />
              <HelpScreen.Row flag="create <name>" description="Scaffold a new TermUI project" />
              <HelpScreen.Row flag="list" description="Browse available components" />
              <HelpScreen.Row flag="theme <name>" description="Apply a built-in theme" />
              <HelpScreen.Row flag="preview" description="Open interactive component gallery" />
            </HelpScreen.Section>
            <HelpScreen.Section label="Options">
              <HelpScreen.Row flag="--help" description="Show help for a command" />
              <HelpScreen.Row flag="--version" description="Show TermUI version" />
            </HelpScreen.Section>
          </HelpScreen>
        </Panel>
      </Stack>
    </ScrollView>
  );
}

// ─── Tab 12: AI ──────────────────────────────────────────────────────────────

function AITab() {
  const theme = useTheme();
  const [approved, setApproved] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4-6');

  const MODELS = [
    { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'Anthropic', context: 200000 },
    { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', context: 200000 },
    { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', provider: 'Anthropic', context: 200000 },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', context: 128000 },
  ];

  const FILE_CHANGES = [
    {
      path: 'src/components/Button.tsx',
      type: 'modify' as const,
      diff: '-  return <div className="btn">{children}</div>;\n+  return <button className="btn">{children}</button>;',
    },
    {
      path: 'src/components/Icon.tsx',
      type: 'create' as const,
      content: 'export function Icon({ name }) { return <span>{name}</span>; }',
    },
    { path: 'src/legacy/OldButton.tsx', type: 'delete' as const },
  ];

  return (
    <ScrollView height={22}>
      <Stack direction="vertical" gap={1}>
        <Panel title="Chat Thread (inline mode)">
          <ChatThread>
            <ChatMessage role="user" inline showSeparator>
              <Text>Build me a terminal UI with TermUI that shows a dashboard</Text>
            </ChatMessage>
            <ChatMessage role="assistant" inline showSeparator>
              <Text>
                I&apos;ll create a dashboard with Tabs, Table, and ProgressBar components.
              </Text>
            </ChatMessage>
            <ChatMessage role="system" inline showSeparator>
              <Text>Context: Using TermUI v0.2.0 with React + Ink</Text>
            </ChatMessage>
            <ChatMessage role="assistant" inline showSeparator streaming />
          </ChatThread>
        </Panel>

        <Panel title="Thinking Block (Space/Enter to toggle)">
          <ThinkingBlock
            content="The user wants a dashboard. I should use the Tabs component for navigation, Table for data display, ProgressBar for metrics, and Card components for summary stats. Let me structure this with a clean layout using Stack and Box primitives."
            defaultCollapsed={false}
            label="Planning response"
            tokenCount={142}
            duration={1800}
          />
        </Panel>

        <Panel title="Tool Calls (Space/Enter to collapse)">
          <Stack direction="vertical" gap={1}>
            <ToolCall
              name="read_file"
              args={{ path: 'src/index.tsx' }}
              status="success"
              result="File read successfully"
              duration={45}
              defaultCollapsed={false}
            />
            <ToolCall
              name="write_file"
              args={{ path: 'src/dashboard.tsx', content: '...' }}
              status="running"
              defaultCollapsed={false}
            />
            <ToolCall
              name="run_tests"
              args={{ pattern: '*.test.tsx' }}
              status="pending"
              defaultCollapsed
            />
          </Stack>
        </Panel>

        {approved === null && (
          <Panel title="Tool Approval (←→ Tab · Enter confirm)">
            <ToolApproval
              name="exec_command"
              description="Run shell command in the project directory"
              args={{ command: 'npm run build', cwd: '/project' }}
              risk="medium"
              onApprove={() => setApproved('approved')}
              onDeny={() => setApproved('denied')}
              onAlwaysAllow={() => setApproved('always-allowed')}
            />
          </Panel>
        )}
        {approved !== null && (
          <Panel title="Tool Approval">
            <StatusMessage variant={approved === 'denied' ? 'error' : 'success'}>
              Tool was {approved}
            </StatusMessage>
          </Panel>
        )}

        <Panel title="File Changes (↑↓ navigate · Enter expand · A accept · X reject)">
          <FileChange changes={FILE_CHANGES} />
        </Panel>

        <Panel title="Token Usage">
          <Stack direction="vertical" gap={1}>
            <TokenUsage prompt={12500} completion={3200} model="claude-sonnet-4-6" showCost />
            <ContextMeter used={15700} limit={200000} label="Context window" />
          </Stack>
        </Panel>

        <Panel title="Model Selector (↑↓ + Enter)">
          <ModelSelector
            models={MODELS}
            selected={selectedModel}
            onSelect={setSelectedModel}
            showContext
            showProvider
            groupByProvider
          />
        </Panel>
      </Stack>
    </ScrollView>
  );
}

// ─── Tab 13: Theming ─────────────────────────────────────────────────────────

function ThemingTab({
  selectedTheme,
  setSelectedTheme,
  setGlobalTheme,
}: {
  selectedTheme: string;
  setSelectedTheme: (v: string) => void;
  setGlobalTheme: (t: ReturnType<typeof useTheme>) => void;
}) {
  const theme = useTheme();
  return (
    <ScrollView height={22}>
      <Stack direction="vertical" gap={1}>
        <Panel title="Select Theme (↑↓ + Enter)">
          <Select
            options={THEMES.map((t) => ({ value: t.value, label: t.label }))}
            value={selectedTheme}
            onChange={(value) => {
              setSelectedTheme(value);
              const found = THEMES.find((t) => t.value === value);
              if (found) setGlobalTheme(found.theme);
            }}
            cursor="›"
          />
        </Panel>

        <Divider label={`Active theme: ${theme.name ?? selectedTheme}`} />

        <Panel title="Color Palette">
          <Box gap={2} flexWrap="wrap">
            {(
              [
                'primary',
                'accent',
                'success',
                'warning',
                'error',
                'info',
                'foreground',
                'background',
                'border',
                'mutedForeground',
              ] as const
            ).map((key) => (
              <Box key={key} flexDirection="column" alignItems="center">
                <Text color={theme.colors[key]} bold>
                  {'██'}
                </Text>
                <Text color={theme.colors.mutedForeground} dimColor>
                  {key}
                </Text>
              </Box>
            ))}
          </Box>
        </Panel>

        <Panel title="Typography preview with current theme">
          <Stack direction="vertical" gap={0}>
            <Heading level={1}>Heading Level 1</Heading>
            <Heading level={2}>Heading Level 2</Heading>
            <Box gap={2}>
              <Badge variant="success">success</Badge>
              <Badge variant="warning">warning</Badge>
              <Badge variant="error">error</Badge>
              <Badge variant="info">info</Badge>
            </Box>
            <Alert variant="info" title="Theme preview">
              Colors adapt to the selected theme.
            </Alert>
          </Stack>
        </Panel>

        <Panel title="Component preview with current theme">
          <Stack direction="vertical" gap={1}>
            <ProgressBar value={65} total={100} label="Building…" color={theme.colors.primary} />
            <StatusMessage variant="success">Connected to registry</StatusMessage>
            <StatusMessage variant="warning">Deprecated API in use</StatusMessage>
          </Stack>
        </Panel>
      </Stack>
    </ScrollView>
  );
}

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

const TAB_DEFS = [
  { key: 'feedback', label: '① Feedback' },
  { key: 'typography', label: '② Typography' },
  { key: 'inputs', label: '③ Inputs' },
  { key: 'selection', label: '④ Selection' },
  { key: 'data', label: '⑤ Data' },
  { key: 'charts', label: '⑥ Charts' },
  { key: 'navigation', label: '⑦ Navigation' },
  { key: 'overlays', label: '⑧ Overlays' },
  { key: 'forms', label: '⑨ Forms' },
  { key: 'utility', label: '⑩ Utility' },
  { key: 'templates', label: '⑪ Templates' },
  { key: 'ai', label: '⑫ AI' },
  { key: 'theming', label: '⑬ Theming' },
];

function TabBar({ active, onSwitch }: { active: string; onSwitch: (k: string) => void }) {
  const theme = useTheme();
  const idx = TAB_DEFS.findIndex((t) => t.key === active);

  return (
    <Box flexDirection="column" gap={0}>
      <Box gap={1} flexWrap="wrap" paddingX={1}>
        {TAB_DEFS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Text
              key={tab.key}
              color={isActive ? theme.colors.primary : theme.colors.mutedForeground}
              bold={isActive}
              underline={isActive}
            >
              {tab.label}
            </Text>
          );
        })}
      </Box>
      <Box paddingX={1}>
        <Text color={theme.colors.mutedForeground} dimColor>
          {'[ ] switch tabs · Esc quit'}
          {idx > 0 ? '' : ''}
        </Text>
      </Box>
    </Box>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function Demo() {
  const theme = useTheme();
  const setGlobalTheme = useThemeUpdater();
  const { exit } = useApp();

  const [activeTab, setActiveTab] = useState('feedback');
  const [progress, setProgress] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState('default');

  useInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 1)), 80);

  useInput((_input, key) => {
    if (key.escape) exit();
  });

  // [ and ] to switch tabs (avoids conflicts with arrow-key-using components)
  useInput((input) => {
    if (input === ']') {
      const idx = TAB_DEFS.findIndex((t) => t.key === activeTab);
      const next = TAB_DEFS[Math.min(TAB_DEFS.length - 1, idx + 1)];
      if (next) setActiveTab(next.key);
    } else if (input === '[') {
      const idx = TAB_DEFS.findIndex((t) => t.key === activeTab);
      const prev = TAB_DEFS[Math.max(0, idx - 1)];
      if (prev) setActiveTab(prev.key);
    }
  });

  const renderTab = () => {
    switch (activeTab) {
      case 'feedback':
        return <FeedbackTab progress={progress} />;
      case 'typography':
        return <TypographyTab />;
      case 'inputs':
        return <InputsTab />;
      case 'selection':
        return <SelectionTab />;
      case 'data':
        return <DataTab />;
      case 'charts':
        return <ChartsTab progress={progress} />;
      case 'navigation':
        return <NavigationTab />;
      case 'overlays':
        return <OverlaysTab />;
      case 'forms':
        return <FormsTab />;
      case 'utility':
        return <UtilityTab />;
      case 'templates':
        return <TemplatesTab />;
      case 'ai':
        return <AITab />;
      case 'theming':
        return (
          <ThemingTab
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            setGlobalTheme={setGlobalTheme as never}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box flexDirection="column" gap={0} padding={1}>
      {/* Header */}
      <Box borderStyle="round" borderColor={theme.colors.primary} paddingX={2} gap={2}>
        <Text bold color={theme.colors.primary}>
          ◆ TermUI Full Demo
        </Text>
        <Text color={theme.colors.mutedForeground}>13 tabs · 101 components</Text>
      </Box>

      {/* Tab bar */}
      <TabBar active={activeTab} onSwitch={setActiveTab} />

      {/* Content */}
      <Box borderStyle="single" borderColor={theme.colors.border} paddingX={1} paddingY={0}>
        {renderTab()}
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Demo />
    </ThemeProvider>
  );
}

// ─── Solo mode ───────────────────────────────────────────────────────────────
// Usage: pnpm start --<component>  e.g.  pnpm start --bigtext
// Category flags (--typography, --inputs …) are accepted but ignored —
// only the component flag matters.

function SoloWrapper({ children }: { children: React.ReactNode }) {
  const { exit } = useApp();
  useInput((_i, key) => {
    if (key.escape) exit();
  });
  return <>{children}</>;
}

// ── Typography ────────────────────────────────────────────────────────────────
function SoloBigText() {
  const theme = useTheme();
  return <BigText color={theme.colors.primary}>TermUI</BigText>;
}
function SoloDigits() {
  const theme = useTheme();
  return <Digits value="12:34:56" size="md" color={theme.colors.accent} />;
}
function SoloHeading() {
  return (
    <Stack direction="vertical" gap={0}>
      <Heading level={1}>Level 1 Heading</Heading>
      <Heading level={2}>Level 2 Heading</Heading>
      <Heading level={3}>Level 3 Heading</Heading>
      <Heading level={4}>Level 4 Heading</Heading>
    </Stack>
  );
}
function SoloGradient() {
  return (
    <Stack direction="vertical" gap={0}>
      <Gradient colors={['#FF6B6B', '#FFE66D', '#6BCB77']}>
        The quick brown fox jumps over the lazy dog
      </Gradient>
      <Gradient colors={['#4ECDC4', '#556270']} bold>
        TermUI — Beautiful terminal interfaces
      </Gradient>
    </Stack>
  );
}
function SoloCode() {
  return <Code language="tsx">{CODE_SAMPLE}</Code>;
}
function SoloMarkdown() {
  return <Markdown>{MD_SAMPLE}</Markdown>;
}
function SoloStreamingText() {
  return (
    <StreamingText
      text="This text streams in character by character like an AI response..."
      animate
      speed={25}
      cursor
    />
  );
}
function SoloTag() {
  return (
    <Box gap={2}>
      <Tag variant="default">typescript</Tag>
      <Tag variant="default">react</Tag>
      <Tag variant="outline">terminal</Tag>
      <Tag onRemove={() => {}}>removable ×</Tag>
    </Box>
  );
}
function SoloLink() {
  return (
    <Stack direction="vertical" gap={0}>
      <Link href="https://termui.dev">TermUI Documentation</Link>
      <Link href="https://github.com/termui" showHref>
        GitHub Repository
      </Link>
    </Stack>
  );
}
function SoloBadge() {
  return (
    <Box gap={2}>
      <Badge variant="success">stable</Badge>
      <Badge variant="warning">beta</Badge>
      <Badge variant="error">deprecated</Badge>
      <Badge variant="info">new</Badge>
      <Badge variant="default">v1.0.0</Badge>
    </Box>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
function SoloTextInput() {
  const [v, setV] = useState('');
  return (
    <TextInput
      value={v}
      onChange={setV}
      placeholder="Type something…"
      label="Name"
      autoFocus
      width={36}
    />
  );
}
// Cast is needed until the components dist is rebuilt with the voice prop.
const VoiceTextInput = TextInput as React.FC<
  React.ComponentProps<typeof TextInput> & { voice?: unknown }
>;

function SoloVoiceInput() {
  const [v, setV] = useState('');
  const [log, setLog] = useState<string[]>([]);

  // ── Mock capture: simulates 1 s of "recording" with no real audio device ──
  const mockCaptureFactory = () => ({
    start: () =>
      new Promise<void>((res) => {
        setLog((l) => [...l.slice(-4), '🎙  capture started (mock)']);
        setTimeout(res, 0);
      }),
    stop: () =>
      new Promise<Buffer>((res) => {
        setLog((l) => [...l.slice(-4), '⏹  capture stopped (mock)']);
        setTimeout(() => res(Buffer.from('mock-audio')), 600);
      }),
    cancel: () => {
      setLog((l) => [...l.slice(-4), '✖  capture cancelled']);
    },
  });

  // ── Mock STT: simulates 0.8 s network latency, echoes a canned phrase ──
  const mockTranscribe = (_audio: Buffer) =>
    new Promise<string>((res) => {
      setLog((l) => [...l.slice(-4), '📡  transcribing… (mock 800 ms)']);
      setTimeout(() => res('hello from voice'), 800);
    });

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Voice dictation demo (mock — no ffmpeg / STT required)</Text>
      <Text dimColor>Hold Space to speak. Single tap still inserts a space.</Text>
      <VoiceTextInput
        value={v}
        onChange={setV}
        placeholder="Waiting for input…"
        label="Transcript"
        autoFocus
        width={48}
        voice={{
          captureFactory: mockCaptureFactory,
          transcribe: mockTranscribe,
          onError: (err: Error) => setLog((l) => [...l.slice(-4), `✖  error: ${err.message}`]),
        }}
      />
      {log.length > 0 && (
        <Box flexDirection="column">
          <Text dimColor>── mock log ─────────────────────────</Text>
          {log.map((line, i) => (
            <Text key={i} dimColor>
              {line}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
}
function SoloPasswordInput() {
  const [v, setV] = useState('');
  return (
    <PasswordInput
      value={v}
      onChange={setV}
      placeholder="Enter password…"
      label="Password"
      showToggle
    />
  );
}
function SoloNumberInput() {
  const [v, setV] = useState(8);
  return <NumberInput value={v} onChange={setV} min={1} max={32} step={1} label="Workers" />;
}
function SoloSearchInput() {
  const [v, setV] = useState('');
  return (
    <SearchInput
      value={v}
      onChange={setV}
      options={['react', 'react-dom', '@types/react', 'react-query', 'react-hook-form']}
      placeholder="Search packages…"
      maxResults={5}
    />
  );
}
function SoloEmailInput() {
  const [v, setV] = useState('');
  return (
    <EmailInput value={v} onChange={setV} placeholder="you@example.com" label="Email" width={36} />
  );
}
function SoloMaskedInput() {
  const [v, setV] = useState('');
  return (
    <MaskedInput
      value={v}
      onChange={setV}
      mask="(999) 999-9999"
      placeholder="(555) 000-0000"
      label="Phone"
    />
  );
}
function SoloTextArea() {
  const [v, setV] = useState('');
  return (
    <TextArea value={v} onChange={setV} placeholder="Enter description…" label="Notes" rows={5} />
  );
}

// ── Selection ─────────────────────────────────────────────────────────────────
const FW_OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'SolidJS' },
];
function SoloSelect() {
  const [v, setV] = useState('react');
  return <Select options={FW_OPTIONS} value={v} onChange={setV} cursor="›" />;
}
function SoloMultiSelect() {
  const [v, setV] = useState<string[]>(['react']);
  return <MultiSelect options={FW_OPTIONS} value={v} onChange={setV} height={4} />;
}
function SoloRadioGroup() {
  const [v, setV] = useState('react');
  return <RadioGroup options={FW_OPTIONS} value={v} onChange={setV} />;
}
function SoloCheckbox() {
  const [v, setV] = useState(false);
  return <Checkbox label="Enable telemetry" checked={v} onChange={setV} />;
}
function SoloCheckboxGroup() {
  const [v, setV] = useState<string[]>(['react']);
  return <CheckboxGroup label="Frameworks" options={FW_OPTIONS} value={v} onChange={setV} />;
}
function SoloTagInput() {
  const [v, setV] = useState<string[]>(['termui', 'react']);
  return <TagInput value={v} onChange={setV} placeholder="Add tag…" maxTags={8} />;
}
function SoloColorPicker() {
  const theme = useTheme();
  const [v, setV] = useState('#7c3aed');
  return (
    <Stack direction="vertical" gap={0}>
      <ColorPicker value={v} onChange={setV} label="Pick a color" autoFocus />
      <Text color={theme.colors.mutedForeground}>
        Selected:{' '}
        <Text color={v} bold>
          {v}
        </Text>
      </Text>
    </Stack>
  );
}
function SoloTreeSelect() {
  const [v, setV] = useState('components');
  return (
    <TreeSelect
      nodes={[
        {
          value: 'packages',
          label: 'packages/',
          children: [
            { value: 'components', label: 'components/' },
            { value: 'core', label: 'core/' },
            { value: 'cli', label: 'cli/' },
          ],
        },
        { value: 'examples', label: 'examples/', children: [{ value: 'demo', label: 'demo/' }] },
      ]}
      value={v}
      onChange={setV}
      expandedByDefault
      label="Select package"
    />
  );
}

// ── Feedback ──────────────────────────────────────────────────────────────────
function SoloSpinner() {
  return (
    <Box gap={3}>
      <Spinner style="dots" label="dots" />
      <Spinner style="arc" label="arc" />
      <Spinner style="star" label="star" />
      <Spinner style="bounce" label="bounce" />
      <Spinner style="earth" label="earth" fps={3} />
    </Box>
  );
}
function SoloProgressBar() {
  const [p, setP] = useState(0);
  const theme = useTheme();
  useInterval(() => setP((v) => (v >= 100 ? 0 : v + 1)), 80);
  return (
    <ProgressBar value={p} total={100} label={`Building… ${p}%`} color={theme.colors.primary} />
  );
}
function SoloProgressCircle() {
  const [p, setP] = useState(0);
  useInterval(() => setP((v) => (v >= 100 ? 0 : v + 1)), 80);
  return (
    <Box gap={4}>
      <ProgressCircle value={25} showPercent />
      <ProgressCircle value={p} showPercent />
      <ProgressCircle value={100} showPercent />
    </Box>
  );
}
function SoloAlert() {
  return (
    <Stack direction="vertical" gap={1}>
      <Alert variant="success" title="Deploy succeeded">
        All health checks passed.
      </Alert>
      <Alert variant="warning" title="Rate limit approaching">
        90% of API quota used.
      </Alert>
      <Alert variant="error" title="Build failed">
        TypeScript errors in 3 files.
      </Alert>
      <Alert variant="info" title="Update available">
        TermUI v0.3.0 is out.
      </Alert>
    </Stack>
  );
}
function SoloBanner() {
  return (
    <Stack direction="vertical" gap={1}>
      <Banner variant="info" title="Info">
        Informational banner message.
      </Banner>
      <Banner variant="warning" dismissible>
        Dismissible warning banner.
      </Banner>
      <Banner variant="success">Operation completed successfully.</Banner>
      <Banner variant="error">Something went wrong.</Banner>
    </Stack>
  );
}
function SoloStatusMessage() {
  return (
    <Stack direction="vertical" gap={0}>
      <StatusMessage variant="success">Deployed to production</StatusMessage>
      <StatusMessage variant="error">Connection refused on port 3000</StatusMessage>
      <StatusMessage variant="warning">Node.js 16 reaches EOL soon</StatusMessage>
      <StatusMessage variant="loading">Fetching dependencies…</StatusMessage>
      <StatusMessage variant="pending">Awaiting approval</StatusMessage>
    </Stack>
  );
}
function SoloToast() {
  return <Toast message="Package installed successfully!" variant="success" duration={99999} />;
}
function SoloSkeleton() {
  return (
    <Stack direction="vertical" gap={0}>
      <Skeleton width={36} />
      <Skeleton width={28} />
      <Skeleton width={32} />
    </Stack>
  );
}
function SoloMultiProgress() {
  const [p, setP] = useState(0);
  useInterval(() => setP((v) => (v >= 100 ? 0 : v + 2)), 80);
  return (
    <MultiProgress
      items={[
        {
          id: '1',
          label: 'Compile TypeScript',
          value: 100,
          total: 100,
          status: 'done',
          statusText: '2.1s',
        },
        { id: '2', label: 'Bundle assets', value: p, total: 100, status: 'running' },
        { id: '3', label: 'Run tests', value: 0, total: 100, status: 'pending' },
        { id: '4', label: 'Deploy', value: 0, total: 100, status: 'pending' },
      ]}
      barWidth={20}
    />
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
function SoloTable() {
  return <Table data={TABLE_DATA} columns={TABLE_COLS} sortable selectable maxRows={5} />;
}
function SoloDataGrid() {
  return <DataGrid data={TABLE_DATA} columns={TABLE_COLS} pageSize={4} showRowNumbers />;
}
function SoloList() {
  const theme = useTheme();
  return (
    <List
      items={[
        {
          key: '1',
          label: 'components/',
          description: '101 UI components',
          color: theme.colors.primary,
        },
        { key: '2', label: 'core/', description: 'hooks, themes, utilities' },
        { key: '3', label: 'cli/', description: 'add, create, preview commands' },
        { key: '4', label: 'adapters/', description: '27 integrations' },
      ]}
      height={6}
    />
  );
}
function SoloCard() {
  return (
    <Card title="Project Stats" subtitle="TermUI monorepo">
      <KeyValue
        items={[
          { key: 'Components', value: '101' },
          { key: 'Themes', value: '8' },
          { key: 'Hooks', value: '16' },
        ]}
      />
    </Card>
  );
}
function SoloKeyValue() {
  return (
    <KeyValue
      items={[
        { key: 'Name', value: 'TermUI' },
        { key: 'Version', value: '0.2.0' },
        { key: 'License', value: 'MIT' },
        { key: 'Author', value: 'Studio1hq.com' },
      ]}
    />
  );
}
function SoloDefinition() {
  return (
    <Definition
      items={[
        { term: 'TermUI', description: 'A terminal UI component library built on React + Ink.' },
        { term: 'Ink', description: 'React renderer for the terminal environment.' },
        { term: 'TSX', description: 'TypeScript with JSX syntax extensions.' },
      ]}
    />
  );
}
function SoloJSONView() {
  return <JSONView data={JSON_DATA} collapsed={false} />;
}
function SoloDiffView() {
  return (
    <DiffView
      oldText={DIFF_OLD}
      newText={DIFF_NEW}
      filename="Hello.tsx"
      mode="unified"
      showLineNumbers
    />
  );
}
function SoloTree() {
  return (
    <Tree
      nodes={[
        {
          key: 'packages',
          label: 'packages',
          children: [
            { key: 'components', label: 'components' },
            { key: 'core', label: 'core' },
            { key: 'cli', label: 'cli' },
          ],
        },
        { key: 'examples', label: 'examples', children: [{ key: 'demo', label: 'demo' }] },
      ]}
      defaultExpanded={['packages']}
    />
  );
}
function SoloDirectoryTree() {
  return (
    <DirectoryTree rootPath="/Users/arindammajumder/Developer/JavaScript/termi" maxDepth={2} />
  );
}
function SoloGitStatus() {
  return <GitStatus branch="feature/full-demo" staged={3} modified={5} ahead={2} behind={0} />;
}

// ── Charts ────────────────────────────────────────────────────────────────────
const BAR_ITEMS = [
  { label: 'Mon', value: 42 },
  { label: 'Tue', value: 67 },
  { label: 'Wed', value: 53 },
  { label: 'Thu', value: 89 },
  { label: 'Fri', value: 75 },
  { label: 'Sat', value: 31 },
];
function SoloBarChart() {
  const theme = useTheme();
  return (
    <BarChart
      data={BAR_ITEMS.map((d, i) => ({
        ...d,
        color: [
          theme.colors.primary,
          theme.colors.accent,
          theme.colors.success,
          theme.colors.warning,
          theme.colors.info,
          theme.colors.error,
        ][i],
      }))}
      direction="horizontal"
      width={36}
      showValues
    />
  );
}
function SoloLineChart() {
  const [data, setData] = useState([12, 28, 22, 45, 38, 67, 54, 73, 61, 82]);
  const theme = useTheme();
  useInterval(() => setData((d) => [...d.slice(1), Math.round(20 + Math.random() * 70)]), 500);
  return (
    <LineChart
      data={data}
      width={48}
      height={10}
      title="Requests/s (live)"
      showAxes
      color={theme.colors.primary}
    />
  );
}
function SoloPieChart() {
  return (
    <PieChart
      data={[
        { label: 'Layout', value: 9 },
        { label: 'Typography', value: 13 },
        { label: 'Input', value: 8 },
        { label: 'Selection', value: 8 },
        { label: 'Data', value: 11 },
        { label: 'Feedback', value: 9 },
        { label: 'Other', value: 43 },
      ]}
      radius={6}
      showLegend
      showPercentages
    />
  );
}
function SoloSparkline() {
  const theme = useTheme();
  const [data, setData] = useState([5, 10, 5, 22, 35, 18, 42, 55, 48, 73, 65, 88]);
  useInterval(() => setData((d) => [...d.slice(1), Math.round(10 + Math.random() * 80)]), 400);
  return <Sparkline data={data} width={36} color={theme.colors.accent} label="CPU % (live)" />;
}
function SoloGauge() {
  const [v, setV] = useState(0);
  const theme = useTheme();
  useInterval(() => setV((p) => (p >= 100 ? 0 : p + 1)), 80);
  return (
    <Box gap={4}>
      <Gauge value={v} label="CPU" size="md" color={theme.colors.primary} />
      <Gauge value={65} label="Memory" size="md" color={theme.colors.warning} />
      <Gauge value={42} label="Disk" size="sm" />
    </Box>
  );
}
function SoloHeatMap() {
  return (
    <HeatMap
      data={[
        [10, 20, 30, 80, 90, 40, 15],
        [5, 60, 70, 45, 35, 85, 25],
        [90, 15, 50, 65, 20, 55, 75],
        [30, 40, 10, 95, 60, 70, 45],
      ]}
      rowLabels={['Mon', 'Tue', 'Wed', 'Thu']}
      colLabels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7']}
      showValues={false}
    />
  );
}

// ── Navigation ────────────────────────────────────────────────────────────────
function SoloBreadcrumb() {
  return (
    <Breadcrumb
      items={[
        { key: 'home', label: 'Home' },
        { key: 'packages', label: 'packages' },
        { key: 'components', label: 'components' },
        { key: 'feedback', label: 'Feedback' },
      ]}
      activeKey="feedback"
    />
  );
}
function SoloPagination() {
  const [p, setP] = useState(3);
  const theme = useTheme();
  return (
    <Stack direction="vertical" gap={0}>
      <Pagination total={12} current={p} onChange={setP} showEdges siblings={1} />
      <Text color={theme.colors.mutedForeground}>Page {p} of 12 · ←→ to navigate</Text>
    </Stack>
  );
}
function SoloMenu() {
  return (
    <Menu
      items={[
        {
          key: 'file',
          label: 'File',
          icon: '📁',
          children: [
            { key: 'new', label: 'New Project', shortcut: 'Ctrl+N' },
            { key: 'open', label: 'Open…', shortcut: 'Ctrl+O' },
            { key: 'sep1', label: '', separator: true },
            { key: 'quit', label: 'Quit', shortcut: 'Ctrl+Q' },
          ],
        },
        {
          key: 'edit',
          label: 'Edit',
          icon: '✏️',
          children: [
            { key: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
            { key: 'paste', label: 'Paste', shortcut: 'Ctrl+V' },
          ],
        },
        { key: 'help', label: 'Help', icon: '❓' },
      ]}
      title="App Menu"
    />
  );
}
function SoloSidebar() {
  const [k, setK] = useState('components');
  return (
    <Sidebar
      items={[
        { key: 'components', label: 'Components', icon: '🧩', badge: '101' },
        { key: 'hooks', label: 'Hooks', icon: '🎣', badge: '16' },
        { key: 'themes', label: 'Themes', icon: '🎨', badge: '8' },
        {
          key: 'adapters',
          label: 'Adapters',
          icon: '🔌',
          badge: '27',
          children: [
            { key: 'git', label: 'git adapter' },
            { key: 'github', label: 'github adapter' },
          ],
        },
      ]}
      activeKey={k}
      onSelect={setK}
      width={24}
      title="Explorer"
    />
  );
}
function SoloCommandPalette() {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  useInput((input) => {
    if (input === 'p') setOpen((v) => !v);
  });
  return (
    <Stack direction="vertical" gap={0}>
      <Text color={theme.colors.mutedForeground}>
        Press P to toggle · ↑↓ navigate · Enter select
      </Text>
      <CommandPalette
        commands={[
          {
            id: 'add',
            label: 'Add component',
            description: 'Install from registry',
            shortcut: 'Ctrl+A',
            group: 'Registry',
            onSelect: () => {},
          },
          {
            id: 'theme',
            label: 'Switch theme',
            description: 'Change color theme',
            group: 'Appearance',
            onSelect: () => setOpen(false),
          },
          {
            id: 'preview',
            label: 'Preview component',
            description: 'Open component gallery',
            group: 'Dev',
            onSelect: () => {},
          },
          {
            id: 'docs',
            label: 'View docs',
            description: 'Open inline documentation',
            group: 'Dev',
            onSelect: () => {},
          },
        ]}
        isOpen={open}
        onClose={() => setOpen(false)}
        placeholder="Search commands…"
        maxItems={6}
      />
    </Stack>
  );
}

// ── Overlays ──────────────────────────────────────────────────────────────────
function SoloModal() {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  useInput((input) => {
    if (input === 'm') setOpen((v) => !v);
  });
  return (
    <Stack direction="vertical" gap={0}>
      <Text color={theme.colors.mutedForeground}>Press M to toggle modal</Text>
      <Modal open={open} onClose={() => setOpen(false)} title="Confirm Deploy" width={44}>
        <Text>Deploy to production?</Text>
        <Text color={theme.colors.mutedForeground}>This affects all users.</Text>
      </Modal>
      {!open && <Text color={theme.colors.mutedForeground}>Modal closed. Press M to reopen.</Text>}
    </Stack>
  );
}
function SoloDialog() {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  return (
    <Stack direction="vertical" gap={0}>
      <Text color={theme.colors.mutedForeground}>←→ Tab switch · Enter confirm</Text>
      <Dialog
        title="Delete project?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        variant="danger"
        isOpen={open}
      >
        <Text>This will permanently delete the project and all its data.</Text>
      </Dialog>
      {!open && <Text color={theme.colors.success}>Dialog closed (action taken).</Text>}
    </Stack>
  );
}
function SoloDrawer() {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  useInput((input) => {
    if (input === 'r') setOpen((v) => !v);
  });
  return (
    <Stack direction="vertical" gap={0}>
      <Text color={theme.colors.mutedForeground}>Press R to toggle drawer</Text>
      <Drawer isOpen={open} edge="right" title="Settings" onClose={() => setOpen(false)} width={30}>
        <Stack direction="vertical" gap={1}>
          <Text bold>Preferences</Text>
          <Text color={theme.colors.mutedForeground}>Theme: Dracula</Text>
          <Text color={theme.colors.mutedForeground}>Font size: 14px</Text>
        </Stack>
      </Drawer>
      {!open && <Text color={theme.colors.mutedForeground}>Drawer closed. Press R to reopen.</Text>}
    </Stack>
  );
}
function SoloTooltip() {
  const [v, setV] = useState(true);
  const theme = useTheme();
  useInput((input) => {
    if (input === 't') setV((x) => !x);
  });
  return (
    <Stack direction="vertical" gap={1}>
      <Text color={theme.colors.mutedForeground}>Press T to toggle tooltip</Text>
      <Tooltip content="Opens a new project workspace" position="top" isVisible={v}>
        <Text bold color={theme.colors.primary}>
          [ New Project ]
        </Text>
      </Tooltip>
    </Stack>
  );
}
function SoloNotificationBadge() {
  const theme = useTheme();
  return (
    <Box gap={3}>
      <Box gap={1}>
        <Text>Inbox</Text>
        <NotificationBadge count={5} />
      </Box>
      <Box gap={1}>
        <Text>Alerts</Text>
        <NotificationBadge count={12} color={theme.colors.warning} />
      </Box>
      <Box gap={1}>
        <Text>Updates</Text>
        <NotificationBadge count={0} />
        <Text color={theme.colors.mutedForeground}>(0 = hidden)</Text>
      </Box>
    </Box>
  );
}

// ── Forms ─────────────────────────────────────────────────────────────────────
function SoloWizard() {
  const [done, setDone] = useState(false);
  const theme = useTheme();
  if (done)
    return (
      <Alert variant="success" title="Done!">
        All steps completed.
      </Alert>
    );
  return (
    <Stack direction="vertical" gap={0}>
      <Text color={theme.colors.mutedForeground}>→/Tab advance · ←/Shift+Tab back</Text>
      <Wizard
        steps={[
          {
            key: 'a',
            title: 'Step 1: Project',
            content: <Text>Configure project name and description.</Text>,
          },
          {
            key: 'b',
            title: 'Step 2: Framework',
            content: <Text>Choose React, Vue, or Svelte.</Text>,
          },
          { key: 'c', title: 'Step 3: Deploy', content: <Text>Select deploy target.</Text> },
        ]}
        showProgress
        onComplete={() => setDone(true)}
      />
    </Stack>
  );
}
function SoloConfirm() {
  const [ans, setAns] = useState<string | null>(null);
  return (
    <Stack direction="vertical" gap={0}>
      <Confirm
        message="Deploy to production?"
        confirmLabel="Yes, deploy"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => setAns('Confirmed ✓')}
        onCancel={() => setAns('Cancelled')}
      />
      {ans && <Text color="green">{ans}</Text>}
    </Stack>
  );
}
function SoloDatePicker() {
  const [d, setD] = useState(new Date());
  return <DatePicker value={d} onChange={setD} label="Release date" autoFocus />;
}
function SoloTimePicker() {
  const [t, setT] = useState({ hours: 9, minutes: 30 });
  return <TimePicker value={t} onChange={setT} label="Release time" format={24} autoFocus />;
}
function SoloFilePicker() {
  const [f, setF] = useState('');
  const theme = useTheme();
  return (
    <Stack direction="vertical" gap={0}>
      <FilePicker
        value={f}
        onChange={setF}
        label="Config file"
        startDir="/Users/arindammajumder/Developer/JavaScript/termi"
        extensions={['.ts', '.tsx', '.json']}
        autoFocus
        maxVisible={8}
      />
      {f && <Text color={theme.colors.mutedForeground}>Selected: {f}</Text>}
    </Stack>
  );
}

// ── Utility ───────────────────────────────────────────────────────────────────
function SoloClock() {
  return (
    <Stack direction="vertical" gap={1}>
      <Clock format="24h" showSeconds showDate size="sm" />
      <Clock format="12h" showSeconds size="lg" />
    </Stack>
  );
}
function SoloTimer() {
  return <Timer duration={60} label="Countdown" format="ms" autoStart />;
}
function SoloStopwatch() {
  return <Stopwatch showLaps autoStart={false} />;
}
function SoloClipboard() {
  return <Clipboard value="npx termui add spinner progress-bar" label="Install command" />;
}
function SoloKeyboardShortcuts() {
  return (
    <KeyboardShortcuts
      shortcuts={[
        { key: '[ ]', description: 'Switch tabs', category: 'Navigation' },
        { key: 'Esc', description: 'Quit', category: 'Navigation' },
        { key: 'Space', description: 'Toggle timer', category: 'Utility' },
        { key: 'R', description: 'Reset', category: 'Utility' },
        { key: 'S', description: 'Sort column', category: 'Table' },
      ]}
      columns={2}
      title="Keyboard Shortcuts"
    />
  );
}
function SoloHelp() {
  return (
    <Help
      keymap={{
        '[/]': 'switch tabs',
        Esc: 'quit',
        Space: 'toggle',
        R: 'reset',
        S: 'sort',
        Enter: 'confirm',
      }}
      title="Controls"
    />
  );
}
function SoloLog() {
  return <Log entries={LOG_ENTRIES} height={8} showTimestamp follow />;
}
function SoloQRCode() {
  return (
    <Box gap={4}>
      <QRCode value="https://termui.dev" size="sm" label="termui.dev" />
      <QRCode value="https://github.com/termui/termui" size="sm" label="GitHub" />
    </Box>
  );
}
function SoloToggle() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <Stack direction="vertical" gap={0}>
      <Toggle checked={a} onChange={setA} label="Dark mode" />
      <Toggle checked={b} onChange={setB} label="Notifications" />
    </Stack>
  );
}
function SoloPanel() {
  const theme = useTheme();
  return (
    <Stack direction="vertical" gap={1}>
      <Panel title="Default Panel">
        <Text>Content inside a panel with a title border.</Text>
      </Panel>
      <Panel title="Accent Panel" borderColor={theme.colors.accent}>
        <Text>Panel with custom border color.</Text>
      </Panel>
    </Stack>
  );
}

// ── Templates ─────────────────────────────────────────────────────────────────
function SoloInfoBox() {
  const theme = useTheme();
  return (
    <InfoBox borderStyle="round" width={52}>
      <InfoBox.Header
        icon="◆"
        iconColor={theme.colors.primary}
        label="TermUI"
        description="Terminal UI framework"
        version="0.2.0"
        versionColor={theme.colors.accent}
      />
      <Divider />
      <InfoBox.Row label="Author" value="Studio1hq.com" valueColor={theme.colors.primary} />
      <InfoBox.Row label="License" value="MIT" />
      <InfoBox.Row
        label="Components"
        value="101"
        valueDetail="across 13 categories"
        valueColor={theme.colors.success}
      />
      <InfoBox.TreeRow label="Latest" value="v0.2.0 — Phase 2 complete" />
    </InfoBox>
  );
}
function SoloBulletList() {
  return (
    <BulletList>
      <BulletList.Item label="Installation" bold>
        <BulletList.Sub>
          <BulletList.TreeItem label="npm install @termui/core @termui/components" />
          <BulletList.TreeItem label="npx termui init" />
        </BulletList.Sub>
      </BulletList.Item>
      <BulletList.Item label="Features">
        <BulletList.Sub>
          <BulletList.CheckItem label="101 components" done />
          <BulletList.CheckItem label="8 built-in themes" done />
          <BulletList.CheckItem label="27 adapters" done />
          <BulletList.CheckItem label="A11y / ARIA support" />
        </BulletList.Sub>
      </BulletList.Item>
    </BulletList>
  );
}
function SoloHelpScreen() {
  return (
    <HelpScreen title="termui" tagline="Beautiful terminal UIs" usage="npx termui <command>">
      <HelpScreen.Section label="Commands">
        <HelpScreen.Row flag="add <component>" description="Add a component from the registry" />
        <HelpScreen.Row flag="create <name>" description="Scaffold a new TermUI project" />
        <HelpScreen.Row flag="list" description="Browse available components" />
        <HelpScreen.Row flag="theme <name>" description="Apply a built-in theme" />
        <HelpScreen.Row flag="preview" description="Open interactive component gallery" />
      </HelpScreen.Section>
      <HelpScreen.Section label="Options">
        <HelpScreen.Row flag="--help" description="Show help for a command" />
        <HelpScreen.Row flag="--version" description="Show TermUI version" />
      </HelpScreen.Section>
    </HelpScreen>
  );
}

// ── AI ────────────────────────────────────────────────────────────────────────

// Fake AsyncIterable that drips words every 120ms — simulates a real LLM stream
async function* fakeStream(text: string): AsyncIterable<string> {
  const words = text.split(' ');
  for (const word of words) {
    await new Promise((r) => setTimeout(r, 120));
    yield word + ' ';
  }
}

function SoloChatMessage() {
  const theme = useTheme();

  const STREAM_TEXT =
    'Sure! I&apos;ll create a dashboard with Tabs for navigation, a live LineChart for metrics, Table for data, and ProgressBar for build status. Using TermUI v0.2.0 with React + Ink.';

  const STREAM_LIVE = fakeStream(
    'I can also consume a real AsyncIterable stream from any LLM SDK — chunks arrive and append live as they come in, with a blinking cursor at the end.'
  );

  return (
    <Stack direction="vertical" gap={1}>
      <Text bold color={theme.colors.primary}>
        streamText — animates a string char by char (speed=18ms)
      </Text>
      <ChatThread>
        <ChatMessage role="user" inline showSeparator>
          <Text>Build me a terminal dashboard with TermUI</Text>
        </ChatMessage>
        <ChatMessage
          role="assistant"
          inline
          showSeparator
          streamText={STREAM_TEXT}
          streamSpeed={18}
        />
      </ChatThread>

      <Text bold color={theme.colors.primary}>
        stream — consumes AsyncIterable&lt;string&gt; live (words every 120ms)
      </Text>
      <ChatThread>
        <ChatMessage role="user" inline showSeparator>
          <Text>How does the stream prop work?</Text>
        </ChatMessage>
        <ChatMessage role="assistant" inline showSeparator stream={STREAM_LIVE} />
      </ChatThread>

      <Text bold color={theme.colors.primary}>
        streaming=true — classic dots indicator
      </Text>
      <ChatThread>
        <ChatMessage role="user" inline showSeparator>
          <Text>Are you still thinking?</Text>
        </ChatMessage>
        <ChatMessage role="assistant" inline showSeparator streaming />
      </ChatThread>

      <Text bold color={theme.colors.primary}>
        default mode · name · timestamp · error role
      </Text>
      <ChatThread>
        <ChatMessage role="user" name="Arindam" timestamp={new Date()} showSeparator>
          <Text>Can you refactor this to use hooks?</Text>
        </ChatMessage>
        <ChatMessage
          role="assistant"
          name="Claude"
          timestamp={new Date()}
          showSeparator
          streamText="Sure! Here is the refactored version using useState and useEffect."
          streamSpeed={22}
        />
        <ChatMessage role="error" showSeparator>
          <Text>Build failed: cannot find module &apos;@termui/core&apos;</Text>
        </ChatMessage>
      </ChatThread>
    </Stack>
  );
}
function SoloToolCall() {
  return (
    <Stack direction="vertical" gap={1}>
      <ToolCall
        name="read_file"
        args={{ path: 'src/index.tsx' }}
        status="success"
        result="File read successfully"
        duration={45}
        defaultCollapsed={false}
      />
      <ToolCall
        name="write_file"
        args={{ path: 'src/dashboard.tsx' }}
        status="running"
        defaultCollapsed={false}
      />
      <ToolCall
        name="run_tests"
        args={{ pattern: '*.test.tsx' }}
        status="pending"
        defaultCollapsed
      />
      <ToolCall
        name="build"
        args={{ target: 'production' }}
        status="error"
        result="Exit code 1"
        defaultCollapsed={false}
      />
    </Stack>
  );
}
function SoloThinkingBlock() {
  return (
    <ThinkingBlock
      content="The user wants a dashboard. I should use the Tabs component for navigation, Table for data display, ProgressBar for metrics, and Card components for summary stats. Let me structure this with Stack and Box primitives from the layout category."
      defaultCollapsed={false}
      label="Reasoning"
      tokenCount={148}
      duration={2100}
    />
  );
}
function SoloToolApproval() {
  const [ans, setAns] = useState<string | null>(null);
  if (ans)
    return (
      <StatusMessage variant={ans === 'denied' ? 'error' : 'success'}>Tool was {ans}</StatusMessage>
    );
  return (
    <ToolApproval
      name="exec_command"
      description="Run shell command in the project directory"
      args={{ command: 'npm run build', cwd: '/project' }}
      risk="medium"
      onApprove={() => setAns('approved')}
      onDeny={() => setAns('denied')}
      onAlwaysAllow={() => setAns('always-allowed')}
    />
  );
}
function SoloTokenUsage() {
  return (
    <Stack direction="vertical" gap={1}>
      <TokenUsage prompt={12500} completion={3200} model="claude-sonnet-4-6" showCost />
      <ContextMeter used={15700} limit={200000} label="Context window" />
    </Stack>
  );
}
function SoloModelSelector() {
  const [sel, setSel] = useState('claude-sonnet-4-6');
  return (
    <ModelSelector
      models={[
        { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', provider: 'Anthropic', context: 200000 },
        {
          id: 'claude-sonnet-4-6',
          name: 'Claude Sonnet 4.6',
          provider: 'Anthropic',
          context: 200000,
        },
        {
          id: 'claude-haiku-4-5',
          name: 'Claude Haiku 4.5',
          provider: 'Anthropic',
          context: 200000,
        },
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', context: 128000 },
      ]}
      selected={sel}
      onSelect={setSel}
      showContext
      showProvider
      groupByProvider
    />
  );
}
function SoloFileChange() {
  return (
    <FileChange
      changes={[
        {
          path: 'src/components/Button.tsx',
          type: 'modify',
          diff: '-  return <div>{children}</div>;\n+  return <button>{children}</button>;',
        },
        {
          path: 'src/components/Icon.tsx',
          type: 'create',
          content: 'export function Icon({ name }) { return <span>{name}</span>; }',
        },
        { path: 'src/legacy/OldButton.tsx', type: 'delete' },
      ]}
    />
  );
}

// ─── Registry ─────────────────────────────────────────────────────────────────

const SOLO_REGISTRY: Record<string, React.ComponentType> = {
  // typography
  bigtext: SoloBigText,
  digits: SoloDigits,
  heading: SoloHeading,
  gradient: SoloGradient,
  code: SoloCode,
  markdown: SoloMarkdown,
  streamingtext: SoloStreamingText,
  streaming: SoloStreamingText,
  tag: SoloTag,
  link: SoloLink,
  badge: SoloBadge,
  // input
  textinput: SoloTextInput,
  text: SoloTextInput,
  voiceinput: SoloVoiceInput,
  voice: SoloVoiceInput,
  passwordinput: SoloPasswordInput,
  password: SoloPasswordInput,
  numberinput: SoloNumberInput,
  number: SoloNumberInput,
  searchinput: SoloSearchInput,
  search: SoloSearchInput,
  emailinput: SoloEmailInput,
  email: SoloEmailInput,
  maskedinput: SoloMaskedInput,
  masked: SoloMaskedInput,
  textarea: SoloTextArea,
  // selection
  select: SoloSelect,
  multiselect: SoloMultiSelect,
  radiogroup: SoloRadioGroup,
  radio: SoloRadioGroup,
  checkbox: SoloCheckbox,
  checkboxgroup: SoloCheckboxGroup,
  taginput: SoloTagInput,
  colorpicker: SoloColorPicker,
  color: SoloColorPicker,
  treeselect: SoloTreeSelect,
  // feedback
  spinner: SoloSpinner,
  progressbar: SoloProgressBar,
  progress: SoloProgressBar,
  progresscircle: SoloProgressCircle,
  alert: SoloAlert,
  banner: SoloBanner,
  statusmessage: SoloStatusMessage,
  status: SoloStatusMessage,
  toast: SoloToast,
  skeleton: SoloSkeleton,
  multiprogress: SoloMultiProgress,
  // data
  table: SoloTable,
  datagrid: SoloDataGrid,
  list: SoloList,
  card: SoloCard,
  keyvalue: SoloKeyValue,
  definition: SoloDefinition,
  jsonview: SoloJSONView,
  json: SoloJSONView,
  diffview: SoloDiffView,
  diff: SoloDiffView,
  tree: SoloTree,
  directorytree: SoloDirectoryTree,
  dirtree: SoloDirectoryTree,
  gitstatus: SoloGitStatus,
  git: SoloGitStatus,
  // charts
  barchart: SoloBarChart,
  bar: SoloBarChart,
  linechart: SoloLineChart,
  line: SoloLineChart,
  piechart: SoloPieChart,
  pie: SoloPieChart,
  sparkline: SoloSparkline,
  gauge: SoloGauge,
  heatmap: SoloHeatMap,
  heat: SoloHeatMap,
  // navigation
  breadcrumb: SoloBreadcrumb,
  pagination: SoloPagination,
  menu: SoloMenu,
  sidebar: SoloSidebar,
  commandpalette: SoloCommandPalette,
  palette: SoloCommandPalette,
  // overlays
  modal: SoloModal,
  dialog: SoloDialog,
  drawer: SoloDrawer,
  tooltip: SoloTooltip,
  notificationbadge: SoloNotificationBadge,
  notification: SoloNotificationBadge,
  // forms
  wizard: SoloWizard,
  confirm: SoloConfirm,
  datepicker: SoloDatePicker,
  date: SoloDatePicker,
  timepicker: SoloTimePicker,
  time: SoloTimePicker,
  filepicker: SoloFilePicker,
  file: SoloFilePicker,
  // utility
  panel: SoloPanel,
  toggle: SoloToggle,
  clock: SoloClock,
  timer: SoloTimer,
  stopwatch: SoloStopwatch,
  clipboard: SoloClipboard,
  keyboardshortcuts: SoloKeyboardShortcuts,
  shortcuts: SoloKeyboardShortcuts,
  help: SoloHelp,
  log: SoloLog,
  qrcode: SoloQRCode,
  qr: SoloQRCode,
  // templates
  infobox: SoloInfoBox,
  bulletlist: SoloBulletList,
  bullets: SoloBulletList,
  helpscreen: SoloHelpScreen,
  // ai
  chatmessage: SoloChatMessage,
  chat: SoloChatMessage,
  toolcall: SoloToolCall,
  tool: SoloToolCall,
  thinkingblock: SoloThinkingBlock,
  thinking: SoloThinkingBlock,
  toolapproval: SoloToolApproval,
  approval: SoloToolApproval,
  tokenusage: SoloTokenUsage,
  tokens: SoloTokenUsage,
  modelselector: SoloModelSelector,
  model: SoloModelSelector,
  filechange: SoloFileChange,
};

// ─── Entry point ──────────────────────────────────────────────────────────────

const flags = process.argv
  .slice(2)
  .filter((a) => a.startsWith('--'))
  .map((a) => a.slice(2).toLowerCase());

const matchedKey = flags.find((f) => f in SOLO_REGISTRY);

if (matchedKey) {
  const SoloComponent = SOLO_REGISTRY[matchedKey]!;
  render(
    <ThemeProvider>
      <SoloWrapper>
        <SoloComponent />
      </SoloWrapper>
    </ThemeProvider>
  );
} else {
  render(<App />);
}
