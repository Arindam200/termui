import { createContext, useContext } from 'react';
import { getTerminalCapabilities } from '../terminal/capabilities.js';

export interface UnicodeContextValue {
  /** Whether the terminal supports Unicode/box-drawing characters. */
  unicode: boolean;
}

/**
 * Context that ThemeProvider populates with the detected unicode capability.
 * Defaults to `true` so components render correctly outside a ThemeProvider.
 */
export const UnicodeContext = createContext<UnicodeContextValue>({ unicode: true });

/**
 * Returns `true` when unicode should be suppressed.
 * Checks `NO_UNICODE=1` env var and terminal capability detection.
 * Used by ThemeProvider to seed UnicodeContext.
 */
export function isNoUnicode(): boolean {
  return !getTerminalCapabilities().supportsUnicode;
}

/**
 * Returns whether the current terminal supports Unicode symbols.
 *
 * Components use this to choose between rich Unicode glyphs and ASCII fallbacks.
 * Reads from `UnicodeContext` (set by `ThemeProvider`) so it honours both
 * auto-detection and `NO_UNICODE=1` / the `noUnicode` ThemeProvider prop.
 *
 * @example
 * ```tsx
 * function MySpinner() {
 *   const unicode = useUnicode();
 *   const frame = unicode ? '⠋' : '|';
 *   return <Text>{frame}</Text>;
 * }
 * ```
 */
export function useUnicode(): boolean {
  return useContext(UnicodeContext).unicode;
}
