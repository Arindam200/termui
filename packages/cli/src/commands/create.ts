import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  printLogo,
  intro,
  step,
  warn,
  done,
  outro,
  hi,
  dim,
  select,
  confirm,
} from '../utils/ui.js';

type Template = 'minimal' | 'cli' | 'dashboard' | 'wizard';

const TEMPLATES: Array<{ value: Template; label: string; hint: string }> = [
  { value: 'minimal', label: 'Minimal', hint: 'Hello World with Text + Spinner' },
  { value: 'cli', label: 'CLI', hint: 'multi-command CLI with add/remove/list' },
  { value: 'dashboard', label: 'Dashboard', hint: 'Tabs + Table + ProgressBar layout' },
  { value: 'wizard', label: 'Wizard', hint: 'multi-step prompt flow with clack' },
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

  // Write README
  writeFileSync(join(projectDir, 'README.md'), buildReadme(projectName, template), 'utf-8');

  // wizard uses termui/clack's spinner — no local components needed
  const STARTER_COMPONENTS: Record<Template, string | null> = {
    minimal: 'box text spinner',
    cli: 'box text',
    dashboard: 'app-shell tabs table progress-bar text',
    wizard: null,
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
};

// ─── Static file content ──────────────────────────────────────────────────────

function buildPackageJson(name: string, template: Template): object {
  return {
    name,
    version: '0.1.0',
    type: 'module',
    scripts: {
      start: 'tsx src/index.tsx',
      build: 'tsc',
      dev: 'tsx watch src/index.tsx',
    },
    dependencies: {
      termui: 'latest',
      '@termui/core': 'latest',
      ink: '^5.0.0',
      react: '^18.0.0',
      ...(template === 'cli' ? {} : {}),
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
