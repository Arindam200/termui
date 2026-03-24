/**
 * termui/clack adapter — @clack/prompts compatible API using TermUI components.
 *
 * Provides the same surface as @clack/prompts but uses ANSI codes directly
 * (no React/Ink required for these simple prompts).
 */

import * as readline from 'readline';

// ANSI helpers
const ansi = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
  reset: '\x1b[0m',
};

/** Print the intro banner */
export function intro(title: string): void {
  console.log(`\n${ansi.bold(ansi.magenta('◆'))}  ${ansi.bold(title)}\n`);
}

/** Print the outro message */
export function outro(message: string): void {
  console.log(`\n${ansi.green('◆')}  ${ansi.bold(message)}\n`);
}

/** Prompt for text input */
export async function text(opts: {
  message: string;
  placeholder?: string;
  validate?: (v: string) => string | undefined;
}): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    const prompt = `${ansi.cyan('◆')}  ${ansi.bold(opts.message)}\n${ansi.dim('›')} `;

    function ask(): void {
      rl.question(prompt, (answer) => {
        const value = answer.trim() || opts.placeholder || '';
        if (opts.validate) {
          const error = opts.validate(value);
          if (error) {
            console.log(`  ${ansi.red('▲')} ${ansi.red(error)}`);
            ask();
            return;
          }
        }
        rl.close();
        console.log(`${ansi.green('◇')}  ${ansi.dim(value)}\n`);
        resolve(value);
      });
    }

    ask();

    rl.on('error', reject);
  });
}

/** Prompt for boolean confirmation */
export async function confirm(opts: { message: string; initialValue?: boolean }): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const defaultHint = opts.initialValue === false ? 'y/N' : 'Y/n';
  const prompt = `${ansi.cyan('◆')}  ${ansi.bold(opts.message)} ${ansi.dim(`(${defaultHint})`)} `;

  return new Promise((resolve, reject) => {
    rl.question(prompt, (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();
      let result: boolean;

      if (trimmed === '') {
        result = opts.initialValue ?? true;
      } else {
        result = trimmed === 'y' || trimmed === 'yes';
      }

      const display = result ? ansi.green('yes') : ansi.red('no');
      console.log(`${ansi.green('◇')}  ${ansi.dim(display)}\n`);
      resolve(result);
    });

    rl.on('error', reject);
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
        process.stdout.write('\x1b[?25l'); // hide cursor
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
        process.stdout.write('\x1b[?25h'); // show cursor
        process.stdout.write('\r\x1b[K'); // clear line
      }
      if (msg) {
        console.log(`${ansi.green('◇')}  ${msg}`);
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

/** Single-select by numeric index (portable without raw TTY). */
export async function select<T>(opts: {
  message: string;
  options: { value: T; label: string; hint?: string }[];
}): Promise<T> {
  console.log(`\n${ansi.cyan('◆')}  ${ansi.bold(opts.message)}\n`);
  opts.options.forEach((o, i) => {
    const hint = o.hint ? ansi.dim(` ${o.hint}`) : '';
    console.log(`  ${ansi.dim(`${i + 1}.`)} ${o.label}${hint}`);
  });
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve, reject) => {
    rl.question(`${ansi.dim('›')} Enter number: `, (ans) => {
      rl.close();
      const n = parseInt(ans.trim(), 10);
      const opt = opts.options[n - 1];
      if (!opt) {
        console.log(`${ansi.red('▲')} Invalid choice; using first option.\n`);
        resolve(opts.options[0]!.value);
        return;
      }
      console.log(`${ansi.green('◇')}  ${ansi.dim(String(opt.label))}\n`);
      resolve(opt.value);
    });
    rl.on('error', reject);
  });
}

/** Multi-select via comma-separated indices. */
export async function multiselect<T>(opts: {
  message: string;
  options: { value: T; label: string }[];
}): Promise<T[]> {
  console.log(`\n${ansi.cyan('◆')}  ${ansi.bold(opts.message)}`);
  console.log(`${ansi.dim('  (comma-separated numbers, e.g. 1,3)')}\n`);
  opts.options.forEach((o, i) => {
    console.log(`  ${ansi.dim(`${i + 1}.`)} ${o.label}`);
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
        const o = opts.options[n - 1];
        if (o) picked.push(o.value);
      }
      console.log(`${ansi.green('◇')}  ${ansi.dim(`${picked.length} selected`)}\n`);
      resolve(picked);
    });
    rl.on('error', reject);
  });
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
    // Parallel mode: print all tasks as pending, run concurrently, then print results
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

    // If not continueOnError, throw the first error
    if (!opts?.continueOnError) {
      for (const result of results) {
        if (result.status === 'rejected') {
          throw result.reason instanceof Error ? result.reason : new Error(String(result.reason));
        }
      }
    }
  } else {
    // Sequential mode (default)
    for (const t of taskList) {
      // Print spinner start line
      process.stdout.write(`  ${ansi.cyan('⠋')} ${t.title}\n`);

      try {
        const returnValue = await t.task();
        // Move cursor up one line and clear it, then print success
        process.stdout.write(`\x1b[1A\x1b[2K`);
        console.log(
          `  ${ansi.green('✓')} ${t.title}${returnValue ? ansi.dim('  ' + returnValue) : ''}`
        );
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        // Move cursor up one line and clear it, then print error
        process.stdout.write(`\x1b[1A\x1b[2K`);
        console.log(`  ${ansi.red('✗')} ${t.title}  ${ansi.red(err.message)}`);
        if (!opts?.continueOnError) {
          throw err;
        }
      }
    }
  }
}
