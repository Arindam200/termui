import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';
import type { ReactNode } from 'react';

export interface KeyValueItem {
  key: string;
  value: ReactNode;
  color?: string;
}

export interface KeyValueProps {
  items: KeyValueItem[];
  keyWidth?: number;
  separator?: string;
  keyColor?: string;
  valueColor?: string;
}

export function KeyValue({
  items,
  keyWidth,
  separator = ':',
  keyColor,
  valueColor,
}: KeyValueProps) {
  const theme = useTheme();

  const resolvedKeyWidth = useMemo(() => {
    if (keyWidth !== undefined) return keyWidth;
    return items.reduce((max, item) => Math.max(max, item.key.length), 0) + 1;
  }, [items, keyWidth]);

  const resolvedKeyColor = keyColor ?? theme.colors.mutedForeground;
  const resolvedValueColor = valueColor ?? theme.colors.foreground;

  return (
    <Box flexDirection="column">
      {items.map((item, idx) => {
        const paddedKey = item.key.padEnd(resolvedKeyWidth, ' ');
        return (
          <Box key={idx} flexDirection="row" gap={1}>
            <Text color={resolvedKeyColor}>{paddedKey}</Text>
            <Text color={resolvedKeyColor}>{separator}</Text>
            <Text color={item.color ?? resolvedValueColor}>{item.value}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
