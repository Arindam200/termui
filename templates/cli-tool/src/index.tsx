/**
 * TermUI Template — CLI Tool
 *
 * A complete CLI tool with subcommands, interactive prompts,
 * spinners, progress bars, and colored output.
 *
 * Run: npx tsx src/index.tsx [command]
 * Commands: init | deploy | status | help
 */
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import { ThemeProvider, useTheme, useInterval } from '@termui/core';
import {
  Spinner,
  ProgressBar,
  Alert,
  Badge,
  TextInput,
  Select,
  Confirm,
  Stack,
  Panel,
  Divider,
  StatusMessage,
  KeyValue,
} from '@termui/components';

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = 'menu' | 'init' | 'deploy' | 'status' | 'done';

// ─── Init wizard ─────────────────────────────────────────────────────────────

function InitScreen({ onDone }: { onDone: () => void }) {
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [projectName, setProjectName] = useState('my-project');
  const [runtime, setRuntime] = useState('node');
  const [confirmed, setConfirmed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);

  useInterval(() => {
    if (installing && installProgress < 100) {
      setInstallProgress((p) => Math.min(100, p + 4));
    } else if (installing && installProgress >= 100) {
      setInstalling(false);
      onDone();
    }
  }, 60);

  const runtimeOptions = [
    { value: 'node', label: 'Node.js' },
    { value: 'bun', label: 'Bun' },
    { value: 'deno', label: 'Deno' },
  ];

  if (installing) {
    return (
      <Stack direction="vertical" gap={1}>
        <Text bold color={theme.colors.primary}>Initializing project…</Text>
        <ProgressBar value={installProgress} total={100} label="Installing dependencies" />
        <StatusMessage variant="loading">Setting up {projectName}…</StatusMessage>
      </Stack>
    );
  }

  return (
    <Stack direction="vertical" gap={1}>
      <Text bold color={theme.colors.primary}>◆ New Project Setup</Text>

      {step === 0 && (
        <Panel title="Project Name">
          <TextInput
            value={projectName}
            onChange={setProjectName}
            placeholder="my-project"
            autoFocus
            onSubmit={() => setStep(1)}
          />
          <Text dimColor> Enter to continue</Text>
        </Panel>
      )}

      {step === 1 && (
        <Panel title="Runtime">
          <Select
            options={runtimeOptions}
            value={runtime}
            onChange={(v) => { setRuntime(v); setStep(2); }}
          />
        </Panel>
      )}

      {step === 2 && (
        <Panel title="Confirm">
          <KeyValue items={[
            { key: 'Project', value: projectName },
            { key: 'Runtime', value: runtime },
          ]} />
          <Box marginTop={1}>
            <Confirm
              message="Create project with these settings?"
              onConfirm={() => setInstalling(true)}
              onCancel={() => setStep(0)}
            />
          </Box>
        </Panel>
      )}
    </Stack>
  );
}

// ─── Deploy screen ────────────────────────────────────────────────────────────

const DEPLOY_STEPS = [
  'Building application…',
  'Running tests…',
  'Pushing to registry…',
  'Deploying to production…',
  'Running health checks…',
];

function DeployScreen({ onDone }: { onDone: () => void }) {
  const theme = useTheme();
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);

  useInterval(() => {
    if (stepIndex < DEPLOY_STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    } else if (!done) {
      setDone(true);
      setTimeout(onDone, 1500);
    }
  }, 900);

  return (
    <Stack direction="vertical" gap={1}>
      <Text bold color={theme.colors.primary}>◆ Deploying</Text>
      {DEPLOY_STEPS.map((step, i) => {
        const isPast = i < stepIndex;
        const isCurrent = i === stepIndex;
        return (
          <Box key={step} gap={1}>
            {isPast && <Text color={theme.colors.success}>✓</Text>}
            {isCurrent && !done && <Spinner style="dots" />}
            {isCurrent && done && <Text color={theme.colors.success}>✓</Text>}
            {i > stepIndex && <Text dimColor>○</Text>}
            <Text color={isPast || (isCurrent && done) ? theme.colors.success : isCurrent ? theme.colors.foreground : theme.colors.mutedForeground}>
              {step}
            </Text>
          </Box>
        );
      })}
      {done && (
        <Alert variant="success" title="Deployed!">
          Your app is live at https://my-project.example.com
        </Alert>
      )}
    </Stack>
  );
}

// ─── Status screen ────────────────────────────────────────────────────────────

function StatusScreen() {
  const theme = useTheme();
  return (
    <Stack direction="vertical" gap={1}>
      <Text bold color={theme.colors.primary}>◆ Status</Text>
      <Panel title="Services">
        <Stack direction="vertical" gap={0}>
          <Box gap={2}>
            <Badge variant="success">●</Badge>
            <Text>API Server</Text>
            <Text dimColor>port 3000 · 99.9% uptime</Text>
          </Box>
          <Box gap={2}>
            <Badge variant="success">●</Badge>
            <Text>Database</Text>
            <Text dimColor>PostgreSQL · 2.3ms avg</Text>
          </Box>
          <Box gap={2}>
            <Badge variant="warning">●</Badge>
            <Text>Cache</Text>
            <Text dimColor>Redis · high memory</Text>
          </Box>
          <Box gap={2}>
            <Badge variant="error">●</Badge>
            <Text>Worker</Text>
            <Text dimColor>offline · restarting</Text>
          </Box>
        </Stack>
      </Panel>
      <KeyValue items={[
        { key: 'Version', value: 'v1.4.2' },
        { key: 'Region', value: 'us-east-1' },
        { key: 'Build', value: '#1042' },
        { key: 'Last deploy', value: '2 hours ago' },
      ]} />
    </Stack>
  );
}

// ─── Main menu ────────────────────────────────────────────────────────────────

function MainMenu({ onSelect }: { onSelect: (s: Screen) => void }) {
  const theme = useTheme();
  const options = [
    { value: 'init', label: 'init     — Create a new project' },
    { value: 'deploy', label: 'deploy   — Deploy to production' },
    { value: 'status', label: 'status   — Show service status' },
  ];
  return (
    <Stack direction="vertical" gap={1}>
      <Text bold color={theme.colors.primary}>◆ my-cli  <Text dimColor>v1.0.0</Text></Text>
      <Divider />
      <Select
        options={options}
        value="init"
        onChange={(v) => onSelect(v as Screen)}
        label="Select a command"
      />
      <Text dimColor>↑↓ navigate  Enter select  q quit</Text>
    </Stack>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

function App() {
  const theme = useTheme();
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>('menu');

  useInput((_i, key) => {
    if (key.escape || _i === 'q') exit();
  });

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      {screen === 'menu' && <MainMenu onSelect={setScreen} />}
      {screen === 'init' && <InitScreen onDone={() => setScreen('done')} />}
      {screen === 'deploy' && <DeployScreen onDone={() => setScreen('done')} />}
      {screen === 'status' && <StatusScreen />}
      {screen === 'done' && (
        <Stack direction="vertical" gap={1}>
          <Alert variant="success" title="Done!">Command completed successfully.</Alert>
          <Text dimColor>Press q to quit or any key to return to menu.</Text>
        </Stack>
      )}
    </Box>
  );
}

render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
