/**
 * termui/conf — conf + env-paths helpers for CLI configuration storage.
 * Requires optional peers `conf` and `env-paths`.
 */

import { existsSync } from 'fs';
import { join } from 'path';

export async function createConf<T extends Record<string, unknown>>(opts: {
  projectName: string;
  defaults?: T;
}): Promise<unknown> {
  const Conf = (await import('conf')).default;
  return new Conf({ projectName: opts.projectName, defaults: opts.defaults });
}

export async function createAppPaths(name: string): Promise<{
  data: string;
  config: string;
  cache: string;
  log: string;
  temp: string;
}> {
  const envPaths = (await import('env-paths')).default;
  return envPaths(name, { suffix: 'termui' });
}

// ─── D3: loadConfig — cosmiconfig-style config file loader ───────────────────

export interface LoadConfigResult<T> {
  config: T;
  filepath: string;
  isEmpty: boolean;
}

/**
 * Load a config file using cosmiconfig-style search order.
 * Searches (in order):
 *   <name>.config.ts  →  <name>.config.js  →  .<name>rc.ts  →  .<name>rc.js
 *   →  .<name>rc.json  →  .<name>rc  →  package.json#<name>
 *
 * TypeScript config files are loaded via dynamic import().
 */
export async function loadConfig<T = Record<string, unknown>>(
  name: string,
  cwd = process.cwd()
): Promise<LoadConfigResult<T> | null> {
  const searchPaths: Array<{ file: string; type: 'ts' | 'js' | 'json' }> = [
    { file: `${name}.config.ts`, type: 'ts' },
    { file: `${name}.config.js`, type: 'js' },
    { file: `.${name}rc.ts`, type: 'ts' },
    { file: `.${name}rc.js`, type: 'js' },
    { file: `.${name}rc.json`, type: 'json' },
    { file: `.${name}rc`, type: 'json' },
  ];

  for (const { file, type } of searchPaths) {
    const filepath = join(cwd, file);
    if (!existsSync(filepath)) continue;

    if (type === 'json') {
      const { readFileSync } = await import('fs');
      try {
        const raw = readFileSync(filepath, 'utf-8').trim();
        if (!raw) return { config: {} as T, filepath, isEmpty: true };
        const config = JSON.parse(raw) as T;
        return { config, filepath, isEmpty: false };
      } catch {
        return { config: {} as T, filepath, isEmpty: true };
      }
    }

    if (type === 'ts' || type === 'js') {
      try {
        const mod = (await import(filepath)) as { default?: T } | T;
        const config = (
          typeof mod === 'object' && mod !== null && 'default' in mod
            ? (mod as { default: T }).default
            : mod
        ) as T;
        return { config, filepath, isEmpty: false };
      } catch {
        return { config: {} as T, filepath, isEmpty: true };
      }
    }
  }

  // Check package.json#<name> field
  const pkgPath = join(cwd, 'package.json');
  if (existsSync(pkgPath)) {
    const { readFileSync } = await import('fs');
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as Record<string, unknown>;
      if (name in pkg) {
        return { config: pkg[name] as T, filepath: pkgPath, isEmpty: false };
      }
    } catch {
      /* ignore */
    }
  }

  return null;
}

/**
 * Type-safe config file helper — use in your config file for IDE autocompletion.
 *
 * @example
 * // mytool.config.ts
 * import { defineConfig } from 'termui/conf';
 * export default defineConfig({ theme: 'dracula', port: 3000 });
 */
export function defineConfig<T>(config: T): T {
  return config;
}
