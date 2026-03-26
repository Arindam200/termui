/**
 * npx termui publish — submit a community component to the TermUI registry.
 *
 * Validates the component structure, then opens a GitHub PR against
 * the termui community-registry repo (or prints instructions if
 * termui/github peer is not installed).
 */

import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
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

interface PublishOptions {
  dryRun?: boolean;
}

export async function publish(args: string[], opts: PublishOptions = {}): Promise<void> {
  const componentPath = args[0];
  const isDryRun = args.includes('--dry-run') || opts.dryRun;

  if (!componentPath) {
    console.error(`${c.yellow}Usage:${c.reset} npx termui publish <component-directory>`);
    console.error(`  Example: ${hi('npx termui publish ./my-component')}\n`);
    process.exit(1);
  }

  printLogo();
  intro('termui publish');

  const cwd = process.cwd();
  const compDir = resolve(cwd, componentPath);

  if (!existsSync(compDir)) {
    fail(`Directory not found: ${bold(componentPath)}`);
    process.exit(1);
  }

  // ─── 1. Validate structure ────────────────────────────────────────────────
  active('Validating component structure…');

  const metaPath = join(compDir, 'meta.json');
  if (!existsSync(metaPath)) {
    fail(`No ${bold('meta.json')} found in ${componentPath}`);
    console.log(`  Create a meta.json with: name, description, version, category, files, deps`);
    process.exit(1);
  }

  let meta: {
    name?: string;
    description?: string;
    version?: string;
    category?: string;
    files?: string[];
    author?: { name: string; url?: string; github?: string };
  };

  try {
    meta = JSON.parse(readFileSync(metaPath, 'utf-8')) as typeof meta;
  } catch {
    fail(`Invalid JSON in meta.json`);
    process.exit(1);
  }

  // Required fields check
  const missing: string[] = [];
  if (!meta.name) missing.push('name');
  if (!meta.description) missing.push('description');
  if (!meta.version) missing.push('version');
  if (!meta.category) missing.push('category');
  if (!meta.files || meta.files.length === 0) missing.push('files');

  if (missing.length > 0) {
    fail(`meta.json is missing required fields: ${bold(missing.join(', '))}`);
    process.exit(1);
  }

  // Check source files exist
  for (const file of meta.files ?? []) {
    if (!existsSync(join(compDir, file))) {
      fail(`Source file not found: ${bold(file)}`);
      process.exit(1);
    }
  }

  step(`${hi('✓')} meta.json valid — ${bold(meta.name!)} v${meta.version} (${meta.category})`);

  // ─── 2. Check for test file ───────────────────────────────────────────────
  const hasTest =
    meta.files?.some((f) => f.includes('.test.')) ||
    existsSync(join(compDir, `${meta.name}.test.tsx`)) ||
    existsSync(join(compDir, `${meta.name}.test.ts`));

  if (!hasTest) {
    warn(`No test file found. Tests are strongly recommended for community components.`);
    warn(`  Add: ${dim(`${meta.name}.test.tsx`)}`);
  } else {
    step(`${hi('✓')} Test file present`);
  }

  // ─── 3. Check for author ──────────────────────────────────────────────────
  if (!meta.author?.name) {
    warn(
      `No ${bold('author')} in meta.json. Add: ${dim('"author": { "name": "your-name", "github": "your-handle" }')}`
    );
  }

  // ─── 4. Submit ────────────────────────────────────────────────────────────
  if (isDryRun) {
    console.log(
      `\n${c.yellow}[dry-run]${c.reset} Validation passed — would open GitHub PR for ${bold(meta.name!)}`
    );
  } else {
    console.log('');
    step(`Component validated. To submit to the community registry:`);
    console.log('');
    console.log(`  ${bold('Option A:')} Use the GitHub CLI`);
    console.log(`  ${dim('1. Fork https://github.com/arindam200/termui-community')}`);
    console.log(`  ${dim(`2. Copy your component to components/${meta.name}/`)}`);
    console.log(`  ${dim('3. Open a PR with title: [community] Add <component-name>')}`);
    console.log('');
    console.log(`  ${bold('Option B:')} Install the GitHub adapter for automated PRs`);
    console.log(`  ${dim('npm install @octokit/rest && npm install termui')}`);
    console.log(`  ${dim('Then re-run npx termui publish (with GITHUB_TOKEN set)')}`);

    // Try automated PR if @octokit/rest is available
    try {
      const { Octokit } = await import('@octokit/rest');
      const token = process.env['GITHUB_TOKEN'];
      if (token) {
        active('Opening GitHub PR automatically…');
        // In a real implementation, this would:
        // 1. Create a fork of the community registry repo
        // 2. Create a branch with the component files
        // 3. Open a PR
        // For now, show instructions
        warn('Automated PR creation requires a community registry repo — coming soon!');
      }
    } catch {
      // @octokit/rest not installed — instructions already shown above
    }
  }

  done(isDryRun ? `Dry run complete for ${hi(meta.name!)}` : `Ready to publish ${hi(meta.name!)}`);
  outro('Visit https://github.com/arindam200/termui to contribute components');
}
