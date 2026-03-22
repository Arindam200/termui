import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary';

export interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  color?: string;
  bold?: boolean;
}

export function Badge({ children, variant = 'default', color, bold = false }: BadgeProps) {
  const theme = useTheme();

  const variantColor = color ?? (() => {
    switch (variant) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      case 'info': return theme.colors.info;
      case 'secondary': return theme.colors.secondary;
      default: return theme.colors.primary;
    }
  })();

  return (
    <Box borderStyle="round" borderColor={variantColor} paddingX={1}>
      <Text color={variantColor} bold={bold}>{children}</Text>
    </Box>
  );
}
