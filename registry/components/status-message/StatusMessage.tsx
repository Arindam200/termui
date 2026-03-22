import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';
import type { ReactNode } from 'react';
import { Spinner } from './Spinner.js';

export type StatusVariant = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'pending';

const ICONS: Record<Exclude<StatusVariant, 'loading'>, string> = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
  pending: '○',
};

export interface StatusMessageProps {
  variant?: StatusVariant;
  children: ReactNode;
  icon?: string;
}

export function StatusMessage({ variant = 'info', children, icon }: StatusMessageProps) {
  const theme = useTheme();

  const variantColor = (() => {
    switch (variant) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'loading':
        return theme.colors.primary;
      case 'pending':
        return theme.colors.muted;
      default:
        return theme.colors.info;
    }
  })();

  return (
    <Box gap={1} flexDirection="row">
      {variant === 'loading' ? (
        <Spinner style="dots" color={variantColor} />
      ) : (
        <Text color={variantColor}>
          {icon ?? ICONS[variant as Exclude<StatusVariant, 'loading'>]}
        </Text>
      )}
      <Text>{children}</Text>
    </Box>
  );
}
