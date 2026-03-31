import React from 'react';
import { Box, Text } from 'ink';
import { useTheme, useMotion, useUnicode } from '@termui/core';

export interface ProgressBarProps {
  value: number; // 0–100
  total?: number; // if set, value is current, total is max
  width?: number;
  showPercent?: boolean;
  showEta?: boolean;
  fillChar?: string;
  emptyChar?: string;
  color?: string;
  label?: string;
  reducedMotion?: boolean;
}

export function ProgressBar({
  value,
  total,
  width = 30,
  showPercent = true,
  showEta = false,
  fillChar,
  emptyChar,
  color,
  label,
  reducedMotion,
}: ProgressBarProps) {
  const theme = useTheme();
  const { reduced } = useMotion();
  const unicode = useUnicode();
  // isReduced available for future shimmer/animation suppression
  const _isReduced = reducedMotion ?? reduced;
  const resolvedColor = color ?? theme.colors.primary;

  // Default fill/empty chars: Unicode block if supported, ASCII '#.' otherwise.
  // Explicit props always win.
  const resolvedFill = fillChar ?? (unicode ? '█' : '#');
  const resolvedEmpty = emptyChar ?? (unicode ? '░' : '.');

  const percent =
    total !== undefined
      ? Math.min(100, Math.round((value / total) * 100))
      : Math.min(100, Math.round(value));
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  const bar = resolvedFill.repeat(filled) + resolvedEmpty.repeat(empty);

  return (
    <Box flexDirection="column">
      {label && <Text>{label}</Text>}
      <Box gap={1}>
        <Text color={resolvedColor}>{bar}</Text>
        {showPercent && <Text color={theme.colors.mutedForeground}>{percent}%</Text>}
        {total !== undefined && (
          <Text color={theme.colors.mutedForeground} dimColor>
            {value}/{total}
          </Text>
        )}
      </Box>
    </Box>
  );
}
