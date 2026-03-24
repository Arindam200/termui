/**
 * termui/completion — shell completion snippets from minimal CLI metadata.
 */

import type { CLIConfig } from '../args/index.js';

export interface CompletionConfig extends CLIConfig {
  /** Extra words to complete for specific subcommands (e.g. component names for "add") */
  subcommandCompletions?: Record<string, string[]>;
}

export function generateBashCompletion(config: CompletionConfig): string {
  const names = Object.keys(config.commands).join(' ');
  const fn = `_${config.name.replace(/[^a-zA-Z0-9]/g, '_')}_completions`;

  const subCases = Object.entries(config.subcommandCompletions ?? {})
    .map(
      ([sub, words]) =>
        `    ${sub}) COMPREPLY=( $(compgen -W "${words.join(' ')}" -- "\${cur}") ); return ;;`
    )
    .join('\n');

  return `# Generated TermUI bash completion for ${config.name}
# Add to ~/.bashrc: source <(${config.name} completion bash)
${fn}() {
  local cur=\${COMP_WORDS[COMP_CWORD]}
  local prev=\${COMP_WORDS[COMP_CWORD-1]}
  if [[ \${COMP_CWORD} -eq 1 ]]; then
    COMPREPLY=( $(compgen -W "${names} help --help --version -h -v" -- "\${cur}") )
    return
  fi
  case "\${prev}" in
${subCases}
  esac
}
complete -F ${fn} ${config.name}
`;
}

export function generateZshCompletion(config: CompletionConfig): string {
  const names = Object.keys(config.commands).join(' ');

  const subArgs = Object.entries(config.subcommandCompletions ?? {})
    .map(([sub, words]) => `  ${sub}) _arguments '*: :(${words.join(' ')})' ;;`)
    .join('\n');

  return `#compdef ${config.name}
# Generated TermUI zsh completion for ${config.name}
# Add to ~/.zshrc: source <(${config.name} completion zsh)
_${config.name.replace(/[^a-zA-Z0-9]/g, '_')}() {
  local state
  _arguments '1: :->cmd' '*::args:->args'
  case \$state in
    cmd) _arguments "1: :(${names} help)" ;;
    args)
      case \$words[1] in
${subArgs}
      esac
    ;;
  esac
}
_${config.name.replace(/[^a-zA-Z0-9]/g, '_')}
`;
}

export function generateFishCompletion(config: CompletionConfig): string {
  const lines: string[] = [
    `# Generated TermUI fish completion for ${config.name}`,
    `# Add to ~/.config/fish/completions/${config.name}.fish`,
  ];

  for (const [cmd, def] of Object.entries(config.commands)) {
    lines.push(
      `complete -c ${config.name} -f -n '__fish_use_subcommand' -a ${cmd} -d '${(def as { description?: string }).description ?? ''}'`
    );
  }
  lines.push(`complete -c ${config.name} -f -n '__fish_use_subcommand' -a help -d 'Show help'`);

  for (const [sub, words] of Object.entries(config.subcommandCompletions ?? {})) {
    for (const word of words) {
      lines.push(
        `complete -c ${config.name} -f -n '__fish_seen_subcommand_from ${sub}' -a ${word}`
      );
    }
  }

  return lines.join('\n') + '\n';
}
