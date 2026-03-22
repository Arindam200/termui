import { getConfig, writeConfig } from '../utils/config.js';

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
  console.log(`${c.dim('Apply: npx termui theme <name>')}\n`);
}

export async function theme(args: string[]): Promise<void> {
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
