import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';
import { normalize } from './utils.js';

export interface SparklineProps {
  data: number[];
  width?: number;
  color?: string;
  label?: string;
}

// Braille Unicode block characters ordered by dot fill level (0–7)
const BRAILLE_LEVELS = ['⣀', '⣄', '⣤', '⣦', '⣶', '⣷', '⣿', '⣿'];

export function Sparkline({ data, width = 20, color, label }: SparklineProps) {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.primary;

  if (data.length === 0) {
    return (
      <Box>
        {label && <Text color={theme.colors.mutedForeground}>{label} </Text>}
        <Text color={theme.colors.mutedForeground}>{'─'.repeat(width)}</Text>
      </Box>
    );
  }

  // Sample/truncate data to fit width
  const sampled =
    data.length > width
      ? Array.from(
          { length: width },
          (_, i) => data[Math.round((i / (width - 1)) * (data.length - 1))] ?? 0
        )
      : data;

  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const levels = sampled.map((v) => normalize(v, min, max, BRAILLE_LEVELS.length));
  const sparkStr = levels.map((l) => BRAILLE_LEVELS[l] ?? BRAILLE_LEVELS[0]).join('');

  return (
    <Box flexDirection="row" gap={1}>
      {label && <Text color={theme.colors.mutedForeground}>{label}</Text>}
      <Text color={resolvedColor}>{sparkStr}</Text>
    </Box>
  );
}
