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
import { checkForUpdates } from './utils/updates.js';

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

    case 'help':
    case '--help':
    case '-h':
    case undefined:
      printHelp();
      break;

    case '--version':
    case '-v':
      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);
      const pkg = require('../../package.json') as { version: string };
      console.log(`termui v${pkg.version}`);
      break;

    default:
      console.error(`\x1b[31mUnknown command: ${command}\x1b[0m`);
      console.error('Run \x1b[1mtermui help\x1b[0m to see available commands.\n');
      process.exit(1);
  }
}

function printHelp() {
  console.log(`
\x1b[1m\x1b[35mtermui\x1b[0m — Terminal UI framework for TypeScript

\x1b[1mUsage:\x1b[0m
  npx termui <command> [options]

\x1b[1mCommands:\x1b[0m
  \x1b[36minit\x1b[0m                Initialize TermUI in your project
  \x1b[36madd <component>\x1b[0m     Add a component from the registry
  \x1b[36madd --all\x1b[0m           Add all available components
  \x1b[36mupdate <component>\x1b[0m  Update (re-install) a component
  \x1b[36mlist\x1b[0m                List all available components
  \x1b[36mdiff <component>\x1b[0m    Show diff between local and registry version
  \x1b[36mtheme [name]\x1b[0m        List or apply a theme
  \x1b[36mpreview\x1b[0m             Interactive component gallery
  \x1b[36mhelp\x1b[0m                Show this help message

\x1b[1mExamples:\x1b[0m
  npx termui init
  npx termui add spinner
  npx termui add table select
  npx termui add --all
  npx termui update spinner
  npx termui diff table
  npx termui list
  npx termui theme dracula
  npx termui preview

\x1b[2mDocs: https://termui.dev\x1b[0m
`);
}

main().catch((err) => {
  console.error('\x1b[31mFatal error:\x1b[0m', err.message ?? err);
  process.exit(1);
});
