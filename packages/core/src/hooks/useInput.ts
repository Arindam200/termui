import { useInput as inkUseInput } from 'ink';

export type Key = {
  upArrow: boolean;
  downArrow: boolean;
  leftArrow: boolean;
  rightArrow: boolean;
  pageDown: boolean;
  pageUp: boolean;
  return: boolean;
  escape: boolean;
  ctrl: boolean;
  shift: boolean;
  tab: boolean;
  backspace: boolean;
  delete: boolean;
  meta: boolean;
  /** Ink 5 Kitty keyboard protocol: 'press' | 'repeat' | 'release'. Undefined on xterm-style terminals. */
  eventType?: 'press' | 'repeat' | 'release';
  /** Home key (Ink 5). */
  home?: boolean;
  /** End key (Ink 5). */
  end?: boolean;
  /** Function key number (Ink 5). */
  fn?: boolean;
};

export type InputHandler = (input: string, key: Key) => void;

/**
 * Handle keyboard input in a component.
 *
 * The handler is called on every keystroke. Use the `key` object
 * to detect modifier keys and special keys.
 *
 * @param handler - Called with `(input, key)` on every keystroke.
 *   `input` is the character typed; `key` has boolean flags for
 *   modifiers (`ctrl`, `meta`, `shift`) and special keys
 *   (`upArrow`, `downArrow`, `leftArrow`, `rightArrow`, `return`,
 *   `escape`, `tab`, `backspace`, `delete`).
 * @param options - Optional options object. `isActive` (default: true)
 *   lets you disable input handling without unmounting.
 *
 * @example
 * ```tsx
 * useInput((input, key) => {
 *   if (key.escape) process.exit(0);
 *   if (key.upArrow) setIndex(i => Math.max(0, i - 1));
 *   if (key.ctrl && input === 'c') process.exit(0);
 * });
 * ```
 */
export function useInput(handler: InputHandler, options?: { isActive?: boolean }): void {
  inkUseInput(handler, options);
}
