import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getConfig } from '../utils/config.js';
import { fetchManifest, fetchComponentFile, type ComponentMeta } from '../registry/client.js';
import {
  printLogo,
  intro,
  step,
  active,
  done,
  warn,
  fail,
  outro,
  hi,
  dim,
  bold,
} from '../utils/ui.js';

// Category → source subdirectory
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

export async function add(args: string[], opts?: { skipHeader?: boolean }): Promise<void> {
  if (args.length === 0) {
    console.error(`\x1b[31mError:\x1b[0m Please specify a component name.`);
    console.error(`  Example: \x1b[36mnpx termui add spinner\x1b[0m\n`);
    process.exit(1);
  }

  const cwd = process.cwd();
  const config = getConfig(cwd);
  const registryUrl = config.registry ?? 'https://arindam200.github.io/termui';

  if (!opts?.skipHeader) {
    printLogo();
    intro('termui');
  }

  // Resolve registry manifest
  active('Connecting to registry…');
  const registry = await fetchManifest(registryUrl);

  const installAll = args.includes('--all');
  const targets = installAll ? Object.keys(registry.components) : args.filter((a) => a !== '--all');

  if (installAll) {
    step(`Found ${hi(String(targets.length))} components`);
  } else {
    step(`Source: ${hi(registryUrl)}`);
    step(`Installing ${hi(targets.join(', '))}`);
  }

  const installed = new Set<string>();
  let addedCount = 0;
  let skippedCount = 0;

  for (const componentName of targets) {
    const meta = registry.components[componentName];
    if (!meta) {
      fail(`Unknown component: ${bold(componentName)}`);
      continue;
    }
    const result = await installComponent(
      meta,
      config.componentsDir,
      cwd,
      registry,
      registryUrl,
      installed
    );
    addedCount += result.added;
    skippedCount += result.skipped;
  }

  done(
    `Added ${hi(String(addedCount))} file${addedCount !== 1 ? 's' : ''}` +
      (skippedCount > 0 ? `  ${dim(`(${skippedCount} already existed)`)}` : '')
  );

  outro(
    `Import from ${hi(`'./components/ui'`)}  ·  ${hi('npx termui list')} to see all components`
  );
}

async function installComponent(
  meta: ComponentMeta,
  componentsDir: string,
  cwd: string,
  registry: Awaited<ReturnType<typeof fetchManifest>>,
  registryUrl: string,
  installed: Set<string>
): Promise<{ added: number; skipped: number }> {
  if (installed.has(meta.name)) return { added: 0, skipped: 0 };
  installed.add(meta.name);

  let added = 0;
  let skipped = 0;

  // Peer components first
  if (meta.peerComponents) {
    for (const peer of meta.peerComponents) {
      const peerMeta = registry.components[peer];
      if (peerMeta) {
        const r = await installComponent(
          peerMeta,
          componentsDir,
          cwd,
          registry,
          registryUrl,
          installed
        );
        added += r.added;
        skipped += r.skipped;
      }
    }
  }

  const categoryDir = CATEGORY_DIR[meta.category] ?? meta.category;
  const outDir = join(cwd, componentsDir, categoryDir);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  for (const fileName of meta.files) {
    const outPath = join(outDir, fileName);
    const relPath = outPath.replace(cwd + '/', '');

    if (existsSync(outPath)) {
      warn(`${dim(relPath)} already exists — skipping`);
      skipped++;
      continue;
    }

    let source: string;
    try {
      source = await fetchComponentFile(registryUrl, meta.name, fileName);
    } catch {
      source = [
        `// ${meta.name} — ${meta.description}`,
        `// Run: npx termui add ${meta.name}`,
        ``,
        `export { ${fileName.replace(/\.tsx?$/, '')} } from '@termui/components';`,
        ``,
      ].join('\n');
      warn(`Registry unreachable — wrote re-export stub for ${hi(fileName)}`);
    }

    writeFileSync(outPath, source, 'utf-8');
    step(`${hi('◇')} ${relPath}`);
    added++;
  }

  if (meta.deps && meta.deps.length > 0) {
    step(`Peer deps: ${hi(meta.deps.join(', '))}  ${dim(`npm install ${meta.deps.join(' ')}`)}`);
  }

  return { added, skipped };
}
