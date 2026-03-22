import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTheme } from '@termui/core';
import type { ReactNode } from 'react';

export type BannerVariant = 'info' | 'warning' | 'error' | 'success' | 'neutral';

const ICONS: Record<BannerVariant, string> = {
  info: 'ℹ',
  warning: '⚠',
  error: '✗',
  success: '✓',
  neutral: '·',
};

export interface BannerProps {
  children: ReactNode;
  variant?: BannerVariant;
  icon?: string;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function Banner({
  children,
  variant = 'info',
  icon,
  title,
  dismissible = false,
  onDismiss,
}: BannerProps) {
  const theme = useTheme();
  const [dismissed, setDismissed] = useState(false);

  const variantColor = (() => {
    switch (variant) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'neutral':
        return theme.colors.muted;
      default:
        return theme.colors.info;
    }
  })();

  useInput((_, key) => {
    if (dismissible && key.escape) {
      setDismissed(true);
      onDismiss?.();
    }
  });

  if (dismissed) return null;

  const resolvedIcon = icon ?? ICONS[variant];

  return (
    <Box flexDirection="column">
      <Box flexDirection="row" gap={1}>
        <Text color={variantColor}>┃</Text>
        <Box flexDirection="column">
          <Box flexDirection="row" gap={1}>
            <Text color={variantColor}>{resolvedIcon}</Text>
            {title && (
              <Text bold color={variantColor}>
                {title}:
              </Text>
            )}
            <Text>{children}</Text>
          </Box>
          {dismissible && (
            <Text color={theme.colors.muted} dimColor>
              press Esc to dismiss
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
}
