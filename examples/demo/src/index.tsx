/**
 * TermUI Phase 2 Demo
 * 5 tabs — Feedback, Typography, Inputs, Selection, Theming
 * Press q to quit, ←/→ to switch tabs
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
} from '@termui/core';
import {
  // Feedback
  Spinner,
  ProgressBar,
  Alert,
  Badge,
  StatusMessage,
  ProgressCircle,
  Skeleton,
  // Typography
  Heading,
  Code,
  Gradient,
  Tag,
  // Input
  NumberInput,
  SearchInput,
  // Selection
  MultiSelect,
  RadioGroup,
  // Data / Layout
  Panel,
  Stack,
  Divider,
  KeyValue,
  Card,
  // Navigation
  Tabs,
  // Theming
  Select,
  Toggle,
} from '@termui/components';

// ─── Shared data ────────────────────────────────────────────────────────────

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

const FRAMEWORK_OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'astro', label: 'Astro' },
];

const FEATURE_OPTIONS = [
  { value: 'ts', label: 'TypeScript' },
  { value: 'lint', label: 'ESLint' },
  { value: 'fmt', label: 'Prettier' },
  { value: 'test', label: 'Vitest' },
  { value: 'ci', label: 'GitHub Actions' },
];

const SEARCH_OPTIONS = [
  'react',
  'react-dom',
  'react-router',
  '@types/react',
  'react-query',
  'react-hook-form',
];

const CODE_SAMPLE = `import { useState } from 'react';

// Counter component
function Counter() {
  const [count, setCount] = useState(0);
  return count + 1;
}`;

// ─── Tab contents ────────────────────────────────────────────────────────────

function FeedbackTab({ progress }: { progress: number }) {
  const theme = useTheme();
  const progressLabel =
    progress < 34
      ? 'Installing packages…'
      : progress < 67
        ? 'Compiling sources…'
        : 'Building artifacts…';
  const progressColor =
    progress < 34 ? theme.colors.info : progress < 67 ? theme.colors.warning : theme.colors.success;

  return (
    <Stack direction="vertical" gap={1}>
      <Panel title="Spinners" borderColor={theme.colors.border}>
        <Box gap={3}>
          <Spinner style="dots" label="dots" />
          <Spinner style="arc" label="arc" />
          <Spinner style="star" label="star" />
          <Spinner style="bounce" label="bounce" />
          <Spinner style="earth" label="earth" fps={3} />
        </Box>
      </Panel>

      <Panel title="Progress Bar">
        <ProgressBar value={progress} total={100} label={progressLabel} color={progressColor} />
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

      <Panel title="Progress Circle + Badges">
        <Box gap={4} alignItems="center">
          <Box flexDirection="column" alignItems="center" gap={0}>
            <ProgressCircle value={25} showPercent />
          </Box>
          <Box flexDirection="column" alignItems="center" gap={0}>
            <ProgressCircle value={60} showPercent />
          </Box>
          <Box flexDirection="column" alignItems="center" gap={0}>
            <ProgressCircle value={100} showPercent />
          </Box>
          <Box gap={2} flexWrap="wrap">
            <Badge variant="success">stable</Badge>
            <Badge variant="warning">beta</Badge>
            <Badge variant="error">deprecated</Badge>
            <Badge variant="info">new</Badge>
          </Box>
        </Box>
      </Panel>

      <Panel title="Skeleton">
        <Stack direction="vertical" gap={0}>
          <Skeleton width={32} />
          <Skeleton width={24} />
          <Skeleton width={28} />
        </Stack>
      </Panel>
    </Stack>
  );
}

function TypographyTab() {
  const theme = useTheme();
  return (
    <Stack direction="vertical" gap={1}>
      <Panel title="Headings">
        <Stack direction="vertical" gap={0}>
          <Heading level={1}>Level 1 Heading</Heading>
          <Heading level={2}>Level 2 Heading</Heading>
          <Heading level={3}>Level 3 Heading</Heading>
          <Heading level={4}>Level 4 Heading</Heading>
        </Stack>
      </Panel>

      <Panel title="Gradient Text">
        <Stack direction="vertical" gap={0}>
          <Gradient colors={['#FF6B6B', '#FFE66D', '#6BCB77']}>
            The quick brown fox jumps over the lazy dog
          </Gradient>
          <Gradient colors={['#4ECDC4', '#556270']} bold>
            TermUI — Beautiful terminal UIs
          </Gradient>
        </Stack>
      </Panel>

      <Panel title="Code">
        <Code language="tsx">{CODE_SAMPLE}</Code>
      </Panel>

      <Panel title="Tags">
        <Box gap={2}>
          <Tag variant="default">typescript</Tag>
          <Tag variant="default">react</Tag>
          <Tag variant="outline">terminal</Tag>
          <Tag variant="outline">open-source</Tag>
          <Tag onRemove={() => {}}>removable</Tag>
        </Box>
      </Panel>

      <Panel title="Alerts">
        <Stack direction="vertical" gap={1}>
          <Alert variant="success" title="Deploy succeeded">
            All health checks passed.
          </Alert>
          <Alert variant="warning" title="Rate limit">
            Approaching API quota (90%).
          </Alert>
        </Stack>
      </Panel>
    </Stack>
  );
}

function InputsTab({
  count,
  setCount,
  searchQuery,
  setSearchQuery,
}: {
  count: number;
  setCount: (n: number) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
}) {
  const theme = useTheme();
  return (
    <Stack direction="vertical" gap={1}>
      <Text color={theme.colors.mutedForeground} dimColor>
        Use ↑↓ to change number · type to search · Tab switches fields
      </Text>

      <Panel title="Number Input">
        <NumberInput value={count} onChange={setCount} min={0} max={100} step={5} label="Threads" />
      </Panel>

      <Panel title="Search Input">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          options={SEARCH_OPTIONS}
          placeholder="Search packages…"
          maxResults={4}
        />
      </Panel>

      <Panel title="KeyValue Display">
        <KeyValue
          items={[
            { key: 'Node.js', value: 'v22.0.0' },
            { key: 'pnpm', value: 'v9.1.0' },
            { key: 'TypeScript', value: 'v5.4.0' },
            { key: 'Threads', value: String(count) },
          ]}
        />
      </Panel>
    </Stack>
  );
}

function SelectionTab({
  selectedFeatures,
  setSelectedFeatures,
  selectedFramework,
  setSelectedFramework,
}: {
  selectedFeatures: string[];
  setSelectedFeatures: (v: string[]) => void;
  selectedFramework: string;
  setSelectedFramework: (v: string) => void;
}) {
  const theme = useTheme();
  return (
    <Stack direction="vertical" gap={1}>
      <Text color={theme.colors.mutedForeground} dimColor>
        Space to toggle · Enter to confirm · ↑↓ navigate
      </Text>

      <Box gap={2}>
        <Box flexDirection="column" flexGrow={1}>
          <Panel title="Multi-Select (Space to toggle)">
            <MultiSelect
              options={FEATURE_OPTIONS}
              value={selectedFeatures}
              onChange={setSelectedFeatures}
              height={5}
            />
          </Panel>
        </Box>
        <Box flexDirection="column" flexGrow={1}>
          <Panel title="Radio Group">
            <RadioGroup
              options={FRAMEWORK_OPTIONS}
              value={selectedFramework}
              onChange={setSelectedFramework}
            />
          </Panel>
        </Box>
      </Box>

      <Panel title="Card">
        <Card title="Project Summary" subtitle="Selected configuration">
          <KeyValue
            items={[
              { key: 'Framework', value: selectedFramework || '(none)' },
              { key: 'Features', value: selectedFeatures.join(', ') || '(none)' },
            ]}
          />
        </Card>
      </Panel>
    </Stack>
  );
}

function ThemingTab({
  selectedTheme,
  setSelectedTheme,
  setGlobalTheme,
  toggleOn,
  setToggleOn,
}: {
  selectedTheme: string;
  setSelectedTheme: (v: string) => void;
  setGlobalTheme: (t: ReturnType<typeof useTheme>) => void;
  toggleOn: boolean;
  setToggleOn: (v: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <Stack direction="vertical" gap={1}>
      <Panel title="Select Theme  (↑↓ + Enter)">
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

      <Divider label={`Active: ${theme.name}`} />

      <Panel title="Color Palette">
        <Box gap={2} flexWrap="wrap">
          {(['primary', 'accent', 'success', 'warning', 'error', 'info'] as const).map((key) => (
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

      <Panel title="Toggle">
        <Toggle checked={toggleOn} onChange={setToggleOn} label="Dark mode" />
      </Panel>
    </Stack>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

function Demo() {
  const theme = useTheme();
  const setGlobalTheme = useThemeUpdater();
  const { exit } = useApp();

  const [activeTab, setActiveTab] = useState('feedback');
  const [progress, setProgress] = useState(0);
  const [count, setCount] = useState(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['ts', 'fmt']);
  const [selectedFramework, setSelectedFramework] = useState('react');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [toggleOn, setToggleOn] = useState(false);

  useInterval(() => {
    setProgress((p) => (p >= 100 ? 0 : p + 1));
  }, 80);

  useInput((input) => {
    if (input === 'q') exit();
  });

  const tabs = [
    {
      key: 'feedback',
      label: 'Feedback',
      content: <FeedbackTab progress={progress} />,
    },
    {
      key: 'typography',
      label: 'Typography',
      content: <TypographyTab />,
    },
    {
      key: 'inputs',
      label: 'Inputs',
      content: (
        <InputsTab
          count={count}
          setCount={setCount}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      ),
    },
    {
      key: 'selection',
      label: 'Selection',
      content: (
        <SelectionTab
          selectedFeatures={selectedFeatures}
          setSelectedFeatures={setSelectedFeatures}
          selectedFramework={selectedFramework}
          setSelectedFramework={setSelectedFramework}
        />
      ),
    },
    {
      key: 'theming',
      label: 'Theming',
      content: (
        <ThemingTab
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          setGlobalTheme={setGlobalTheme as never}
          toggleOn={toggleOn}
          setToggleOn={setToggleOn}
        />
      ),
    },
  ];

  return (
    <Box flexDirection="column" gap={1} padding={1}>
      <Box borderStyle="round" borderColor={theme.colors.primary} paddingX={2}>
        <Text bold color={theme.colors.primary}>
          ◆ TermUI v0.2.0 — Phase 2 Demo
        </Text>
        <Text color={theme.colors.mutedForeground}> ←/→ tabs · q quit</Text>
      </Box>

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
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

render(<App />);
