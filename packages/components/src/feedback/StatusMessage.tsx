import React from 'react';
import { Box, Text } from 'ink';
import { useTheme, useUnicode } from '@termui/core';
import type { ReactNode } from 'react';
import { Spinner } from './Spinner.js';

export type StatusVariant = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'pending';

const UNICODE_ICONS: Record<Exclude<StatusVariant, 'loading'>, string> = {
  success: '✓',
  error:   '✗',
  warning: '⚠',
  info:    'ℹ',
  pending: '○',
};

/** ASCII fallbacks: every glyph is printable 7-bit ASCII. */
const ASCII_ICONS: Record<Exclude<StatusVariant, 'loading'>, string> = {
  success: 'OK',
  error:   'ERR',
  warning: '!',
  info:    'i',
  pending: '.',
};

export interface StatusMessageProps {
  variant?: StatusVariant;
  children: ReactNode;
  icon?: string;
}

export function StatusMessage({ variant = 'info', children, icon }: StatusMessageProps) {
  const theme = useTheme();
  const unicode = useUnicode();

  const variantColor = (() => {
    switch (variant) {
      case 'success': return theme.colors.success;
      case 'error':   return theme.colors.error;
      case 'warning': return theme.colors.warning;
      case 'loading': return theme.colors.primary;
      case 'pending': return theme.colors.muted;
      default:        return theme.colors.info;
    }
  })();

  const iconSet = unicode ? UNICODE_ICONS : ASCII_ICONS;

  return (
    <Box gap={1} flexDirection="row">
      {variant === 'loading' ? (
        <Spinner style="dots" color={variantColor} />
      ) : (
        <Text color={variantColor}>
          {icon ?? iconSet[variant as Exclude<StatusVariant, 'loading'>]}
        </Text>
      )}
      <Text>{children}</Text>
    </Box>
  );
}
