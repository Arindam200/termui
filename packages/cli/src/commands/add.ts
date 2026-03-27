import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { pathToFileURL } from 'url';
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
  c,
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

// ─── Levenshtein distance (inline, no extra deps) ─────────────────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]!;
      } else {
        dp[i]![j] = 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
      }
    }
  }
  return dp[m]![n]!;
}

function findClosestMatch(
  query: string,
  candidates: string[]
): { name: string; distance: number } | null {
  let best: { name: string; distance: number } | null = null;
  for (const name of candidates) {
    const d = levenshtein(query, name);
    if (best === null || d < best.distance) {
      best = { name, distance: d };
    }
  }
  return best;
}

// ─── Prettier formatting (optional) ──────────────────────────────────────────

async function formatWithPrettier(source: string, filePath: string, cwd: string): Promise<string> {
  // Try ESM entry (Prettier 3.x) first, then CJS (Prettier 2.x)
  const candidates = ['index.mjs', 'index.js', 'index.cjs'];
  for (const entry of candidates) {
    const candidate = resolve(cwd, 'node_modules', 'prettier', entry);
    if (!existsSync(candidate)) continue;
    try {
      const prettierUrl = pathToFileURL(candidate).href;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prettier = (await import(prettierUrl)) as any;
      const mod = prettier.default ?? prettier; // handle ESM default export
      const config = (await mod.resolveConfig(filePath)) ?? {};
      return await mod.format(source, {
        ...config,
        filepath: filePath,
        parser: 'typescript',
      });
    } catch {
      // Try next candidate
    }
  }
  return source;
}

export async function add(args: string[], opts?: { isNested?: boolean }): Promise<void> {
  const isDryRun = args.includes('--dry-run');
  const filteredArgs = args.filter((a) => a !== '--dry-run');

  // Handle --recipe flag early
  const recipeIdx = filteredArgs.indexOf('--recipe');
  if (recipeIdx !== -1) {
    const recipeName = filteredArgs[recipeIdx + 1];

    const cwd = process.cwd();
    const config = getConfig(cwd);
    const registryUrl = config.registry ?? 'https://arindam200.github.io/termui';

    if (!opts?.isNested) {
      printLogo();
      intro('termui');
    }

    if (!recipeName) {
      fail('Please specify a recipe name: npx termui add --recipe <name>');
      process.exit(1);
    }

    // Resolve registry manifest
    active('Connecting to registry…');
    let registry: Awaited<ReturnType<typeof fetchManifest>>;
    try {
      registry = await fetchManifest(registryUrl);
    } catch {
      fail(`Failed to fetch registry from ${bold(registryUrl)}`);
      process.exit(2);
    }

    if (isDryRun) {
      step(`${c.yellow}[dry-run]${c.reset} No files will be written`);
    }

    active(`Fetching recipe ${bold(recipeName)}…`);
    let recipe: {
      name: string;
      components: string[];
      wiringFile: string;
      wiringContent: string;
      description?: string;
    };
    try {
      const url = `${registryUrl}/recipes/${recipeName}.json`;
      const res = await fetch(url);
      if (!res.ok) {
        fail(`Recipe '${recipeName}' not found in registry.`);
        process.exit(2);
      }
      recipe = (await res.json()) as typeof recipe;
    } catch {
      fail(`Could not fetch recipe '${recipeName}' from registry.`);
      process.exit(2);
    }

    step(`Recipe: ${hi(recipe.name)} — ${recipe.description ?? ''}`);
    step(`Components: ${hi(recipe.components.join(', '))}`);

    const recipeInstalled = new Set<string>();
    // Install all components
    for (const compName of recipe.components) {
      const meta = registry.components[compName];
      if (meta) {
        await installComponent(
          meta,
          config.componentsDir,
          cwd,
          registry,
          registryUrl,
          recipeInstalled,
          isDryRun
        );
      }
    }

    // Write wiring file
    const wiringPath = join(cwd, config.componentsDir, recipe.wiringFile);
    if (!isDryRun) {
      if (!existsSync(dirname(wiringPath))) mkdirSync(dirname(wiringPath), { recursive: true });
      writeFileSync(wiringPath, recipe.wiringContent, 'utf-8');
      step(`${hi('◇')} ${recipe.wiringFile} (wiring)`);
    }

    done(`Recipe ${hi(recipe.name)} installed`);
    outro(`Import from ${hi(`'./components/ui'`)}`);
    return;
  }

  if (filteredArgs.length === 0) {
    console.error(`\x1b[31mError:\x1b[0m Please specify a component name.`);
    console.error(`  Example: \x1b[36mnpx termui add spinner\x1b[0m\n`);
    process.exit(1);
  }

  const cwd = process.cwd();
  const config = getConfig(cwd);
  const registryUrl = config.registry ?? 'https://arindam200.github.io/termui';

  if (!opts?.isNested) {
    printLogo();
    intro('termui');
  }

  // Resolve registry manifest
  active('Connecting to registry…');
  let registry: Awaited<ReturnType<typeof fetchManifest>>;
  try {
    registry = await fetchManifest(registryUrl);
  } catch {
    fail(`Failed to fetch registry from ${bold(registryUrl)}`);
    process.exit(2);
  }

  const installAll = filteredArgs.includes('--all');
  const targets = installAll
    ? Object.keys(registry.components)
    : filteredArgs.filter((a) => a !== '--all');

  if (installAll) {
    step(`Found ${hi(String(targets.length))} components`);
  } else {
    step(`Source: ${hi(registryUrl)}`);
    step(`Installing ${hi(targets.join(', '))}`);
  }

  if (isDryRun) {
    step(`${c.yellow}[dry-run]${c.reset} No files will be written`);
  }

  const allComponentNames = Object.keys(registry.components);
  const installed = new Set<string>();
  let addedCount = 0;
  let existedCount = 0;
  let failedCount = 0;

  for (const componentName of targets) {
    const meta = registry.components[componentName];
    if (!meta) {
      fail(`No component ${bold(`'${componentName}'`)} found.`);

      // Fuzzy match: find closest candidate
      const closest = findClosestMatch(componentName, allComponentNames);
      if (closest && closest.distance <= 3) {
        console.log(`${c.yellow}  Did you mean ${closest.name}?${c.reset}`);
        // Show all components in the same category as the closest match
        const closestMeta = registry.components[closest.name];
        if (closestMeta) {
          const sameCategory = allComponentNames.filter(
            (n) => registry.components[n]?.category === closestMeta.category
          );
          console.log(`  Available in ${closestMeta.category}: ${sameCategory.join(', ')}`);
        }
      } else {
        // No close match — show all categories
        const byCategory: Record<string, string[]> = {};
        for (const name of allComponentNames) {
          const cat = registry.components[name]?.category ?? 'other';
          if (!byCategory[cat]) byCategory[cat] = [];
          byCategory[cat]!.push(name);
        }
        for (const [cat, names] of Object.entries(byCategory)) {
          console.log(`  Available in ${cat}: ${names.join(', ')}`);
        }
      }

      process.exit(1);
    }

    const result = await installComponent(
      meta,
      config.componentsDir,
      cwd,
      registry,
      registryUrl,
      installed,
      isDryRun
    );
    addedCount += result.added;
    existedCount += result.existed;
    failedCount += result.failed;
  }

  if (isDryRun) {
    console.log(`${c.yellow}  Dry run complete — no files written.${c.reset}`);
  } else {
    const parts: string[] = [];
    if (existedCount > 0) parts.push(`${existedCount} already existed`);
    if (failedCount > 0) parts.push(`${failedCount} registry unreachable`);
    done(
      `Added ${hi(String(addedCount))} file${addedCount !== 1 ? 's' : ''}` +
        (parts.length > 0 ? `  ${dim(`(${parts.join(', ')})`)}` : '')
    );
  }

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
  installed: Set<string>,
  isDryRun = false
): Promise<{ added: number; existed: number; failed: number }> {
  if (installed.has(meta.name)) return { added: 0, existed: 0, failed: 0 };
  installed.add(meta.name);

  let added = 0;
  let existed = 0;
  let failed = 0;

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
          installed,
          isDryRun
        );
        added += r.added;
        existed += r.existed;
        failed += r.failed;
      }
    }
  }

  const categoryDir = CATEGORY_DIR[meta.category] ?? meta.category;
  const outDir = join(cwd, componentsDir, categoryDir);

  if (!isDryRun && !existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  for (const fileName of meta.files) {
    const outPath = join(outDir, fileName);
    const relPath = outPath.replace(cwd + '/', '');

    if (!isDryRun && existsSync(outPath)) {
      warn(`${dim(relPath)} already exists — skipping`);
      existed++;
      continue;
    }

    let source: string;
    try {
      source = await fetchComponentFile(registryUrl, meta.name, fileName);
    } catch {
      // Registry unreachable — skip this file rather than write a broken stub.
      // A stub re-exporting from '@termui/components' would compile but fail at
      // runtime because that package is not a declared dependency.
      if (!isDryRun) {
        warn(
          `Registry unreachable — ${hi(fileName)} skipped. ` +
            `Run ${hi(`npx termui add ${meta.name}`)} again when online.`
        );
      }
      failed++;
      continue;
    }

    // Format with Prettier if available in the user's project
    const formatted = await formatWithPrettier(source, outPath, cwd);

    if (isDryRun) {
      console.log(`  ${c.yellow}[dry-run]${c.reset} Would write: ${relPath}`);
      const preview = formatted
        .split('\n')
        .slice(0, 8)
        .map((l) => dim(`    ${l}`))
        .join('\n');
      if (preview) console.log(preview);
    } else {
      writeFileSync(outPath, formatted, 'utf-8');
      step(`${hi('◇')} ${relPath}`);
    }
    added++;
  }

  if (meta.deps && meta.deps.length > 0) {
    step(`Peer deps: ${hi(meta.deps.join(', '))}  ${dim(`npm install ${meta.deps.join(' ')}`)}`);
  }

  return { added, existed, failed };
}
