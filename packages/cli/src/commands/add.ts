import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';
import { pathToFileURL } from 'url';
import { getConfig } from '../utils/config.js';
import { fetchManifest, fetchComponentFile, type ComponentMeta } from '../registry/client.js';
import { resolveWithin } from '../utils/pathSafety.js';
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

// ─── Package manager detection + auto-install ────────────────────────────────

function detectPackageManager(cwd: string): string {
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(cwd, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(cwd, 'bun.lockb'))) return 'bun';
  return 'npm';
}

function getMissingDeps(deps: string[], cwd: string): string[] {
  return deps.filter((dep) => !existsSync(join(cwd, 'node_modules', dep)));
}

function installDeps(deps: string[], cwd: string): void {
  const missing = getMissingDeps(deps, cwd);
  if (missing.length === 0) return;
  const pm = detectPackageManager(cwd);
  const cmd = pm === 'npm' ? `npm install ${missing.join(' ')}` : `${pm} add ${missing.join(' ')}`;
  try {
    execSync(cmd, { stdio: 'inherit', cwd });
  } catch {
    warn(`Auto-install failed. Run manually: ${hi(cmd)}`);
  }
}

/** Core packages every component needs — installed once before any component is written. */
const CORE_DEPS = ['termui', 'react', 'ink'];

/**
 * Adapters are already bundled inside `termui` as subpath exports (e.g. `termui/commander`).
 * The user doesn't download any files — they just need the underlying npm package installed.
 * Map: adapter name the user types → npm package(s) to install.
 */
const ADAPTER_DEPS: Record<string, string[]> = {
  commander: ['commander'],
  chalk: ['chalk'],
  ora: ['ora'],
  meow: ['meow'],
  inquirer: ['inquirer'],
  yargs: ['yargs'],
  vue: ['vue'],
  svelte: ['svelte'],
  conf: ['conf'],
  execa: ['execa'],
  'node-pty': ['node-pty'],
  pty: ['node-pty'],
  keychain: ['keytar'],
  git: ['simple-git'],
  github: ['@octokit/rest'],
  ai: ['@anthropic-ai/sdk'],
};

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

function resolveProjectPath(cwd: string, ...segments: string[]): string {
  return resolveWithin(cwd, ...segments);
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
    const registryUrl = config.registry;

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
      const url = `${registryUrl}/recipes/${encodeURIComponent(recipeName)}.json`;
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
    let wiringPath: string;
    try {
      wiringPath = resolveProjectPath(cwd, config.componentsDir, recipe.wiringFile);
    } catch {
      fail(`Recipe '${recipeName}' returned an unsafe wiring path.`);
      process.exit(2);
    }
    if (!isDryRun) {
      if (!existsSync(dirname(wiringPath))) mkdirSync(dirname(wiringPath), { recursive: true });
      writeFileSync(wiringPath, recipe.wiringContent, 'utf-8');
      step(`${hi('◇')} ${recipe.wiringFile} (wiring)`);
    }

    done(`Recipe ${hi(recipe.name)} installed`);
    outro(`Import from ${hi(`'./components/ui'`)}`);
    return;
  }

  // Special case: `termui add mcp` → install MCP server config
  if (filteredArgs.length === 1 && filteredArgs[0] === 'mcp') {
    const { installMcp } = await import('./mcp.js');
    await installMcp();
    return;
  }

  if (filteredArgs.length === 0) {
    console.error(`\x1b[31mError:\x1b[0m Please specify a component name.`);
    console.error(`  Example: \x1b[36mnpx termui add spinner\x1b[0m\n`);
    process.exit(1);
  }

  const cwd = process.cwd();
  const config = getConfig(cwd);

  // Build ordered registry URL list: primary first, then any extras from config.registries
  const primaryUrl = config.registry;
  const extraRegistries = (config.registries ?? []).filter((r) => r !== primaryUrl);
  const allRegistryUrls = [primaryUrl, ...extraRegistries];

  if (!opts?.isNested) {
    printLogo();
    intro('termui');
  }

  // Fetch and merge manifests from all configured registries.
  // Later registries can override components from earlier ones (community overrides core).
  active('Connecting to registry…');
  let registry: Awaited<ReturnType<typeof fetchManifest>>;
  try {
    registry = await fetchManifest(primaryUrl);
  } catch {
    fail(`Failed to fetch registry from ${bold(primaryUrl)}`);
    process.exit(2);
  }

  // Merge in extra registries — components from extra registries shadow the primary
  for (const extraUrl of extraRegistries) {
    try {
      const extra = await fetchManifest(extraUrl);
      registry = { ...registry, components: { ...registry.components, ...extra.components } };
    } catch {
      warn(`Could not reach registry ${bold(extraUrl)} — skipping`);
    }
  }

  // Track which registry URL each component came from for correct file fetching
  const componentRegistryUrl = new Map<string, string>();
  for (const name of Object.keys(registry.components)) {
    componentRegistryUrl.set(name, primaryUrl);
  }
  for (const extraUrl of extraRegistries) {
    try {
      const extra = await fetchManifest(extraUrl);
      for (const name of Object.keys(extra.components)) {
        componentRegistryUrl.set(name, extraUrl);
      }
    } catch {
      // already warned above
    }
  }

  const registryUrl = primaryUrl;

  const installAll = filteredArgs.includes('--all');
  const targets = installAll
    ? Object.keys(registry.components)
    : filteredArgs.filter((a) => a !== '--all');

  if (installAll) {
    step(`Found ${hi(String(targets.length))} components`);
  } else {
    if (extraRegistries.length > 0) {
      step(`Sources: ${hi([primaryUrl, ...extraRegistries].join(', '))}`);
    } else {
      step(`Source: ${hi(primaryUrl)}`);
    }
    step(`Installing ${hi(targets.join(', '))}`);
  }

  if (isDryRun) {
    step(`${c.yellow}[dry-run]${c.reset} No files will be written`);
  }

  const allComponentNames = Object.keys(registry.components);

  // Validate all requested components exist before installing anything
  if (!installAll) {
    for (const componentName of targets) {
      if (ADAPTER_DEPS[componentName]) continue; // adapters are always valid
      if (!registry.components[componentName]) {
        fail(`No component ${bold(`'${componentName}'`)} found.`);

        const closest = findClosestMatch(componentName, allComponentNames);
        if (closest && closest.distance <= 3) {
          console.log(`${c.yellow}  Did you mean ${closest.name}?${c.reset}`);
          const closestMeta = registry.components[closest.name];
          if (closestMeta) {
            const sameCategory = allComponentNames.filter(
              (n) => registry.components[n]?.category === closestMeta.category
            );
            console.log(`  Available in ${closestMeta.category}: ${sameCategory.join(', ')}`);
          }
        } else {
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
    }
  }

  // Ensure core deps are installed for every component
  if (!isDryRun) {
    const missingCore = getMissingDeps(CORE_DEPS, cwd);
    if (missingCore.length > 0) {
      step(`Installing core deps: ${hi(missingCore.join(', '))}`);
      installDeps(missingCore, cwd);
    }
  }
  const installed = new Set<string>();
  let addedCount = 0;
  let existedCount = 0;
  let failedCount = 0;

  for (const componentName of targets) {
    // Handle adapter installs — no files to copy, just install the underlying npm package
    const adapterDeps = ADAPTER_DEPS[componentName];
    if (adapterDeps) {
      if (!isDryRun) {
        step(`Adapter ${hi(componentName)} → installing ${hi(adapterDeps.join(', '))}`);
        installDeps(adapterDeps, cwd);
        step(
          `${hi('◇')} termui/${componentName} ready  ${dim(`import from 'termui/${componentName}'`)}`
        );
      } else {
        step(`${c.yellow}[dry-run]${c.reset} Would install: ${adapterDeps.join(', ')}`);
      }
      addedCount++;
      continue;
    }

    const meta = registry.components[componentName];
    if (!meta) continue; // pre-flight check already caught unknown components

    const result = await installComponent(
      meta,
      config.componentsDir,
      cwd,
      registry,
      componentRegistryUrl.get(componentName) ?? registryUrl,
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
  let outDir: string;
  try {
    outDir = resolveProjectPath(cwd, componentsDir, categoryDir);
  } catch {
    fail(`Registry metadata for '${meta.name}' resolved outside the project directory.`);
    process.exit(2);
  }

  if (!isDryRun && !existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  for (const fileName of meta.files) {
    let outPath: string;
    try {
      outPath = resolveProjectPath(outDir, fileName);
    } catch {
      fail(`Registry file path '${fileName}' for '${meta.name}' is unsafe.`);
      process.exit(2);
    }
    const relPath = relative(cwd, outPath);

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
      // A stub re-exporting from 'termui/components' would compile but fail at
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

  if (meta.deps && meta.deps.length > 0 && !isDryRun) {
    step(`Installing peer deps: ${hi(meta.deps.join(', '))}`);
    installDeps(meta.deps, cwd);
  }

  return { added, existed, failed };
}
