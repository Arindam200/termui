import { useFocus as inkUseFocus } from 'ink';

/** Single component focus state — delegates to Ink's useFocus */
export function useFocus(options?: { autoFocus?: boolean; isActive?: boolean; id?: string }) {
  return inkUseFocus(options);
}
