/**
 * Shared ANSI / clack-style UI primitives for the TermUI CLI.
 *
 * Produces output that looks like @clack/prompts:
 *   │
 *   ◇  Step text
 *   │
 *   ◆  Active / done step
 *   └  Footer
 */

import readline from 'readline';

// ─── Color environment detection ──────────────────────────────────────────────
// Respects NO_COLOR (https://no-color.org), FORCE_COLOR, and CLICOLOR.

function isColorEnabled(): boolean {
  const noColor = process.env['NO_COLOR'];
  if (noColor !== undefined && noColor !== '') return false;
  const force = process.env['FORCE_COLOR'];
  if (force === '0' || force === 'false') return false;
  if (force === '1' || force === '2' || force === '3' || force === 'true') return true;
  const cliColor = process.env['CLICOLOR'];
  if (cliColor === '0') return false;
  if (cliColor === '1') return true;
  return process.stdout.isTTY === true;
}

// ─── picocolors-style wrap helper ─────────────────────────────────────────────

function wrap(open: string, close: string) {
  return (str: string): string => {
    if (!isColorEnabled()) return str;
    return `${open}${str}${close}`;
  };
}

// ─── pc — functional color API (picocolors-compatible) ────────────────────────

export const pc = {
  // Modifiers
  reset: wrap('\x1b[0m', '\x1b[0m'),
  bold: wrap('\x1b[1m', '\x1b[22m'),
  dim: wrap('\x1b[2m', '\x1b[22m'),
  // Foreground colors
  gray: wrap('\x1b[90m', '\x1b[39m'),
  white: wrap('\x1b[97m', '\x1b[39m'),
  cyan: wrap('\x1b[36m', '\x1b[39m'),
  magenta: wrap('\x1b[35m', '\x1b[39m'),
  green: wrap('\x1b[32m', '\x1b[39m'),
  yellow: wrap('\x1b[33m', '\x1b[39m'),
  red: wrap('\x1b[31m', '\x1b[39m'),
  blue: wrap('\x1b[34m', '\x1b[39m'),
  // Background colors
  bgCyan: wrap('\x1b[46m', '\x1b[49m'),
  bgGreen: wrap('\x1b[42m', '\x1b[49m'),
  bgRed: wrap('\x1b[41m', '\x1b[49m'),
  // 256-color foreground (medium gray for logo)
  ansi256(code: number): (str: string) => string {
    return (str: string): string => {
      if (!isColorEnabled()) return str;
      return `\x1b[38;5;${code}m${str}\x1b[39m`;
    };
  },
};

// ─── ANSI helpers (backward-compatible raw-string object) ─────────────────────
// Callers that reference e.g. `c.bold`, `c.cyan`, `${c.red}...${c.reset}` as
// plain strings continue to work.  Color stripping is applied here so that
// NO_COLOR / FORCE_COLOR is respected even for the raw-string API.

function raw(ansi: string, fallback = ''): string {
  return isColorEnabled() ? ansi : fallback;
}

export const c = {
  get reset() {
    return raw('\x1b[0m');
  },
  get bold() {
    return raw('\x1b[1m');
  },
  get dim() {
    return raw('\x1b[2m');
  },
  // Foreground
  get gray() {
    return raw('\x1b[90m');
  },
  get white() {
    return raw('\x1b[97m');
  },
  get cyan() {
    return raw('\x1b[36m');
  },
  get magenta() {
    return raw('\x1b[35m');
  },
  get green() {
    return raw('\x1b[32m');
  },
  get yellow() {
    return raw('\x1b[33m');
  },
  get red() {
    return raw('\x1b[31m');
  },
  get blue() {
    return raw('\x1b[34m');
  },
  // Background
  get bgCyan() {
    return raw('\x1b[46m');
  },
  get bgGreen() {
    return raw('\x1b[42m');
  },
  get bgRed() {
    return raw('\x1b[41m');
  },
  // 256-color foreground (medium gray for logo)
  get logoGray() {
    return raw('\x1b[38;5;245m');
  },
};

export const sym = {
  get pipe() {
    return pc.gray('│');
  },
  get hollow() {
    return pc.gray('◇');
  },
  get filled() {
    return pc.cyan('◆');
  },
  get done() {
    return pc.green('◆');
  },
  get warn() {
    return pc.yellow('◇');
  },
  get error() {
    return pc.red('◆');
  },
  get corner() {
    return pc.gray('└');
  },
  get tick() {
    return pc.green('✓');
  },
  get skip() {
    return pc.yellow('~');
  },
};

// ─── ASCII art logo ────────────────────────────────────────────────────────────

// ANSI Shadow figlet font, manually composed for "TERMUI"
const LOGO_LINES = [
  '████████╗███████╗██████╗ ███╗   ███╗██╗   ██╗██╗',
  '╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║   ██║██║',
  '   ██║   █████╗  ██████╔╝██╔████╔██║██║   ██║██║',
  '   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║   ██║██║',
  '   ██║   ███████╗██║  ██║██║ ╚═╝ ██║╚██████╔╝██║',
  '   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝',
];

export function printLogo(): void {
  console.log('');
  for (const line of LOGO_LINES) {
    console.log(`  ${pc.ansi256(245)(line)}`);
  }
  console.log('');
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function badge(text: string): string {
  // Bold + bgCyan + black fg (30m) around the label
  if (!isColorEnabled()) return ` ${text} `;
  return `\x1b[1m\x1b[46m\x1b[30m ${text} \x1b[0m`;
}

// ─── Step lines ───────────────────────────────────────────────────────────────

export function intro(label: string): void {
  console.log(`${sym.pipe}`);
  console.log(`  ${badge(label)}`);
}

export function step(text: string): void {
  console.log(`${sym.pipe}`);
  console.log(`${sym.hollow}  ${text}`);
}

export function active(text: string): void {
  console.log(`${sym.pipe}`);
  console.log(`${sym.filled}  ${text}`);
}

export function done(text: string): void {
  console.log(`${sym.pipe}`);
  console.log(`${sym.done}  ${text}`);
}

export function warn(text: string): void {
  console.log(`${sym.pipe}`);
  console.log(`${sym.warn}  ${text}`);
}

export function fail(text: string): void {
  console.log(`${sym.pipe}`);
  console.log(`${sym.error}  ${text}`);
}

export function outro(text: string): void {
  console.log(`${sym.pipe}`);
  console.log(`${sym.corner}  ${text}`);
  console.log('');
}

// ─── Inline highlights ────────────────────────────────────────────────────────

export function hi(text: string): string {
  return pc.cyan(text);
}
export function dim(text: string): string {
  return pc.dim(text);
}
export function bold(text: string): string {
  return pc.bold(text);
}
export function gr(text: string): string {
  return pc.green(text);
}

// ─── Interactive: single-choice select ────────────────────────────────────────

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  hint?: string;
}

export async function select<T extends string>(
  prompt: string,
  options: readonly SelectOption<T>[]
): Promise<T> {
  return new Promise((resolve) => {
    let idx = 0;
    let drawn = false;

    function render(): void {
      if (drawn) {
        process.stdout.write(`\x1b[${options.length + 2}A\x1b[0J`);
      }
      drawn = true;

      console.log(`${sym.pipe}`);
      console.log(`${sym.filled}  ${bold(prompt)} ${dim('(↑↓ navigate, Enter select)')}`);
      for (let i = 0; i < options.length; i++) {
        const opt = options[i]!;
        const selected = i === idx;
        const indicator = selected ? `${c.cyan}●${c.reset}` : `${c.gray}○${c.reset}`;
        const label = selected
          ? `${c.bold}${c.white}${opt.label}${c.reset}`
          : `${c.gray}${opt.label}${c.reset}`;
        const hint = opt.hint ? ` ${dim(opt.hint)}` : '';
        console.log(`  ${indicator} ${label}${hint}`);
      }
    }

    render();

    if (!process.stdin.isTTY) {
      // Non-interactive: return first option
      resolve(options[0]!.value);
      return;
    }

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    function onKey(key: string): void {
      if (key === '\x1b[A' || key === 'k') {
        idx = Math.max(0, idx - 1);
        render();
      } else if (key === '\x1b[B' || key === 'j') {
        idx = Math.min(options.length - 1, idx + 1);
        render();
      } else if (key === '\r' || key === '\n') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', onKey);
        // Show selected
        process.stdout.write(`\x1b[${options.length + 2}A\x1b[0J`);
        console.log(`${sym.pipe}`);
        console.log(`${sym.done}  ${bold(prompt)}`);
        console.log(`  ${c.green}●${c.reset} ${c.bold}${c.white}${options[idx]!.label}${c.reset}`);
        resolve(options[idx]!.value);
      } else if (key === '\x03') {
        process.stdin.setRawMode(false);
        process.exit(0);
      }
    }

    process.stdin.on('data', onKey);
  });
}

// ─── Interactive: confirm (yes/no) ────────────────────────────────────────────

export async function confirm(prompt: string, defaultValue = true): Promise<boolean> {
  return new Promise((resolve) => {
    const hint = defaultValue ? dim('(Y/n)') : dim('(y/N)');

    console.log(`${sym.pipe}`);
    console.log(`${sym.filled}  ${bold(prompt)} ${hint}`);

    if (!process.stdin.isTTY) {
      resolve(defaultValue);
      return;
    }

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    function onKey(key: string): void {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener('data', onKey);

      let answer: boolean;
      if (key === 'y' || key === 'Y') {
        answer = true;
      } else if (key === 'n' || key === 'N') {
        answer = false;
      } else if (key === '\r' || key === '\n') {
        answer = defaultValue;
      } else if (key === '\x03') {
        process.exit(0);
        return;
      } else {
        answer = defaultValue;
      }

      const answerLabel = answer ? `${c.green}yes${c.reset}` : `${c.red}no${c.reset}`;
      process.stdout.write(`\x1b[2A\x1b[0J`);
      console.log(`${sym.pipe}`);
      console.log(`${sym.done}  ${bold(prompt)}  ${answerLabel}`);
      resolve(answer);
    }

    process.stdin.on('data', onKey);
  });
}

// ─── Interactive: text input ───────────────────────────────────────────────────

export async function text(
  prompt: string,
  options: { defaultValue?: string; validate?: (v: string) => string | undefined } = {}
): Promise<string> {
  return new Promise((resolve) => {
    const { defaultValue = '', validate } = options;
    let input = '';
    let errorMsg = '';

    function render(isFirst = false): void {
      if (!isFirst) {
        const lines = 2 + (errorMsg ? 1 : 0);
        process.stdout.write(`\x1b[${lines}A\x1b[0J`);
      }
      const placeholder = defaultValue ? dim(` (default: ${defaultValue})`) : '';
      console.log(`${sym.pipe}`);
      console.log(`${sym.filled}  ${bold(prompt)}${placeholder}`);
      if (errorMsg) {
        console.log(`  ${c.red}✖ ${errorMsg}${c.reset}`);
      }
      process.stdout.write(`  ${c.cyan}›${c.reset} ${input}`);
    }

    render(true);

    if (!process.stdin.isTTY) {
      console.log('');
      resolve(defaultValue);
      return;
    }

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    function onKey(key: string): void {
      if (key === '\x03') {
        process.stdin.setRawMode(false);
        process.exit(0);
      } else if (key === '\r' || key === '\n') {
        const value = input.trim() || defaultValue;
        if (validate) {
          const err = validate(value);
          if (err) {
            errorMsg = err;
            render();
            return;
          }
        }
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', onKey);
        console.log('');
        const lines = 2 + (errorMsg ? 1 : 0);
        process.stdout.write(`\x1b[${lines + 1}A\x1b[0J`);
        console.log(`${sym.pipe}`);
        console.log(`${sym.done}  ${bold(prompt)}  ${c.white}${value}${c.reset}`);
        resolve(value);
      } else if (key === '\x7f' || key === '\b') {
        input = input.slice(0, -1);
        errorMsg = '';
        render();
      } else if (key >= ' ') {
        input += key;
        errorMsg = '';
        render();
      }
    }

    process.stdin.on('data', onKey);
  });
}

// ─── Interactive: multi-select checkboxes ─────────────────────────────────────

export async function multiselect<T extends string>(
  prompt: string,
  options: SelectOption<T>[],
  initialSelected: T[] = []
): Promise<T[]> {
  return new Promise((resolve) => {
    let cursor = 0;
    const selected = new Set<T>(initialSelected);
    let drawn = false;

    function render(): void {
      if (drawn) {
        process.stdout.write(`\x1b[${options.length + 3}A\x1b[0J`);
      }
      drawn = true;

      console.log(`${sym.pipe}`);
      console.log(`${sym.filled}  ${bold(prompt)} ${dim('(space toggle, Enter confirm)')}`);
      for (let i = 0; i < options.length; i++) {
        const opt = options[i]!;
        const isActive = i === cursor;
        const isSelected = selected.has(opt.value);
        const box = isSelected ? `${c.green}■${c.reset}` : `${c.gray}□${c.reset}`;
        const label = isActive
          ? `${c.bold}${c.white}${opt.label}${c.reset}`
          : isSelected
            ? `${c.white}${opt.label}${c.reset}`
            : `${c.gray}${opt.label}${c.reset}`;
        const hint = opt.hint ? ` ${dim(opt.hint)}` : '';
        const cursor_indicator = isActive ? `${c.cyan}▶${c.reset}` : ' ';
        console.log(`  ${cursor_indicator} ${box} ${label}${hint}`);
      }
      console.log(`  ${dim('─────────────────────────────')}`);
    }

    render();

    if (!process.stdin.isTTY) {
      resolve([...selected]);
      return;
    }

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    function onKey(key: string): void {
      if (key === '\x1b[A' || key === 'k') {
        cursor = Math.max(0, cursor - 1);
        render();
      } else if (key === '\x1b[B' || key === 'j') {
        cursor = Math.min(options.length - 1, cursor + 1);
        render();
      } else if (key === ' ') {
        const val = options[cursor]!.value;
        if (selected.has(val)) selected.delete(val);
        else selected.add(val);
        render();
      } else if (key === 'a') {
        if (selected.size === options.length) {
          selected.clear();
        } else {
          options.forEach((o) => selected.add(o.value));
        }
        render();
      } else if (key === '\r' || key === '\n') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', onKey);

        const result = [...selected];
        // Show summary
        process.stdout.write(`\x1b[${options.length + 3}A\x1b[0J`);
        console.log(`${sym.pipe}`);
        console.log(`${sym.done}  ${bold(prompt)}`);
        const labels = options
          .filter((o) => result.includes(o.value))
          .map((o) => `${c.green}■${c.reset} ${o.label}`)
          .join('  ');
        console.log(`  ${labels || dim('(none)')}`);
        resolve(result);
      } else if (key === '\x03') {
        process.stdin.setRawMode(false);
        process.exit(0);
      }
    }

    process.stdin.on('data', onKey);
  });
}
