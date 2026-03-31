import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from 'termui';
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
  /** Show a border around the alert. Default: true */
  bordered?: boolean;
  /** Border style. Default: theme.border.style */
  borderStyle?:
    | 'single'
    | 'double'
    | 'round'
    | 'bold'
    | 'singleDouble'
    | 'doubleSingle'
    | 'classic';
  /** Override the border/icon color */
  color?: string;
  /** Horizontal padding. Default: 1 */
  paddingX?: number;
  /** Vertical padding. Default: 0 */
  paddingY?: number;
}

export function Alert({
  variant = 'info',
  title,
  children,
  icon,
  bordered = true,
  borderStyle,
  color,
  paddingX = 1,
  paddingY = 0,
}: AlertProps) {
  const theme = useTheme();

  const variantColor =
    color ??
    (() => {
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

  const inner = (
    <>
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
    </>
  );

  if (!bordered) {
    return (
      <Box flexDirection="column" paddingX={paddingX} paddingY={paddingY}>
        {inner}
      </Box>
    );
  }

  return (
    <Box
      borderStyle={borderStyle ?? theme.border.style}
      borderColor={variantColor}
      paddingX={paddingX}
      paddingY={paddingY}
      flexDirection="column"
    >
      {inner}
    </Box>
  );
}
