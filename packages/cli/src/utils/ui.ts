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

// ─── ANSI helpers ─────────────────────────────────────────────────────────────

export const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  // Foreground
  gray: '\x1b[90m',
  white: '\x1b[97m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  // Background
  bgCyan: '\x1b[46m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  // 256-color foreground (medium gray for logo)
  logoGray: '\x1b[38;5;245m',
};

export const sym = {
  pipe: `${c.gray}│${c.reset}`,
  hollow: `${c.gray}◇${c.reset}`,
  filled: `${c.cyan}◆${c.reset}`,
  done: `${c.green}◆${c.reset}`,
  warn: `${c.yellow}◇${c.reset}`,
  error: `${c.red}◆${c.reset}`,
  corner: `${c.gray}└${c.reset}`,
  tick: `${c.green}✓${c.reset}`,
  skip: `${c.yellow}~${c.reset}`,
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
    console.log(`  ${c.logoGray}${line}${c.reset}`);
  }
  console.log('');
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function badge(text: string): string {
  return `${c.bold}${c.bgCyan}\x1b[30m ${text} ${c.reset}`;
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
  return `${c.cyan}${text}${c.reset}`;
}
export function dim(text: string): string {
  return `${c.dim}${text}${c.reset}`;
}
export function bold(text: string): string {
  return `${c.bold}${text}${c.reset}`;
}
export function gr(text: string): string {
  return `${c.green}${text}${c.reset}`;
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
