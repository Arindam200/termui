import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, relative, resolve, isAbsolute } from 'path';
import { writeConfig, type TermUIConfig } from '../utils/config.js';
import { printLogo, intro, step, warn, done, outro, hi, dim, bold, pc } from '../utils/ui.js';
import { select, confirm, text } from '../utils/clack.js';

// ─── Option parsing ───────────────────────────────────────────────────────────

interface InitOptions {
  yes: boolean;
  defaults: boolean;
  force: boolean;
  cwd?: string;
  name?: string;
  silent: boolean;
  reinstall?: boolean;
  help: boolean;
  components: string[];
}

function parseOptions(argv: string[]): InitOptions {
  const opts: InitOptions = {
    yes: true, // -y defaults to true per spec
    defaults: false,
    force: false,
    silent: false,
    help: false,
    components: [],
  };

  const takesValue = new Set(['-c', '--cwd', '-n', '--name']);

  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i]!;
    const next = argv[i + 1];
    const peek = (): string | undefined =>
      next !== undefined && !next.startsWith('-') ? next : undefined;

    switch (tok) {
      case '-h':
      case '--help':
        opts.help = true;
        break;
      case '-y':
      case '--yes':
        opts.yes = true;
        break;
      case '--no-yes':
        opts.yes = false;
        break;
      case '-d':
      case '--defaults':
        opts.defaults = true;
        break;
      case '-f':
      case '--force':
        opts.force = true;
        break;
      case '-s':
      case '--silent':
        opts.silent = true;
        break;
      case '--reinstall':
        opts.reinstall = true;
        break;
      case '--no-reinstall':
        opts.reinstall = false;
        break;
      default: {
        if (takesValue.has(tok)) {
          const v = peek();
          if (v === undefined) {
            throw new Error(`Option ${tok} requires a value`);
          }
          if (tok === '-c' || tok === '--cwd') opts.cwd = v;
          else if (tok === '-n' || tok === '--name') opts.name = v;
          i++;
        } else if (tok.startsWith('-')) {
          throw new Error(`Unknown option: ${tok}`);
        } else {
          opts.components.push(tok);
        }
      }
    }
  }

  return opts;
}

function printInitHelp(): void {
  const { cyan, yellow, green, bold: b } = pc;
  console.log(`
${b('Usage:')} termui init [options] [components...]

initialize your project and install dependencies

${b('Arguments:')}
  ${green('components')}             names, url or local path to component

${b('Options:')}
  ${cyan('-y, --yes')}              skip confirmation prompt. ${yellow('(default: true)')}
  ${cyan('-d, --defaults')}         use default configuration. ${yellow('(default: false)')}
  ${cyan('-f, --force')}            force overwrite of existing configuration. ${yellow('(default: false)')}
  ${cyan('-c, --cwd <cwd>')}        the working directory. defaults to the current directory.
  ${cyan('-n, --name <name>')}      the name for the new project.
  ${cyan('-s, --silent')}           mute output. ${yellow('(default: false)')}
  ${cyan('--reinstall')}            re-install existing UI components.
  ${cyan('--no-reinstall')}         do not re-install existing UI components.
  ${cyan('-h, --help')}             display help for command
`);
}

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

function buildInstallCommand(pm: PackageManager, deps = 'react ink termui'): string {
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
import { ThemeProvider } from 'termui';
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

export async function init(args: string[], opts?: { isNested?: boolean }): Promise<void> {
  let parsed: InitOptions;
  try {
    parsed = parseOptions(args);
  } catch (err) {
    console.error(`\x1b[31mError:\x1b[0m ${(err as Error).message}`);
    console.error(`Run ${hi('npx termui init --help')} for usage.`);
    process.exit(1);
  }

  if (parsed.help) {
    printInitHelp();
    return;
  }

  // Silent mode: suppress non-error output.
  const silent = parsed.silent;
  const logStep = silent ? () => {} : step;
  const logWarn = silent ? () => {} : warn;
  const logDone = silent ? () => {} : done;
  const logOutro = silent ? () => {} : outro;

  // Resolve working directory.
  const cwd = parsed.cwd
    ? isAbsolute(parsed.cwd)
      ? parsed.cwd
      : resolve(process.cwd(), parsed.cwd)
    : process.cwd();

  if (parsed.cwd && !existsSync(cwd)) {
    console.error(`\x1b[31mError:\x1b[0m --cwd path does not exist: ${cwd}`);
    process.exit(1);
  }

  // ─── Logo + intro ──────────────────────────────────────────────────────────
  if (!opts?.isNested && !silent) {
    printLogo();
    intro('termui init');
  }

  logStep(`Initializing in ${hi(cwd)}`);
  if (parsed.name) logStep(`Project name: ${hi(parsed.name)}`);

  // ─── Detect environment ────────────────────────────────────────────────────
  const pm = detectPackageManager(cwd);
  const useTypeScript = detectTypeScript(cwd);

  logStep(`Detected ${hi(pm)} · ${useTypeScript ? hi('TypeScript') : dim('JavaScript')} project`);

  // ─── Existing config handling ─────────────────────────────────────────────
  const configJsonPath = join(cwd, 'termui.config.json');
  if (existsSync(configJsonPath)) {
    if (parsed.force) {
      logWarn(`${hi('termui.config.json')} exists — overwriting (--force)`);
    } else if (parsed.yes || parsed.defaults) {
      logOutro(`Config already exists. Use ${hi('--force')} to overwrite.`);
      return;
    } else {
      logWarn(`${hi('termui.config.json')} already exists — overwrite?`);
      const overwrite = await confirm({
        message: 'Overwrite existing config?',
        initialValue: false,
      });
      if (!overwrite) {
        logOutro(`Aborted — your existing config is unchanged.`);
        return;
      }
    }
  }

  // ─── Components directory ─────────────────────────────────────────────────
  const componentsDir =
    parsed.yes || parsed.defaults
      ? './components/ui'
      : await text({
          message: 'Components directory',
          placeholder: './components/ui',
          validate: (v) => (v.includes('..') ? 'Path must not contain ".."' : undefined),
        });

  // ─── Theme selection ──────────────────────────────────────────────────────
  const theme: Theme =
    parsed.yes || parsed.defaults
      ? 'default'
      : await select<Theme>({ message: 'Pick a theme', options: [...THEMES] });

  // ─── Install dependencies? ────────────────────────────────────────────────
  const shouldInstall =
    parsed.yes || parsed.defaults
      ? true
      : await confirm({
          message: 'Install dependencies? (react, ink, termui)',
          initialValue: true,
        });

  // ─── Create components directory ──────────────────────────────────────────
  const resolvedComponentsDir = join(cwd, componentsDir.replace(/^\.\//, ''));
  if (!existsSync(resolvedComponentsDir)) {
    mkdirSync(resolvedComponentsDir, { recursive: true });
    logStep(`Created ${hi(componentsDir)}`);
  } else {
    logWarn(`${hi(componentsDir)} already exists — skipping`);
  }

  // ─── Write termui.config.json ─────────────────────────────────────────────
  const config: TermUIConfig = {
    version: '1.0.0',
    componentsDir,
    registry: 'https://arindam200.github.io/termui',
    theme,
  };
  writeConfig(config, cwd);
  logStep(`Wrote ${hi('termui.config.json')}  ${dim(`theme: ${theme}`)}`);

  // ─── Write termui.config.ts ───────────────────────────────────────────────
  const configTsPath = join(cwd, 'termui.config.ts');
  if (!existsSync(configTsPath) || parsed.force) {
    writeFileSync(configTsPath, buildConfigTs(theme, componentsDir), 'utf-8');
    logStep(`${existsSync(configTsPath) ? 'Updated' : 'Created'} ${hi('termui.config.ts')}`);
  } else {
    logWarn(`${hi('termui.config.ts')} already exists — keeping your config`);
  }

  // ─── Starter app ──────────────────────────────────────────────────────────
  const srcDir = join(cwd, 'src');
  if (!existsSync(srcDir)) {
    mkdirSync(srcDir, { recursive: true });
    logStep(`Created ${hi('src/')} directory`);
  }

  const ext = useTypeScript ? 'tsx' : 'jsx';
  const appFilePath = join(srcDir, `index.${ext}`);

  if (!existsSync(appFilePath) || parsed.force) {
    writeFileSync(appFilePath, buildStarterApp(useTypeScript, componentsDir), 'utf-8');
    logStep(`Created ${hi(`src/index.${ext}`)}  ${dim('starter Hello, TermUI app')}`);
  } else {
    logWarn(`${hi(`src/index.${ext}`)} already exists — skipping`);
  }

  // ─── Install dependencies ─────────────────────────────────────────────────
  if (shouldInstall) {
    const installCmd = buildInstallCommand(pm);
    logStep(`Installing dependencies…`);
    try {
      execSync(installCmd, { stdio: silent ? 'ignore' : 'inherit', cwd });
    } catch {
      logWarn(`Install failed. Run manually: ${hi(installCmd)}`);
    }
  }

  // ─── Install positional components via `add` ──────────────────────────────
  if (parsed.components.length > 0) {
    logStep(`Adding components: ${parsed.components.map((c) => hi(c)).join(', ')}`);
    const prevCwd = process.cwd();
    try {
      if (cwd !== prevCwd) process.chdir(cwd);
      const { add } = await import('./add.js');
      const addArgs = [...parsed.components];
      if (parsed.reinstall) addArgs.push('--force');
      await add(addArgs, { isNested: true });
    } finally {
      if (cwd !== prevCwd) process.chdir(prevCwd);
    }
  }

  // ─── Done ─────────────────────────────────────────────────────────────────
  logDone('All done! TermUI is ready.');

  logOutro(
    `Next: ${hi('npx termui add box text spinner')}  ·  ${hi('npx termui list')}  ·  ${hi('npx termui preview')}`
  );
}
