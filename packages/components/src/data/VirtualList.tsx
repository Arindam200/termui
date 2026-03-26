import React, { useState, useMemo, useCallback } from 'react';
import { Box, Text } from 'ink';
import { useInput, useTheme } from '@termui/core';
import type { ReactNode } from 'react';

export interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isActive: boolean) => ReactNode;
  height: number;
  onSelect?: (item: T, index: number) => void;
  cursor?: string;
  overscan?: number;
  /** Enable built-in search/filter */
  searchable?: boolean;
  /** Custom filter function. Default: case-insensitive substring on String(item) */
  filterFn?: (item: T, query: string) => boolean;
  /** Called when search query changes (for server-side filtering) */
  onSearch?: (query: string) => void;
}

export function VirtualList<T>({
  items,
  renderItem,
  height,
  onSelect,
  overscan = 2,
  searchable = false,
  filterFn,
  onSearch,
}: VirtualListProps<T>) {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowStart, setWindowStart] = useState(0);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const defaultFilter = useCallback((item: T, q: string): boolean => {
    return String(item).toLowerCase().includes(q.toLowerCase());
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchable || query === '') return items;
    const fn = filterFn ?? defaultFilter;
    return items.filter((item) => fn(item, query));
  }, [items, query, searchable, filterFn, defaultFilter]);

  const listHeight = searchable ? height - 2 : height;

  useInput((input, key) => {
    if (searchable && searchFocused) {
      if (key.escape) {
        setSearchFocused(false);
        return;
      }
      if (key.backspace || key.delete) {
        const newQ = query.slice(0, -1);
        setQuery(newQ);
        onSearch?.(newQ);
        setActiveIndex(0);
        setWindowStart(0);
        return;
      }
      if (key.downArrow) {
        setSearchFocused(false);
        return;
      }
      if (input && input.length === 1 && !key.ctrl && !key.meta) {
        const newQ = query + input;
        setQuery(newQ);
        onSearch?.(newQ);
        setActiveIndex(0);
        setWindowStart(0);
        return;
      }
    }

    if (searchable && !searchFocused && input === '/') {
      setSearchFocused(true);
      return;
    }

    if (key.upArrow) {
      if (searchable && activeIndex === 0) {
        setSearchFocused(true);
        return;
      }
      setActiveIndex((prev) => {
        const next = Math.max(0, prev - 1);
        setWindowStart((ws) => Math.min(ws, next));
        return next;
      });
    } else if (key.downArrow) {
      setActiveIndex((prev) => {
        const next = Math.min(filteredItems.length - 1, prev + 1);
        setWindowStart((ws) => {
          if (next >= ws + listHeight) return next - listHeight + 1;
          return ws;
        });
        return next;
      });
    } else if (key.return) {
      const item = filteredItems[activeIndex];
      if (item !== undefined) onSelect?.(item, activeIndex);
    }
  });

  const visibleStart = Math.max(0, windowStart - overscan);
  const visibleEnd = Math.min(filteredItems.length, windowStart + listHeight + overscan);
  const visibleItems = useMemo(
    () => filteredItems.slice(visibleStart, visibleEnd),
    [filteredItems, visibleStart, visibleEnd]
  );

  // Scrollbar calculations
  const thumbSize =
    filteredItems.length > 0
      ? Math.max(1, Math.floor((listHeight * listHeight) / filteredItems.length))
      : 1;
  const thumbPosition =
    filteredItems.length <= listHeight
      ? 0
      : Math.floor(
          (activeIndex / Math.max(1, filteredItems.length - 1)) * (listHeight - thumbSize)
        );

  const scrollbar = useMemo(() => {
    return Array.from({ length: listHeight }, (_, i) => {
      if (i >= thumbPosition && i < thumbPosition + thumbSize) return '█';
      return '│';
    });
  }, [listHeight, thumbPosition, thumbSize]);

  return (
    <Box flexDirection="column">
      {searchable && (
        <Box
          flexDirection="row"
          borderStyle={searchFocused ? 'bold' : 'single'}
          borderColor={searchFocused ? theme.colors.focusRing : theme.colors.border}
          paddingLeft={1}
          paddingRight={1}
          marginBottom={0}
        >
          <Text color={theme.colors.mutedForeground}>Search: </Text>
          <Text>{query}</Text>
          {searchFocused && <Text color={theme.colors.primary}>▌</Text>}
          {!searchFocused && query === '' && (
            <Text color={theme.colors.mutedForeground} dimColor>
              / to search
            </Text>
          )}
        </Box>
      )}
      <Box flexDirection="row">
        <Box flexDirection="column" flexGrow={1}>
          {filteredItems.length === 0 && query !== '' ? (
            <Text color={theme.colors.mutedForeground} dimColor>
              No results for &apos;{query}&apos;
            </Text>
          ) : (
            visibleItems.map((item, localIdx) => {
              const globalIdx = visibleStart + localIdx;
              const isVisible = globalIdx >= windowStart && globalIdx < windowStart + listHeight;
              if (!isVisible) return null;
              const isActive = globalIdx === activeIndex;
              return <Box key={globalIdx}>{renderItem(item, globalIdx, isActive)}</Box>;
            })
          )}
        </Box>
        {filteredItems.length > listHeight && (
          <Box flexDirection="column" marginLeft={1}>
            {scrollbar.map((char, i) => (
              <Text
                key={i}
                color={char === '█' ? theme.colors.primary : theme.colors.mutedForeground}
              >
                {char}
              </Text>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
