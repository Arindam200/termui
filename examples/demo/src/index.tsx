/**
 * TermUI Phase 1 Demo
 * Tests: ThemeProvider, Spinner, ProgressBar, Alert, Badge, Select, Panel
 */
import React, { useState } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import { ThemeProvider, useTheme, useThemeUpdater, useInterval } from '@termui/core';
import {
  Spinner,
  ProgressBar,
  Alert,
  Badge,
  Select,
  Panel,
  Toggle,
  Tabs,
  Stack,
} from '@termui/components';
import { draculaTheme, nordTheme, defaultTheme } from '@termui/core';

const THEMES = [
  { value: 'default', label: 'Default (purple)', theme: defaultTheme },
  { value: 'dracula', label: 'Dracula', theme: draculaTheme },
  { value: 'nord', label: 'Nord', theme: nordTheme },
];

function Demo() {
  const theme = useTheme();
  const setGlobalTheme = useThemeUpdater();
  const { exit } = useApp();
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [toggleOn, setToggleOn] = useState(false);
  const [activeTab, setActiveTab] = useState('components');
  const [progress, setProgress] = useState(0);

  useInterval(() => {
    setProgress((p) => (p >= 100 ? 0 : p + 1));
  }, 80);

  const progressLabel =
    progress < 34 ? 'Installing packages…' :
    progress < 67 ? 'Compiling sources…' :
                    'Building artifacts…';

  useInput((input) => {
    if (input === 'q') exit();
  });

  return (
    <Box flexDirection="column" gap={1} padding={1}>
      {/* Header */}
      <Box borderStyle="round" borderColor={theme.colors.primary} paddingX={2}>
        <Text bold color={theme.colors.primary}>
          ◆ TermUI v0.1.0 — Phase 1 Demo
        </Text>
        <Text color={theme.colors.mutedForeground}> (press q to quit)</Text>
      </Box>

      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          {
            key: 'components',
            label: 'Components',
            content: (
              <Stack direction="vertical" gap={1}>
                {/* Spinners */}
                <Panel title="Spinners" borderColor={theme.colors.border}>
                  <Box gap={3}>
                    <Spinner style="dots" label="dots" />
                    <Spinner style="line" label="line" />
                    <Spinner style="arc" label="arc" />
                    <Spinner style="star" label="star" />
                    <Spinner style="bounce" label="bounce" />
                    <Spinner style="earth" label="earth" fps={3} />
                  </Box>
                </Panel>

                {/* Progress */}
                <Panel title="Progress Bar">
                  <ProgressBar value={progress} total={100} label={progressLabel} color={
                    progress < 34 ? theme.colors.info :
                    progress < 67 ? theme.colors.warning :
                                    theme.colors.success
                  } />
                </Panel>

                {/* Alerts */}
                <Panel title="Alerts">
                  <Stack direction="vertical" gap={1}>
                    <Alert variant="success" title="Build complete">All 26 tests pass.</Alert>
                    <Alert variant="error" title="Error">Could not connect to registry.</Alert>
                    <Alert variant="warning" title="Warning">Node.js 16 is deprecated.</Alert>
                    <Alert variant="info" title="Info">TermUI v0.2.0 is available.</Alert>
                  </Stack>
                </Panel>

                {/* Badges */}
                <Panel title="Badges">
                  <Box gap={2}>
                    <Badge variant="default">v0.1.0</Badge>
                    <Badge variant="success">stable</Badge>
                    <Badge variant="warning">beta</Badge>
                    <Badge variant="error">deprecated</Badge>
                    <Badge variant="info">new</Badge>
                  </Box>
                </Panel>
              </Stack>
            ),
          },
          {
            key: 'theming',
            label: 'Theming',
            content: (
              <Stack direction="vertical" gap={1}>
                <Panel title="Select Theme">
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
                <Panel title="Toggle">
                  <Toggle
                    checked={toggleOn}
                    onChange={setToggleOn}
                    label="Dark mode"
                  />
                </Panel>
                <Text color={theme.colors.mutedForeground} dimColor>
                  Active theme: {theme.name}
                </Text>
              </Stack>
            ),
          },
        ]}
      />
    </Box>
  );
}

// Listen for q to exit
function App() {
  return (
    <ThemeProvider>
      <Demo />
    </ThemeProvider>
  );
}

render(<App />);
