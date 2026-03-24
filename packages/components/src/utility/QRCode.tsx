import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';
import { generateQR, SIZE, type Matrix } from './qrEncoder.js';

export interface QRCodeProps {
  value: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
}

const QUIET_ZONE = 2;

export function QRCode({ value, size = 'md', color, label }: QRCodeProps) {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.foreground;

  let matrix: Matrix;
  try {
    matrix = generateQR(value);
  } catch {
    return (
      <Box flexDirection="column" gap={0}>
        <Text color="red">QR Error: value too long or unsupported</Text>
        {label && <Text color={theme.colors.mutedForeground}>{label}</Text>}
      </Box>
    );
  }

  // Add quiet zone
  const qzMatrix: Matrix = [];
  const totalSize = SIZE + QUIET_ZONE * 2;
  for (let r = 0; r < totalSize; r++) {
    const row: boolean[] = new Array(totalSize).fill(false);
    if (r >= QUIET_ZONE && r < SIZE + QUIET_ZONE) {
      for (let c = 0; c < SIZE; c++) {
        row[c + QUIET_ZONE] = matrix[r - QUIET_ZONE]![c] ?? false;
      }
    }
    qzMatrix.push(row);
  }

  const scale = size === 'lg' ? 2 : 1;

  if (size === 'sm') {
    const lines: React.ReactElement[] = [];
    for (let r = 0; r < totalSize; r += 2) {
      const chars: string[] = [];
      for (let c = 0; c < totalSize; c++) {
        const top = qzMatrix[r]![c] ?? false;
        const bottom = qzMatrix[r + 1]?.[c] ?? false;
        if (top && bottom) chars.push('█');
        else if (top) chars.push('▀');
        else if (bottom) chars.push('▄');
        else chars.push(' ');
      }
      lines.push(
        <Text key={r} color={resolvedColor}>
          {chars.join('')}
        </Text>
      );
    }
    return (
      <Box flexDirection="column" gap={0}>
        {lines}
        {label && <Text color={theme.colors.mutedForeground}>{label}</Text>}
      </Box>
    );
  }

  const lines: React.ReactElement[] = [];
  for (let r = 0; r < totalSize; r++) {
    const chars: string[] = [];
    for (let c = 0; c < totalSize; c++) {
      const on = qzMatrix[r]![c] ?? false;
      chars.push((on ? '█' : ' ').repeat(scale));
    }
    for (let s = 0; s < scale; s++) {
      lines.push(
        <Text key={`${r}-${s}`} color={resolvedColor}>
          {chars.join('')}
        </Text>
      );
    }
  }

  return (
    <Box flexDirection="column" gap={0}>
      {lines}
      {label && <Text color={theme.colors.mutedForeground}>{label}</Text>}
    </Box>
  );
}
