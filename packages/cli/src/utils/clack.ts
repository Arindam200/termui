/**
 * clack.ts — local inline of the termui/clack adapter API for use in the TermUI CLI itself.
 *
 * The CLI cannot import from @termui/adapters at compile time (rootDir constraint),
 * so this module provides the same interface inline. Users of termui access this via
 * `import { select, confirm, text } from 'termui/clack'` — this file is the CLI-internal
 * equivalent.
 *
 * API is intentionally identical to packages/adapters/clack/index.ts.
 * Implementations use raw-mode TTY (arrow keys) for richer UX than readline.
 */

import { pc } from './ui.js';

// ─── Symbols ──────────────────────────────────────────────────────────────────

const sym = {
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
};

// ─── Structured log helpers ───────────────────────────────────────────────────

export const log = {
  info(msg: string): void {
    console.log(`${pc.cyan('●')} ${msg}`);
  },
  success(msg: string): void {
    console.log(`${pc.green('✓')} ${pc.green(msg)}`);
  },
  warn(msg: string): void {
    console.log(`${pc.yellow('▲')} ${pc.yellow(msg)}`);
  },
  error(msg: string): void {
    console.log(`${pc.red('✗')} ${pc.red(msg)}`);
  },
  step(msg: string): void {
    console.log(`${pc.magenta('◆')} ${pc.bold(msg)}`);
  },
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function spinner(): {
  start(msg?: string): void;
  stop(msg?: string): void;
  message(msg: string): void;
} {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frameIdx = 0;
  let interval: ReturnType<typeof setInterval> | null = null;
  let currentMsg = '';

  function render() {
    const frame = frames[frameIdx % frames.length]!;
    process.stdout.write(`\r${pc.cyan(frame)} ${currentMsg}`);
    frameIdx++;
  }

  return {
    start(msg = '') {
      currentMsg = msg;
      if (process.stdout.isTTY) {
        process.stdout.write('\x1b[?25l');
        interval = setInterval(render, 80);
      } else {
        process.stdout.write(`  ${msg}...\n`);
      }
    },
    stop(msg = '') {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      if (process.stdout.isTTY) {
        process.stdout.write('\x1b[?25h');
        process.stdout.write('\r\x1b[K');
      }
      if (msg) {
        console.log(`${sym.done}  ${msg}`);
      }
    },
    message(msg: string) {
      currentMsg = msg;
    },
  };
}

// ─── CancelError ─────────────────────────────────────────────────────────────

export class CancelError extends Error {
  constructor(message = 'Prompt cancelled') {
    super(message);
    this.name = 'CancelError';
  }
}

export function cancel(message = 'Cancelled'): never {
  throw new CancelError(message);
}

// ─── text ─────────────────────────────────────────────────────────────────────

export async function text(opts: {
  message: string;
  placeholder?: string;
  validate?: (v: string) => string | undefined;
}): Promise<string> {
  return new Promise((resolve) => {
    const { message, placeholder = '', validate } = opts;
    let input = '';
    let errorMsg = '';

    function render(isFirst = false): void {
      if (!isFirst) {
        const lines = 2 + (errorMsg ? 1 : 0);
        process.stdout.write(`\x1b[${lines}A\x1b[0J`);
      }
      const hint = placeholder ? pc.dim(` (default: ${placeholder})`) : '';
      console.log(`${sym.pipe}`);
      console.log(`${sym.filled}  ${pc.bold(message)}${hint}`);
      if (errorMsg) {
        console.log(`  ${pc.red('✖')} ${pc.red(errorMsg)}`);
      }
      process.stdout.write(`  ${pc.cyan('›')} ${input}`);
    }

    render(true);

    if (!process.stdin.isTTY) {
      console.log('');
      resolve(placeholder);
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
        const value = input.trim() || placeholder;
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
        console.log(`${sym.done}  ${pc.bold(message)}  ${pc.white(value)}`);
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

// ─── confirm ─────────────────────────────────────────────────────────────────

export async function confirm(opts: { message: string; initialValue?: boolean }): Promise<boolean> {
  const defaultValue = opts.initialValue ?? true;
  const hint = defaultValue ? pc.dim('(Y/n)') : pc.dim('(y/N)');

  return new Promise((resolve) => {
    console.log(`${sym.pipe}`);
    console.log(`${sym.filled}  ${pc.bold(opts.message)} ${hint}`);

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

      const answerLabel = answer ? pc.green('yes') : pc.red('no');
      process.stdout.write(`\x1b[2A\x1b[0J`);
      console.log(`${sym.pipe}`);
      console.log(`${sym.done}  ${pc.bold(opts.message)}  ${answerLabel}`);
      resolve(answer);
    }

    process.stdin.on('data', onKey);
  });
}

// ─── select ──────────────────────────────────────────────────────────────────

export async function select<T>(opts: {
  message: string;
  options: { value: T; label: string; hint?: string }[];
}): Promise<T> {
  const { message, options } = opts;
  return new Promise((resolve) => {
    let idx = 0;
    let drawn = false;

    function render(): void {
      if (drawn) {
        process.stdout.write(`\x1b[${options.length + 2}A\x1b[0J`);
      }
      drawn = true;

      console.log(`${sym.pipe}`);
      console.log(`${sym.filled}  ${pc.bold(message)} ${pc.dim('(↑↓ navigate, Enter select)')}`);
      for (let i = 0; i < options.length; i++) {
        const opt = options[i]!;
        const selected = i === idx;
        const indicator = selected ? pc.cyan('●') : pc.gray('○');
        const label = selected ? pc.bold(pc.white(opt.label)) : pc.gray(opt.label);
        const hint = opt.hint ? ` ${pc.dim(opt.hint)}` : '';
        console.log(`  ${indicator} ${label}${hint}`);
      }
    }

    render();

    if (!process.stdin.isTTY) {
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
        process.stdout.write(`\x1b[${options.length + 2}A\x1b[0J`);
        console.log(`${sym.pipe}`);
        console.log(`${sym.done}  ${pc.bold(message)}`);
        console.log(`  ${pc.green('●')} ${pc.bold(pc.white(options[idx]!.label))}`);
        resolve(options[idx]!.value);
      } else if (key === '\x03') {
        process.stdin.setRawMode(false);
        process.exit(0);
      }
    }

    process.stdin.on('data', onKey);
  });
}

// ─── multiselect ─────────────────────────────────────────────────────────────

export async function multiselect<T>(opts: {
  message: string;
  options: { value: T; label: string; hint?: string }[];
  initialValues?: T[];
}): Promise<T[]> {
  const { message, options, initialValues = [] } = opts;
  return new Promise((resolve) => {
    let cursor = 0;
    const selected = new Set<T>(initialValues);
    let drawn = false;

    function render(): void {
      if (drawn) {
        process.stdout.write(`\x1b[${options.length + 3}A\x1b[0J`);
      }
      drawn = true;

      console.log(`${sym.pipe}`);
      console.log(`${sym.filled}  ${pc.bold(message)} ${pc.dim('(space toggle, Enter confirm)')}`);
      for (let i = 0; i < options.length; i++) {
        const opt = options[i]!;
        const isActive = i === cursor;
        const isSelected = selected.has(opt.value);
        const box = isSelected ? pc.green('■') : pc.gray('□');
        const label = isActive
          ? pc.bold(pc.white(opt.label))
          : isSelected
            ? pc.white(opt.label)
            : pc.gray(opt.label);
        const hint = opt.hint ? ` ${pc.dim(opt.hint)}` : '';
        const cursorIndicator = isActive ? pc.cyan('▶') : ' ';
        console.log(`  ${cursorIndicator} ${box} ${label}${hint}`);
      }
      console.log(`  ${pc.dim('─────────────────────────────')}`);
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
        process.stdout.write(`\x1b[${options.length + 3}A\x1b[0J`);
        console.log(`${sym.pipe}`);
        console.log(`${sym.done}  ${pc.bold(message)}`);
        const labels = options
          .filter((o) => result.includes(o.value))
          .map((o) => `${pc.green('■')} ${o.label}`)
          .join('  ');
        console.log(`  ${labels || pc.dim('(none)')}`);
        resolve(result);
      } else if (key === '\x03') {
        process.stdin.setRawMode(false);
        process.exit(0);
      }
    }

    process.stdin.on('data', onKey);
  });
}

// ─── group ────────────────────────────────────────────────────────────────────

export async function group<T>(opts: { title: string; prompts: () => Promise<T> }): Promise<T> {
  console.log(`\n${pc.magenta('◆')}  ${pc.bold(opts.title)}\n`);
  return opts.prompts();
}

// ─── tasks ────────────────────────────────────────────────────────────────────

export interface Task {
  title: string;
  task: () => Promise<string | undefined | void>;
}

export interface TasksOptions {
  parallel?: boolean;
  continueOnError?: boolean;
}

export async function tasks(taskList: Task[], opts?: TasksOptions): Promise<void> {
  if (opts?.parallel) {
    for (const t of taskList) {
      console.log(`  ${pc.cyan('⠋')} ${t.title}`);
    }
    const results = await Promise.allSettled(taskList.map((t) => t.task()));
    for (let i = 0; i < taskList.length; i++) {
      const t = taskList[i]!;
      const result = results[i]!;
      if (result.status === 'fulfilled') {
        const returnValue = result.value;
        console.log(
          `  ${pc.green('✓')} ${t.title}${returnValue ? pc.dim('  ' + returnValue) : ''}`
        );
      } else {
        const err =
          result.reason instanceof Error ? result.reason : new Error(String(result.reason));
        console.log(`  ${pc.red('✗')} ${t.title}  ${pc.red(err.message)}`);
      }
    }
    if (!opts?.continueOnError) {
      for (const result of results) {
        if (result.status === 'rejected') {
          throw result.reason instanceof Error ? result.reason : new Error(String(result.reason));
        }
      }
    }
  } else {
    for (const t of taskList) {
      process.stdout.write(`  ${pc.cyan('⠋')} ${t.title}\n`);
      try {
        const returnValue = await t.task();
        process.stdout.write(`\x1b[1A\x1b[2K`);
        console.log(
          `  ${pc.green('✓')} ${t.title}${returnValue ? pc.dim('  ' + returnValue) : ''}`
        );
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        process.stdout.write(`\x1b[1A\x1b[2K`);
        console.log(`  ${pc.red('✗')} ${t.title}  ${pc.red(err.message)}`);
        if (!opts?.continueOnError) {
          throw err;
        }
      }
    }
  }
}
