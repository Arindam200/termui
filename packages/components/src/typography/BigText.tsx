import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';
import { FONT, FALLBACK, decodeRow } from './BigText.font.js';

export type BigTextFont = 'block' | 'simple';

export interface BigTextProps {
  children: string;
  color?: string;
  font?: BigTextFont;
}

function getCharRows(ch: string): number[] {
  const upper = ch.toUpperCase();
  return FONT[upper] ?? FONT[ch] ?? FALLBACK;
}

export function BigText({ children, color, font = 'block' }: BigTextProps) {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.primary;
  const onChar = font === 'block' ? '█' : '▓';
  const offChar = ' ';

  const chars = children.split('');
  const rows = 5;

  return (
    <Box flexDirection="column">
      {Array.from({ length: rows }, (_, rowIdx) => (
        <Box key={rowIdx} flexDirection="row">
          {chars.map((ch, charIdx) => {
            const charRows = getCharRows(ch);
            const row = decodeRow(charRows[rowIdx] ?? 0);
            const rowStr = row.map((pixel) => (pixel ? onChar : offChar)).join('');
            return (
              <Text key={charIdx} color={resolvedColor}>
                {rowStr + ' '}
              </Text>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}
