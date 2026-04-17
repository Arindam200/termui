import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useTheme, useInput } from '@termui/core';
import type { ReactNode } from 'react';

export interface ConversationHistoryProps {
  /** Number of visible rows. Default: 20 */
  maxHeight?: number;
  children?: ReactNode;
  /** Show scroll position indicator. Default: true */
  showScrollHint?: boolean;
  /** Whether keyboard navigation is active. Default: true */
  isActive?: boolean;
}

// Note: true pixel-perfect scrolling is not possible in Ink — this is a best-effort
// wrapper that slices the child list by count to simulate a scrollable view.
export function ConversationHistory({
  maxHeight = 20,
  children,
  showScrollHint = true,
  isActive = true,
}: ConversationHistoryProps) {
  const theme = useTheme();
  const childArray = React.Children.toArray(children);
  const totalChildren = childArray.length;

  // scrollOffset is the index of the first visible child (0 = top)
  // We start anchored to the bottom (latest messages visible).
  const maxOffset = Math.max(0, totalChildren - maxHeight);
  const [scrollOffset, setScrollOffset] = useState(maxOffset);

  useInput(
    (_input, key) => {
      if (key.upArrow) {
        setScrollOffset((o) => Math.max(0, o - 1));
      } else if (key.downArrow) {
        setScrollOffset((o) => Math.min(Math.max(0, totalChildren - maxHeight), o + 1));
      }
    },
    { isActive }
  );

  const visibleChildren = childArray.slice(scrollOffset, scrollOffset + maxHeight);

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" overflow="hidden" height={maxHeight}>
        {visibleChildren}
      </Box>
      {showScrollHint && isActive && (
        <Text dimColor color={theme.colors.mutedForeground}>
          ↑↓ scroll
        </Text>
      )}
    </Box>
  );
}
