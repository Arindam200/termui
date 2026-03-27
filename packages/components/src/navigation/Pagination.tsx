import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput, useTheme } from '@termui/core';

export interface PaginationProps {
  total: number;
  /** Controlled current page (1-based). Omit for uncontrolled mode. */
  current?: number;
  onChange?: (page: number) => void;
  showEdges?: boolean;
  siblings?: number;
}

function buildPages(
  total: number,
  current: number,
  siblings: number,
  showEdges: boolean
): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];

  if (showEdges) {
    // Always include first page with optional ellipsis
    pages.push(1);
    const leftSibling = Math.max(2, current - siblings);
    const rightSibling = Math.min(total - 1, current + siblings);
    if (leftSibling > 2) pages.push('...');
    for (let i = leftSibling; i <= rightSibling; i++) pages.push(i);
    if (rightSibling < total - 1) pages.push('...');
    pages.push(total);
  } else {
    // Only show the sibling window around the current page
    const left = Math.max(1, current - siblings);
    const right = Math.min(total, current + siblings);
    for (let i = left; i <= right; i++) pages.push(i);
  }

  return pages;
}

export function Pagination({
  total,
  current,
  onChange,
  showEdges = true,
  siblings = 1,
}: PaginationProps) {
  const theme = useTheme();
  const [internalPage, setInternalPage] = useState(current ?? 1);
  // In controlled mode (current provided), the parent owns the page value.
  // In uncontrolled mode (current omitted), use internal state.
  const activePage = current ?? internalPage;

  function goTo(page: number) {
    const clamped = Math.min(Math.max(1, page), total);
    if (clamped === activePage) return;
    if (current !== undefined) {
      onChange?.(clamped);
    } else {
      setInternalPage(clamped);
      onChange?.(clamped);
    }
  }

  useInput((_input, key) => {
    if (key.leftArrow) goTo(activePage - 1);
    if (key.rightArrow) goTo(activePage + 1);
  });

  const pages = buildPages(total, activePage, siblings, showEdges);

  return (
    <Box flexDirection="row" alignItems="center" gap={1}>
      {/* Prev button */}
      <Text
        color={activePage === 1 ? theme.colors.mutedForeground : theme.colors.primary}
        dimColor={activePage === 1}
      >
        ‹
      </Text>

      {pages.map((p, idx) => {
        if (p === '...') {
          return (
            <Text key={`ellipsis-${idx}`} color={theme.colors.mutedForeground}>
              …
            </Text>
          );
        }
        const isActive = p === activePage;
        return (
          <Text
            key={p}
            color={isActive ? theme.colors.primary : theme.colors.mutedForeground}
            bold={isActive}
          >
            {isActive ? `[${p}]` : `${p}`}
          </Text>
        );
      })}

      {/* Next button */}
      <Text
        color={activePage === total ? theme.colors.mutedForeground : theme.colors.primary}
        dimColor={activePage === total}
      >
        ›
      </Text>
    </Box>
  );
}
