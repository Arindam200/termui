/**
 * termui/args adapter — createCLI helper with styled help output using ANSI codes.
 * Optional bridges: yargs (applyYargsStyledHelp) and commander (createCommanderProgram).
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
      const name = c.cyan(cmdKey.padEnd(16));
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
  ${c.cyan('--help, -h')}      Show this help
  ${c.cyan('--version, -v')}   Show version number
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

    const parsedArgs: Record<string, unknown> = {};

    if (commandDef.args) {
      for (const [key, def] of Object.entries(commandDef.args)) {
        if (def.default !== undefined) {
          parsedArgs[key] = def.default;
        }
      }
    }

    const rest = rawArgs.slice(1);
    for (let i = 0; i < rest.length; i++) {
      const arg = rest[i]!;
      if (arg.startsWith('--')) {
        const eqIdx = arg.indexOf('=');
        if (eqIdx !== -1) {
          const key = arg.slice(2, eqIdx);
          const val = arg.slice(eqIdx + 1);
          parsedArgs[key] = coerce(val);
        } else {
          const key = arg.slice(2);
          const nextArg = rest[i + 1];
          if (nextArg && !nextArg.startsWith('-')) {
            parsedArgs[key] = coerce(nextArg);
            i++;
          } else {
            parsedArgs[key] = true;
          }
        }
      } else if (arg.startsWith('-') && arg.length === 2) {
        const key = arg.slice(1);
        const nextArg = rest[i + 1];
        if (nextArg && !nextArg.startsWith('-')) {
          parsedArgs[key] = coerce(nextArg);
          i++;
        } else {
          parsedArgs[key] = true;
        }
      }
    }

    if (commandDef.args) {
      for (const [key, def] of Object.entries(commandDef.args)) {
        if (def.required && parsedArgs[key] === undefined) {
          console.error(`${c.red('Error:')} Missing required argument: ${c.bold(`--${key}`)}`);
          process.exit(1);
        }
      }
    }

    return { command: commandName, args: parsedArgs };
  }

  return { parse, help, version };
}

/** Alias for {@link createCLI}. */
export { createCLI as createMinimalCLI };

function coerce(val: string): unknown {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === 'null') return null;
  if (/^-?\d+(\.\d+)?$/.test(val)) return parseFloat(val);
  return val;
}

export interface HelpThemeMeta {
  name: string;
  version: string;
  description?: string;
}

function colorizePlainHelp(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      if (/^Usage:/i.test(line)) return `${c.bold(c.cyan(line))}`;
      if (/^Options:/i.test(line)) return `${c.bold(line)}`;
      if (/^Commands:/i.test(line)) return `${c.bold(line)}`;
      if (line.trim().startsWith('-')) return `${c.green(line)}`;
      return line;
    })
    .join('\n');
}

/**
 * Apply TermUI-style usage banner and script name to a yargs argv chain.
 * Requires optional peer `yargs`.
 */
export async function applyYargsStyledHelp(y: unknown, meta: HelpThemeMeta): Promise<unknown> {
  const argv = y as { scriptName: (n: string) => unknown; usage: (s: string) => unknown };
  const banner = `${c.bold(c.magenta(meta.name))} ${c.dim(`v${meta.version}`)}${meta.description ? `\n${meta.description}` : ''}`;
  return (argv.scriptName(meta.name) as { usage: (s: string) => unknown }).usage(banner);
}

/**
 * Create a Commander program with colored stdout for help text.
 * Requires optional peer `commander`.
 */
export async function createCommanderProgram(meta: HelpThemeMeta): Promise<unknown> {
  const { Command } = await import('commander');
  const program = new Command();
  program.name(meta.name);
  program.version(meta.version, '-v, --version');
  if (meta.description) {
    program.description(meta.description);
  }
  program.configureOutput({
    writeOut: (str: string) => process.stdout.write(colorizePlainHelp(str)),
    writeErr: (str: string) => process.stderr.write(str),
  });
  return program;
}

/**
 * Build a yargs instance from process.argv with TermUI styling applied.
 * Requires optional peer `yargs`.
 */
export async function createYargsCLI(
  configure: (y: unknown) => unknown,
  meta: HelpThemeMeta
): Promise<unknown> {
  const yargs = (await import('yargs')).default;
  const { hideBin } = await import('yargs/helpers');
  let chain = yargs(hideBin(process.argv));
  chain = (await applyYargsStyledHelp(chain, meta)) as typeof chain;
  chain = configure(chain) as typeof chain;
  return chain;
}
