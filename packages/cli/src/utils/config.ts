import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface TermUIConfig {
  version: string;
  componentsDir: string;
  registry: string;
  theme: string;
}

const DEFAULT_CONFIG: TermUIConfig = {
  version: '0.1.0',
  componentsDir: './components/ui',
  registry: 'https://registry.termui.dev',
  theme: 'default',
};

export function readConfig(cwd = process.cwd()): TermUIConfig | null {
  const configPath = join(cwd, 'termui.config.json');
  if (!existsSync(configPath)) return null;
  try {
    const raw = readFileSync(configPath, 'utf-8');
    return JSON.parse(raw) as TermUIConfig;
  } catch {
    return null;
  }
}

export function writeConfig(config: TermUIConfig, cwd = process.cwd()): void {
  const configPath = join(cwd, 'termui.config.json');
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

export function getConfig(cwd = process.cwd()): TermUIConfig {
  return readConfig(cwd) ?? DEFAULT_CONFIG;
}
