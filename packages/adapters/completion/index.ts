/**
 * termui/completion — shell completion snippets from minimal CLI metadata.
 */

import type { CLIConfig } from '../args/index.js';

export function generateBashCompletion(config: CLIConfig): string {
  const names = Object.keys(config.commands).join(' ');
  const fn = `_${config.name.replace(/[^a-zA-Z0-9]/g, '_')}_completions`;
  return `# Generated TermUI bash completion for ${config.name}
${fn}() {
  local cur=\${COMP_WORDS[COMP_CWORD]}
  if [[ \${COMP_CWORD} -eq 1 ]]; then
    COMPREPLY=( $(compgen -W "${names} help --help --version -h -v" -- "\${cur}") )
    return
  fi
}
complete -F ${fn} ${config.name}
`;
}

export function generateZshCompletion(config: CLIConfig): string {
  const names = Object.keys(config.commands).join(' ');
  return `#compdef ${config.name}
# Generated TermUI zsh completion for ${config.name}
_arguments "1: :(${names} help)" '*::options:->opts'
`;
}
