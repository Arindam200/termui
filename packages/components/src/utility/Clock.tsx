import React, { useState, useCallback } from 'react';
import { Box, Text } from 'ink';
import { useInterval, useTheme } from '@termui/core';

export interface ClockProps {
  format?: '12h' | '24h';
  showSeconds?: boolean;
  showDate?: boolean;
  timezone?: string;
  color?: string;
  size?: 'sm' | 'lg';
}

// Box-drawing digit segments for large display (7-segment style, 3 wide x 5 tall)
const BIG_DIGITS: Record<string, string[]> = {
  '0': ['╔═╗', '║ ║', '║ ║', '║ ║', '╚═╝'],
  '1': [' ╗ ', ' ║ ', ' ║ ', ' ║ ', ' ╩ '],
  '2': ['╔═╗', '  ║', '╔═╝', '║  ', '╚══'],
  '3': ['╔═╗', '  ║', ' ═╣', '  ║', '╚═╝'],
  '4': ['╗ ╗', '║ ║', '╚═╣', '  ║', '  ╩'],
  '5': ['╔══', '║  ', '╚═╗', '  ║', '╚═╝'],
  '6': ['╔══', '║  ', '╠═╗', '║ ║', '╚═╝'],
  '7': ['╔═╗', '  ║', '  ║', '  ║', '  ╩'],
  '8': ['╔═╗', '║ ║', '╠═╣', '║ ║', '╚═╝'],
  '9': ['╔═╗', '║ ║', '╚═╣', '  ║', '╚═╝'],
  ':': ['   ', ' ● ', '   ', ' ● ', '   '],
  ' ': ['   ', '   ', '   ', '   ', '   '],
};

function renderBigText(str: string, color: string): React.ReactElement {
  const rows: string[] = ['', '', '', '', ''];
  for (const ch of str) {
    const segs = BIG_DIGITS[ch] ?? BIG_DIGITS[' ']!;
    for (let r = 0; r < 5; r++) {
      rows[r] += segs[r];
    }
  }
  return (
    <Box flexDirection="column">
      {rows.map((row, i) => (
        <Text key={i} color={color}>
          {row}
        </Text>
      ))}
    </Box>
  );
}

function getTimeParts(format: '12h' | '24h', showSeconds: boolean, timezone?: string) {
  const now = timezone
    ? new Date(new Date().toLocaleString('en-US', { timeZone: timezone }))
    : new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  let ampm = '';

  if (format === '12h') {
    ampm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12 || 12;
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const time = showSeconds
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(hours)}:${pad(minutes)}`;

  return { time, ampm };
}

function getDateString(timezone?: string): string {
  const now = timezone
    ? new Date(new Date().toLocaleString('en-US', { timeZone: timezone }))
    : new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function Clock({
  format = '24h',
  showSeconds = true,
  showDate = false,
  timezone,
  color,
  size = 'sm',
}: ClockProps) {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.primary;

  const [tick, setTick] = useState(0);
  useInterval(
    useCallback(() => setTick((t) => t + 1), []),
    1000
  );

  const { time, ampm } = getTimeParts(format, showSeconds, timezone);

  if (size === 'lg') {
    return (
      <Box flexDirection="column" gap={0}>
        {showDate && <Text color={theme.colors.mutedForeground}>{getDateString(timezone)}</Text>}
        <Box alignItems="flex-end" gap={0}>
          {renderBigText(time, resolvedColor)}
          {ampm && (
            <Text color={theme.colors.mutedForeground} bold>
              {ampm}
            </Text>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={0}>
      {showDate && <Text color={theme.colors.mutedForeground}>{getDateString(timezone)}</Text>}
      <Box gap={0}>
        <Text color={resolvedColor} bold>
          {time}
        </Text>
        {ampm && <Text color={theme.colors.mutedForeground}>{ampm}</Text>}
      </Box>
    </Box>
  );
}
