#!/usr/bin/env node
/**
 * TermUI CLI — npx termui
 */

import { init } from './commands/init.js';
import { add } from './commands/add.js';
import { list } from './commands/list.js';
import { diff } from './commands/diff.js';
import { update } from './commands/update.js';
import { theme } from './commands/theme.js';
import { preview, previewHelp } from './commands/preview.js';
import { dev } from './commands/dev.js';
import { checkForUpdates } from './utils/updates.js';
import { printLogo, intro, step, outro, hi, dim, c, sym } from './utils/ui.js';

const [, , command, ...args] = process.argv;

async function main() {
  // Show update notice on every command (non-blocking)
  checkForUpdates().catch(() => {}); // fire and forget

  switch (command) {
    case 'init':
      await init(args);
      break;

    case 'add':
      // Support --all flag to install all components
      if (args.includes('--all')) {
        const { getLocalRegistry } = await import('./registry/client.js');
        const registry = getLocalRegistry();
        const allNames = Object.keys(registry.components);
        await add(allNames);
      } else {
        await add(args);
      }
      break;

    case 'list':
      await list(args);
      break;

    case 'diff':
      await diff(args);
      break;

    case 'update':
      await update(args);
      break;

    case 'theme':
      await theme(args);
      break;

    case 'preview':
      if (args.includes('--help') || args.includes('-h')) {
        previewHelp();
      } else {
        await preview(args);
      }
      break;

    case 'dev':
      await dev(args);
      break;

    case 'help':
    case '--help':
    case '-h':
    case undefined:
      printHelp();
      break;

    case '--version':
    case '-v': {
      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);
      const pkg = require('../../package.json') as { version: string };
      printLogo();
      intro('termui');
      step(`Version ${hi(`v${pkg.version}`)}`);
      outro(`${hi('npx termui help')} for commands`);
      break;
    }

    default:
      printLogo();
      intro('termui');
      console.log(`${sym.pipe}`);
      console.log(`${sym.error}  Unknown command: ${c.bold}${command}${c.reset}`);
      outro(`Run ${hi('npx termui help')} to see available commands`);
      process.exit(1);
  }
}

function printHelp() {
  printLogo();
  intro('termui');

  const cmds: [string, string][] = [
    ['init',               'Initialize TermUI in your project'],
    ['add <component>',    'Add one or more components from the registry'],
    ['add --all',          'Add all 91 components at once'],
    ['update <component>', 'Re-download a component from the registry'],
    ['list',               'Browse all available components'],
    ['diff <component>',   'Show diff between local and registry version'],
    ['theme [name]',       'List or apply a theme'],
    ['preview',            'Interactive component gallery (91 components)'],
    ['dev',                'Watch mode — hot-reload on file change'],
    ['help',               'Show this help message'],
  ];

  step(`${c.bold}Usage${c.reset}  npx termui ${c.gray}<command>${c.reset}`);
  console.log(`${sym.pipe}`);
  console.log(`${sym.hollow}  ${c.bold}Commands${c.reset}`);
  for (const [cmd, desc] of cmds) {
    console.log(`${c.gray}│${c.reset}    ${hi(cmd.padEnd(24))}${dim(desc)}`);
  }

  step(`${c.bold}Examples${c.reset}`);
  const examples = [
    'npx termui init',
    'npx termui add spinner table',
    'npx termui add --all',
    'npx termui theme dracula',
    'npx termui preview',
  ];
  for (const ex of examples) {
    console.log(`${c.gray}│${c.reset}    ${hi(ex)}`);
  }

  outro(`Docs: ${hi('https://arindam200.github.io/termui')}  ·  v1.0.0`);
}

main().catch((err) => {
  console.error('\x1b[31mFatal error:\x1b[0m', err.message ?? err);
  process.exit(1);
});
