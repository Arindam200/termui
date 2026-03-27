import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { printLogo, intro, step, done, outro, hi, dim, select, confirm } from '../utils/ui.js';

type Template = 'minimal' | 'cli' | 'dashboard' | 'wizard' | 'ai-assistant';

const TEMPLATES: Array<{ value: Template; label: string; hint: string }> = [
  { value: 'minimal', label: 'Minimal', hint: 'Hello World with Text + Spinner' },
  { value: 'cli', label: 'CLI', hint: 'multi-command CLI with add/remove/list' },
  { value: 'dashboard', label: 'Dashboard', hint: 'Tabs + Table + ProgressBar layout' },
  { value: 'wizard', label: 'Wizard', hint: 'multi-step prompt flow with clack' },
  { value: 'ai-assistant', label: 'AI Assistant', hint: 'streaming AI chat CLI with termui/ai' },
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

  const template = await select<Template>('Choose a starter template', TEMPLATES);

  step(`Scaffolding ${hi(projectName)} with ${hi(template)} template…`);

  // Create project structure
  mkdirSync(join(projectDir, 'src'), { recursive: true });
  mkdirSync(join(projectDir, 'components', 'ui'), { recursive: true });

  // Write package.json
  writeFileSync(
    join(projectDir, 'package.json'),
    JSON.stringify(buildPackageJson(projectName, template), null, 2) + '\n',
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

  // Write README
  writeFileSync(join(projectDir, 'README.md'), buildReadme(projectName, template), 'utf-8');

  // wizard uses termui/clack's spinner — no local components needed
  const STARTER_COMPONENTS: Record<Template, string | null> = {
    minimal: 'box text spinner',
    cli: 'box text',
    dashboard: 'app-shell tabs table progress-bar text',
    wizard: null,
    'ai-assistant': null,
  };
  const starterComponents = STARTER_COMPONENTS[template];
  const addCmd = starterComponents ? `npx termui add ${starterComponents}` : null;

  done(`Created ${hi(projectName)}`);
  const outroLines = [
    `  cd ${projectName}`,
    `  npm install`,
    ...(addCmd ? [`  ${addCmd}  ${dim('# install starter components')}`] : []),
    `  npm start`,
  ];
  outro(outroLines.join('\n'));
}

// ─── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES_MAP: Record<Template, string> = {
  minimal: `import React from 'react';
import { render } from 'ink';
import { ThemeProvider } from '@termui/core';
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
import { ThemeProvider } from '@termui/core';
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
import { ThemeProvider } from '@termui/core';
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
import { ThemeProvider, useTheme, useInput, useInterval } from '@termui/core';
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
    initialValue: true,
  });

  if (writeEnv) {
    const { writeFileSync } = await import('fs');
    const lines = [
      \`AI_PROVIDER=\${provider}\`,
      \`AI_MODEL=\${model}\`,
      ...(apiKey ? [\`\${provider === 'anthropic' ? 'ANTHROPIC' : 'OPENAI'}_API_KEY=\${apiKey}\`] : []),
    ];
    writeFileSync('.env.local', lines.join('\\n') + '\\n', 'utf-8');
    log.success('Written .env.local');
  }

  outro(\`Setup complete — run \\\`npm start\\\` to launch the assistant\`);
}

main().catch((err) => {
  console.error('Setup failed:', err.message ?? err);
  process.exit(1);
});
`;

// ─── Static file content ──────────────────────────────────────────────────────

function buildPackageJson(name: string, template: Template): object {
  const isAI = template === 'ai-assistant';
  return {
    name,
    version: '0.1.0',
    type: 'module',
    scripts: {
      start: 'tsx src/index.tsx',
      build: 'tsc',
      dev: 'tsx watch src/index.tsx',
      ...(isAI ? { setup: 'tsx src/setup.ts' } : {}),
    },
    dependencies: {
      termui: 'latest',
      '@termui/core': 'latest',
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
};

function buildReadme(name: string, template: Template): string {
  const comps = README_STARTER_COMPONENTS[template];
  const addSection = comps
    ? `\n## Add starter components\n\n\`\`\`bash\nnpx termui add ${comps}\n\`\`\`\n`
    : '';

  return `# ${name}

A TermUI app built with the **${template}** template.

## Getting started

\`\`\`bash
npm install${addSection}
npm start
\`\`\`

## Docs

- [TermUI docs](https://arindam200.github.io/termui)
- [Component catalog](https://arindam200.github.io/termui/components)
`;
}
