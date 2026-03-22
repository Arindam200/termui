import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getConfig } from '../utils/config.js';
import {
  fetchManifest,
  fetchComponentFile,
  getLocalRegistry,
  type ComponentMeta,
} from '../registry/client.js';

// Category to source subdirectory mapping
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

export async function add(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error('\x1b[31mError:\x1b[0m Please specify a component name.');
    console.error('  Example: \x1b[36mnpx termui add spinner\x1b[0m\n');
    process.exit(1);
  }

  const cwd = process.cwd();
  const config = getConfig(cwd);
  const registryUrl = config.registry ?? 'https://arindam200.github.io/termui';

  // Try fetching the live manifest; falls back to embedded local registry
  const registry = await fetchManifest(registryUrl);

  const installAll = args.includes('--all');
  const targets = installAll ? Object.keys(registry.components) : args.filter((a) => a !== '--all');

  for (const componentName of targets) {
    const meta = registry.components[componentName];

    if (!meta) {
      console.error(`\x1b[31m✗\x1b[0m Component not found: \x1b[1m${componentName}\x1b[0m`);
      console.error(`  Run \x1b[36mnpx termui list\x1b[0m to see available components.\n`);
      continue;
    }

    await installComponent(meta, config.componentsDir, cwd, registry, registryUrl);
  }
}

async function installComponent(
  meta: ComponentMeta,
  componentsDir: string,
  cwd: string,
  registry: Awaited<ReturnType<typeof fetchManifest>>,
  registryUrl: string,
  installed = new Set<string>()
): Promise<void> {
  if (installed.has(meta.name)) return;
  installed.add(meta.name);

  console.log(`\x1b[35m◆\x1b[0m Adding \x1b[1m${meta.name}\x1b[0m...`);

  // Install peer components first
  if (meta.peerComponents) {
    for (const peer of meta.peerComponents) {
      const peerMeta = registry.components[peer];
      if (peerMeta) {
        await installComponent(peerMeta, componentsDir, cwd, registry, registryUrl, installed);
      }
    }
  }

  // Resolve output directory
  const categoryDir = CATEGORY_DIR[meta.category] ?? meta.category;
  const outDir = join(cwd, componentsDir, categoryDir);

  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  for (const fileName of meta.files) {
    const outPath = join(outDir, fileName);
    if (existsSync(outPath)) {
      console.log(`  \x1b[33m~\x1b[0m ${fileName} already exists, skipping`);
      continue;
    }

    let source: string;
    try {
      source = await fetchComponentFile(registryUrl, meta.name, fileName);
    } catch {
      // Registry unreachable — write a re-export stub so the user can still build
      source = [
        `// ${meta.name} — ${meta.description}`,
        `// Source: npx termui add ${meta.name}`,
        `// Docs:   https://termui.dev/components/${meta.name}`,
        ``,
        `export { ${fileName.replace(/\.tsx?$/, '')} } from '@termui/components';`,
        ``,
      ].join('\n');
      console.log(`  \x1b[33m!\x1b[0m Registry unreachable — wrote re-export stub for ${fileName}`);
    }

    writeFileSync(outPath, source, 'utf-8');
    console.log(`  \x1b[32m✓\x1b[0m Created ${outPath.replace(cwd + '/', '')}`);
  }

  // Remind about npm deps if any
  if (meta.deps && meta.deps.length > 0) {
    console.log(`  \x1b[36mi\x1b[0m Peer deps: \x1b[1m${meta.deps.join(', ')}\x1b[0m`);
    console.log(`    Install with: npm install ${meta.deps.join(' ')}`);
  }

  console.log(`\x1b[32m✓\x1b[0m Added \x1b[1m${meta.name}\x1b[0m\n`);
}
