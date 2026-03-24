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
      await add(args);
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

    case 'completion': {
      const shell = args[0];
      if (!shell || !['bash', 'zsh', 'fish'].includes(shell)) {
        console.error(`\x1b[31mError:\x1b[0m Usage: npx termui completion <bash|zsh|fish>`);
        process.exit(1);
      }
      await runCompletion(shell as 'bash' | 'zsh' | 'fish');
      break;
    }

    case 'create': {
      const { create } = await import('./commands/create.js');
      await create(args);
      break;
    }

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
    { value: 'preview', label: 'Preview component gallery', hint: 'browse all components' },
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

    await add(chosen, { isNested: true });
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

    await add(chosen, { isNested: true });
  } else if (action === 'init') {
    await init([], { isNested: true });
  } else if (action === 'theme') {
    await theme([]);
  } else if (action === 'preview') {
    await preview([]);
  } else if (action === 'list') {
    await list([], { isNested: true });
  } else if (action === 'dev') {
    await dev([]);
  } else {
    printHelp();
  }
}

async function runCompletion(shell: 'bash' | 'zsh' | 'fish'): Promise<void> {
  const { getLocalRegistry } = await import('./registry/client.js');
  const registry = getLocalRegistry();
  const comps = Object.keys(registry.components).join(' ');
  const THEMES = 'default dracula nord catppuccin monokai tokyo-night one-dark solarized';
  const CMDS =
    'init add list diff update theme preview dev create completion help --help --version';

  if (shell === 'bash') {
    process.stdout.write(`# TermUI bash completion — source <(npx termui completion bash)
_termui_completions() {
  local cur=\${COMP_WORDS[COMP_CWORD]}
  local prev=\${COMP_WORDS[COMP_CWORD-1]}
  if [[ \${COMP_CWORD} -eq 1 ]]; then
    COMPREPLY=( $(compgen -W "${CMDS}" -- "\${cur}") )
    return
  fi
  case "\${prev}" in
    add|update|diff) COMPREPLY=( $(compgen -W "${comps}" -- "\${cur}") ); return ;;
    theme)           COMPREPLY=( $(compgen -W "${THEMES}" -- "\${cur}") ); return ;;
    completion)      COMPREPLY=( $(compgen -W "bash zsh fish" -- "\${cur}") ); return ;;
  esac
}
complete -F _termui_completions termui npx
`);
  } else if (shell === 'zsh') {
    process.stdout.write(`#compdef termui
# TermUI zsh completion — source <(npx termui completion zsh)
_termui() {
  local state
  _arguments '1: :->cmd' '*::args:->args'
  case $state in
    cmd) _arguments "1: :(${CMDS})" ;;
    args)
      case $words[1] in
        add|update|diff) _arguments '*: :(${comps})' ;;
        theme)           _arguments '*: :(${THEMES})' ;;
        completion)      _arguments '*: :(bash zsh fish)' ;;
      esac
    ;;
  esac
}
_termui
`);
  } else {
    // fish
    const compLines = [`# TermUI fish completion — copy to ~/.config/fish/completions/termui.fish`];
    for (const cmd of CMDS.split(' ')) {
      compLines.push(`complete -c termui -f -n '__fish_use_subcommand' -a ${cmd}`);
    }
    for (const comp of comps.split(' ').filter(Boolean)) {
      compLines.push(
        `complete -c termui -f -n '__fish_seen_subcommand_from add update diff' -a ${comp}`
      );
    }
    for (const t of THEMES.split(' ')) {
      compLines.push(`complete -c termui -f -n '__fish_seen_subcommand_from theme' -a ${t}`);
    }
    process.stdout.write(compLines.join('\n') + '\n');
  }
}

function printHelp() {
  printLogo();
  intro('termui');

  const cmds: [string, string][] = [
    ['init', 'Initialize TermUI in your project'],
    ['add <component>', 'Add one or more components from the registry'],
    ['add --all', 'Add all components at once'],
    ['update <component>', 'Re-download a component from the registry'],
    ['list', 'Browse all available components'],
    ['diff <component>', 'Show diff between local and registry version'],
    ['theme [name]', 'List or apply a theme'],
    ['preview', 'Interactive component gallery'],
    ['create <name>', 'Scaffold a new TermUI project'],
    ['list --category <cat>', 'Filter list by category'],
    ['list --search <q>', 'Search components by name/description'],
    ['list --json', 'Machine-readable JSON output'],
    ['completion <shell>', 'Print shell completion script (bash/zsh/fish)'],
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

  outro(`Docs: ${hi('https://arindam200.github.io/termui')}  ·  v1.1.3`);
}

main().catch((err) => {
  console.error('\x1b[31mFatal error:\x1b[0m', err.message ?? err);
  process.exit(1);
});
