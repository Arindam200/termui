import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';
import type { ReactNode } from 'react';

export interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function FormField({ label, children, error, hint, required }: FormFieldProps) {
  const theme = useTheme();

  return (
    <Box flexDirection="column" gap={0}>
      <Box gap={0}>
        <Text bold>{label}</Text>
        {required && <Text color={theme.colors.error}> *</Text>}
      </Box>
      <Box>{children}</Box>
      {hint && !error && (
        <Text color={theme.colors.mutedForeground} dimColor>
          {hint}
        </Text>
      )}
      {error && (
        <Text color={theme.colors.error}>
          {'✗ '}
          {error}
        </Text>
      )}
    </Box>
  );
}
