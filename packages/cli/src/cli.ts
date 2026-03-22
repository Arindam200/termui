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
import { printLogo, intro, step, outro, hi, dim, c, sym, select, multiselect } from './utils/ui.js';

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
      printHelp();
      break;

    case undefined:
      await interactiveMenu();
      break;

    case '--version':
    case '-v': {
      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);
      const pkg = require('../package.json') as { version: string };
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

const CATEGORY_ICONS: Record<string, string> = {
  layout: '📐',
  typography: '🔤',
  input: '⌨️',
  selection: '☑️',
  data: '📊',
  feedback: '💬',
  navigation: '🧭',
  overlays: '🪟',
  forms: '📝',
  utility: '🔧',
  charts: '📈',
  templates: '🎨',
};

async function interactiveMenu(): Promise<void> {
  printLogo();
  intro('termui');

  const action = await select('What would you like to do?', [
    { value: 'add-component', label: 'Add a component', hint: 'browse by category' },
    { value: 'add-template', label: 'Use a template', hint: 'starter layouts & pages' },
    { value: 'init', label: 'Initialize project', hint: 'set up termui.config.json' },
    { value: 'theme', label: 'Change theme', hint: 'dracula, nord, catppuccin…' },
    { value: 'preview', label: 'Preview component gallery', hint: '91 components' },
    { value: 'list', label: 'Browse all components', hint: 'grouped by category' },
    { value: 'dev', label: 'Dev mode', hint: 'watch & hot-reload' },
    { value: 'help', label: 'Show help', hint: 'all commands & examples' },
  ]);

  if (action === 'add-component') {
    const { getLocalRegistry } = await import('./registry/client.js');
    const registry = getLocalRegistry();
    const components = Object.values(registry.components).filter((c) => c.category !== 'templates');

    // Build unique category list preserving insertion order
    const categories = [...new Set(components.map((c) => c.category))];

    const category = await select(
      'Choose a category',
      categories.map((cat) => ({
        value: cat,
        label: `${CATEGORY_ICONS[cat] ?? '•'}  ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
        hint: `${components.filter((c) => c.category === cat).length} components`,
      }))
    );

    const inCategory = components.filter((c) => c.category === category);
    const chosen = await multiselect(
      `Select components to add  ${dim(`(${category})`)}`,
      inCategory.map((c) => ({ value: c.name, label: c.name, hint: c.description }))
    );

    if (chosen.length === 0) {
      step('No components selected.');
      outro('Run again to pick components');
      return;
    }

    await add(chosen);
  } else if (action === 'add-template') {
    const { getLocalRegistry } = await import('./registry/client.js');
    const registry = getLocalRegistry();
    const templates = Object.values(registry.components).filter((c) => c.category === 'templates');

    if (templates.length === 0) {
      step('No templates found in the registry.');
      outro('Check the docs for available templates');
      return;
    }

    const chosen = await multiselect(
      'Select templates to add',
      templates.map((t) => ({ value: t.name, label: t.name, hint: t.description }))
    );

    if (chosen.length === 0) {
      step('No templates selected.');
      outro('Run again to pick templates');
      return;
    }

    await add(chosen);
  } else if (action === 'init') {
    await init([]);
  } else if (action === 'theme') {
    await theme([]);
  } else if (action === 'preview') {
    await preview([]);
  } else if (action === 'list') {
    await list([]);
  } else if (action === 'dev') {
    await dev([]);
  } else {
    printHelp();
  }
}

function printHelp() {
  printLogo();
  intro('termui');

  const cmds: [string, string][] = [
    ['init', 'Initialize TermUI in your project'],
    ['add <component>', 'Add one or more components from the registry'],
    ['add --all', 'Add all 91 components at once'],
    ['update <component>', 'Re-download a component from the registry'],
    ['list', 'Browse all available components'],
    ['diff <component>', 'Show diff between local and registry version'],
    ['theme [name]', 'List or apply a theme'],
    ['preview', 'Interactive component gallery (91 components)'],
    ['dev', 'Watch mode — hot-reload on file change'],
    ['help', 'Show this help message'],
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
