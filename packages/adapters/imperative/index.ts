/**
 * termui/imperative — non-React prompt API
 *
 * Each function mounts its Ink component, awaits submission, then unmounts.
 * This is the React-backed equivalent of termui/clack, with full TermUI theming.
 *
 * @example
 * ```ts
 * import { intro, text, select, confirm, outro } from 'termui/imperative';
 *
 * intro('Setup');
 * const name = await text({ message: 'Project name', placeholder: 'my-app' });
 * const pm   = await select({ message: 'Package manager', options: ['npm', 'pnpm', 'bun'] });
 * const ok   = await confirm({ message: `Create ${name} with ${pm}?` });
 * outro(ok ? 'Done!' : 'Cancelled');
 * ```
 */

import React from 'react';
import { render as inkRender } from 'ink';
import { ThemeProvider } from '@termui/core';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface TextOptions {
  message: string;
  placeholder?: string;
  defaultValue?: string;
  validate?: (value: string) => string | undefined;
}

export interface SelectOptions<T extends string = string> {
  message: string;
  options: Array<T | { value: T; label: string; hint?: string }>;
  initialValue?: T;
}

export interface MultiSelectOptions<T extends string = string> {
  message: string;
  options: Array<T | { value: T; label: string; hint?: string }>;
  initialValues?: T[];
  required?: boolean;
}

export interface ConfirmOptions {
  message: string;
  initialValue?: boolean;
}

export interface SpinnerHandle {
  start: (msg?: string) => void;
  stop: (msg?: string) => void;
  error: (msg?: string) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const ESC = '\x1b[';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';

// ─── intro / outro ─────────────────────────────────────────────────────────

export function intro(title: string): void {
  console.log(`\n${BOLD}${CYAN}◆ ${title}${RESET}`);
  console.log(`${DIM}${'─'.repeat(Math.min(process.stdout.columns ?? 40, 60))}${RESET}`);
}

export function outro(message: string): void {
  console.log(`${DIM}${'─'.repeat(Math.min(process.stdout.columns ?? 40, 60))}${RESET}`);
  console.log(`${BOLD}${GREEN}◆ ${message}${RESET}\n`);
}

// ─── log ───────────────────────────────────────────────────────────────────

export const log = {
  info: (msg: string) => console.log(`${CYAN}  ℹ ${RESET}${msg}`),
  success: (msg: string) => console.log(`${GREEN}  ✓ ${RESET}${msg}`),
  warn: (msg: string) => console.log(`${YELLOW}  ! ${RESET}${msg}`),
  error: (msg: string) => console.error(`${RED}  ✗ ${RESET}${msg}`),
  step: (msg: string) => console.log(`${DIM}  │${RESET} ${msg}`),
};

// ─── text ──────────────────────────────────────────────────────────────────

export async function text(opts: TextOptions): Promise<string> {
  const { default: readline } = await import('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    const prompt = opts.placeholder
      ? `${BOLD}◇${RESET} ${opts.message} ${DIM}(${opts.placeholder})${RESET} `
      : `${BOLD}◇${RESET} ${opts.message} `;

    const tryPrompt = () => {
      rl.question(prompt, (answer) => {
        const value = answer.trim() || opts.defaultValue || opts.placeholder || '';
        if (opts.validate) {
          const err = opts.validate(value);
          if (err) {
            console.log(`${RED}  ✗ ${err}${RESET}`);
            tryPrompt();
            return;
          }
        }
        rl.close();
        resolve(value);
      });
    };
    tryPrompt();
  });
}

// ─── confirm ───────────────────────────────────────────────────────────────

export async function confirm(opts: ConfirmOptions): Promise<boolean> {
  const { default: readline } = await import('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    const def = opts.initialValue !== false;
    const prompt = `${BOLD}◇${RESET} ${opts.message} ${DIM}(${def ? 'Y/n' : 'y/N'})${RESET} `;
    rl.question(prompt, (answer) => {
      rl.close();
      const a = answer.trim().toLowerCase();
      if (a === '') resolve(def);
      else resolve(a === 'y' || a === 'yes');
    });
  });
}

// ─── select ────────────────────────────────────────────────────────────────

export async function select<T extends string = string>(opts: SelectOptions<T>): Promise<T> {
  const normalized = opts.options.map((o) =>
    typeof o === 'string' ? { value: o as T, label: o, hint: undefined } : o
  );

  console.log(`${BOLD}◇${RESET} ${opts.message}`);
  normalized.forEach((o, i) => {
    const num = `${DIM}${i + 1}.${RESET}`;
    const hint = o.hint ? ` ${DIM}(${o.hint})${RESET}` : '';
    console.log(`  ${num} ${o.label}${hint}`);
  });

  const { default: readline } = await import('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    const tryPrompt = () => {
      rl.question(`${DIM}Enter number (1-${normalized.length}):${RESET} `, (answer) => {
        const idx = parseInt(answer.trim(), 10) - 1;
        if (isNaN(idx) || idx < 0 || idx >= normalized.length) {
          console.log(`${RED}  ✗ Invalid choice${RESET}`);
          tryPrompt();
          return;
        }
        rl.close();
        resolve(normalized[idx]!.value);
      });
    };
    tryPrompt();
  });
}

// ─── multiselect ───────────────────────────────────────────────────────────

export async function multiselect<T extends string = string>(
  opts: MultiSelectOptions<T>
): Promise<T[]> {
  const normalized = opts.options.map((o) =>
    typeof o === 'string' ? { value: o as T, label: o, hint: undefined } : o
  );

  console.log(`${BOLD}◇${RESET} ${opts.message} ${DIM}(comma-separated numbers)${RESET}`);
  normalized.forEach((o, i) => {
    const num = `${DIM}${i + 1}.${RESET}`;
    const hint = o.hint ? ` ${DIM}(${o.hint})${RESET}` : '';
    console.log(`  ${num} ${o.label}${hint}`);
  });

  const { default: readline } = await import('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    const tryPrompt = () => {
      rl.question(`${DIM}Enter numbers (e.g. 1,3):${RESET} `, (answer) => {
        const parts = answer
          .trim()
          .split(',')
          .map((s) => parseInt(s.trim(), 10) - 1);
        const valid = parts.every((i) => !isNaN(i) && i >= 0 && i < normalized.length);
        if (!valid) {
          console.log(`${RED}  ✗ Invalid selection${RESET}`);
          tryPrompt();
          return;
        }
        if (opts.required && parts.length === 0) {
          console.log(`${RED}  ✗ Select at least one option${RESET}`);
          tryPrompt();
          return;
        }
        rl.close();
        resolve(parts.map((i) => normalized[i]!.value));
      });
    };
    tryPrompt();
  });
}

// ─── spinner ───────────────────────────────────────────────────────────────

export function spinner(): SpinnerHandle {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frame = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let currentMsg = '';

  const clear = () => {
    if (process.stdout.isTTY) process.stdout.write('\r\x1b[K');
  };

  return {
    start(msg = '') {
      currentMsg = msg;
      timer = setInterval(() => {
        clear();
        process.stdout.write(`${CYAN}${frames[frame % frames.length]!}${RESET} ${currentMsg}`);
        frame++;
      }, 80);
    },
    stop(msg) {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      clear();
      console.log(`${GREEN}✓${RESET} ${msg ?? currentMsg}`);
    },
    error(msg) {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      clear();
      console.log(`${RED}✗${RESET} ${msg ?? currentMsg}`);
    },
  };
}
