import { useState, useCallback } from 'react';
import { useInput } from './useInput.js';

export interface VirtualScrollOptions {
  /** Total number of items in the list. */
  itemCount: number;
  /** Number of visible rows in the viewport. */
  viewportSize: number;
  /** Number of rows per item. Defaults to 1. */
  itemSize?: number;
  /** Initially focused index. Defaults to 0. */
  defaultIndex?: number;
  /** Extra items rendered above/below viewport. Defaults to 2. */
  overscan?: number;
  /** Whether keyboard events are handled. Defaults to true. */
  isActive?: boolean;
  /** Wrap navigation at ends. Defaults to false. */
  loop?: boolean;
}

export interface VirtualScrollResult {
  /** First rendered item index (includes overscan). */
  startIndex: number;
  /** Last rendered item index (includes overscan). */
  endIndex: number;
  /** First truly visible item index. */
  visibleStartIndex: number;
  /** Last truly visible item index. */
  visibleEndIndex: number;
  /** Currently focused item index. */
  focusedIndex: number;
  /** Current scroll position in rows. */
  scrollOffset: number;
  /** Programmatically set focused index (scrolls into view). */
  setFocusedIndex: (index: number) => void;
  /** Scroll to and focus the given index. */
  scrollToIndex: (index: number) => void;
  /** Returns true if the index is within the truly visible range. */
  isItemVisible: (index: number) => boolean;
}

// ── Pure arithmetic helpers (exported so tests can verify them directly) ──────

/**
 * Adjust scroll offset so that `focusedIndex` stays within the visible window.
 * Only moves the scroll when the item is out of view.
 */
export function adjustScrollOffset(
  focusedIndex: number,
  currentOffset: number,
  viewportSize: number,
  itemSize: number
): number {
  const itemTop = focusedIndex * itemSize;
  const itemBottom = itemTop + itemSize - 1;

  if (itemTop < currentOffset) {
    // Item is above the viewport — scroll up to reveal it
    return itemTop;
  }
  if (itemBottom > currentOffset + viewportSize - 1) {
    // Item is below the viewport — scroll down to reveal it
    return itemBottom - viewportSize + 1;
  }
  return currentOffset;
}

/**
 * Compute visible and overscan item index ranges from scroll state.
 */
export function computeRanges(
  scrollOffset: number,
  viewportSize: number,
  itemSize: number,
  itemCount: number,
  overscan: number
): {
  visibleStartIndex: number;
  visibleEndIndex: number;
  startIndex: number;
  endIndex: number;
} {
  if (itemCount === 0) {
    return { visibleStartIndex: 0, visibleEndIndex: 0, startIndex: 0, endIndex: 0 };
  }

  const visibleStartIndex = Math.floor(scrollOffset / itemSize);
  const visibleEndIndex = Math.min(
    itemCount - 1,
    visibleStartIndex + Math.ceil(viewportSize / itemSize) - 1
  );
  const startIndex = Math.max(0, visibleStartIndex - overscan);
  const endIndex = Math.min(itemCount - 1, visibleEndIndex + overscan);

  return { visibleStartIndex, visibleEndIndex, startIndex, endIndex };
}

/**
 * Navigate one step up, respecting loop and itemCount.
 */
export function navigateUp(index: number, itemCount: number, loop: boolean): number {
  if (itemCount === 0) return 0;
  return loop ? (index - 1 + itemCount) % itemCount : Math.max(0, index - 1);
}

/**
 * Navigate one step down, respecting loop and itemCount.
 */
export function navigateDown(index: number, itemCount: number, loop: boolean): number {
  if (itemCount === 0) return 0;
  return loop ? (index + 1) % itemCount : Math.min(itemCount - 1, index + 1);
}

/**
 * Navigate by a page (clamps, never wraps).
 */
export function navigatePageUp(index: number, pageItems: number): number {
  return Math.max(0, index - pageItems);
}

export function navigatePageDown(index: number, itemCount: number, pageItems: number): number {
  return Math.min(itemCount - 1, index + pageItems);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Virtual scrolling hook for efficient rendering of large terminal lists.
 *
 * Manages focus, scroll window, and overscan. Handles ↑/↓, PgUp/PgDn, Home/End.
 *
 * @example
 * ```tsx
 * function MyBigList({ items }: { items: string[] }) {
 *   const { startIndex, endIndex, focusedIndex, isItemVisible } = useVirtualScroll({
 *     itemCount: items.length,
 *     viewportSize: 10,
 *   });
 *   return (
 *     <Box flexDirection="column">
 *       {items.slice(startIndex, endIndex + 1).map((item, offset) => {
 *         const index = startIndex + offset;
 *         return isItemVisible(index) ? (
 *           <Text key={index} color={index === focusedIndex ? 'cyan' : undefined}>{item}</Text>
 *         ) : null;
 *       })}
 *     </Box>
 *   );
 * }
 * ```
 */
export function useVirtualScroll(options: VirtualScrollOptions): VirtualScrollResult {
  const {
    itemCount,
    viewportSize,
    itemSize = 1,
    defaultIndex = 0,
    overscan = 2,
    isActive = true,
    loop = false,
  } = options;

  const pageItems = Math.max(1, Math.floor(viewportSize / itemSize));

  const clampedDefault = itemCount > 0 ? Math.max(0, Math.min(defaultIndex, itemCount - 1)) : 0;

  const [focusedIndex, setFocusedIndexRaw] = useState(clampedDefault);
  const [scrollOffset, setScrollOffset] = useState(() =>
    adjustScrollOffset(clampedDefault, 0, viewportSize, itemSize)
  );

  useInput(
    (_input, key) => {
      if (itemCount === 0) return;

      if (key.upArrow) {
        setFocusedIndexRaw((prev) => {
          const next = navigateUp(prev, itemCount, loop);
          setScrollOffset((off) => adjustScrollOffset(next, off, viewportSize, itemSize));
          return next;
        });
      } else if (key.downArrow) {
        setFocusedIndexRaw((prev) => {
          const next = navigateDown(prev, itemCount, loop);
          setScrollOffset((off) => adjustScrollOffset(next, off, viewportSize, itemSize));
          return next;
        });
      } else if (key.pageUp) {
        setFocusedIndexRaw((prev) => {
          const next = navigatePageUp(prev, pageItems);
          setScrollOffset((off) => adjustScrollOffset(next, off, viewportSize, itemSize));
          return next;
        });
      } else if (key.pageDown) {
        setFocusedIndexRaw((prev) => {
          const next = navigatePageDown(prev, itemCount, pageItems);
          setScrollOffset((off) => adjustScrollOffset(next, off, viewportSize, itemSize));
          return next;
        });
      } else if (key.home) {
        setFocusedIndexRaw(0);
        setScrollOffset(0);
      } else if (key.end) {
        const last = itemCount - 1;
        setFocusedIndexRaw(last);
        setScrollOffset(adjustScrollOffset(last, 0, viewportSize, itemSize));
      }
    },
    { isActive: isActive && itemCount > 0 }
  );

  const setFocusedIndex = useCallback(
    (index: number) => {
      if (itemCount === 0) return;
      const clamped = Math.max(0, Math.min(itemCount - 1, index));
      setFocusedIndexRaw(clamped);
      setScrollOffset((off) => adjustScrollOffset(clamped, off, viewportSize, itemSize));
    },
    [itemCount, viewportSize, itemSize]
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      if (itemCount === 0) return;
      const clamped = Math.max(0, Math.min(itemCount - 1, index));
      setFocusedIndexRaw(clamped);
      // Center the item in the viewport
      const itemTop = clamped * itemSize;
      const centered = Math.max(0, itemTop - Math.floor((viewportSize - itemSize) / 2));
      setScrollOffset(centered);
    },
    [itemCount, viewportSize, itemSize]
  );

  const { visibleStartIndex, visibleEndIndex, startIndex, endIndex } = computeRanges(
    scrollOffset,
    viewportSize,
    itemSize,
    itemCount,
    overscan
  );

  const isItemVisible = useCallback(
    (index: number): boolean => {
      if (itemCount === 0) return false;
      return index >= visibleStartIndex && index <= visibleEndIndex;
    },
    [itemCount, visibleStartIndex, visibleEndIndex]
  );

  return {
    startIndex,
    endIndex,
    visibleStartIndex,
    visibleEndIndex,
    focusedIndex,
    scrollOffset,
    setFocusedIndex,
    scrollToIndex,
    isItemVisible,
  };
}
