// Run with: npx tsx examples/with-commander/index.ts --help

/**
 * Example: termui/commander — themed help output via commander adapter
 */

import { createCommanderProgram, loadCommander } from '../../packages/adapters/commander/index.js';

async function main() {
  const mod = (await loadCommander()) as {
    Command: new () => Record<string, (...args: unknown[]) => unknown>;
    Option: new (flags: string, description?: string) => unknown;
  };

  const { program, applyTermuiStyle } = createCommanderProgram({
    name: 'my-app',
    version: '1.0.0',
    description: 'A sample CLI built with @termui/adapters/commander',
    themeColor: '#00d7ff',
  });

  // Resolve the lazy program to get the real commander Command instance
  const prog = await (program as unknown as Promise<typeof mod.Command.prototype>);

  // Global flags
  (prog as Record<string, (...a: unknown[]) => unknown>)
    ['option']('-v, --verbose', 'Enable verbose output')
    [
      'option'
    ]('-e, --env <environment>', 'Target environment (development|staging|production)', 'development');

  // build command
  const buildCmd = new mod.Command();
  buildCmd['name']('build')
    ['description']('Compile and bundle the project')
    ['option']('-o, --output <dir>', 'Output directory', 'dist')
    ['option']('--minify', 'Minify output bundles')
    ['action']((opts: Record<string, unknown>) => {
      const verbose = (prog as Record<string, unknown>)['opts']?.() as Record<string, boolean>;
      if (verbose?.verbose) console.log('[verbose] Starting build...');
      console.log(`Building → ${opts['output'] as string}${opts['minify'] ? ' (minified)' : ''}`);
    });

  // deploy command
  const deployCmd = new mod.Command();
  deployCmd['name']('deploy')
    ['description']('Deploy the project to the target environment')
    ['option']('--dry-run', 'Preview deployment without executing')
    ['action']((opts: Record<string, unknown>) => {
      const globals = (prog as Record<string, unknown>)['opts']?.() as Record<string, string>;
      const env = globals?.env ?? 'development';
      if (opts['dryRun']) {
        console.log(`[dry-run] Would deploy to ${env}`);
      } else {
        console.log(`Deploying to ${env}...`);
      }
    });

  // status command
  const statusCmd = new mod.Command();
  statusCmd['name']('status')
    ['description']('Show current deployment status')
    ['action'](() => {
      const globals = (prog as Record<string, unknown>)['opts']?.() as Record<string, string>;
      const env = globals?.env ?? 'development';
      console.log(`Status: environment=${env}, healthy=true`);
    });

  (prog as Record<string, (...a: unknown[]) => unknown>)
    ['addCommand'](buildCmd)
    ['addCommand'](deployCmd)
    ['addCommand'](statusCmd);

  // Apply TermUI-themed help output (colored headings, dimmed descriptions)
  applyTermuiStyle();

  (prog as Record<string, (...a: unknown[]) => unknown>)['parseAsync'](process.argv);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
