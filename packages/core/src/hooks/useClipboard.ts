import { useCallback } from 'react';
import { osc } from '../terminal/ansi.js';

/**
 * Write to the system clipboard using OSC 52 sequences.
 *
 * OSC 52 is supported by most modern terminals (iTerm2, Windows Terminal,
 * Alacritty, Kitty, VS Code terminal). Falls back gracefully when not
 * supported — writes are silently ignored.
 *
 * @returns `{ write(text): void }` — `write` sends `text` to the terminal
 *   clipboard via an OSC 52 escape sequence.
 *
 * @example
 * ```tsx
 * const { write } = useClipboard();
 * // Copy to clipboard:
 * write('some text');
 * ```
 */
export function useClipboard() {
  const write = useCallback((text: string) => {
    process.stdout.write(osc.clipboardWrite(text));
  }, []);

  return { write };
}
