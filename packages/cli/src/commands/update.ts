import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getConfig } from '../utils/config.js';
import {
  fetchManifest,
  fetchComponentFile,
  getLocalRegistry,
  type ComponentMeta,
} from '../registry/client.js';

// ANSI color helpers
const c = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

const CATEGORY_DIR: Record<string, string> = {
  layout: 'layout',
  typography: 'typography',
  input: 'input',
  selection: 'selection',
  data: 'data',
  feedback: 'feedback',
  navigation: 'navigation',
  overlays: 'overlays',
  forms: 'forms',
  utility: 'utility',
  charts: 'charts',
  templates: 'templates',
};

async function updateComponent(
  meta: ComponentMeta,
  componentsDir: string,
  cwd: string,
  registryUrl: string,
  registry: ReturnType<typeof getLocalRegistry>,
  updated: Set<string>
): Promise<void> {
  if (updated.has(meta.name)) return;
  updated.add(meta.name);

  console.log(`${c.magenta('◆')} Updating ${c.bold(meta.name)}…`);

  // Recursively update peer components first
  if (meta.peerComponents) {
    for (const peer of meta.peerComponents) {
      const peerMeta = registry.components[peer];
      if (peerMeta) {
        await updateComponent(peerMeta, componentsDir, cwd, registryUrl, registry, updated);
      }
    }
  }

  const categoryDir = CATEGORY_DIR[meta.category] ?? meta.category;
  const outDir = join(cwd, componentsDir, categoryDir);

  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  let writtenCount = 0;

  for (const fileName of meta.files) {
    const outPath = join(outDir, fileName);
    const existed = existsSync(outPath);

    // Fetch actual source from registry
    let source: string;
    try {
      source = await fetchComponentFile(registryUrl, meta.name, fileName);
    } catch {
      console.log(
        `  ${c.yellow('~')} ${fileName}: ${c.yellow('could not fetch from registry — skipped')}`
      );
      console.log(`  ${c.dim('Hint: check your network or try again later.')}`);
      continue;
    }

    writeFileSync(outPath, source, 'utf-8');
    writtenCount++;

    const action = existed ? c.yellow('↺') : c.green('✓');
    const verb = existed ? 'Updated' : 'Created';
    console.log(`  ${action} ${verb} ${outPath.replace(cwd + '/', '')}`);
  }

  if (writtenCount > 0) {
    console.log(`${c.green('✓')} Updated ${c.bold(meta.name)}\n`);
  } else {
    console.log(`${c.yellow('~')} ${c.bold(meta.name)}: no files written (registry unreachable)\n`);
  }
}

export async function update(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error(c.red('Error:') + ' Please specify a component name.');
    console.error('  Example: ' + c.cyan('npx termui update spinner') + '\n');
    process.exit(1);
  }

  const cwd = process.cwd();
  const config = getConfig(cwd);
  const registryUrl = config.registry ?? 'https://arindam200.github.io/termui';

  // Fetch manifest (with CDN fallback)
  let registry: ReturnType<typeof getLocalRegistry>;
  try {
    registry = await fetchManifest(registryUrl);
  } catch {
    console.error(c.red('Error:') + ' Could not reach the registry. Using local manifest.');
    registry = getLocalRegistry();
  }

  const updated = new Set<string>();

  for (const componentName of args) {
    const meta = registry.components[componentName];

    if (!meta) {
      console.error(c.red('✗') + ` Component not found: ${c.bold(componentName)}`);
      console.error(`  Run ${c.cyan('npx termui list')} to see available components.\n`);
      continue;
    }

    await updateComponent(meta, config.componentsDir, cwd, registryUrl, registry, updated);
  }
}
