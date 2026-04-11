import { useState, useCallback } from 'react';
import { useInput } from './useInput.js';

export interface KeyboardNavigationOptions {
  /** Total number of items in the list. */
  itemCount: number;
  /** Initially active index. Defaults to 0. */
  defaultIndex?: number;
  /** Wrap around at the ends. Defaults to true. */
  loop?: boolean;
  /** How many items to jump on Page Up / Page Down. Defaults to 10. */
  pageSize?: number;
  /** Called when the user presses Enter or Space on the active item. */
  onSelect?: (index: number) => void;
  /** Called when the user presses Escape. */
  onDismiss?: () => void;
  /** Whether keyboard handling is active. Defaults to true. */
  isActive?: boolean;
}

export interface KeyboardNavigationResult {
  /** The currently highlighted index. */
  activeIndex: number;
  /** Programmatically move focus to an index (clamped to valid range). */
  setActiveIndex: (index: number) => void;
}

/**
 * Standard keyboard navigation for list-style interactive components.
 *
 * Handles: ↑↓ arrows, Home/End, Page Up/Down, Enter/Space to select, Escape to dismiss.
 * All interactive components (Select, Menu, Tabs, CommandPalette, etc.) should use
 * this hook to ensure consistent keyboard behaviour across the library.
 *
 * @example
 * ```tsx
 * function MyList({ items }: { items: string[] }) {
 *   const { activeIndex } = useKeyboardNavigation({
 *     itemCount: items.length,
 *     onSelect: (i) => console.log('selected', items[i]),
 *     onDismiss: () => setOpen(false),
 *   });
 *   return (
 *     <Box flexDirection="column">
 *       {items.map((item, i) => (
 *         <Text key={item} color={i === activeIndex ? 'cyan' : undefined}>{item}</Text>
 *       ))}
 *     </Box>
 *   );
 * }
 * ```
 */
export function useKeyboardNavigation(
  options: KeyboardNavigationOptions
): KeyboardNavigationResult {
  const {
    itemCount,
    defaultIndex = 0,
    loop = true,
    pageSize = 10,
    onSelect,
    onDismiss,
    isActive = true,
  } = options;

  const [activeIndex, setActiveIndexRaw] = useState(
    Math.max(0, Math.min(defaultIndex, Math.max(0, itemCount - 1)))
  );

  useInput(
    (input, key) => {
      if (itemCount === 0) return;

      if (key.upArrow) {
        setActiveIndexRaw((i) => (loop ? (i - 1 + itemCount) % itemCount : Math.max(0, i - 1)));
      } else if (key.downArrow) {
        setActiveIndexRaw((i) =>
          loop ? (i + 1) % itemCount : Math.min(itemCount - 1, i + 1)
        );
      } else if (key.home) {
        setActiveIndexRaw(0);
      } else if (key.end) {
        setActiveIndexRaw(itemCount - 1);
      } else if (key.pageUp) {
        setActiveIndexRaw((i) => Math.max(0, i - pageSize));
      } else if (key.pageDown) {
        setActiveIndexRaw((i) => Math.min(itemCount - 1, i + pageSize));
      } else if (key.return || input === ' ') {
        onSelect?.(activeIndex);
      } else if (key.escape) {
        onDismiss?.();
      }
    },
    { isActive: isActive && itemCount > 0 }
  );

  const setActiveIndex = useCallback(
    (index: number) => {
      setActiveIndexRaw(Math.max(0, Math.min(itemCount - 1, index)));
    },
    [itemCount]
  );

  return { activeIndex, setActiveIndex };
}
