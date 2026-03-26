/**
 * termui/commander adapter — thin wrapper that applies TermUI-styled help output
 * to a commander CLI. Uses dynamic import so commander stays an optional peer dep.
 */

import { isColorEnabled } from '../internal/color-env.js';

export interface CommanderOptions {
  name: string;
  version?: string;
  description?: string;
  /** Hex color for section headings, e.g. "#00d7ff" */
  themeColor?: string;
}

// Convert a hex color string to an ANSI truecolor escape sequence
function hexToAnsi(hex: string, text: string): string {
  if (!isColorEnabled()) return text;
  const clean = hex.replace('#', '').padEnd(6, '0');
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[39m`;
}

function bold(text: string): string {
  if (!isColorEnabled()) return text;
  return `\x1b[1m${text}\x1b[22m`;
}

function dim(text: string): string {
  if (!isColorEnabled()) return text;
  return `\x1b[2m${text}\x1b[22m`;
}

/**
 * Dynamically loads the `commander` package.
 * Throws a descriptive error if commander is not installed.
 */
export async function loadCommander(): Promise<unknown> {
  try {
    const mod = await import('commander');
    return mod;
  } catch {
    throw new Error(
      '[termui/adapters/commander] The `commander` package is not installed. ' +
        'Add it as a dependency: npm install commander'
    );
  }
}

export function createCommanderProgram(options: CommanderOptions): {
  program: unknown;
  applyTermuiStyle(): void;
} {
  // program is lazily resolved — will be set after loadCommander() is called
  // We return a proxy object so callers can assign program themselves,
  // or use the async loader pattern.
  let _program: unknown = null;
  const themeColor = options.themeColor ?? '#00d7ff';

  function applyTermuiStyle(): void {
    if (!_program) {
      throw new Error(
        '[termui/adapters/commander] Call await loadCommander() and assign ' +
          'the result to program before calling applyTermuiStyle().'
      );
    }

    const prog = _program as {
      configureOutput(config: {
        writeOut?: (str: string) => void;
        writeErr?: (str: string) => void;
        outputError?: (str: string, write: (s: string) => void) => void;
      }): void;
    };

    prog.configureOutput({
      writeOut(str: string) {
        // Style section headings in help output
        const styled = str
          // Bold + themed "Usage:" heading
          .replace(/^(Usage:)/m, (_: string, p1: string) => bold(hexToAnsi(themeColor, p1)))
          // Bold + themed "Options:" heading
          .replace(/^(Options:)/m, (_: string, p1: string) => bold(hexToAnsi(themeColor, p1)))
          // Bold + themed "Commands:" heading
          .replace(/^(Commands:)/m, (_: string, p1: string) => bold(hexToAnsi(themeColor, p1)))
          // Bold + themed "Arguments:" heading
          .replace(/^(Arguments:)/m, (_: string, p1: string) => bold(hexToAnsi(themeColor, p1)))
          // Dim the description line (first non-empty line after a blank line)
          .replace(
            /^(\s{2,})([^\s-].+)$/m,
            (_: string, indent: string, line: string) => indent + dim(line)
          );
        process.stdout.write(styled);
      },
      writeErr(str: string) {
        const prefix = isColorEnabled() ? '\x1b[31mError:\x1b[39m ' : 'Error: ';
        process.stderr.write(str.replace(/^error:/im, prefix));
      },
      outputError(str: string, write: (s: string) => void) {
        const prefix = isColorEnabled() ? '\x1b[31mError:\x1b[39m ' : 'Error: ';
        write(str.replace(/^error:/im, prefix));
      },
    });
  }

  // Lazy init: load commander and configure the program
  async function init(): Promise<unknown> {
    const mod = (await loadCommander()) as { Command: new () => unknown };
    const { Command } = mod;
    _program = new Command();

    const prog = _program as {
      name(n: string): unknown;
      description(d: string): unknown;
      version(v: string): unknown;
    };

    prog.name(options.name);
    if (options.description) prog.description(options.description);
    if (options.version) prog.version(options.version);

    applyTermuiStyle();
    return _program;
  }

  // Expose a thenable-like object so callers can do:
  //   const { program } = createCommanderProgram({ name: 'mycli' });
  //   await program; // resolves to the commander Command instance
  const lazyProgram = new Proxy({} as Record<string, unknown>, {
    get(_target, prop: string) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        const promise = init();
        return promise[prop as 'then'].bind(promise);
      }
      if (_program) {
        return (_program as Record<string, unknown>)[prop];
      }
      // Return a function that queues after init
      return (...args: unknown[]) => {
        return init().then((p) => {
          const fn = (p as Record<string, unknown>)[prop];
          if (typeof fn === 'function') return fn(...args);
        });
      };
    },
  });

  return {
    program: lazyProgram,
    applyTermuiStyle,
  };
}

export default createCommanderProgram;
