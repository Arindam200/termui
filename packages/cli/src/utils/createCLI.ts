/**
 * createCLI — minimal re-export of the termui/args API for use in the TermUI CLI itself.
 *
 * The CLI cannot import from @termui/adapters at compile time (rootDir constraint),
 * so this module provides the same interface inline. Users of termui access this via
 * `import { createCLI } from 'termui/args'` — this file is the CLI-internal equivalent.
 *
 * API is intentionally identical to packages/adapters/args/index.ts.
 */

const c = {
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
};

export interface CLICommand {
  name: string;
  description: string;
  args?: Record<
    string,
    {
      description: string;
      required?: boolean;
      default?: unknown;
    }
  >;
}

export interface CLIConfig {
  name: string;
  version: string;
  description?: string;
  commands: Record<string, CLICommand>;
}

export function createCLI(config: CLIConfig): {
  parse(argv?: string[]): { command: string; args: Record<string, unknown> } | null;
  help(): void;
  version(): void;
} {
  function help(): void {
    console.log(`
${c.bold(c.magenta(config.name))} ${c.dim(`v${config.version}`)}${config.description ? `\n${config.description}` : ''}

${c.bold('Usage:')}
  ${config.name} <command> [options]

${c.bold('Commands:')}`);

    for (const [cmdKey, cmd] of Object.entries(config.commands)) {
      const name = c.cyan(cmdKey.padEnd(20));
      console.log(`  ${name}  ${c.dim(cmd.description)}`);

      if (cmd.args) {
        for (const [argKey, argDef] of Object.entries(cmd.args)) {
          const required = argDef.required ? c.yellow(' (required)') : '';
          const defaultVal =
            argDef.default !== undefined ? c.dim(` [default: ${argDef.default}]`) : '';
          console.log(
            `    ${c.green(`--${argKey}`)}  ${argDef.description}${required}${defaultVal}`
          );
        }
      }
    }

    console.log(`
${c.bold('Options:')}
  ${c.cyan('--help, -h')}        Show this help
  ${c.cyan('--version, -v')}     Show version number
`);
  }

  function version(): void {
    console.log(`${config.name} v${config.version}`);
  }

  function parse(argv?: string[]): { command: string; args: Record<string, unknown> } | null {
    const rawArgs = argv ?? process.argv.slice(2);

    if (
      rawArgs.length === 0 ||
      rawArgs[0] === 'help' ||
      rawArgs[0] === '--help' ||
      rawArgs[0] === '-h'
    ) {
      help();
      return null;
    }

    if (rawArgs[0] === '--version' || rawArgs[0] === '-v') {
      version();
      return null;
    }

    const commandName = rawArgs[0]!;
    const commandDef = config.commands[commandName];

    if (!commandDef) {
      console.error(`${c.red('Error:')} Unknown command: ${c.bold(commandName)}`);
      console.error(`Run ${c.cyan(`${config.name} --help`)} for usage.\n`);
      process.exit(1);
    }

    // Parse --key value pairs from the remaining argv
    const parsedArgs: Record<string, unknown> = {};
    const rest = rawArgs.slice(1);
    for (let i = 0; i < rest.length; i++) {
      const token = rest[i]!;
      if (token.startsWith('--')) {
        const key = token.slice(2);
        const next = rest[i + 1];
        if (next !== undefined && !next.startsWith('-')) {
          parsedArgs[key] = next;
          i++;
        } else {
          parsedArgs[key] = true;
        }
      }
    }

    return { command: commandName, args: parsedArgs };
  }

  return { parse, help, version };
}
