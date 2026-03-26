import { useFocusManager as inkUseFocusManager } from 'ink';

/**
 * Programmatically control the global focus cycle across all focusable
 * components. Delegates to Ink's `useFocusManager` and is most useful for
 * implementing custom keyboard navigation, modal traps, or focus-reset logic.
 *
 * @returns An object with the following methods:
 *   - `focus(id)` — Move focus directly to the component registered with the
 *     given `id` (set via `useFocus({ id })`).
 *   - `disableFocus()` — Suspend the entire focus system; no component will
 *     receive focus until `enableFocus()` is called. Useful when a modal or
 *     overlay should capture all input exclusively.
 *   - `enableFocus()` — Resume normal focus management after a
 *     `disableFocus()` call.
 *   - `focusNext()` — Advance focus to the next component in tab order.
 *   - `focusPrevious()` — Move focus back to the previous component in tab
 *     order (equivalent to Shift+Tab).
 *
 * @example
 * ```tsx
 * function App() {
 *   const { focus, focusNext, focusPrevious, disableFocus, enableFocus } =
 *     useFocusManager();
 *
 *   useInput((input, key) => {
 *     if (key.tab) focusNext();
 *     if (key.shift && key.tab) focusPrevious();
 *     if (input === 'r') focus('search'); // jump to a named component
 *   });
 *
 *   return <SearchInput />;
 * }
 * ```
 */
export function useFocusManager() {
  return inkUseFocusManager();
}
