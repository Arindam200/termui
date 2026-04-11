import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput, useTheme, useFocusTrap } from '@termui/core';
import type { ReactNode } from 'react';

export type DrawerEdge = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps {
  isOpen?: boolean;
  edge?: DrawerEdge;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  width?: number;
  height?: number;
  /**
   * Ordered Ink focus IDs to trap within the drawer.
   * When provided, Tab/Shift+Tab cycles through them and focus is
   * moved to the first ID when the drawer opens.
   */
  focusableIds?: string[];
}

export function Drawer({
  isOpen = false,
  edge = 'right',
  title,
  children,
  onClose,
  width = 40,
  height = 10,
  focusableIds = [],
}: DrawerProps) {
  const theme = useTheme();

  useInput(
    (_input, key) => {
      if (!isOpen) return;
      if (key.escape) onClose?.();
    },
    { isActive: isOpen }
  );
  useFocusTrap({ focusableIds, isActive: isOpen && focusableIds.length > 0 });

  if (!isOpen) return null;

  const isHorizontal = edge === 'left' || edge === 'right';

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={theme.colors.border}
      width={isHorizontal ? width : undefined}
      height={!isHorizontal ? height : undefined}
      paddingX={1}
      paddingY={0}
    >
      <Box justifyContent="space-between" marginBottom={1}>
        {title ? (
          <Text bold color={theme.colors.primary}>
            {title}
          </Text>
        ) : (
          <Text> </Text>
        )}
        <Text color={theme.colors.mutedForeground} dimColor>
          Esc to close
        </Text>
      </Box>
      <Box flexDirection="column" flexGrow={1}>
        {children}
      </Box>
    </Box>
  );
}
