import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getConfig } from '../utils/config.js';
import { fetchManifest, fetchComponentFile, getLocalRegistry } from '../registry/client.js';

// ANSI color helpers
const c = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
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

function computeDiff(original: string, updated: string, fileName: string): string {
  const origLines = original.split('\n');
  const updLines = updated.split('\n');

  const lines: string[] = [];
  lines.push(c.bold(`--- local/${fileName}`));
  lines.push(c.bold(`+++ registry/${fileName}`));

  const maxLen = Math.max(origLines.length, updLines.length);
  let hasDiff = false;

  for (let i = 0; i < maxLen; i++) {
    const origLine = origLines[i];
    const updLine = updLines[i];

    if (origLine === undefined) {
      lines.push(c.green(`+  ${updLine}`));
      hasDiff = true;
    } else if (updLine === undefined) {
      lines.push(c.red(`-  ${origLine}`));
      hasDiff = true;
    } else if (origLine !== updLine) {
      lines.push(c.red(`-  ${origLine}`));
      lines.push(c.green(`+  ${updLine}`));
      hasDiff = true;
    } else {
      lines.push(c.dim(`   ${origLine}`));
    }
  }

  if (!hasDiff) return '';
  return lines.join('\n');
}

export async function diff(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error(c.red('Error:') + ' Please specify a component name.');
    console.error('  Example: ' + c.cyan('npx termui diff spinner') + '\n');
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

  for (const componentName of args) {
    const meta = registry.components[componentName];

    if (!meta) {
      console.error(c.red('✗') + ` Component not found: ${c.bold(componentName)}`);
      console.error(`  Run ${c.cyan('npx termui list')} to see available components.\n`);
      continue;
    }

    const categoryDir = CATEGORY_DIR[meta.category] ?? meta.category;
    const outDir = join(cwd, config.componentsDir, categoryDir);

    console.log(`\n${c.bold(c.cyan(`Diff: ${meta.name}`))}\n`);

    let hasAnyDiff = false;
    let hasSkipped = false;
    let checkedCount = 0;

    for (const fileName of meta.files) {
      const filePath = join(outDir, fileName);

      if (!existsSync(filePath)) {
        console.log(
          c.yellow(`  ~ ${fileName}: not installed locally`) +
            c.dim(`  (run npx termui add ${meta.name})`)
        );
        hasSkipped = true;
        continue;
      }

      // Fetch registry version for comparison
      let registryContent: string;
      try {
        registryContent = await fetchComponentFile(registryUrl, meta.name, fileName);
      } catch {
        console.log(
          c.yellow(`  ~ ${fileName}: could not fetch registry version`) +
            c.dim('  (check your network)')
        );
        hasSkipped = true;
        continue;
      }

      checkedCount++;
      const localContent = readFileSync(filePath, 'utf-8');
      const diffOutput = computeDiff(localContent, registryContent, fileName);

      if (!diffOutput) {
        console.log(c.green(`  ✓ ${fileName}: up to date`));
      } else {
        hasAnyDiff = true;
        console.log(`  ${c.yellow('~')} ${fileName}:`);
        console.log(diffOutput);
      }
    }

    if (hasSkipped && checkedCount === 0) {
      // Every file was missing or unreachable — no verdict possible
      console.log(
        c.yellow(
          `\n~ ${meta.name}: not fully installed. Run ${c.cyan(`npx termui add ${meta.name}`)}\n`
        )
      );
    } else if (hasAnyDiff) {
      console.log(
        c.yellow(
          `\n~ ${meta.name} has differences. Run ${c.cyan(`npx termui update ${meta.name}`)} to update.\n`
        )
      );
    } else {
      console.log(c.green(`\n✓ ${meta.name} is up to date.\n`));
    }
  }
}
