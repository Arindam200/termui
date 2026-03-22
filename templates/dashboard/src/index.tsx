/**
 * TermUI Template — Dashboard
 *
 * Real-time monitoring dashboard with charts, KPI cards,
 * tables, and auto-refreshing metrics.
 *
 * Run: npx tsx src/index.tsx
 */
import React, { useState } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import { ThemeProvider, useTheme, useInterval } from '@termui/core';
import {
  Spinner,
  ProgressBar,
  Badge,
  Panel,
  Stack,
  Divider,
  Table,
  KeyValue,
  Tabs,
  StatusMessage,
} from '@termui/components';

// ─── Fake data generators ─────────────────────────────────────────────────────

function randBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSparkline(len = 20): number[] {
  const data: number[] = [];
  let v = 50;
  for (let i = 0; i < len; i++) {
    v = Math.max(0, Math.min(100, v + randBetween(-8, 8)));
    data.push(v);
  }
  return data;
}

// ─── ASCII sparkline (inline, no chart component needed) ──────────────────────

const BRAILLE_DOTS = ['⣀', '⣄', '⣤', '⣦', '⣶', '⣷', '⣿'];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const chars = data.map((v) => {
    const idx = Math.round((v / max) * (BRAILLE_DOTS.length - 1));
    return BRAILLE_DOTS[idx] ?? BRAILLE_DOTS[0]!;
  });
  return <Text color={color}>{chars.join('')}</Text>;
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  unit,
  trend,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'flat';
  color: string;
}) {
  const theme = useTheme();
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor =
    trend === 'up'
      ? theme.colors.success
      : trend === 'down'
        ? theme.colors.error
        : theme.colors.warning;
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.colors.border}
      paddingX={2}
      paddingY={1}
      minWidth={18}
    >
      <Text dimColor>{label}</Text>
      <Box gap={1} alignItems="flex-end">
        <Text bold color={color}>
          {value}
        </Text>
        <Text dimColor>{unit}</Text>
      </Box>
      <Text color={trendColor}>
        {arrow} {trend}
      </Text>
    </Box>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ metrics }: { metrics: ReturnType<typeof useMetrics> }) {
  const theme = useTheme();
  return (
    <Stack direction="vertical" gap={1}>
      <Box gap={2}>
        <KpiCard
          label="CPU"
          value={metrics.cpu}
          unit="%"
          trend={metrics.cpu > 70 ? 'up' : 'down'}
          color={metrics.cpu > 70 ? theme.colors.error : theme.colors.success}
        />
        <KpiCard
          label="Memory"
          value={metrics.memory}
          unit="%"
          trend="flat"
          color={theme.colors.warning}
        />
        <KpiCard
          label="Requests/s"
          value={metrics.rps}
          unit="rps"
          trend="up"
          color={theme.colors.info}
        />
        <KpiCard
          label="Errors"
          value={metrics.errors}
          unit="/min"
          trend={metrics.errors > 5 ? 'up' : 'down'}
          color={metrics.errors > 5 ? theme.colors.error : theme.colors.success}
        />
      </Box>

      <Box gap={2}>
        <Panel title="CPU  (1m)" flexGrow={1}>
          <Sparkline data={metrics.cpuHistory} color={theme.colors.primary} />
          <ProgressBar
            value={metrics.cpu}
            total={100}
            color={metrics.cpu > 80 ? theme.colors.error : theme.colors.primary}
          />
        </Panel>
        <Panel title="Memory  (1m)" flexGrow={1}>
          <Sparkline data={metrics.memHistory} color={theme.colors.accent} />
          <ProgressBar value={metrics.memory} total={100} color={theme.colors.accent} />
        </Panel>
      </Box>

      <Panel title="Services">
        <Stack direction="vertical" gap={0}>
          {metrics.services.map((s) => (
            <Box key={s.name} gap={2}>
              <Badge
                variant={
                  s.status === 'up' ? 'success' : s.status === 'degraded' ? 'warning' : 'error'
                }
              >
                {s.status === 'up' ? '●' : s.status === 'degraded' ? '◐' : '○'}
              </Badge>
              <Text>{s.name.padEnd(16)}</Text>
              <Text dimColor>{s.latency}ms</Text>
            </Box>
          ))}
        </Stack>
      </Panel>
    </Stack>
  );
}

// ─── Requests tab ─────────────────────────────────────────────────────────────

function RequestsTab({ metrics }: { metrics: ReturnType<typeof useMetrics> }) {
  const columns = [
    { key: 'method', header: 'Method', width: 8 },
    { key: 'path', header: 'Path', width: 28 },
    { key: 'status', header: 'Status', width: 8 },
    { key: 'latency', header: 'Latency', width: 10 },
    { key: 'count', header: 'Count', width: 8 },
  ];
  return (
    <Stack direction="vertical" gap={1}>
      <Panel title={`Top Endpoints  (${metrics.rps} req/s)`}>
        <Table columns={columns} data={metrics.endpoints} />
      </Panel>
    </Stack>
  );
}

// ─── Logs tab ─────────────────────────────────────────────────────────────────

function LogsTab({ logs }: { logs: Array<{ level: string; msg: string; time: string }> }) {
  const theme = useTheme();
  const levelColor: Record<string, string> = {
    info: theme.colors.info,
    warn: theme.colors.warning,
    error: theme.colors.error,
    debug: theme.colors.mutedForeground,
  };
  return (
    <Panel title="Recent Logs" height={16}>
      <Stack direction="vertical" gap={0}>
        {logs.slice(-14).map((log, i) => (
          <Box key={i} gap={1}>
            <Text dimColor>{log.time}</Text>
            <Text color={levelColor[log.level] ?? theme.colors.foreground} bold>
              [{log.level.toUpperCase().padEnd(5)}]
            </Text>
            <Text>{log.msg}</Text>
          </Box>
        ))}
      </Stack>
    </Panel>
  );
}

// ─── Metrics hook ─────────────────────────────────────────────────────────────

function useMetrics() {
  const [cpu, setCpu] = useState(42);
  const [memory, setMemory] = useState(67);
  const [rps, setRps] = useState(248);
  const [errors, setErrors] = useState(2);
  const [cpuHistory, setCpuHistory] = useState(() => generateSparkline());
  const [memHistory, setMemHistory] = useState(() => generateSparkline());
  const [tick, setTick] = useState(0);

  const services = [
    { name: 'API Gateway', status: 'up' as const, latency: randBetween(1, 5) + tick * 0 },
    { name: 'Auth Service', status: 'up' as const, latency: randBetween(2, 8) + tick * 0 },
    { name: 'Database', status: 'degraded' as const, latency: randBetween(20, 80) + tick * 0 },
    { name: 'Cache (Redis)', status: 'up' as const, latency: randBetween(1, 3) + tick * 0 },
    { name: 'Queue Worker', status: 'down' as const, latency: 0 },
  ];

  const endpoints = [
    {
      method: 'GET',
      path: '/api/users',
      status: '200',
      latency: `${randBetween(8, 20) + tick * 0}ms`,
      count: `${randBetween(900, 1200) + tick * 0}`,
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      status: '200',
      latency: `${randBetween(20, 60)}ms`,
      count: `${randBetween(100, 300)}`,
    },
    {
      method: 'GET',
      path: '/api/products',
      status: '200',
      latency: `${randBetween(15, 35)}ms`,
      count: `${randBetween(400, 700)}`,
    },
    {
      method: 'DELETE',
      path: '/api/sessions/:id',
      status: '204',
      latency: `${randBetween(5, 15)}ms`,
      count: `${randBetween(50, 120)}`,
    },
    {
      method: 'GET',
      path: '/api/metrics',
      status: '500',
      latency: `${randBetween(100, 300)}ms`,
      count: `${randBetween(1, 10)}`,
    },
  ];

  useInterval(() => {
    const newCpu = Math.max(5, Math.min(95, cpu + randBetween(-5, 5)));
    setCpu(newCpu);
    setCpuHistory((h) => [...h.slice(1), newCpu]);
    const newMem = Math.max(20, Math.min(95, memory + randBetween(-2, 2)));
    setMemory(newMem);
    setMemHistory((h) => [...h.slice(1), newMem]);
    setRps(Math.max(0, rps + randBetween(-20, 20)));
    setErrors(Math.max(0, errors + randBetween(-1, 1)));
    setTick((t) => t + 1);
  }, 1500);

  return { cpu, memory, rps, errors, cpuHistory, memHistory, services, endpoints };
}

function useLogs() {
  const [logs, setLogs] = useState<Array<{ level: string; msg: string; time: string }>>([
    { level: 'info', msg: 'Server started on :3000', time: '12:00:01' },
    { level: 'info', msg: 'Connected to PostgreSQL', time: '12:00:02' },
    { level: 'warn', msg: 'Redis connection slow (>100ms)', time: '12:00:05' },
    { level: 'info', msg: 'GET /api/users 200 12ms', time: '12:00:10' },
    { level: 'error', msg: 'Worker process crashed (SIGKILL)', time: '12:00:14' },
  ]);

  const LOG_MESSAGES = [
    { level: 'info', msg: 'GET /api/users 200 12ms' },
    { level: 'info', msg: 'POST /api/auth/login 200 38ms' },
    { level: 'warn', msg: 'Slow query detected (>500ms)' },
    { level: 'debug', msg: 'Cache hit ratio: 94.2%' },
    { level: 'error', msg: 'Failed to connect to worker' },
    { level: 'info', msg: 'Health check passed' },
    { level: 'info', msg: 'GET /api/metrics 200 5ms' },
    { level: 'warn', msg: 'Memory usage above 80%' },
  ];

  useInterval(() => {
    const entry = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)]!;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setLogs((prev) => [...prev.slice(-50), { ...entry, time }]);
  }, 800);

  return logs;
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function Dashboard() {
  const theme = useTheme();
  const { exit } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const metrics = useMetrics();
  const logs = useLogs();

  useInput((_i, key) => {
    if (key.escape || _i === 'q') exit();
  });

  const tabs = [
    { key: 'overview', label: 'Overview', content: <OverviewTab metrics={metrics} /> },
    { key: 'requests', label: 'Requests', content: <RequestsTab metrics={metrics} /> },
    { key: 'logs', label: 'Logs', content: <LogsTab logs={logs} /> },
  ];

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Box justifyContent="space-between">
        <Text bold color={theme.colors.primary}>
          ◆ Dashboard <Text dimColor>auto-refresh 1.5s</Text>
        </Text>
        <Box gap={1}>
          <Spinner style="dots" />
          <Text dimColor>live · q quit</Text>
        </Box>
      </Box>
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
    </Box>
  );
}

render(
  <ThemeProvider>
    <Dashboard />
  </ThemeProvider>
);
