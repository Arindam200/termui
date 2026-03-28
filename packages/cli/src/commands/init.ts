import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { writeConfig, type TermUIConfig } from '../utils/config.js';
import { printLogo, intro, step, warn, done, outro, hi, dim, bold } from '../utils/ui.js';
import { select, confirm, text } from '../utils/clack.js';

// ─── Types ───────────────────────────────────────────────────────────────────

type PackageManager = 'pnpm' | 'yarn' | 'bun' | 'npm';

// ─── ANSI color swatches (256-color backgrounds) ──────────────────────────────

const THEME_SWATCHES: Record<string, string> = {
  default: '\x1b[48;5;255m  \x1b[0m',
  dracula: '\x1b[48;5;135m  \x1b[0m',
  nord: '\x1b[48;5;110m  \x1b[0m',
  catppuccin: '\x1b[48;5;183m  \x1b[0m',
  monokai: '\x1b[48;5;208m  \x1b[0m',
  'tokyo-night': '\x1b[48;5;99m   \x1b[0m',
  'one-dark': '\x1b[48;5;68m  \x1b[0m',
  solarized: '\x1b[48;5;136m  \x1b[0m',
};

const THEMES = [
  {
    value: 'default',
    label: 'Default',
    hint: `${THEME_SWATCHES['default']} clean neutral palette`,
  },
  {
    value: 'dracula',
    label: 'Dracula',
    hint: `${THEME_SWATCHES['dracula']} purple & pink dark theme`,
  },
  { value: 'nord', label: 'Nord', hint: `${THEME_SWATCHES['nord']} cool arctic blues` },
  {
    value: 'catppuccin',
    label: 'Catppuccin',
    hint: `${THEME_SWATCHES['catppuccin']} pastel mocha tones`,
  },
  { value: 'monokai', label: 'Monokai', hint: `${THEME_SWATCHES['monokai']} classic warm darks` },
  {
    value: 'tokyo-night',
    label: 'Tokyo Night',
    hint: `${THEME_SWATCHES['tokyo-night']} vibrant neon city`,
  },
  {
    value: 'one-dark',
    label: 'One Dark',
    hint: `${THEME_SWATCHES['one-dark']} Atom-inspired dark`,
  },
  {
    value: 'solarized',
    label: 'Solarized',
    hint: `${THEME_SWATCHES['solarized']} ethan schoonover classic`,
  },
] as const;

type Theme = (typeof THEMES)[number]['value'];

// ─── Detection helpers ────────────────────────────────────────────────────────

function detectPackageManager(cwd: string): PackageManager {
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(cwd, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(cwd, 'bun.lockb'))) return 'bun';
  if (existsSync(join(cwd, 'package-lock.json'))) return 'npm';
  return 'npm';
}

function detectTypeScript(cwd: string): boolean {
  return existsSync(join(cwd, 'tsconfig.json'));
}

function buildInstallCommand(pm: PackageManager): string {
  const deps = 'react ink @termui/core';
  switch (pm) {
    case 'pnpm':
      return `pnpm add ${deps}`;
    case 'yarn':
      return `yarn add ${deps}`;
    case 'bun':
      return `bun add ${deps}`;
    default:
      return `npm install ${deps}`;
  }
}

// ─── Starter app template ─────────────────────────────────────────────────────

function buildStarterApp(useTypeScript: boolean, componentsDir: string): string {
  // The starter file is written to src/index.tsx|jsx, so compute the import
  // path relative to src/ rather than the project root.
  // e.g. componentsDir = './components/ui' → importBase = '../components/ui'
  //      componentsDir = './src/ui'        → importBase = 'ui'
  const normalized = componentsDir.replace(/^\.\//, '').replace(/^\//, '');
  const rel = relative('src', normalized).replace(/\\/g, '/');
  const importBase = rel.startsWith('.') ? rel : `./${rel}`;
  void useTypeScript; // both TS and JS use the same JSX template

  return `import React from 'react';
import { render } from 'ink';
import { ThemeProvider } from '@termui/core';
import { Box } from '${importBase}/layout/Box.js';
import { Text } from '${importBase}/typography/Text.js';
import { Spinner } from '${importBase}/feedback/Spinner.js';

function App() {
  return (
    <ThemeProvider>
      <Box flexDirection="column" padding={1}>
        <Text bold>Hello, TermUI!</Text>
        <Spinner label="Loading\u2026" />
      </Box>
    </ThemeProvider>
  );
}

render(<App />);
`;
}

function buildConfigTs(theme: string, componentsDir: string): string {
  return `// termui.config.ts — edit this file to change your TermUI settings
export default {
  version:       '1.0.0',
  componentsDir: '${componentsDir}',
  registry:      'https://arindam200.github.io/termui',
  theme:         '${theme}',
};
`;
}

// ─── Main command ─────────────────────────────────────────────────────────────

export async function init(_args: string[], opts?: { isNested?: boolean }): Promise<void> {
  const cwd = process.cwd();

  // ─── Logo + intro ──────────────────────────────────────────────────────────
  if (!opts?.isNested) {
    printLogo();
    intro('termui init');
  }

  step(`Initializing in ${hi(cwd)}`);

  // ─── Step 1: Detect environment ────────────────────────────────────────────
  const pm = detectPackageManager(cwd);
  const useTypeScript = detectTypeScript(cwd);

  step(`Detected ${hi(pm)} · ${useTypeScript ? hi('TypeScript') : dim('JavaScript')} project`);

  // ─── Step 2: Check for existing config ────────────────────────────────────
  const configJsonPath = join(cwd, 'termui.config.json');
  if (existsSync(configJsonPath)) {
    warn(`${hi('termui.config.json')} already exists — overwrite?`);
    const overwrite = await confirm({ message: 'Overwrite existing config?', initialValue: false });
    if (!overwrite) {
      outro(`Aborted — your existing config is unchanged.`);
      return;
    }
  }

  // ─── Step 3: Components directory ─────────────────────────────────────────
  const componentsDir = await text({
    message: 'Components directory',
    placeholder: './components/ui',
    validate: (v) => {
      if (v.includes('..')) return 'Path must not contain ".."';
      return undefined;
    },
  });

  // ─── Step 4: Theme selection ───────────────────────────────────────────────
  const theme = await select<Theme>({ message: 'Pick a theme', options: [...THEMES] });

  // ─── Step 5: Install dependencies ─────────────────────────────────────────
  const shouldInstall = await confirm({
    message: 'Install dependencies? (react, ink, termui)',
    initialValue: true,
  });

  // ─── Step 6: Create components directory ──────────────────────────────────
  const resolvedComponentsDir = join(cwd, componentsDir.replace(/^\.\//, ''));
  if (!existsSync(resolvedComponentsDir)) {
    mkdirSync(resolvedComponentsDir, { recursive: true });
    step(`Created ${hi(componentsDir)}`);
  } else {
    warn(`${hi(componentsDir)} already exists — skipping`);
  }

  // ─── Step 7: Write termui.config.json ─────────────────────────────────────
  const config: TermUIConfig = {
    version: '1.0.0',
    componentsDir,
    registry: 'https://arindam200.github.io/termui',
    theme,
  };

  writeConfig(config, cwd);
  step(`Wrote ${hi('termui.config.json')}  ${dim(`theme: ${theme}`)}`);

  // ─── Step 8: Write termui.config.ts ───────────────────────────────────────
  const configTsPath = join(cwd, 'termui.config.ts');
  if (!existsSync(configTsPath)) {
    writeFileSync(configTsPath, buildConfigTs(theme, componentsDir), 'utf-8');
    step(`Created ${hi('termui.config.ts')}`);
  } else {
    warn(`${hi('termui.config.ts')} already exists — keeping your config`);
  }

  // ─── Step 9: Generate starter app ─────────────────────────────────────────
  const srcDir = join(cwd, 'src');
  if (!existsSync(srcDir)) {
    mkdirSync(srcDir, { recursive: true });
    step(`Created ${hi('src/')} directory`);
  }

  const ext = useTypeScript ? 'tsx' : 'jsx';
  const appFilePath = join(srcDir, `index.${ext}`);

  if (!existsSync(appFilePath)) {
    writeFileSync(appFilePath, buildStarterApp(useTypeScript, componentsDir), 'utf-8');
    step(`Created ${hi(`src/index.${ext}`)}  ${dim('starter Hello, TermUI app')}`);
  } else {
    warn(`${hi(`src/index.${ext}`)} already exists — skipping`);
  }

  // ─── Step 10: Install dependencies ──────────────────────────────────────────
  if (shouldInstall) {
    const installCmd = buildInstallCommand(pm);
    step(`Installing dependencies…`);
    try {
      execSync(installCmd, { stdio: 'inherit', cwd });
    } catch {
      warn(`Install failed. Run manually: ${hi(installCmd)}`);
    }
  }

  // ─── Done ──────────────────────────────────────────────────────────────────
  done('All done! TermUI is ready.');

  outro(
    `Next: ${hi('npx termui add box text spinner')}  ·  ${hi('npx termui list')}  ·  ${hi('npx termui preview')}`
  );
}
