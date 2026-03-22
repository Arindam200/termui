import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';
import type { ReactNode } from 'react';

export interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  isVisible?: boolean;
}

export function Tooltip({ children, content, position = 'top', isVisible = false }: TooltipProps) {
  const theme = useTheme();

  const tooltipBox = (
    <Box borderStyle="single" borderColor={theme.colors.border} paddingX={1} paddingY={0}>
      <Text color={theme.colors.foreground}>{content}</Text>
    </Box>
  );

  if (!isVisible) {
    return <Box>{children}</Box>;
  }

  if (position === 'top') {
    return (
      <Box flexDirection="column" alignItems="flex-start">
        {tooltipBox}
        <Text color={theme.colors.mutedForeground}>↓</Text>
        <Box>{children}</Box>
      </Box>
    );
  }

  if (position === 'bottom') {
    return (
      <Box flexDirection="column" alignItems="flex-start">
        <Box>{children}</Box>
        <Text color={theme.colors.mutedForeground}>↑</Text>
        {tooltipBox}
      </Box>
    );
  }

  if (position === 'left') {
    return (
      <Box flexDirection="row" alignItems="center" gap={1}>
        {tooltipBox}
        <Box>{children}</Box>
      </Box>
    );
  }

  // right
  return (
    <Box flexDirection="row" alignItems="center" gap={1}>
      <Box>{children}</Box>
      {tooltipBox}
    </Box>
  );
}
