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

// ---------------------------------------------------------------------------
// Prop extraction helpers
// ---------------------------------------------------------------------------

interface PropInfo {
  name: string;
  type: string;
  required: boolean;
}

function extractProps(source: string, componentName: string): PropInfo[] {
  // Look for the Props interface: interface XxxProps { ... }
  // Use a regex to find the interface block
  const interfaceRegex = new RegExp(
    `interface\\s+${componentName}Props[\\s\\S]*?\\{([^}]+)\\}`,
    'g'
  );

  const props: PropInfo[] = [];
  const match = interfaceRegex.exec(source);
  if (!match) return props;

  const body = match[1]!;
  // Match each prop: name?: type or name: type
  const propRegex = /^\s*(?:\/\*[\s\S]*?\*\/)?\s*(\w+)(\??):\s*([^;]+);/gm;
  let propMatch: RegExpExecArray | null;

  while ((propMatch = propRegex.exec(body)) !== null) {
    const name = propMatch[1]!;
    const optional = propMatch[2] === '?';
    const type = propMatch[3]!.trim();
    props.push({ name, type, required: !optional });
  }

  return props;
}

function diffProps(
  oldProps: PropInfo[],
  newProps: PropInfo[]
): { added: PropInfo[]; removed: PropInfo[]; changed: Array<{ old: PropInfo; new: PropInfo }> } {
  const oldMap = new Map(oldProps.map((p) => [p.name, p]));
  const newMap = new Map(newProps.map((p) => [p.name, p]));

  const added: PropInfo[] = [];
  const removed: PropInfo[] = [];
  const changed: Array<{ old: PropInfo; new: PropInfo }> = [];

  for (const [name, prop] of newMap) {
    if (!oldMap.has(name)) {
      added.push(prop);
    } else {
      const old = oldMap.get(name)!;
      if (old.type !== prop.type || old.required !== prop.required) {
        changed.push({ old, new: prop });
      }
    }
  }

  for (const [name, prop] of oldMap) {
    if (!newMap.has(name)) removed.push(prop);
  }

  return { added, removed, changed };
}

// ---------------------------------------------------------------------------
// Code diff helper
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Main diff command
// ---------------------------------------------------------------------------

export async function diff(args: string[]): Promise<void> {
  // Strip flag args before treating as component names
  const componentArgs = args.filter((a) => !a.startsWith('--'));

  if (componentArgs.length === 0) {
    console.error(c.red('Error:') + ' Please specify a component name.');
    console.error('  Example: ' + c.cyan('npx termui diff spinner') + '\n');
    process.exit(1);
  }

  const propsOnly = args.includes('--props-only');
  const breakingCheck = args.includes('--breaking');

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

  let hasBreakingChanges = false;

  for (const componentName of componentArgs) {
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

    // Collect sources for prop analysis (keyed by file name)
    let localSource: string | null = null;
    let registrySource: string | null = null;

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

      // Keep the first .tsx/.ts file for prop analysis
      if (localSource === null && /\.[tj]sx?$/.test(fileName)) {
        localSource = localContent;
        registrySource = registryContent;
      }

      if (!propsOnly) {
        const diffOutput = computeDiff(localContent, registryContent, fileName);

        if (!diffOutput) {
          console.log(c.green(`  ✓ ${fileName}: up to date`));
        } else {
          hasAnyDiff = true;
          console.log(`  ${c.yellow('~')} ${fileName}:`);
          console.log(diffOutput);
        }
      }
    }

    // Prop-changes section
    if (localSource !== null && registrySource !== null) {
      const compName = componentName
        .split('-')
        .map((s) => s[0]!.toUpperCase() + s.slice(1))
        .join('');
      const localProps = extractProps(localSource, compName);
      const registryProps = extractProps(registrySource, compName);

      if (localProps.length > 0 || registryProps.length > 0) {
        const { added, removed, changed } = diffProps(localProps, registryProps);

        if (added.length > 0 || removed.length > 0 || changed.length > 0) {
          console.log(`\n${c.bold('Prop changes:')}`);

          for (const p of added) {
            console.log(`  \x1b[32m+ ${p.name}${p.required ? '' : '?'}: ${p.type}\x1b[0m`);
          }
          for (const p of removed) {
            console.log(
              `  \x1b[31m- ${p.name}${p.required ? '' : '?'}: ${p.type}\x1b[0m  ${c.dim('(REMOVED)')}`
            );
          }
          for (const ch of changed) {
            console.log(
              `  \x1b[33m~ ${ch.old.name}${ch.old.required ? '' : '?'}: ${ch.old.type}\x1b[0m`
            );
            console.log(
              `    \x1b[33m→ ${ch.new.name}${ch.new.required ? '' : '?'}: ${ch.new.type}\x1b[0m`
            );
          }

          // Track breaking changes: removed props or props that became required
          if (
            breakingCheck &&
            (removed.length > 0 || changed.some((ch) => ch.new.required && !ch.old.required))
          ) {
            hasBreakingChanges = true;
          }
        }
      }
    }

    if (propsOnly) {
      // Skip the code-diff verdict when --props-only is set
      continue;
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

  if (breakingCheck && hasBreakingChanges) {
    process.exit(1);
  }
}
