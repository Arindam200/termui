import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';
import type { ReactNode } from 'react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

const ICONS: Record<AlertVariant, string> = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
};

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  icon?: string;
}

export function Alert({ variant = 'info', title, children, icon }: AlertProps) {
  const theme = useTheme();

  const variantColor = (() => {
    switch (variant) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.info;
    }
  })();

  const resolvedIcon = icon ?? ICONS[variant];

  return (
    <Box
      borderStyle="round"
      borderColor={variantColor}
      paddingX={1}
      paddingY={0}
      flexDirection="column"
    >
      <Box gap={1}>
        <Text color={variantColor} bold>
          {resolvedIcon}
        </Text>
        {title && (
          <Text bold color={variantColor}>
            {title}
          </Text>
        )}
      </Box>
      {children && <Text>{children}</Text>}
    </Box>
  );
}
