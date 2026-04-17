import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';
import { printLogo, intro, step, done, outro, hi, select, confirm } from '../utils/ui.js';

type Template =
  | 'minimal'
  | 'cli'
  | 'dashboard'
  | 'wizard'
  | 'ai-assistant'
  | 'coding-agent';

const TEMPLATES: Array<{ value: Template; label: string; hint: string }> = [
  { value: 'minimal', label: 'Minimal', hint: 'Hello World with Text + Spinner' },
  { value: 'cli', label: 'CLI', hint: 'multi-command CLI with add/remove/list' },
  { value: 'dashboard', label: 'Dashboard', hint: 'Tabs + Table + ProgressBar layout' },
  { value: 'wizard', label: 'Wizard', hint: 'multi-step prompt flow with clack' },
  { value: 'ai-assistant', label: 'AI Assistant', hint: 'streaming AI chat CLI with termui/ai' },
  {
    value: 'coding-agent',
    label: 'Coding Agent',
    hint: 'Claude-Code-style terminal agent UI powered by the OpenAI SDK',
  },
];

export async function create(args: string[]): Promise<void> {
  const projectName = args[0];

  printLogo();
  intro('create-termui');

  if (!projectName) {
    console.error(`\x1b[31mError:\x1b[0m Please specify a project name.`);
    console.error(`  Example: \x1b[36mnpx termui create my-app\x1b[0m\n`);
    process.exit(1);
  }

  const projectDir = join(process.cwd(), projectName);

  if (existsSync(projectDir)) {
    const overwrite = await confirm(
      `Directory ${hi(projectName)} already exists. Continue?`,
      false
    );
    if (!overwrite) {
      outro('Cancelled.');
      return;
    }
  }

  const templateFlagIdx = args.indexOf('--template');
  const templateFlag =
    templateFlagIdx !== -1 && TEMPLATES.some((t) => t.value === args[templateFlagIdx + 1])
      ? (args[templateFlagIdx + 1] as Template)
      : undefined;

  const template = templateFlag ?? (await select<Template>('Choose a starter template', TEMPLATES));

  step(`Scaffolding ${hi(projectName)} with ${hi(template)} template…`);

  // Create project structure
  mkdirSync(join(projectDir, 'src'), { recursive: true });
  mkdirSync(join(projectDir, 'components', 'ui'), { recursive: true });

  const termuiSpecifier = await resolveTermuiDependency(projectDir);

  // Write package.json
  writeFileSync(
    join(projectDir, 'package.json'),
    JSON.stringify(buildPackageJson(projectName, template, termuiSpecifier), null, 2) + '\n',
    'utf-8'
  );
  step(`Created ${hi('package.json')}`);

  // Write tsconfig.json
  writeFileSync(join(projectDir, 'tsconfig.json'), TSCONFIG, 'utf-8');
  step(`Created ${hi('tsconfig.json')}`);

  // Write termui.config.ts
  writeFileSync(join(projectDir, 'termui.config.ts'), TERMUI_CONFIG, 'utf-8');
  step(`Created ${hi('termui.config.ts')}`);

  // Write .gitignore
  writeFileSync(join(projectDir, '.gitignore'), GITIGNORE, 'utf-8');

  // Write template entry point
  const entryContent = TEMPLATES_MAP[template];
  writeFileSync(join(projectDir, 'src', 'index.tsx'), entryContent, 'utf-8');
  step(`Created ${hi('src/index.tsx')}`);

  // ai-assistant: also write the setup script
  if (template === 'ai-assistant') {
    writeFileSync(join(projectDir, 'src', 'setup.ts'), AI_ASSISTANT_SETUP, 'utf-8');
    step(`Created ${hi('src/setup.ts')}`);
  }

  // coding-agent: write the OpenAI setup script + env file
  if (template === 'coding-agent') {
    writeFileSync(join(projectDir, 'src', 'setup.ts'), CODING_AGENT_SETUP, 'utf-8');
    step(`Created ${hi('src/setup.ts')}`);
    writeFileSync(join(projectDir, '.env.example'), CODING_AGENT_ENV_EXAMPLE, 'utf-8');
    step(`Created ${hi('.env.example')}`);
  }

  // Write README
  writeFileSync(join(projectDir, 'README.md'), buildReadme(projectName, template), 'utf-8');

  // wizard / ai-assistant / coding-agent ship self-contained entry files that
  // rely on `ink` + `termui` directly — no local components required.
  const STARTER_COMPONENTS: Record<Template, string[] | null> = {
    minimal: ['box', 'text', 'spinner'],
    cli: ['box', 'text'],
    dashboard: ['app-shell', 'tabs', 'table', 'progress-bar', 'text'],
    wizard: null,
    'ai-assistant': null,
    'coding-agent': null,
  };
  const starterComponents = STARTER_COMPONENTS[template];

  // Auto-install starter components into the scaffolded project so the entry
  // file's imports resolve on first `npm start`. Skip if the template doesn't
  // need any (wizard, ai-assistant).
  if (starterComponents && starterComponents.length > 0) {
    step(`Adding starter components: ${starterComponents.map((c) => hi(c)).join(', ')}`);
    const prevCwd = process.cwd();
    try {
      process.chdir(projectDir);
      const { add } = await import('./add.js');
      await add(starterComponents, { isNested: true });
    } catch (err) {
      // Don't fail the whole scaffold — just surface the error and tell the
      // user to add manually.
      console.error(`\x1b[33mWarning:\x1b[0m starter components failed to install:`);
      console.error(`  ${(err as Error).message}`);
      console.error(`  Run: \x1b[36mcd ${projectName} && npx termui add ${starterComponents.join(' ')}\x1b[0m`);
    } finally {
      process.chdir(prevCwd);
    }
  }

  done(`Created ${hi(projectName)}`);
  const outroLines = [
    `  cd ${projectName}`,
    `  npm install`,
    `  npm start`,
  ];
  outro(outroLines.join('\n'));
}

// ─── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES_MAP: Record<Template, string> = {
  minimal: `import React from 'react';
import { render } from 'ink';
import { ThemeProvider } from 'termui';
import { Box } from '../components/ui/layout/Box.js';
import { Text } from '../components/ui/typography/Text.js';
import { Spinner } from '../components/ui/feedback/Spinner.js';

function App() {
  return (
    <ThemeProvider>
      <Box flexDirection="column" padding={1}>
        <Text bold>Hello, TermUI!</Text>
        <Spinner label="Loading…" />
      </Box>
    </ThemeProvider>
  );
}

render(<App />);
`,

  cli: `import React from 'react';
import { render } from 'ink';
import { ThemeProvider } from 'termui';
import { Box } from '../components/ui/layout/Box.js';
import { Text } from '../components/ui/typography/Text.js';
import { createCLI } from 'termui/args';

const cli = createCLI({
  name: 'my-cli',
  version: '1.0.0',
  description: 'My TermUI CLI',
  commands: {
    add: {
      name: 'add',
      description: 'Add an item',
      args: { name: { description: 'Item name', required: true } },
    },
    list: {
      name: 'list',
      description: 'List all items',
    },
    remove: {
      name: 'remove',
      description: 'Remove an item',
      args: { name: { description: 'Item name', required: true } },
    },
  },
});

const parsed = cli.parse();
if (parsed) {
  function App() {
    return (
      <ThemeProvider>
        <Box padding={1}>
          <Text bold>Command: {parsed!.command}</Text>
        </Box>
      </ThemeProvider>
    );
  }
  render(<App />);
}
`,

  dashboard: `import React from 'react';
import { render } from 'ink';
import { ThemeProvider } from 'termui';
import { AppShell } from '../components/ui/templates/AppShell.js';
import { Tabs } from '../components/ui/navigation/Tabs.js';
import { Table } from '../components/ui/data/Table.js';
import { ProgressBar } from '../components/ui/feedback/ProgressBar.js';
import { Text } from '../components/ui/typography/Text.js';

const SAMPLE_DATA = [
  { name: 'Item A', status: 'active', value: 42 },
  { name: 'Item B', status: 'inactive', value: 87 },
  { name: 'Item C', status: 'pending', value: 15 },
];

function App() {
  return (
    <ThemeProvider>
      <AppShell>
        <AppShell.Header>
          <Text bold>My Dashboard</Text>
        </AppShell.Header>
        <AppShell.Content>
          <Tabs
            defaultTab="overview"
            tabs={[
              {
                key: 'overview',
                label: 'Overview',
                content: (
                  <>
                    <ProgressBar value={72} label="CPU" showPercent />
                    <ProgressBar value={4.2} total={16} label="Memory (GB)" showPercent />
                  </>
                ),
              },
              {
                key: 'data',
                label: 'Data',
                content: (
                  <Table
                    data={SAMPLE_DATA}
                    columns={[
                      { key: 'name', header: 'Name' },
                      { key: 'status', header: 'Status' },
                      { key: 'value', header: 'Value', align: 'right' },
                    ]}
                  />
                ),
              },
              {
                key: 'settings',
                label: 'Settings',
                content: <Text dim>Settings coming soon\u2026</Text>,
              },
            ]}
          />
        </AppShell.Content>
        <AppShell.Hints items={['q: quit', 'tab: switch tab']} />
      </AppShell>
    </ThemeProvider>
  );
}

render(<App />);
`,

  wizard: `import React from 'react';
import { intro, outro, text, select, confirm, spinner } from 'termui/clack';

async function main() {
  intro('Setup Wizard');

  const name = await text({ message: 'What is your project name?', placeholder: 'my-project' });
  const env = await select({
    message: 'Choose environment',
    options: [
      { value: 'development', label: 'Development' },
      { value: 'production', label: 'Production' },
    ],
  });
  const install = await confirm({ message: 'Install dependencies?' });

  if (install) {
    const s = spinner();
    s.start('Installing…');
    await new Promise((r) => setTimeout(r, 1500));
    s.stop('Installed!');
  }

  outro(\`Ready! Project: \${name}, env: \${env}\`);
}

main();
`,
  'ai-assistant': `import React, { useState, useCallback } from 'react';
import { render } from 'ink';
import { ThemeProvider, useTheme, useInput, useInterval } from 'termui';
import { Box, Text } from 'ink';
import { createCLI } from 'termui/args';

// ─── Types ────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  streaming?: boolean;
}

// ─── Simple streaming simulation ─────────────────────────────────────────
// In production, replace with: import { useChat } from 'termui/ai';
// and configure your provider (Anthropic, OpenAI, or Ollama).

function useSimpleChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'system',
      content: 'You are a helpful AI assistant.',
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    // Simulate streaming response
    // Replace this block with real API call using termui/ai
    const response =
      \`I received your message: "\${content}"

\` +
      \`To connect a real AI provider, replace this simulation with:

\` +
      \`import { useChat } from 'termui/ai';
\` +
      \`const { sendMessage } = useChat({
\` +
      \`  provider: 'anthropic',
\` +
      \`  model: 'claude-sonnet-4-20250514',
\` +
      \`  apiKey: process.env.ANTHROPIC_API_KEY,
\` +
      \`});\`;

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= response.length) {
        clearInterval(interval);
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: response, streaming: false } : m
          )
        );
        return;
      }
      const chunk = response.slice(0, idx + 3);
      idx += 3;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: chunk } : m
        )
      );
    }, 30);
  }, []);

  const abort = useCallback(() => {
    setIsStreaming(false);
  }, []);

  return { messages, sendMessage, isStreaming, abort };
}

// ─── ChatMessage component ───────────────────────────────────────────────────

function ChatMessage({ message, termWidth }: { message: Message; termWidth: number }) {
  const theme = useTheme();
  const [cursorVisible, setCursorVisible] = useState(true);

  useInterval(() => {
    if (message.streaming) setCursorVisible((v) => !v);
  }, 500);

  if (message.role === 'system') return null;

  const isUser = message.role === 'user';
  const nameColor = isUser ? theme.colors.primary : theme.colors.accent;
  const name = isUser ? 'You' : 'Assistant';
  const borderColor = isUser ? theme.colors.primary : theme.colors.accent;

  return (
    <Box
      flexDirection="column"
      marginBottom={1}
      paddingLeft={1}
      paddingRight={1}
      borderStyle="single"
      borderColor={borderColor}
      width={Math.min(termWidth - 4, 80)}
      alignSelf={isUser ? 'flex-end' : 'flex-start'}
    >
      <Text bold color={nameColor}>{name}</Text>
      <Text>
        {message.content}
        {message.streaming && cursorVisible && <Text color={theme.colors.primary}>▌</Text>}
      </Text>
    </Box>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────────────

function App({ model, systemPrompt }: { model?: string; systemPrompt?: string }) {
  const theme = useTheme();
  const { messages, sendMessage, isStreaming, abort } = useSimpleChat();
  const [input, setInput] = useState('');
  const [termWidth] = useState(process.stdout.columns ?? 80);
  void model; void systemPrompt; // Wire to termui/ai useChat() when ready

  useInput((char, key) => {
    if (key.ctrl && char === 'c') process.exit(0);

    if (key.ctrl && char === 'a') {
      if (isStreaming) abort();
      return;
    }

    if (key.return) {
      if (input.trim() && !isStreaming) {
        const msg = input.trim();
        setInput('');
        sendMessage(msg);
      }
      return;
    }

    if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    if (char && char.length === 1 && !key.ctrl && !key.meta) {
      setInput((prev) => prev + char);
    }
  });

  const visibleMessages = messages.filter((m) => m.role !== 'system');

  return (
    <Box flexDirection="column" height={process.stdout.rows ?? 24}>
      {/* Header */}
      <Box
        borderStyle="single"
        borderColor={theme.colors.primary}
        paddingLeft={1}
        paddingRight={1}
        justifyContent="space-between"
      >
        <Text bold color={theme.colors.primary}>AI Assistant</Text>
        <Text color={theme.colors.mutedForeground} dimColor>
          Ctrl+C: quit  Ctrl+A: abort stream
        </Text>
      </Box>

      {/* Messages */}
      <Box flexDirection="column" flexGrow={1} paddingLeft={1} paddingRight={1} paddingTop={1}>
        {visibleMessages.length === 0 ? (
          <Box flexDirection="column" alignItems="center" paddingTop={2}>
            <Text color={theme.colors.mutedForeground} dimColor>
              Start a conversation. Type below and press Enter.
            </Text>
            <Text color={theme.colors.mutedForeground} dimColor>
              Connect termui/ai for real AI providers (Anthropic, OpenAI, Ollama).
            </Text>
          </Box>
        ) : (
          visibleMessages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} termWidth={termWidth} />
          ))
        )}
        {isStreaming && (
          <Text color={theme.colors.mutedForeground} dimColor>
            Assistant is responding...
          </Text>
        )}
      </Box>

      {/* Input area */}
      <Box
        borderStyle={isStreaming ? 'single' : 'bold'}
        borderColor={isStreaming ? theme.colors.mutedForeground : theme.colors.focusRing}
        paddingLeft={1}
        paddingRight={1}
        marginLeft={1}
        marginRight={1}
      >
        <Text color={theme.colors.mutedForeground}>{'> '}</Text>
        <Text>{input}</Text>
        <Text color={theme.colors.primary}>▌</Text>
        {isStreaming && (
          <Text color={theme.colors.mutedForeground} dimColor>  (streaming...)</Text>
        )}
      </Box>

      {/* Status bar */}
      <Box paddingLeft={2} paddingRight={2}>
        <Text color={theme.colors.mutedForeground} dimColor>
          {isStreaming
            ? 'Streaming response...'
            : \`\${visibleMessages.length} messages  ·  termui/ai for real providers\`}
        </Text>
      </Box>
    </Box>
  );
}

// Parse CLI flags via termui/args
const cli = createCLI({
  name: 'ai-assistant',
  version: '0.1.0',
  description: 'AI assistant powered by TermUI',
  commands: {
    chat: {
      name: 'chat',
      description: 'Start a chat session',
      args: {
        model:    { description: 'Model ID to use (e.g. claude-sonnet-4-6)' },
        system:   { description: 'System prompt override' },
        stream:   { description: 'Enable streaming (default: true)' },
        json:     { description: 'Output responses as JSON' },
      },
    },
    setup: {
      name: 'setup',
      description: 'Configure provider and API key',
    },
  },
});

// cli.parse() returns null after printing help/version — exit cleanly.
// Default to 'chat' when no subcommand is given.
const argv = process.argv.slice(2);
const parsed = argv.length === 0
  ? { command: 'chat', args: {} as Record<string, unknown> }
  : cli.parse(argv);
if (!parsed) process.exit(0);

// Route: 'setup' command defers to src/setup.ts
if (parsed.command === 'setup') {
  console.error('Run: npm run setup');
  process.exit(0);
}

render(
  <ThemeProvider>
    <App
      model={typeof parsed.args.model === 'string' ? parsed.args.model : undefined}
      systemPrompt={typeof parsed.args.system === 'string' ? parsed.args.system : undefined}
    />
  </ThemeProvider>
);
`,

  'coding-agent': `import React, { useState, useCallback, useRef } from 'react';
import { render } from 'ink';
import { Box, Text } from 'ink';
import { ThemeProvider, useTheme, useInput, useInterval } from 'termui';
import os from 'os';
import OpenAI from 'openai';

// ─── Config ──────────────────────────────────────────────────────────────────

const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const VERSION = '0.1.0';

const SYSTEM_PROMPT = [
  'You are a helpful coding agent running inside a terminal UI.',
  'Be concise and accurate. Prefer runnable code with short explanations.',
  'When editing code, show unified diffs or full file contents.',
].join(' ');

// ─── Types & chat hook ───────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  streaming?: boolean;
}

function useCodingAgent() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'sys', role: 'system', content: SYSTEM_PROMPT },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const clientRef = useRef<OpenAI | null>(null);

  function getClient(): OpenAI | null {
    if (clientRef.current) return clientRef.current;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    const baseURL = process.env.OPENAI_BASE_URL;
    clientRef.current = new OpenAI({ apiKey, baseURL });
    return clientRef.current;
  }

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = { id: 'u-' + Date.now(), role: 'user', content };
    const asstId = 'a-' + Date.now();
    const asstMsg: Message = { id: asstId, role: 'assistant', content: '', streaming: true };

    // Capture the current history snapshot for the API call via a functional
    // setState (avoids racing with subsequent sends).
    let history: Array<{ role: Message['role']; content: string }> = [];
    setMessages((prev) => {
      history = [...prev, userMsg].map((m) => ({ role: m.role, content: m.content }));
      return [...prev, userMsg, asstMsg];
    });
    setIsStreaming(true);

    const client = getClient();
    if (!client) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === asstId
            ? {
                ...m,
                streaming: false,
                content:
                  'OPENAI_API_KEY is not set.\\n\\n' +
                  'Run:  npm run setup\\n' +
                  'Or:   export OPENAI_API_KEY=sk-...',
              }
            : m,
        ),
      );
      setIsStreaming(false);
      return;
    }

    try {
      abortRef.current = new AbortController();
      const stream = await client.chat.completions.create(
        { model: MODEL, messages: history, stream: true },
        { signal: abortRef.current.signal },
      );
      let acc = '';
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (!delta) continue;
        acc += delta;
        setMessages((prev) =>
          prev.map((m) => (m.id === asstId ? { ...m, content: acc } : m)),
        );
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === asstId ? { ...m, streaming: false } : m)),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === asstId
            ? { ...m, streaming: false, content: 'Error: ' + msg }
            : m,
        ),
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clear = useCallback(() => {
    setMessages([{ id: 'sys', role: 'system', content: SYSTEM_PROMPT }]);
  }, []);

  return { messages, sendMessage, isStreaming, abort, clear };
}

// ─── Welcome card (shown before the first message) ──────────────────────────

const TERMUI_MARK = [
  '╭────────╮',
  '│● ● ●   │',
  '│  $ _   │',
  '╰────────╯',
];

function WelcomeCard() {
  const theme = useTheme();
  const user = os.userInfo().username || 'there';
  const home = os.homedir();
  const cwd = process.cwd().startsWith(home)
    ? '~' + process.cwd().slice(home.length)
    : process.cwd();

  return (
    <Box
      borderStyle="round"
      borderColor={theme.colors.primary}
      paddingX={2}
      paddingY={1}
      width="100%"
    >
      {/* Left — centered welcome + mark */}
      <Box
        flexDirection="column"
        flexBasis={0}
        flexGrow={1}
        alignItems="center"
      >
        <Text bold>Welcome back {user}!</Text>
        <Box marginTop={1} flexDirection="column" alignItems="center">
          {TERMUI_MARK.map((line, i) => (
            <Text key={i} color={theme.colors.primary}>{line}</Text>
          ))}
        </Box>
        <Box marginTop={1} flexDirection="column" alignItems="center">
          <Text dimColor>{MODEL} · OpenAI · Coding Agent</Text>
          <Text dimColor>{cwd}</Text>
        </Box>
      </Box>

      {/* Vertical divider between columns */}
      <Box
        borderStyle="single"
        borderColor={theme.colors.primary}
        borderTop={false}
        borderBottom={false}
        borderRight={false}
        marginX={2}
      />

      {/* Right — tips + activity */}
      <Box flexDirection="column" flexBasis={0} flexGrow={1}>
        <Text bold color={theme.colors.primary}>Tips for getting started</Text>
        <Text>Ask the agent to edit files, run commands, or explain code.</Text>
        <Text dimColor>Type <Text bold>/help</Text> for slash commands.</Text>
        <Box marginY={1}>
          <Text dimColor>{'─'.repeat(48)}</Text>
        </Box>
        <Text bold color={theme.colors.primary}>Recent activity</Text>
        <Text dimColor>No recent activity</Text>
      </Box>
    </Box>
  );
}

// ─── Chat message rendering ─────────────────────────────────────────────────

function ChatMessage({ message }: { message: Message }) {
  const theme = useTheme();
  const [cursorVisible, setCursorVisible] = useState(true);

  useInterval(() => {
    if (message.streaming) setCursorVisible((v) => !v);
  }, 500);

  if (message.role === 'system') return null;

  if (message.role === 'user') {
    return (
      <Box paddingX={1} marginTop={1}>
        <Text color={theme.colors.mutedForeground}>{'› '}</Text>
        <Text bold>{message.content}</Text>
      </Box>
    );
  }

  return (
    <Box paddingX={1} marginTop={1}>
      <Text color={theme.colors.primary}>● </Text>
      <Text>
        {message.content}
        {message.streaming && cursorVisible && (
          <Text color={theme.colors.primary}>▌</Text>
        )}
      </Text>
    </Box>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────

function App() {
  const theme = useTheme();
  const { messages, sendMessage, isStreaming, abort, clear } = useCodingAgent();
  const [input, setInput] = useState('');
  const visible = messages.filter((m) => m.role !== 'system');

  const handleSubmit = (raw: string): void => {
    const text = raw.trim();
    if (!text) return;

    if (text === '/help') {
      // eslint-disable-next-line no-console
      console.log('Commands: /help · /clear · /model <id> · Ctrl+C quit · Ctrl+A abort');
      return;
    }
    if (text === '/clear') {
      clear();
      return;
    }
    if (text.startsWith('/model ')) {
      process.env.OPENAI_MODEL = text.slice('/model '.length).trim();
      return;
    }
    sendMessage(text);
  };

  useInput((char, key) => {
    if (key.ctrl && char === 'c') process.exit(0);
    if (key.ctrl && char === 'a') {
      if (isStreaming) abort();
      return;
    }
    if (key.return) {
      if (!isStreaming) {
        const msg = input;
        setInput('');
        handleSubmit(msg);
      }
      return;
    }
    if (key.backspace || key.delete) {
      setInput((p) => p.slice(0, -1));
      return;
    }
    if (char && char.length === 1 && !key.ctrl && !key.meta) {
      setInput((p) => p + char);
    }
  });

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      {visible.length === 0 ? (
        <WelcomeCard />
      ) : (
        <Box flexDirection="column">
          {visible.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
        </Box>
      )}

      {/* Input */}
      <Box
        marginTop={1}
        borderStyle="single"
        borderColor={isStreaming ? theme.colors.mutedForeground : theme.colors.focusRing}
        paddingX={1}
      >
        <Text color={theme.colors.mutedForeground}>{'› '}</Text>
        <Text>{input}</Text>
        <Text color={theme.colors.primary}>▌</Text>
      </Box>

      <Box paddingX={1} justifyContent="space-between">
        <Text dimColor>
          {isStreaming
            ? 'streaming…  Ctrl+A to abort'
            : '? for shortcuts  ·  /help  ·  Ctrl+C to quit'}
        </Text>
        <Text dimColor>◎ {MODEL} · openai</Text>
      </Box>
    </Box>
  );
}

render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);
`,
};

// ─── AI assistant setup script (src/setup.ts) ─────────────────────────────────

const AI_ASSISTANT_SETUP = `/**
 * AI Assistant Setup — run with: npm run setup
 *
 * Guides you through provider selection and stores your API key securely
 * using the OS keychain (via termui/keychain + keytar).
 *
 * Install keytar for secure storage:
 *   npm install keytar
 */
import { intro, outro, select, text, confirm, spinner, log } from 'termui/clack';

const APP_NAME = 'ai-assistant';

async function main() {
  intro('AI Assistant Setup');

  // 1 — Provider selection
  const provider = await select({
    message: 'Choose your AI provider',
    options: [
      { value: 'anthropic', label: 'Anthropic (Claude)', hint: 'claude-sonnet-4-6, claude-opus-4-6' },
      { value: 'openai',    label: 'OpenAI (GPT)',       hint: 'gpt-4o, gpt-4-turbo' },
      { value: 'ollama',    label: 'Ollama (local)',      hint: 'llama3, mistral, phi3 — no API key needed' },
    ],
  });

  // 2 — Model selection
  const MODEL_DEFAULTS: Record<string, string> = {
    anthropic: 'claude-sonnet-4-6',
    openai: 'gpt-4o',
    ollama: 'llama3',
  };
  const model = await text({
    message: 'Model ID',
    placeholder: MODEL_DEFAULTS[provider as string] ?? 'your-model-id',
    initialValue: MODEL_DEFAULTS[provider as string] ?? '',
  });

  // 3 — API key (skipped for Ollama)
  let apiKey: string | undefined;
  if (provider !== 'ollama') {
    const envVar = provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
    const existing = process.env[envVar];

    if (existing) {
      log.info(\`Using \${envVar} from environment\`);
    } else {
      apiKey = await text({
        message: \`Paste your \${String(provider).toUpperCase()} API key\`,
        placeholder: 'sk-...',
        validate: (v) => (v.trim().length < 8 ? 'API key looks too short' : undefined),
      });

      const storeInKeychain = await confirm({
        message: 'Store in OS keychain for future sessions?',
        initialValue: true,
      });

      if (storeInKeychain && apiKey) {
        const s = spinner();
        s.start('Saving to keychain…');
        try {
          // Requires: npm install keytar
          const keytar = await import('keytar');
          await keytar.setPassword(APP_NAME, String(provider), String(apiKey));
          s.stop('Saved to keychain ✓');
        } catch {
          s.stop('keytar not available — set via env var instead');
          log.warn(\`export \${envVar}=<your-key>\`);
        }
      }
    }
  }

  // 4 — Write .env file
  const writeEnv = await confirm({
    message: 'Write provider settings to .env.local?',
    initialValue: false,
  });

  if (writeEnv) {
    const { writeFileSync } = await import('fs');
    const lines = [
      \`AI_PROVIDER=\${provider}\`,
      \`AI_MODEL=\${model}\`,
      ...(apiKey ? [\`\${provider === 'anthropic' ? 'ANTHROPIC' : 'OPENAI'}_API_KEY=\${apiKey}\`] : []),
    ];
    writeFileSync('.env.local', lines.join('\\n') + '\\n', { encoding: 'utf-8', mode: 0o600 });
    log.success('Written .env.local');
    log.warn('Keep .env.local out of version control and prefer the OS keychain when possible');
  }

  outro(\`Setup complete — run \\\`npm start\\\` to launch the assistant\`);
}

main().catch((err) => {
  console.error('Setup failed:', err.message ?? err);
  process.exit(1);
});
`;

// ─── Coding agent setup script (src/setup.ts) ────────────────────────────────

const CODING_AGENT_SETUP = `/**
 * Coding Agent Setup — run with: npm run setup
 *
 * Collects your OpenAI API key + model and writes them to .env.local so
 * \`npm start\` can pick them up via \`node --env-file\`.
 */
import { intro, outro, text, select, confirm, log } from 'termui/clack';
import { writeFileSync, existsSync, readFileSync } from 'fs';

async function main() {
  intro('Coding Agent Setup');

  const existingKey = process.env.OPENAI_API_KEY;
  if (existingKey) {
    log.info('OPENAI_API_KEY already set in the environment — skipping prompt.');
  }

  const apiKey = existingKey
    ? existingKey
    : await text({
        message: 'Paste your OpenAI API key',
        placeholder: 'sk-...',
        validate: (v) => (v.trim().length < 8 ? 'API key looks too short' : undefined),
      });

  const model = await select({
    message: 'Default model',
    options: [
      { value: 'gpt-4o-mini',  label: 'gpt-4o-mini',  hint: 'fast + cheap (default)' },
      { value: 'gpt-4o',       label: 'gpt-4o',       hint: 'most capable general-purpose' },
      { value: 'gpt-4.1-mini', label: 'gpt-4.1-mini', hint: 'balanced coding model' },
      { value: 'gpt-4.1',      label: 'gpt-4.1',      hint: 'top coding performance' },
      { value: 'custom',       label: 'Other…',        hint: 'enter a model id manually' },
    ],
  });

  const finalModel = model === 'custom'
    ? await text({ message: 'Model id', placeholder: 'o1-mini' })
    : model;

  const baseURL = await text({
    message: 'Custom OpenAI-compatible base URL (optional)',
    placeholder: 'https://api.openai.com/v1',
  });

  const write = await confirm({ message: 'Write settings to .env.local?', initialValue: true });
  if (!write) {
    outro('Skipped — remember to export OPENAI_API_KEY before running \`npm start\`.');
    return;
  }

  const lines = [
    \`OPENAI_API_KEY=\${String(apiKey)}\`,
    \`OPENAI_MODEL=\${String(finalModel)}\`,
    ...(baseURL && String(baseURL).trim() ? [\`OPENAI_BASE_URL=\${String(baseURL).trim()}\`] : []),
  ];

  if (existsSync('.env.local')) {
    const current = readFileSync('.env.local', 'utf-8').trimEnd();
    writeFileSync('.env.local', current + '\\n' + lines.join('\\n') + '\\n', { mode: 0o600 });
  } else {
    writeFileSync('.env.local', lines.join('\\n') + '\\n', { mode: 0o600 });
  }

  log.success('Wrote .env.local (mode 600)');
  log.warn('Keep .env.local out of version control.');
  outro('Setup complete — run \`npm start\` to launch the agent.');
}

main().catch((err) => {
  console.error('Setup failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
`;

const CODING_AGENT_ENV_EXAMPLE = `# Copy to .env.local and fill in your values, or run: npm run setup
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
# OPENAI_BASE_URL=https://api.openai.com/v1
`;

// ─── Static file content ──────────────────────────────────────────────────────

/** Walk up from the new project dir to find the published `termui` workspace root (tsup + package.json). */
function findLocalTermuiPackageRoot(fromDir: string): string | null {
  let dir = resolve(fromDir);
  for (let i = 0; i < 12; i++) {
    const pkgPath = join(dir, 'package.json');
    const tsupPath = join(dir, 'tsup.config.ts');
    if (existsSync(pkgPath) && existsSync(tsupPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { name?: string };
        if (pkg.name === 'termui') return dir;
      } catch {
        /* ignore invalid json */
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * When scaffolding inside this repo, install from `npm pack` output (file:…/*.tgz) instead of
 * `file:../..` to the repo root. A directory link makes `import 'react'` from termui/dist resolve
 * via the monorepo's node_modules while the app uses its own — two Reacts → invalid hook call.
 * A packed install only contains published files, so React resolves once under the new app.
 */
async function resolveTermuiDependency(projectDir: string): Promise<string> {
  const override = process.env['TERMUI_PACKAGE_SPECIFIER']?.trim();
  if (override) return override;

  const root = findLocalTermuiPackageRoot(projectDir);
  if (root) {
    const tgzPath = ensureLocalTermuiPack(root);
    let rel = relative(projectDir, tgzPath);
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return `file:${rel.split(/\\/g).join('/')}`;
  }
  return '^1.5.1';
}

function ensureLocalTermuiPack(termuiRoot: string): string {
  const pkgPath = join(termuiRoot, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version?: string };
  const version = pkg.version ?? '0.0.0';
  const tgzName = `termui-${version}.tgz`;
  const tgzPath = join(termuiRoot, tgzName);
  const distIndex = join(termuiRoot, 'dist', 'index.js');

  if (!existsSync(distIndex)) {
    step('Building termui (dist/ missing)…');
    const run = existsSync(join(termuiRoot, 'pnpm-lock.yaml'))
      ? 'pnpm run build:root'
      : 'npm run build:root';
    execSync(run, { cwd: termuiRoot, stdio: 'inherit', env: process.env });
  }

  if (!existsSync(join(termuiRoot, 'dist', 'index.js'))) {
    throw new Error(
      `termui dist/ is missing after build. In ${termuiRoot}, run: pnpm run build:root (or npm run build:root)`
    );
  }

  step('Packing termui for local npm install (single React copy)…');
  execSync('npm pack --silent', { cwd: termuiRoot, stdio: 'pipe', env: process.env });

  if (!existsSync(tgzPath)) {
    throw new Error(`npm pack did not create ${tgzName} in ${termuiRoot}.`);
  }
  return tgzPath;
}

function buildPackageJson(name: string, template: Template, termuiSpecifier: string): object {
  const isAI = template === 'ai-assistant';
  const isCodingAgent = template === 'coding-agent';

  const scripts: Record<string, string> = {
    start: 'tsx src/index.tsx',
    build: 'tsc',
    dev: 'tsx watch src/index.tsx',
  };
  if (isAI) scripts.setup = 'tsx src/setup.ts';
  if (isCodingAgent) {
    // Load .env.local automatically via node --env-file (Node >= 20.6)
    scripts.start = 'tsx --env-file-if-exists=.env.local src/index.tsx';
    scripts.dev = 'tsx watch --env-file-if-exists=.env.local src/index.tsx';
    scripts.setup = 'tsx src/setup.ts';
  }

  return {
    name,
    version: '0.1.0',
    type: 'module',
    scripts,
    dependencies: {
      termui: termuiSpecifier,
      ink: '^5.0.0',
      react: '^18.0.0',
      ...(isAI
        ? {
            // Optional peer deps for AI features — install what you use
            // keytar: '^7.9.0',  // secure API key storage (uncomment to enable)
            // @anthropic-ai/sdk: '^0.26.0',
            // openai: '^4.0.0',
          }
        : {}),
      ...(isCodingAgent ? { openai: '^4.67.0' } : {}),
    },
    devDependencies: {
      typescript: '^5.0.0',
      tsx: '^4.0.0',
      '@types/react': '^18.0.0',
      '@types/node': '^20.0.0',
    },
  };
}

const TSCONFIG = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"]
}
`;

const TERMUI_CONFIG = `// termui.config.ts — edit this file to change your TermUI settings
export default {
  version:       '1.0.0',
  componentsDir: './components/ui',
  registry:      'https://arindam200.github.io/termui',
  theme:         'default',
};
`;

const GITIGNORE = `node_modules/
dist/
*.js.map
`;

const README_STARTER_COMPONENTS: Record<Template, string | null> = {
  minimal: 'box text spinner',
  cli: 'box text',
  dashboard: 'app-shell tabs table progress-bar text',
  wizard: null,
  'ai-assistant': null,
  'coding-agent': null,
};

function buildReadme(name: string, template: Template): string {
  const comps = README_STARTER_COMPONENTS[template];
  const addSection = comps
    ? `\n## Add starter components\n\n\`\`\`bash\nnpx termui add ${comps}\n\`\`\`\n`
    : '';

  const codingAgentSection =
    template === 'coding-agent'
      ? `
## Configure OpenAI

Run the interactive setup (writes \`.env.local\`):

\`\`\`bash
npm run setup
\`\`\`

Or set the env vars directly:

\`\`\`bash
export OPENAI_API_KEY=sk-...
export OPENAI_MODEL=gpt-4o-mini
# export OPENAI_BASE_URL=https://api.openai.com/v1
\`\`\`

## Shortcuts

- \`/help\` — list slash commands
- \`/clear\` — reset the conversation
- \`/model <id>\` — switch model for the session
- \`Ctrl+A\` — abort the streaming response
- \`Ctrl+C\` — quit
`
      : '';

  return `# ${name}

A TermUI app built with the **${template}** template.

## Getting started

\`\`\`bash
npm install${addSection}
npm start
\`\`\`
${codingAgentSection}
## Docs

- [TermUI docs](https://arindam200.github.io/termui)
- [Component catalog](https://arindam200.github.io/termui/components)
`;
}
