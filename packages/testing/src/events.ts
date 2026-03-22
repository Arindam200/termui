/**
 * Keyboard event simulation for TermUI components.
 *
 * Writes raw ANSI escape sequences to the process stdin mock so that
 * Ink's useInput / readline handlers receive the event.
 */
import { type Writable } from 'stream';

export interface FireEventOptions {
  /** Custom stdin stream to write to (defaults to process.stdin) */
  stdin?: Writable;
}

/** Map of named keys to their ANSI sequences */
const KEY_SEQUENCES: Record<string, string> = {
  // Navigation
  up: '\x1b[A',
  down: '\x1b[B',
  right: '\x1b[C',
  left: '\x1b[D',
  home: '\x1b[H',
  end: '\x1b[F',
  pageUp: '\x1b[5~',
  pageDown: '\x1b[6~',
  // Actions
  enter: '\r',
  return: '\r',
  tab: '\t',
  backspace: '\x7f',
  delete: '\x1b[3~',
  escape: '\x1b',
  space: ' ',
  // Ctrl combos
  ctrlC: '\x03',
  ctrlD: '\x04',
  ctrlN: '\x0e',
  ctrlP: '\x10',
  ctrlS: '\x13',
  ctrlZ: '\x1a',
};

export interface FireEventAPI {
  /** Fire a named key (e.g. 'up', 'enter', 'escape') */
  key(name: keyof typeof KEY_SEQUENCES | string, opts?: FireEventOptions): void;
  /** Type a string character by character */
  type(text: string, opts?: FireEventOptions): void;
  /** Press a single character */
  press(char: string, opts?: FireEventOptions): void;
}

function writeToStdin(data: string, opts?: FireEventOptions): void {
  const target = (opts?.stdin ?? process.stdin) as Writable & { write: (d: string) => void };
  if (typeof target.write === 'function') {
    target.write(data);
  }
}

export const fireEvent: FireEventAPI = {
  key(name: string, opts?: FireEventOptions): void {
    const seq = KEY_SEQUENCES[name] ?? name;
    writeToStdin(seq, opts);
  },

  type(text: string, opts?: FireEventOptions): void {
    for (const char of text) {
      writeToStdin(char, opts);
    }
  },

  press(char: string, opts?: FireEventOptions): void {
    writeToStdin(char, opts);
  },
};
