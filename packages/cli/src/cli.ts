/**
 * TermUI CLI — npx termui
 *
 * Command routing uses createCLI from termui/args (@termui/adapters) — dogfooding the product.
 */

import { checkForUpdates } from './utils/updates.js';
import { printLogo, intro, step, outro, hi, dim, select, multiselect } from './utils/ui.js';
import { createCLI } from './utils/createCLI.js';

// ─── CLI config (termui/args — dogfooding) ────────────────────────────────────

const cli = createCLI({
  name: 'termui',
  version: '1.4.1',
  description: 'TermUI — shadcn-style terminal UI component library',
  commands: {
    init: { name: 'init', description: 'Initialize TermUI in your project' },
    add: {
      name: 'add',
      description: 'Add one or more components from the registry',
      args: { component: { description: 'Component name(s) or --all / --recipe <name>' } },
    },
    list: {
      name: 'list',
      description: 'Browse available components',
      args: {
        category: { description: 'Filter by category (--category <name>)' },
        search: { description: 'Fuzzy search (--search <query>)' },
      },
    },
    diff: { name: 'diff', description: 'Show diff vs registry' },
    update: { name: 'update', description: 'Re-download a component from the registry' },
    theme: { name: 'theme', description: 'Apply a built-in theme' },
    preview: { name: 'preview', description: 'Interactive component gallery' },
    create: { name: 'create', description: 'Scaffold a new TermUI project' },
    dev: { name: 'dev', description: 'Watch mode — hot-reload on file change' },
    docs: { name: 'docs', description: 'Show inline docs for a component' },
    publish: { name: 'publish', description: 'Submit a component to the community registry' },
    mcp: {
      name: 'mcp',
      description: 'Start the TermUI MCP server (stdio) for AI assistant integration',
    },
    completion: {
      name: 'completion',
      description: 'Print shell completion script (bash/zsh/fish/powershell)',
      args: { shell: { description: 'Shell: bash | zsh | fish | powershell', required: true } },
    },
  },
});

// ─── Dispatch ─────────────────────────────────────────────────────────────────

async function main() {
  // Show update notice on every command (non-blocking)
  checkForUpdates().catch(() => {}); // fire and forget

  const rawArgs = process.argv.slice(2);

  // No command → interactive menu
  if (rawArgs.length === 0) {
    await interactiveMenu();
    return;
  }

  // --version / -v handled before createCLI so we can show the logo
  if (rawArgs[0] === '--version' || rawArgs[0] === '-v') {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const pkg = require('../package.json') as { version: string };
    printLogo();
    intro('termui');
    step(`Version ${hi(`v${pkg.version}`)}`);
    outro(`${hi('npx termui help')} for commands`);
    return;
  }

  // Delegate routing + --help/unknown-command to createCLI (termui/args)
  const parsed = cli.parse(rawArgs);
  if (!parsed) {
    // createCLI already printed help or an error
    return;
  }

  const { command } = parsed;
  const cmdArgs = rawArgs.slice(1);

  switch (command) {
    case 'init': {
      const { init } = await import('./commands/init.js');
      await init(cmdArgs);
      break;
    }

    case 'add': {
      const { add } = await import('./commands/add.js');
      await add(cmdArgs);
      break;
    }

    case 'list': {
      const { list } = await import('./commands/list.js');
      await list(cmdArgs);
      break;
    }

    case 'diff': {
      const { diff } = await import('./commands/diff.js');
      await diff(cmdArgs);
      break;
    }

    case 'update': {
      const { update } = await import('./commands/update.js');
      await update(cmdArgs);
      break;
    }

    case 'theme': {
      const { theme } = await import('./commands/theme.js');
      await theme(cmdArgs);
      break;
    }

    case 'preview': {
      const { preview, previewHelp } = await import('./commands/preview.js');
      if (cmdArgs.includes('--help') || cmdArgs.includes('-h')) {
        previewHelp();
      } else {
        await preview(cmdArgs);
      }
      break;
    }

    case 'dev': {
      const { dev } = await import('./commands/dev.js');
      await dev(cmdArgs);
      break;
    }

    case 'docs': {
      const { docs } = await import('./commands/docs.js');
      await docs(cmdArgs);
      break;
    }

    case 'completion': {
      const shell = cmdArgs[0];
      if (!shell || !['bash', 'zsh', 'fish', 'powershell'].includes(shell)) {
        console.error(`\x1b[31mError:\x1b[0m Usage: npx termui completion <bash|zsh|fish|powershell>`);
        process.exit(1);
      }
      await runCompletion(shell as 'bash' | 'zsh' | 'fish' | 'powershell');
      break;
    }

    case 'mcp': {
      const { mcp, mcpHelp } = await import('./commands/mcp.js');
      if (cmdArgs.includes('--help') || cmdArgs.includes('-h')) {
        mcpHelp();
      } else {
        await mcp(cmdArgs);
      }
      break;
    }

    case 'publish': {
      const { publish } = await import('./commands/publish.js');
      await publish(cmdArgs, {});
      break;
    }

    case 'create': {
      const { create } = await import('./commands/create.js');
      await create(cmdArgs);
      break;
    }
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

    const { add } = await import('./commands/add.js');
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

    const { add: addCmd } = await import('./commands/add.js');
    await addCmd(chosen, { isNested: true });
  } else if (action === 'init') {
    const { init } = await import('./commands/init.js');
    await init([], { isNested: true });
  } else if (action === 'theme') {
    const { theme } = await import('./commands/theme.js');
    await theme([]);
  } else if (action === 'preview') {
    const { preview } = await import('./commands/preview.js');
    await preview([]);
  } else if (action === 'list') {
    const { list } = await import('./commands/list.js');
    await list([], { isNested: true });
  } else if (action === 'dev') {
    const { dev } = await import('./commands/dev.js');
    await dev([]);
  } else {
    cli.help();
  }
}

async function runCompletion(shell: 'bash' | 'zsh' | 'fish' | 'powershell'): Promise<void> {
  const { getLocalRegistry } = await import('./registry/client.js');
  const registry = getLocalRegistry();
  const comps = Object.keys(registry.components).join(' ');
  const THEMES =
    'default dracula nord catppuccin monokai tokyo-night one-dark solarized high-contrast high-contrast-light';
  const CMDS =
    'init add list diff update theme preview dev docs create publish completion help --help --version';

  if (shell === 'powershell') {
    const cmdList = CMDS.split(' ').map((c) => `'${c}'`).join(', ');
    const compList = comps.split(' ').filter(Boolean).map((c) => `'${c}'`).join(', ');
    const themeList = THEMES.split(' ').map((t) => `'${t}'`).join(', ');
    process.stdout.write(`# TermUI PowerShell completion
# Add the following to your PowerShell profile ($PROFILE):
#   npx termui completion powershell | Out-String | Invoke-Expression

Register-ArgumentCompleter -Native -CommandName @('termui', 'npx') -ScriptBlock {
  param($wordToComplete, $commandAst, $cursorPosition)
  $cmds = @(${cmdList})
  $comps = @(${compList})
  $themes = @(${themeList})
  $words = $commandAst.CommandElements
  if ($words.Count -le 2) {
    $cmds | Where-Object { $_ -like "$wordToComplete*" } |
      ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) }
    return
  }
  $prev = $words[$words.Count - 2].ToString()
  switch ($prev) {
    { $_ -in 'add','update','diff' } {
      $comps | Where-Object { $_ -like "$wordToComplete*" } |
        ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) }
    }
    'theme' {
      $themes | Where-Object { $_ -like "$wordToComplete*" } |
        ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) }
    }
    'completion' {
      @('bash','zsh','fish','powershell') | Where-Object { $_ -like "$wordToComplete*" } |
        ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) }
    }
  }
}
`);
  } else if (shell === 'bash') {
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
    completion)      COMPREPLY=( $(compgen -W "bash zsh fish powershell" -- "\${cur}") ); return ;;
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
        completion)      _arguments '*: :(bash zsh fish powershell)' ;;
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

main().catch((err) => {
  console.error('\x1b[31mFatal error:\x1b[0m', err.message ?? err);
  process.exit(1);
});
