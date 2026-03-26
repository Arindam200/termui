import { useFocus as inkUseFocus } from 'ink';

/**
 * Track and control focus state for a single component. Delegates to Ink's
 * `useFocus` and participates in the global tab-focus cycle managed by
 * `useFocusManager`.
 *
 * @param options.autoFocus - When `true`, the component captures focus
 *   immediately on mount without waiting for a tab keypress. Defaults to `false`.
 * @param options.isActive - When `false`, the component is excluded from the
 *   focus cycle entirely (useful for conditionally disabled elements). Defaults
 *   to `true`.
 * @param options.id - Optional stable identifier so `useFocusManager().focus(id)`
 *   can target this component by name. Must be unique across the component tree.
 * @returns An object with `isFocused: boolean` — `true` when this component
 *   currently holds keyboard focus.
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const { isFocused } = useFocus({ autoFocus: true, id: 'search' });
 *   return (
 *     <Box borderColor={isFocused ? 'blue' : 'gray'}>
 *       <TextInput />
 *     </Box>
 *   );
 * }
 * ```
 */
export function useFocus(options?: { autoFocus?: boolean; isActive?: boolean; id?: string }) {
  return inkUseFocus(options);
}
