import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { writeConfig, type TermUIConfig } from '../utils/config.js';

const TERMUI_CONFIG_TS = `import type { TermUIConfig } from 'termui';

const config: TermUIConfig = {
  version: '0.1.0',
  componentsDir: './components/ui',
  registry: 'https://registry.termui.dev',
  theme: 'default',
};

export default config;
`;

export async function init(_args: string[]): Promise<void> {
  const cwd = process.cwd();

  console.log('\x1b[1m\x1b[35m◆ TermUI\x1b[0m — Initializing in', cwd, '\n');

  // Create components/ui directory
  const componentsDir = join(cwd, 'components', 'ui');
  if (!existsSync(componentsDir)) {
    mkdirSync(componentsDir, { recursive: true });
    console.log('\x1b[32m✓\x1b[0m Created', componentsDir.replace(cwd, '.'));
  } else {
    console.log('\x1b[33m~\x1b[0m Directory already exists:', componentsDir.replace(cwd, '.'));
  }

  // Write termui.config.ts
  const configTsPath = join(cwd, 'termui.config.ts');
  if (!existsSync(configTsPath)) {
    writeFileSync(configTsPath, TERMUI_CONFIG_TS, 'utf-8');
    console.log('\x1b[32m✓\x1b[0m Created termui.config.ts');
  } else {
    console.log('\x1b[33m~\x1b[0m termui.config.ts already exists, skipping');
  }

  // Write termui.config.json (runtime config)
  const jsonConfig: TermUIConfig = {
    version: '0.1.0',
    componentsDir: './components/ui',
    registry: 'https://registry.termui.dev',
    theme: 'default',
  };
  writeConfig(jsonConfig, cwd);
  console.log('\x1b[32m✓\x1b[0m Created termui.config.json');

  console.log('\n\x1b[32m✓ Done!\x1b[0m\n');
  console.log('Next steps:');
  console.log('  \x1b[36mnpx termui add spinner\x1b[0m   — Add your first component');
  console.log('  \x1b[36mnpx termui list\x1b[0m           — Browse available components\n');
}
