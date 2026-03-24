# CLI Patterns — Full Working Code

Copy-adapt these patterns. Each is a complete, runnable screen.

---

## Pattern 1 — Data Browser

**Use when:** displaying a searchable, selectable list of items (packages, files, PRs, containers, etc.)

```
npx termui add app-shell search-input table alert spinner
```

```tsx
// src/screens/BrowserScreen.tsx
import React, { useState, useMemo } from 'react';
import { Text } from 'ink';
import { useInput, useAsync, useTheme } from 'termui/core';
import { AppShell } from '../components/templates/AppShell.js';
import { Table } from '../components/data/Table.js';
import { SearchInput } from '../components/input/SearchInput.js';
import { Spinner } from '../components/feedback/Spinner.js';
import { Alert } from '../components/feedback/Alert.js';

interface Item {
  id: string;
  name: string;
  status: string;
  updated: string;
}

interface BrowserScreenProps {
  onSelect: (item: Item) => void;
}

export function BrowserScreen({ onSelect }: BrowserScreenProps) {
  const theme = useTheme();
  const [query, setQuery] = useState('');

  const {
    data: items,
    loading,
    error,
  } = useAsync<Item[]>(async () => {
    // Replace with your real data fetching
    return fetchItems();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(
      (i) => i.name.toLowerCase().includes(q) || i.status.toLowerCase().includes(q)
    );
  }, [items, query]);

  useInput((input, key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) process.exit(0);
  });

  return (
    <AppShell>
      <AppShell.Header>
        <Text bold color={theme.colors.primary}>
          ◆ My Browser
        </Text>
        <SearchInput value={query} onChange={setQuery} placeholder="Filter…" />
      </AppShell.Header>
      <AppShell.Content height={20}>
        {loading && <Spinner label="Loading…" />}
        {error && (
          <Alert variant="error" title="Error">
            {String(error)}
          </Alert>
        )}
        {!loading && !error && (
          <Table
            data={filtered}
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'status', header: 'Status', width: 12 },
              { key: 'updated', header: 'Updated', width: 16, align: 'right' },
            ]}
            selectable
            onSelect={onSelect}
            maxRows={18}
          />
        )}
      </AppShell.Content>
      <AppShell.Hints items={['↑↓ navigate', 'Enter select', 'q quit']} />
    </AppShell>
  );
}
```

---

## Pattern 2 — Setup Wizard

**Use when:** onboarding, project init, guided configuration (like `npx create-*` tools)

```
npx termui add setup-flow text-input select multi-select spinner
```

```tsx
// src/app.tsx
import React, { useState } from 'react';
import { Text } from 'ink';
import { useInput, useTheme } from 'termui/core';
import { SetupFlow } from '../components/templates/SetupFlow.js';
import { TextInput } from '../components/input/TextInput.js';
import { Select } from '../components/selection/Select.js';
import { MultiSelect } from '../components/selection/MultiSelect.js';

type Step = 'name' | 'framework' | 'features' | 'installing' | 'done';

export function App() {
  const theme = useTheme();
  const [step, setStep] = useState<Step>('name');
  const [config, setConfig] = useState({ name: '', framework: '', features: [] as string[] });

  useInput((input, key) => {
    if (key.ctrl && input === 'c') process.exit(0);
  });

  const isComplete = (s: Step) => {
    const order: Step[] = ['name', 'framework', 'features', 'installing', 'done'];
    return order.indexOf(s) < order.indexOf(step);
  };

  return (
    <SetupFlow title="SETUP" titleColor={theme.colors.primary}>
      <SetupFlow.Badge label="v1.0" bg="cyan" color="black" />

      {/* Step 1 */}
      <SetupFlow.Step status={isComplete('name') ? 'done' : step === 'name' ? 'active' : 'pending'}>
        {step === 'name' ? (
          <TextInput
            label="Project name"
            placeholder="my-app"
            autoFocus
            onSubmit={(name) => {
              setConfig((c) => ({ ...c, name }));
              setStep('framework');
            }}
          />
        ) : (
          <Text>
            Project name: <Text bold>{config.name}</Text>
          </Text>
        )}
      </SetupFlow.Step>

      {/* Step 2 */}
      {(step === 'framework' || isComplete('framework')) && (
        <SetupFlow.Step status={isComplete('framework') ? 'done' : 'active'}>
          {step === 'framework' ? (
            <Select
              label="Framework"
              options={[
                { value: 'react', label: 'React' },
                { value: 'vue', label: 'Vue' },
                { value: 'svelte', label: 'Svelte' },
              ]}
              onSubmit={(framework) => {
                setConfig((c) => ({ ...c, framework }));
                setStep('features');
              }}
            />
          ) : (
            <Text>
              Framework: <Text bold>{config.framework}</Text>
            </Text>
          )}
        </SetupFlow.Step>
      )}

      {/* Step 3 */}
      {(step === 'features' || isComplete('features')) && (
        <SetupFlow.Step status={isComplete('features') ? 'done' : 'active'}>
          {step === 'features' ? (
            <SetupFlow.MultiSelect
              label="Features"
              hint="space to toggle, enter to confirm"
              options={[
                { value: 'ts', label: 'TypeScript', description: 'recommended' },
                { value: 'lint', label: 'ESLint' },
                { value: 'test', label: 'Testing' },
              ]}
              onSubmit={(features) => {
                setConfig((c) => ({ ...c, features }));
                setStep('installing');
                // Simulate install
                setTimeout(() => setStep('done'), 2000);
              }}
            />
          ) : (
            <Text>
              Features: <Text bold>{config.features.join(', ')}</Text>
            </Text>
          )}
        </SetupFlow.Step>
      )}

      {/* Step 4 — async work */}
      {(step === 'installing' || step === 'done') && (
        <SetupFlow.Step status={step === 'done' ? 'success' : 'active'}>
          {step === 'installing' ? (
            <SetupFlow.Spinner label="Installing packages…" />
          ) : (
            <Text color="green">
              ✓ Done! Run <Text bold>cd {config.name} && npm run dev</Text>
            </Text>
          )}
        </SetupFlow.Step>
      )}
    </SetupFlow>
  );
}
```

---

## Pattern 3 — Dashboard / Monitor

**Use when:** real-time metrics, logs, system stats, deployment status

```
npx termui add app-shell tabs bar-chart gauge sparkline spinner status-message
```

```tsx
// src/app.tsx
import React, { useState } from 'react';
import { Text, Box } from 'ink';
import { useInput, useInterval, useTheme } from 'termui/core';
import { AppShell } from '../components/templates/AppShell.js';
import { Tabs } from '../components/navigation/Tabs.js';
import { BarChart } from '../components/charts/BarChart.js';
import { Gauge } from '../components/charts/Gauge.js';
import { Sparkline } from '../components/charts/Sparkline.js';
import { StatusMessage } from '../components/feedback/StatusMessage.js';

interface Metrics {
  cpu: number;
  memory: number;
  cpuHistory: number[];
  requests: Array<{ label: string; value: number }>;
}

function readMetrics(): Metrics {
  // Replace with your real metrics
  const cpu = Math.round(Math.random() * 100);
  return {
    cpu,
    memory: Math.round(Math.random() * 100),
    cpuHistory: Array.from({ length: 20 }, () => Math.round(Math.random() * 100)),
    requests: ['GET', 'POST', 'PUT', 'DELETE'].map((m) => ({
      label: m,
      value: Math.round(Math.random() * 500),
    })),
  };
}

export function App() {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<Metrics>(readMetrics);

  useInterval(() => setMetrics(readMetrics()), 2000);

  useInput((input, key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) process.exit(0);
  });

  const OverviewTab = (
    <Box flexDirection="column" gap={1}>
      <Box gap={4}>
        <Gauge
          value={metrics.cpu}
          label="CPU"
          unit="%"
          warningThreshold={75}
          dangerThreshold={90}
        />
        <Gauge
          value={metrics.memory}
          label="Memory"
          unit="%"
          warningThreshold={80}
          dangerThreshold={95}
        />
      </Box>
      <Text dimColor>CPU history (last 20s):</Text>
      <Sparkline data={metrics.cpuHistory} width={40} color={theme.colors.primary} />
      <StatusMessage variant={metrics.cpu > 80 ? 'error' : 'success'}>
        {metrics.cpu > 80 ? 'High CPU usage detected' : 'All systems nominal'}
      </StatusMessage>
    </Box>
  );

  const RequestsTab = (
    <BarChart
      data={metrics.requests}
      title="Requests per method"
      orientation="horizontal"
      color={theme.colors.accent}
      showValues
    />
  );

  return (
    <AppShell>
      <AppShell.Header>
        <Text bold color={theme.colors.primary}>
          ◆ ✦ DASHBOARD ✦ ◆
        </Text>
        <Text dimColor>Refreshes every 2s</Text>
      </AppShell.Header>
      <AppShell.Content height={22}>
        <Tabs
          tabs={[
            { key: 'overview', label: 'Overview', content: OverviewTab },
            { key: 'requests', label: 'Requests', content: RequestsTab },
          ]}
        />
      </AppShell.Content>
      <AppShell.Hints items={['← → switch tabs', 'q quit']} />
    </AppShell>
  );
}
```

---

## Pattern 4 — CRUD Manager

**Use when:** managing resources (containers, configs, users, deployments) with create/edit/delete

```
npx termui add app-shell table form form-field text-input select confirm modal alert
```

```tsx
// src/app.tsx
import React, { useState } from 'react';
import { Text } from 'ink';
import { useInput, useTheme } from 'termui/core';
import { AppShell } from '../components/templates/AppShell.js';
import { Table } from '../components/data/Table.js';
import { Form } from '../components/forms/Form.js';
import { FormField } from '../components/forms/FormField.js';
import { TextInput } from '../components/input/TextInput.js';
import { Select } from '../components/selection/Select.js';
import { Confirm } from '../components/forms/Confirm.js';
import { Alert } from '../components/feedback/Alert.js';

interface Resource {
  id: string;
  name: string;
  env: string;
  status: string;
}

type View = 'list' | 'create' | 'confirm-delete';

export function App() {
  const theme = useTheme();
  const [view, setView] = useState<View>('list');
  const [resources, setResources] = useState<Resource[]>([
    { id: '1', name: 'api-prod', env: 'production', status: 'running' },
    { id: '2', name: 'api-staging', env: 'staging', status: 'stopped' },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useInput((input, key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) process.exit(0);
    if (key.escape && view !== 'list') setView('list');
    if (input === 'n' && view === 'list') setView('create');
    if (input === 'd' && view === 'list' && selectedId) setView('confirm-delete');
  });

  const handleCreate = (values: Record<string, unknown>) => {
    const newResource: Resource = {
      id: Date.now().toString(),
      name: values['name'] as string,
      env: values['env'] as string,
      status: 'stopped',
    };
    setResources((r) => [...r, newResource]);
    setFlash({ type: 'success', msg: `Created ${newResource.name}` });
    setTimeout(() => setFlash(null), 3000);
    setView('list');
  };

  const handleDelete = () => {
    setResources((r) => r.filter((x) => x.id !== selectedId));
    setFlash({ type: 'success', msg: 'Resource deleted' });
    setTimeout(() => setFlash(null), 3000);
    setSelectedId(null);
    setView('list');
  };

  if (view === 'create') {
    return (
      <AppShell>
        <AppShell.Header>
          <Text bold color={theme.colors.primary}>
            New Resource
          </Text>
        </AppShell.Header>
        <AppShell.Content>
          <Form
            onSubmit={handleCreate}
            fields={[{ name: 'name', validate: (v) => (v ? null : 'Required') }]}
          >
            <FormField name="name" label="Name">
              <TextInput autoFocus />
            </FormField>
            <FormField name="env" label="Environment">
              <Select
                options={[
                  { value: 'production', label: 'Production' },
                  { value: 'staging', label: 'Staging' },
                  { value: 'dev', label: 'Development' },
                ]}
              />
            </FormField>
          </Form>
        </AppShell.Content>
        <AppShell.Hints items={['Ctrl+S submit', 'Esc cancel']} />
      </AppShell>
    );
  }

  if (view === 'confirm-delete') {
    const target = resources.find((r) => r.id === selectedId);
    return (
      <Confirm
        message={`Delete "${target?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setView('list')}
        destructive
      />
    );
  }

  return (
    <AppShell>
      <AppShell.Header>
        <Text bold color={theme.colors.primary}>
          ◆ Resource Manager
        </Text>
      </AppShell.Header>
      <AppShell.Content height={20}>
        {flash && (
          <Alert variant={flash.type} title={flash.type === 'success' ? 'Done' : 'Error'}>
            {flash.msg}
          </Alert>
        )}
        <Table
          data={resources}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'env', header: 'Environment', width: 14 },
            { key: 'status', header: 'Status', width: 10 },
          ]}
          selectable
          onSelect={(row) => setSelectedId(row.id)}
          sortable
        />
      </AppShell.Content>
      <AppShell.Hints items={['↑↓ navigate', 'n new', 'd delete', 'q quit']} />
    </AppShell>
  );
}
```

---

## Pattern 5 — Auth / Login Flow

**Use when:** the CLI needs credentials, tokens, or account setup before the main UI

```
npx termui add login-flow text-input password-input setup-flow spinner alert
```

```tsx
// src/screens/AuthScreen.tsx
import React, { useState } from 'react';
import { useTheme } from 'termui/core';
import { LoginFlow } from '../components/templates/LoginFlow.js';
import { SetupFlow } from '../components/templates/SetupFlow.js';
import { TextInput } from '../components/input/TextInput.js';
import { PasswordInput } from '../components/input/PasswordInput.js';
import { Alert } from '../components/feedback/Alert.js';

type AuthStep = 'method' | 'credentials' | 'verifying' | 'done' | 'error';

interface AuthScreenProps {
  onAuthenticated: (token: string) => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const theme = useTheme();
  const [step, setStep] = useState<AuthStep>('method');
  const [method, setMethod] = useState<'token' | 'login'>('token');
  const [error, setError] = useState<string | null>(null);

  const handleMethod = (val: 'token' | 'login') => {
    setMethod(val);
    setStep('credentials');
  };

  const handleSubmit = async (token: string) => {
    setStep('verifying');
    try {
      // Replace with your real auth
      await verifyToken(token);
      setStep('done');
      setTimeout(() => onAuthenticated(token), 500);
    } catch {
      setStep('error');
      setError('Invalid token. Check your credentials and try again.');
    }
  };

  if (step === 'method') {
    return (
      <LoginFlow
        title="MYAPP"
        announcement={{ icon: '◆', message: 'Connect to your account to continue' }}
        description={['Choose how you'd like to authenticate.']}
        options={[
          { value: 'token', label: 'Use API token' },
          { value: 'login', label: 'Email + password' },
        ]}
        onSelect={handleMethod as (v: string) => void}
      />
    );
  }

  return (
    <SetupFlow title="AUTH" titleColor={theme.colors.primary}>
      {step === 'error' && (
        <Alert variant="error" title="Authentication failed">{error}</Alert>
      )}
      {step === 'credentials' && method === 'token' && (
        <SetupFlow.Step status="active">
          <PasswordInput
            label="API token"
            placeholder="sk-…"
            autoFocus
            onSubmit={handleSubmit}
          />
        </SetupFlow.Step>
      )}
      {step === 'credentials' && method === 'login' && (
        <>
          <SetupFlow.Step status="active">
            <TextInput label="Email" placeholder="you@example.com" autoFocus onSubmit={() => {}} />
          </SetupFlow.Step>
          <SetupFlow.Step status="pending">
            <PasswordInput label="Password" onSubmit={handleSubmit} />
          </SetupFlow.Step>
        </>
      )}
      {step === 'verifying' && (
        <SetupFlow.Spinner label="Verifying credentials…" />
      )}
      {step === 'done' && (
        <SetupFlow.Step status="success">Authenticated successfully!</SetupFlow.Step>
      )}
    </SetupFlow>
  );
}
```

---

## Pattern 6 — Log Viewer / Event Feed

**Use when:** streaming CLI output, deployment logs, event history, audit trails

```
npx termui add app-shell log status-message badge spinner
```

```tsx
// src/screens/LogScreen.tsx
import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import { useInput, useTheme } from 'termui/core';
import { AppShell } from '../components/templates/AppShell.js';
import { Log } from '../components/utility/Log.js';
import { StatusMessage } from '../components/feedback/StatusMessage.js';
import { Badge } from '../components/typography/Badge.js';
import { Spinner } from '../components/feedback/Spinner.js';

interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: Date;
}

interface LogScreenProps {
  onBack: () => void;
  source: string; // e.g., "api-prod"
}

export function LogScreen({ onBack, source }: LogScreenProps) {
  const theme = useTheme();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [streaming, setStreaming] = useState(true);
  const [filter, setFilter] = useState<LogEntry['level'] | 'all'>('all');

  useEffect(() => {
    // Replace with your real log stream
    const stream = streamLogs(source);
    stream.on('data', (entry: LogEntry) => setEntries((e) => [...e.slice(-200), entry]));
    stream.on('end', () => setStreaming(false));
    return () => stream.destroy();
  }, [source]);

  useInput((input, key) => {
    if (key.escape) onBack();
    if (input === 'q' || (key.ctrl && input === 'c')) process.exit(0);
    if (input === '1') setFilter('info');
    if (input === '2') setFilter('warn');
    if (input === '3') setFilter('error');
    if (input === '0') setFilter('all');
  });

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.level === filter);

  return (
    <AppShell>
      <AppShell.Header>
        <Box gap={2}>
          <Text bold color={theme.colors.primary}>
            Logs: {source}
          </Text>
          {streaming ? (
            <Spinner style="dots" label="streaming" fps={8} />
          ) : (
            <StatusMessage variant="info">Stream ended</StatusMessage>
          )}
          <Badge variant={filter === 'all' ? 'default' : 'info'}>
            {filter === 'all' ? 'all levels' : filter}
          </Badge>
        </Box>
      </AppShell.Header>
      <AppShell.Content height={22}>
        <Log entries={filtered} maxLines={200} showTimestamps showLevel />
      </AppShell.Content>
      <AppShell.Hints items={['0 all  1 info  2 warn  3 error', 'Esc back', 'q quit']} />
    </AppShell>
  );
}
```

---

## Combining patterns

Real CLIs usually combine two or three patterns. A common structure:

```
Auth flow (Pattern 5)
  ↓ authenticated
App root with Tabs or sidebar navigation
  ├── Tab 1: Data Browser (Pattern 1)
  ├── Tab 2: Dashboard (Pattern 3)
  └── Tab 3: Settings via CRUD (Pattern 4)
```

Wire them together in `src/app.tsx` using a `screen` state variable (see the CRUD pattern for an example of state-driven screen routing).
