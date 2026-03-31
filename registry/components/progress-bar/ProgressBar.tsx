import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from 'termui';

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
}

export function ProgressBar({
  value,
  total,
  width = 30,
  showPercent = true,
  showEta = false,
  fillChar = '█',
  emptyChar = '░',
  color,
  label,
}: ProgressBarProps) {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.primary;

  const percent =
    total !== undefined
      ? Math.min(100, Math.round((value / total) * 100))
      : Math.min(100, Math.round(value));
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  const bar = fillChar.repeat(filled) + emptyChar.repeat(empty);

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
