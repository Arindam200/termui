/**
 * termui/args adapter — createCLI helper with styled help output using ANSI codes.
 * Optional bridges: yargs (applyYargsStyledHelp) and commander (createCommanderProgram).
 *
 * Also exports cross-platform signal/exit utilities (W6).
 */

// ─── Cross-platform process exit helpers (W6) ────────────────────────────────

/**
 * Register a callback that fires when the process is about to exit.
 *
 * On all platforms: `SIGINT` (Ctrl+C) and `process.on('exit')` are hooked.
 * On Unix only: `SIGTERM` and `SIGHUP` are also hooked — Windows does not
 * support these signals. Apps that use SIGHUP for config-reload must provide
 * their own Windows fallback (e.g. a file-watcher or IPC channel).
 *
 * The callback is called at most once (guarded by a flag) to prevent
 * duplicate cleanup when multiple signals fire in quick succession.
 *
 * @returns A `dispose` function that removes all registered listeners.
 *
 * @example
 * ```ts
 * const dispose = onProcessExit(() => {
 *   db.close();
 *   console.log('Goodbye!');
 * });
 * // Later, if you want to remove the handler:
 * dispose();
 * ```
 */
export function onProcessExit(handler: () => void): () => void {
  let called = false;
  const once = () => {
    if (!called) {
      called = true;
      handler();
    }
  };

  process.on('exit', once);
  process.on('SIGINT', once);

  if (process.platform !== 'win32') {
    // SIGTERM and SIGHUP are not available on Windows.
    // ConPTY correctly forwards Ctrl+C as SIGINT on Windows — no special handling needed.
    process.on('SIGTERM', once);
    process.on('SIGHUP', once);
  }

  return () => {
    process.off('exit', once);
    process.off('SIGINT', once);
    if (process.platform !== 'win32') {
      process.off('SIGTERM', once);
      process.off('SIGHUP', once);
    }
  };
}

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
        const knownKeys = commandDef.args ? Object.keys(commandDef.args) : [];
        if (knownKeys.length > 0 && !knownKeys.includes(key)) {
          console.error(`${c.red('Error:')} Unknown flag: ${c.bold(`-${key}`)}`);
          process.exit(1);
        }
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

// ---------------------------------------------------------------------------
// Phase 5 §5.3 — Type-safe ParsedArgs, positional args, global flags,
//                middleware, and inline action handlers via createCLIv2
// ---------------------------------------------------------------------------

// C1 — Type-safe argument schema types

type ArgType = 'string' | 'number' | 'boolean';

export interface ArgDef {
  type: ArgType;
  required?: boolean;
  default?: string | number | boolean;
  description?: string;
}

export interface CommandDefV2 {
  description?: string;
  args?: Record<string, ArgDef>;
  action?: (ctx: {
    args: Record<string, unknown>;
    flags: Record<string, unknown>;
  }) => Promise<void> | void;
}

export interface CLIConfigV2 {
  name: string;
  version: string;
  description?: string;
  /** C3 — Global flags applied to every command. */
  globalFlags?: Record<string, ArgDef>;
  /** C3 — Middleware chain; each middleware must call next() to proceed. */
  middleware?: Array<
    (
      ctx: { command: string; args: Record<string, unknown> },
      next: () => Promise<void>
    ) => Promise<void>
  >;
  commands: Record<string, CommandDefV2>;
}

// C4 — createCLIv2: inline action handlers + cli.run()

export function createCLIv2(config: CLIConfigV2): {
  run(argv?: string[]): Promise<void>;
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
      console.log(`  ${name}  ${c.dim(cmd.description ?? '')}`);

      if (cmd.args) {
        for (const [argKey, argDef] of Object.entries(cmd.args)) {
          const required = argDef.required ? c.yellow(' (required)') : '';
          const defaultVal =
            argDef.default !== undefined ? c.dim(` [default: ${argDef.default}]`) : '';
          const desc = argDef.description ?? '';
          console.log(`    ${c.green(`--${argKey}`)}  ${desc}${required}${defaultVal}`);
        }
      }
    }

    if (config.globalFlags && Object.keys(config.globalFlags).length > 0) {
      console.log(`\n${c.bold('Global Flags:')}`);
      for (const [flagKey, flagDef] of Object.entries(config.globalFlags)) {
        const required = flagDef.required ? c.yellow(' (required)') : '';
        const defaultVal =
          flagDef.default !== undefined ? c.dim(` [default: ${flagDef.default}]`) : '';
        const desc = flagDef.description ?? '';
        console.log(`  ${c.green(`--${flagKey}`)}  ${desc}${required}${defaultVal}`);
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

  async function run(argv?: string[]): Promise<void> {
    const rawArgs = argv ?? process.argv.slice(2);

    if (!rawArgs[0] || rawArgs[0] === '--help' || rawArgs[0] === '-h') {
      help();
      return;
    }

    if (rawArgs[0] === '--version' || rawArgs[0] === '-v') {
      version();
      return;
    }

    const commandName = rawArgs[0];
    const commandDef = config.commands[commandName];

    if (!commandDef) {
      console.error(`${c.red('Error:')} Unknown command: ${c.bold(commandName)}`);
      process.exit(1);
    }

    // C2 — Parse flags and positional args; C3 — merge global flags
    const parsed = parseArgs(rawArgs.slice(1), {
      ...(config.globalFlags ?? {}),
      ...(commandDef.args ?? {}),
    });

    const ctx = { command: commandName, args: parsed.flags, positional: parsed.positional };

    // C3 — Run middleware chain, then dispatch to action
    const middlewares = config.middleware ?? [];
    let idx = 0;

    async function next(): Promise<void> {
      if (idx < middlewares.length) {
        await middlewares[idx++]!(ctx, next);
      } else if (commandDef.action) {
        await commandDef.action({ args: ctx.args, flags: ctx.args });
      }
    }

    await next();
  }

  return { run, help, version };
}

// C2 — Internal parser that separates flags from positional args
function parseArgs(
  rawArgs: string[],
  argDefs: Record<string, ArgDef>
): { flags: Record<string, unknown>; positional: string[] } {
  const flags: Record<string, unknown> = {};
  const positional: string[] = [];

  // Set defaults from schema
  for (const [key, def] of Object.entries(argDefs)) {
    if (def.default !== undefined) flags[key] = def.default;
  }

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i]!;

    if (arg === '--') {
      // Stop flag parsing; everything after is passed through as positional
      break;
    } else if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx !== -1) {
        const key = arg.slice(2, eqIdx);
        const val = arg.slice(eqIdx + 1);
        const def = argDefs[key];
        flags[key] =
          def?.type === 'boolean' ? val !== 'false' : coerceTyped(val, def?.type ?? 'string');
      } else {
        const key = arg.slice(2);
        const def = argDefs[key];
        if (def?.type === 'boolean') {
          flags[key] = true;
        } else {
          const nextVal = rawArgs[i + 1];
          if (nextVal && !nextVal.startsWith('-')) {
            flags[key] = coerceTyped(nextVal, def?.type ?? 'string');
            i++;
          } else {
            flags[key] = true;
          }
        }
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      const key = arg.slice(1);
      const nextVal = rawArgs[i + 1];
      if (nextVal && !nextVal.startsWith('-')) {
        flags[key] = coerceTyped(nextVal, 'string');
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      // C2 — non-flag argument collected as positional
      positional.push(arg);
    }
  }

  // Validate required args
  for (const [key, def] of Object.entries(argDefs)) {
    if (def.required && flags[key] === undefined) {
      console.error(`${c.red('Error:')} Missing required argument: ${c.bold(`--${key}`)}`);
      process.exit(1);
    }
  }

  return { flags, positional };
}

function coerceTyped(val: string, type: ArgType): unknown {
  if (type === 'number') return parseFloat(val);
  if (type === 'boolean') return val !== 'false' && val !== '0';
  return val;
}

// ─── D2: createOutput — structured output modes ───────────────────────────────

export interface OutputOptions {
  json?: boolean;
  quiet?: boolean;
  verbose?: boolean;
}

export interface Output {
  log(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  success(data: unknown): void;
  table(data: Record<string, unknown>[]): void;
  debug(message: string): void;
}

/**
 * Create a structured output helper that respects --json, --quiet, and --verbose flags.
 *
 * - `--json`: All structured output (success, table) is emitted as NDJSON to stdout.
 *   log/warn/debug are suppressed; error still goes to stderr.
 * - `--quiet`: All non-error output is suppressed.
 * - `--verbose`: debug() lines are shown (suppressed otherwise).
 */
export function createOutput(opts: OutputOptions = {}): Output {
  const { json = false, quiet = false, verbose = false } = opts;

  function log(message: string): void {
    if (quiet || json) return;
    console.log(message);
  }

  function warn(message: string): void {
    if (quiet || json) return;
    console.warn(`${c.yellow('[warn]')} ${message}`);
  }

  function error(message: string): void {
    console.error(`${c.red('[error]')} ${message}`);
  }

  function success(data: unknown): void {
    if (quiet) return;
    if (json) {
      process.stdout.write(JSON.stringify(data) + '\n');
    } else {
      console.log(
        `${c.green('✓')} ${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}`
      );
    }
  }

  function table(data: Record<string, unknown>[]): void {
    if (quiet) return;
    if (json) {
      process.stdout.write(JSON.stringify(data) + '\n');
      return;
    }
    if (data.length === 0) {
      console.log('(empty)');
      return;
    }
    const keys = Object.keys(data[0]!);
    const widths = keys.map((k) =>
      Math.max(k.length, ...data.map((row) => String(row[k] ?? '').length))
    );
    const sep = widths.map((w) => '─'.repeat(w + 2)).join('┼');
    const header = keys.map((k, i) => ` ${c.bold(k.padEnd(widths[i]!))} `).join('│');
    console.log(header);
    console.log(sep);
    for (const row of data) {
      console.log(keys.map((k, i) => ` ${String(row[k] ?? '').padEnd(widths[i]!)} `).join('│'));
    }
  }

  function debug(message: string): void {
    if (!verbose || quiet) return;
    console.log(`${c.dim('[debug]')} ${message}`);
  }

  return { log, warn, error, success, table, debug };
}

// ─── D5: withGracefulExit — signal handling + cleanup ────────────────────────

const _cleanupHandlers: Array<() => Promise<void> | void> = [];

/**
 * Register a cleanup callback to run before process exit.
 * Works with withGracefulExit().
 */
export function onCleanup(fn: () => Promise<void> | void): void {
  _cleanupHandlers.push(fn);
}

async function _runCleanups(): Promise<void> {
  for (const fn of _cleanupHandlers) {
    try {
      await fn();
    } catch {
      /* ignore cleanup errors */
    }
  }
}

/**
 * Wrap a CLI entry point with graceful exit handling.
 * Catches SIGINT, SIGTERM, uncaughtException, and unhandledRejection.
 * Runs registered onCleanup() handlers before exiting.
 * Prints user-friendly error message in normal mode, full stack in --verbose.
 */
export async function withGracefulExit(
  fn: () => Promise<void>,
  opts: { verbose?: boolean } = {}
): Promise<void> {
  const { verbose = process.argv.includes('--verbose') } = opts;

  async function handleExit(code: number): Promise<never> {
    await _runCleanups();
    process.exit(code);
  }

  process.on('SIGINT', async () => {
    process.stderr.write('\n');
    await handleExit(130);
  });

  process.on('SIGTERM', async () => {
    await handleExit(0);
  });

  process.on('uncaughtException', async (err: Error) => {
    if (verbose) {
      console.error(c.red('Uncaught exception:'), err);
    } else {
      console.error(`${c.red('Error:')} ${err.message}`);
      console.error(c.dim('Run with --verbose for full stack trace.'));
    }
    await handleExit(1);
  });

  process.on('unhandledRejection', async (reason: unknown) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    if (verbose) {
      console.error(c.red('Unhandled rejection:'), reason);
    } else {
      console.error(`${c.red('Error:')} ${message}`);
      console.error(c.dim('Run with --verbose for full stack trace.'));
    }
    await handleExit(1);
  });

  try {
    await fn();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (verbose) {
      console.error(c.red('Fatal:'), err);
    } else {
      console.error(`${c.red('Error:')} ${message}`);
    }
    await handleExit(1);
  }
}
