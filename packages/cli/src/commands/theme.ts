import { getConfig, writeConfig } from '../utils/config.js';
import { printLogo, intro, step, done, outro, hi, dim, bold } from '../utils/ui.js';

// ANSI color helpers
const c = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
};

const AVAILABLE_THEMES = [
  'default',
  'dracula',
  'nord',
  'catppuccin',
  'monokai',
  'solarized',
  'tokyo-night',
  'one-dark',
  'high-contrast',
];

const THEME_DESCRIPTIONS: Record<string, string> = {
  default: 'Clean, neutral theme with blue accents',
  dracula: 'Dark purple theme with vibrant colors',
  nord: 'Arctic, north-bluish color palette',
  catppuccin: 'Soothing pastel theme for the high-spirited',
  monokai: 'Classic dark theme with vivid colors',
  solarized: 'Precision colors for machines and people',
  'tokyo-night': 'Dark theme inspired by Tokyo at night',
  'one-dark': 'Atom One Dark color scheme',
  'high-contrast': 'WCAG AA high-contrast theme for accessibility',
};

const THEME_PREVIEWS: Record<string, string> = {
  default: '\x1b[34m■\x1b[0m \x1b[32m■\x1b[0m \x1b[31m■\x1b[0m \x1b[33m■\x1b[0m',
  dracula: '\x1b[35m■\x1b[0m \x1b[32m■\x1b[0m \x1b[36m■\x1b[0m \x1b[33m■\x1b[0m',
  nord: '\x1b[34m■\x1b[0m \x1b[36m■\x1b[0m \x1b[32m■\x1b[0m \x1b[31m■\x1b[0m',
  catppuccin: '\x1b[35m■\x1b[0m \x1b[34m■\x1b[0m \x1b[36m■\x1b[0m \x1b[32m■\x1b[0m',
  monokai: '\x1b[33m■\x1b[0m \x1b[32m■\x1b[0m \x1b[36m■\x1b[0m \x1b[35m■\x1b[0m',
  solarized: '\x1b[33m■\x1b[0m \x1b[34m■\x1b[0m \x1b[36m■\x1b[0m \x1b[32m■\x1b[0m',
  'tokyo-night': '\x1b[34m■\x1b[0m \x1b[35m■\x1b[0m \x1b[36m■\x1b[0m \x1b[33m■\x1b[0m',
  'one-dark': '\x1b[34m■\x1b[0m \x1b[36m■\x1b[0m \x1b[32m■\x1b[0m \x1b[33m■\x1b[0m',
  'high-contrast': '\x1b[97m■\x1b[0m \x1b[93m■\x1b[0m \x1b[96m■\x1b[0m \x1b[92m■\x1b[0m',
};

function listThemes(currentTheme: string): void {
  console.log(`\n${c.bold(c.magenta('◆ Available TermUI Themes'))}\n`);

  for (const theme of AVAILABLE_THEMES) {
    const isCurrent = theme === currentTheme;
    const preview = THEME_PREVIEWS[theme] ?? '';
    const desc = THEME_DESCRIPTIONS[theme] ?? '';
    const marker = isCurrent ? c.green('✓') : ' ';
    const name = isCurrent ? c.bold(c.green(theme.padEnd(14))) : c.cyan(theme.padEnd(14));

    console.log(`  ${marker} ${name}  ${preview}  ${c.dim(desc)}`);
  }

  console.log();
  console.log(`${c.dim(`Current theme: ${currentTheme}`)}`);
  console.log(`${c.dim('Apply: npx termui theme <name>')}`);
  console.log(
    `${c.dim('Community themes: npm search termui-theme-* | npx termui theme add <package>')}\n`
  );
}

export async function theme(args: string[]): Promise<void> {
  const subcommand = args[0];

  if (subcommand === 'add') {
    return themeAdd(args.slice(1));
  }
  if (subcommand === 'publish') {
    return themePublish();
  }

  const cwd = process.cwd();
  const config = getConfig(cwd);

  if (args.length === 0) {
    listThemes(config.theme);
    return;
  }

  const themeName = args[0]!.toLowerCase();

  if (!AVAILABLE_THEMES.includes(themeName)) {
    console.error(c.red('✗') + ` Unknown theme: ${c.bold(themeName)}`);
    console.error(`  Available themes: ${AVAILABLE_THEMES.join(', ')}\n`);
    process.exit(1);
  }

  if (themeName === config.theme) {
    console.log(`${c.yellow('~')} Theme ${c.bold(themeName)} is already active.\n`);
    return;
  }

  const updatedConfig = { ...config, theme: themeName };
  writeConfig(updatedConfig, cwd);

  console.log(`${c.green('✓')} Theme set to ${c.bold(c.cyan(themeName))}`);
  console.log(`${c.dim('Updated termui.config.json')}\n`);

  // Show preview
  const preview = THEME_PREVIEWS[themeName] ?? '';
  const desc = THEME_DESCRIPTIONS[themeName] ?? '';
  console.log(`  ${preview}  ${desc}\n`);
}

async function themeAdd(args: string[]): Promise<void> {
  const pkgName = args[0];
  if (!pkgName) {
    console.error(`Usage: npx termui theme add <npm-package>`);
    console.error(`  Example: npx termui theme add termui-theme-gruvbox`);
    process.exit(1);
  }

  printLogo();
  intro('termui theme add');

  step(`Installing theme package ${hi(pkgName)}…`);
  console.log(`\n  Run: ${hi(`npm install ${pkgName}`)}`);
  console.log('');
  step('Then add to termui.config.ts:');
  console.log(`
${dim(`import { default as myTheme } from '${pkgName}';`)}
${dim(`import { defineConfig } from 'termui';`)}
${dim('')}
${dim(`export default defineConfig({`)}
${dim(`  theme: myTheme,   // pass the imported theme object`)}
${dim(`});`)}
`);

  done(`Theme ${hi(pkgName)} instructions ready`);
  outro('Share themes via npm with the termui-theme-* naming convention');
}

async function themePublish(): Promise<void> {
  printLogo();
  intro('termui theme publish');

  const cwd = process.cwd();
  const config = getConfig(cwd);

  step('Scaffolding publishable theme package…');

  // Generate theme package scaffold
  const packageName = `termui-theme-custom`;
  const packageJson = {
    name: packageName,
    version: '0.1.0',
    type: 'module',
    description: 'A custom TermUI theme',
    keywords: ['termui', 'termui-theme', 'terminal', 'cli'],
    main: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        import: './dist/index.js',
        types: './dist/index.d.ts',
      },
    },
    peerDependencies: {
      termui: '>=1.0.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
      tsup: '^8.0.0',
    },
  };

  const indexTs = `import { createTheme } from 'termui';

const myTheme = createTheme({
  name: '${packageName}',
  colors: {
    primary: '#YOUR_COLOR',
    // Override any tokens from the default theme
    // See: https://termui.dev/theming
  },
});

export default myTheme;
`;

  const tsupConfig = `import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
});
`;

  const { writeFileSync, mkdirSync, existsSync } = await import('fs');
  const { join } = await import('path');

  const themePkgDir = join(cwd, packageName);

  if (!existsSync(themePkgDir)) {
    mkdirSync(join(themePkgDir, 'src'), { recursive: true });
  }

  writeFileSync(join(themePkgDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  writeFileSync(join(themePkgDir, 'src', 'index.ts'), indexTs);
  writeFileSync(join(themePkgDir, 'tsup.config.ts'), tsupConfig);

  step(`${hi('◇')} ${packageName}/package.json`);
  step(`${hi('◇')} ${packageName}/src/index.ts`);
  step(`${hi('◇')} ${packageName}/tsup.config.ts`);

  console.log('');
  console.log(`  ${bold('Next steps:')}`);
  console.log(`  ${dim(`1. Edit ${packageName}/src/index.ts with your colors`)}`);
  console.log(`  ${dim(`2. cd ${packageName} && pnpm build`)}`);
  console.log(`  ${dim(`3. npm publish --access public`)}`);
  console.log(`  ${dim(`4. Users install with: npx termui theme add ${packageName}`)}`);

  done('Theme package scaffolded');
  outro(`Name your package ${hi('termui-theme-*')} for discoverability`);

  // suppress unused variable warning — config is read for future extension
  void config;
}
