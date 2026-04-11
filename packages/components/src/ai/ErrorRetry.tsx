import React from 'react';
import { Box, Text } from 'ink';
import { useTheme, useInput } from '@termui/core';

export interface ErrorRetryProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  /** Number of prior retry attempts. Shows "Retry attempt N" when > 0 */
  retryCount?: number;
  /** Max retries before disabling the retry action. Default: 3 */
  maxRetries?: number;
  /** Whether this component captures input. Default: true */
  isActive?: boolean;
}

export function ErrorRetry({
  error,
  onRetry,
  onDismiss,
  retryCount = 0,
  maxRetries = 3,
  isActive = true,
}: ErrorRetryProps) {
  const theme = useTheme();
  const message = typeof error === 'string' ? error : error.message;
  const maxReached = retryCount >= maxRetries;

  useInput(
    (input, key) => {
      if (!maxReached && (key.return || input === 'r')) {
        onRetry?.();
      } else if (key.escape) {
        onDismiss?.();
      }
    },
    { isActive },
  );

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.colors.error ?? 'red'}
      paddingX={1}
      paddingY={0}
    >
      {/* Error message */}
      <Box gap={1}>
        <Text color={theme.colors.error ?? 'red'} bold>
          ✗
        </Text>
        <Text>{message}</Text>
      </Box>

      {/* Retry attempt indicator */}
      {retryCount > 0 && (
        <Text dimColor color={theme.colors.mutedForeground}>
          Retry attempt {retryCount}
        </Text>
      )}

      {/* Status / action hints */}
      {maxReached ? (
        <Text dimColor color={theme.colors.mutedForeground}>
          Max retries reached
        </Text>
      ) : (
        <Text dimColor color={theme.colors.mutedForeground}>
          Enter / r — retry  ·  Esc — dismiss
        </Text>
      )}
    </Box>
  );
}
