import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { writeConfig, type TermUIConfig } from '../utils/config.js';
import {
  printLogo, badge, intro, step, active, done, warn, outro,
  hi, dim, bold, select,
} from '../utils/ui.js';

const THEMES = [
  { value: 'default',     label: 'Default',      hint: 'clean neutral palette' },
  { value: 'dracula',     label: 'Dracula',       hint: 'purple & pink dark theme' },
  { value: 'nord',        label: 'Nord',          hint: 'cool arctic blues' },
  { value: 'catppuccin',  label: 'Catppuccin',    hint: 'pastel mocha tones' },
  { value: 'monokai',     label: 'Monokai',       hint: 'classic warm darks' },
  { value: 'tokyo-night', label: 'Tokyo Night',   hint: 'vibrant neon city' },
  { value: 'one-dark',    label: 'One Dark',      hint: 'Atom-inspired dark' },
  { value: 'solarized',   label: 'Solarized',     hint: 'ethan schoonover classic' },
] as const;

type Theme = typeof THEMES[number]['value'];

export async function init(_args: string[]): Promise<void> {
  const cwd = process.cwd();

  // ─── Logo + badge ───────────────────────────────────────────────────────────
  printLogo();
  intro('termui');

  // ─── Step 1: Project info ───────────────────────────────────────────────────
  step(`Initializing in ${hi(cwd)}`);

  // ─── Step 2: components/ui dir ─────────────────────────────────────────────
  const componentsDir = join(cwd, 'components', 'ui');
  if (!existsSync(componentsDir)) {
    mkdirSync(componentsDir, { recursive: true });
    step(`Created ${hi('./components/ui')}`);
  } else {
    warn(`${hi('./components/ui')} already exists — skipping`);
  }

  // ─── Step 3: Theme selection ────────────────────────────────────────────────
  const theme = await select<Theme>('Pick a theme', [...THEMES]);

  // ─── Step 4: Write config ───────────────────────────────────────────────────
  const config: TermUIConfig = {
    version:       '1.0.0',
    componentsDir: './components/ui',
    registry:      'https://arindam200.github.io/termui',
    theme,
  };

  writeConfig(config, cwd);

  const configTsPath = join(cwd, 'termui.config.ts');
  if (!existsSync(configTsPath)) {
    writeFileSync(configTsPath, buildConfigTs(theme), 'utf-8');
    step(`Created ${hi('termui.config.ts')}`);
  } else {
    warn(`${hi('termui.config.ts')} already exists — keeping your config`);
  }

  step(`Wrote ${hi('termui.config.json')}  ${dim(`theme: ${theme}`)}`);

  // ─── Done ───────────────────────────────────────────────────────────────────
  done('All done! TermUI is ready.');

  outro(
    `Next: ${hi('npx termui add spinner')}  ·  ${hi('npx termui list')}  ·  ${hi('npx termui preview')}`
  );
}

function buildConfigTs(theme: string): string {
  return `import type { TermUIConfig } from 'termui';

const config: TermUIConfig = {
  version:       '1.0.0',
  componentsDir: './components/ui',
  registry:      'https://arindam200.github.io/termui',
  theme:         '${theme}',
};

export default config;
`;
}
