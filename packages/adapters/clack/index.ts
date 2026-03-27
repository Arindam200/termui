/**
 * termui/clack adapter — @clack/prompts compatible API using TermUI components.
 *
 * Provides the same surface as @clack/prompts but uses raw-mode TTY for richer
 * UX (arrow-key navigation for select, single-key confirm) with graceful fallback
 * to readline in non-TTY environments.
 */

// ─── ANSI helpers ─────────────────────────────────────────────────────────────

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

function wrap(open: string, close: string) {
  return (s: string): string => (isColorEnabled() ? `${open}${s}${close}` : s);
}

const ansi = {
  green: wrap('\x1b[32m', '\x1b[0m'),
  red: wrap('\x1b[31m', '\x1b[0m'),
  yellow: wrap('\x1b[33m', '\x1b[0m'),
  cyan: wrap('\x1b[36m', '\x1b[0m'),
  bold: wrap('\x1b[1m', '\x1b[22m'),
  dim: wrap('\x1b[2m', '\x1b[22m'),
  magenta: wrap('\x1b[35m', '\x1b[0m'),
  white: wrap('\x1b[97m', '\x1b[0m'),
  gray: wrap('\x1b[90m', '\x1b[0m'),
};

// ─── Symbols ──────────────────────────────────────────────────────────────────

const sym = {
  get pipe() {
    return ansi.gray('│');
  },
  get hollow() {
    return ansi.gray('◇');
  },
  get filled() {
    return ansi.cyan('◆');
  },
  get done() {
    return ansi.green('◆');
  },
};

/** Print the intro banner */
export function intro(title: string): void {
  console.log(`\n${ansi.bold(ansi.magenta('◆'))}  ${ansi.bold(title)}\n`);
}

/** Print the outro message */
export function outro(message: string): void {
  console.log(`\n${ansi.green('◆')}  ${ansi.bold(message)}\n`);
}

/** Prompt for text input (raw-mode TTY with readline fallback) */
export async function text(opts: {
  message: string;
  placeholder?: string;
  validate?: (v: string) => string | undefined;
}): Promise<string> {
  const { message, placeholder = '', validate } = opts;

  // Fallback for non-TTY (e.g., CI, piped input)
  if (!process.stdin.isTTY) {
    const readline = await import('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const prompt = `${sym.filled}  ${ansi.bold(message)}${placeholder ? ansi.dim(` (default: ${placeholder})`) : ''}\n${ansi.dim('›')} `;
    return new Promise((resolve, reject) => {
      rl.question(prompt, (answer) => {
        const value = answer.trim() || placeholder;
        if (validate) {
          const err = validate(value);
          if (err) {
            console.log(`  ${ansi.red('▲')} ${ansi.red(err)}`);
          }
        }
        rl.close();
        resolve(value);
      });
      rl.on('error', reject);
    });
  }

  return new Promise((resolve) => {
    let input = '';
    let errorMsg = '';

    function render(isFirst = false): void {
      if (!isFirst) {
        const lines = 2 + (errorMsg ? 1 : 0);
        process.stdout.write(`\x1b[${lines}A\x1b[0J`);
      }
      const hint = placeholder ? ansi.dim(` (default: ${placeholder})`) : '';
      console.log(`${sym.pipe}`);
      console.log(`${sym.filled}  ${ansi.bold(message)}${hint}`);
      if (errorMsg) {
        console.log(`  ${ansi.red('✖')} ${ansi.red(errorMsg)}`);
      }
      process.stdout.write(`  ${ansi.cyan('›')} ${input}`);
    }

    render(true);

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
        console.log(`${sym.done}  ${ansi.bold(message)}  ${ansi.white(value)}`);
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

/** Prompt for boolean confirmation (single-key Y/N with readline fallback) */
export async function confirm(opts: { message: string; initialValue?: boolean }): Promise<boolean> {
  const defaultValue = opts.initialValue ?? true;
  const hint = defaultValue ? ansi.dim('(Y/n)') : ansi.dim('(y/N)');

  // Fallback for non-TTY
  if (!process.stdin.isTTY) {
    const readline = await import('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const prompt = `${sym.filled}  ${ansi.bold(opts.message)} ${hint} `;
    return new Promise((resolve, reject) => {
      rl.question(prompt, (answer) => {
        rl.close();
        const trimmed = answer.trim().toLowerCase();
        let result: boolean;
        if (trimmed === '') {
          result = defaultValue;
        } else {
          result = trimmed === 'y' || trimmed === 'yes';
        }
        const display = result ? ansi.green('yes') : ansi.red('no');
        console.log(`${sym.done}  ${ansi.dim(display)}\n`);
        resolve(result);
      });
      rl.on('error', reject);
    });
  }

  return new Promise((resolve) => {
    console.log(`${sym.pipe}`);
    console.log(`${sym.filled}  ${ansi.bold(opts.message)} ${hint}`);

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

      const answerLabel = answer ? ansi.green('yes') : ansi.red('no');
      process.stdout.write(`\x1b[2A\x1b[0J`);
      console.log(`${sym.pipe}`);
      console.log(`${sym.done}  ${ansi.bold(opts.message)}  ${answerLabel}`);
      resolve(answer);
    }

    process.stdin.on('data', onKey);
  });
}

/** Single-select with arrow-key navigation (readline fallback for non-TTY) */
export async function select<T>(opts: {
  message: string;
  options: { value: T; label: string; hint?: string }[];
}): Promise<T> {
  const { message, options } = opts;

  // Fallback for non-TTY
  if (!process.stdin.isTTY) {
    const readline = await import('readline');
    console.log(`\n${sym.filled}  ${ansi.bold(message)}\n`);
    options.forEach((o, i) => {
      const hint = o.hint ? ansi.dim(` ${o.hint}`) : '';
      console.log(`  ${ansi.dim(`${i + 1}.`)} ${String(o.label)}${hint}`);
    });
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve, reject) => {
      rl.question(`${ansi.dim('›')} Enter number: `, (ans) => {
        rl.close();
        const n = parseInt(ans.trim(), 10);
        const opt = options[n - 1];
        if (!opt) {
          console.log(`${ansi.red('▲')} Invalid choice; using first option.\n`);
          resolve(options[0]!.value);
          return;
        }
        console.log(`${sym.done}  ${ansi.dim(String(opt.label))}\n`);
        resolve(opt.value);
      });
      rl.on('error', reject);
    });
  }

  return new Promise((resolve) => {
    let idx = 0;
    let drawn = false;

    function render(): void {
      if (drawn) {
        process.stdout.write(`\x1b[${options.length + 2}A\x1b[0J`);
      }
      drawn = true;

      console.log(`${sym.pipe}`);
      console.log(
        `${sym.filled}  ${ansi.bold(message)} ${ansi.dim('(↑↓ navigate, Enter select)')}`
      );
      for (let i = 0; i < options.length; i++) {
        const opt = options[i]!;
        const selected = i === idx;
        const indicator = selected ? ansi.cyan('●') : ansi.gray('○');
        const label = selected
          ? ansi.bold(ansi.white(opt.label as string))
          : ansi.gray(opt.label as string);
        const hint = opt.hint ? ` ${ansi.dim(opt.hint)}` : '';
        console.log(`  ${indicator} ${label}${hint}`);
      }
    }

    render();

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
        console.log(`${sym.done}  ${ansi.bold(message)}`);
        console.log(`  ${ansi.green('●')} ${ansi.bold(ansi.white(options[idx]!.label as string))}`);
        resolve(options[idx]!.value);
      } else if (key === '\x03') {
        process.stdin.setRawMode(false);
        process.exit(0);
      }
    }

    process.stdin.on('data', onKey);
  });
}

/** Multi-select with arrow-key navigation and space toggle */
export async function multiselect<T>(opts: {
  message: string;
  options: { value: T; label: string; hint?: string }[];
  initialValues?: T[];
}): Promise<T[]> {
  const { message, options, initialValues = [] } = opts;

  // Fallback for non-TTY
  if (!process.stdin.isTTY) {
    const readline = await import('readline');
    console.log(`\n${sym.filled}  ${ansi.bold(message)}`);
    console.log(`${ansi.dim('  (comma-separated numbers, e.g. 1,3)')}\n`);
    options.forEach((o, i) => {
      console.log(`  ${ansi.dim(`${i + 1}.`)} ${String(o.label)}`);
    });
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve, reject) => {
      rl.question(`${ansi.dim('›')} `, (ans) => {
        rl.close();
        const parts = ans
          .split(/[,\s]+/)
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !Number.isNaN(n));
        const picked: T[] = [];
        for (const n of parts) {
          const o = options[n - 1];
          if (o) picked.push(o.value);
        }
        console.log(`${sym.done}  ${ansi.dim(`${picked.length} selected`)}\n`);
        resolve(picked);
      });
      rl.on('error', reject);
    });
  }

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
      console.log(
        `${sym.filled}  ${ansi.bold(message)} ${ansi.dim('(space toggle, Enter confirm)')}`
      );
      for (let i = 0; i < options.length; i++) {
        const opt = options[i]!;
        const isActive = i === cursor;
        const isSelected = selected.has(opt.value);
        const box = isSelected ? ansi.green('■') : ansi.gray('□');
        const label = isActive
          ? ansi.bold(ansi.white(opt.label as string))
          : isSelected
            ? ansi.white(opt.label as string)
            : ansi.gray(opt.label as string);
        const hint = opt.hint ? ` ${ansi.dim(opt.hint)}` : '';
        const cursorIndicator = isActive ? ansi.cyan('▶') : ' ';
        console.log(`  ${cursorIndicator} ${box} ${label}${hint}`);
      }
      console.log(`  ${ansi.dim('─────────────────────────────')}`);
    }

    render();

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
        console.log(`${sym.done}  ${ansi.bold(message)}`);
        const labels = options
          .filter((o) => result.includes(o.value))
          .map((o) => `${ansi.green('■')} ${String(o.label)}`)
          .join('  ');
        console.log(`  ${labels || ansi.dim('(none)')}`);
        resolve(result);
      } else if (key === '\x03') {
        process.stdin.setRawMode(false);
        process.exit(0);
      }
    }

    process.stdin.on('data', onKey);
  });
}

/** Spinner for async operations */
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
    process.stdout.write(`\r${ansi.cyan(frame)} ${currentMsg}`);
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

/** Structured log helpers */
export const log = {
  info(msg: string): void {
    console.log(`${ansi.cyan('●')} ${msg}`);
  },
  success(msg: string): void {
    console.log(`${ansi.green('✓')} ${ansi.green(msg)}`);
  },
  warn(msg: string): void {
    console.log(`${ansi.yellow('▲')} ${ansi.yellow(msg)}`);
  },
  error(msg: string): void {
    console.log(`${ansi.red('✗')} ${ansi.red(msg)}`);
  },
  step(msg: string): void {
    console.log(`${ansi.magenta('◆')} ${ansi.bold(msg)}`);
  },
};

/** Thrown when a prompt is cancelled (clack-compatible). */
export class CancelError extends Error {
  constructor(message = 'Prompt cancelled') {
    super(message);
    this.name = 'CancelError';
  }
}

export function cancel(message = 'Cancelled'): never {
  throw new CancelError(message);
}

/** Run nested prompts under a titled group. */
export async function group<T>(opts: { title: string; prompts: () => Promise<T> }): Promise<T> {
  console.log(`\n${ansi.magenta('◆')}  ${ansi.bold(opts.title)}\n`);
  return opts.prompts();
}

export interface Task {
  title: string;
  task: () => Promise<string | undefined | void>;
}

export interface TasksOptions {
  parallel?: boolean;
  continueOnError?: boolean;
}

/** Run a list of tasks with spinner feedback. */
export async function tasks(taskList: Task[], opts?: TasksOptions): Promise<void> {
  if (opts?.parallel) {
    for (const t of taskList) {
      console.log(`  ${ansi.cyan('⠋')} ${t.title}`);
    }

    const results = await Promise.allSettled(taskList.map((t) => t.task()));

    for (let i = 0; i < taskList.length; i++) {
      const t = taskList[i]!;
      const result = results[i]!;
      if (result.status === 'fulfilled') {
        const returnValue = result.value;
        console.log(
          `  ${ansi.green('✓')} ${t.title}${returnValue ? ansi.dim('  ' + returnValue) : ''}`
        );
      } else {
        const err =
          result.reason instanceof Error ? result.reason : new Error(String(result.reason));
        console.log(`  ${ansi.red('✗')} ${t.title}  ${ansi.red(err.message)}`);
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
      process.stdout.write(`  ${ansi.cyan('⠋')} ${t.title}\n`);

      try {
        const returnValue = await t.task();
        process.stdout.write(`\x1b[1A\x1b[2K`);
        console.log(
          `  ${ansi.green('✓')} ${t.title}${returnValue ? ansi.dim('  ' + returnValue) : ''}`
        );
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        process.stdout.write(`\x1b[1A\x1b[2K`);
        console.log(`  ${ansi.red('✗')} ${t.title}  ${ansi.red(err.message)}`);
        if (!opts?.continueOnError) {
          throw err;
        }
      }
    }
  }
}
