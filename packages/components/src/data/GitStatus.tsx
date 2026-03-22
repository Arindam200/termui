import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';

export interface GitStatusProps {
  branch: string;
  staged?: number;
  modified?: number;
  ahead?: number;
  behind?: number;
}

/** Presentational git summary line for use with `useGit` from `termui/git`. */
export function GitStatus({
  branch,
  staged = 0,
  modified = 0,
  ahead = 0,
  behind = 0,
}: GitStatusProps) {
  const theme = useTheme();
  return (
    <Box flexDirection="column" gap={0}>
      <Text color={theme.colors.primary}>
        <Text bold>Branch </Text>
        {branch}
      </Text>
      <Text color={theme.colors.mutedForeground}>
        {ahead}↑ {behind}↓ · staged {staged} · modified {modified}
      </Text>
    </Box>
  );
}
