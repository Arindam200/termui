import React from 'react';
import { Box, Text } from 'ink';
import { useTheme, useUnicode } from '@termui/core';

export type ProgressCircleSize = 'sm' | 'md' | 'lg';

export interface ProgressCircleProps {
  value: number;
  size?: ProgressCircleSize;
  color?: string;
  label?: string;
  showPercent?: boolean;
}

const BRAILLE_CHARS = ['○', '◔', '◑', '◕', '●', '◉', '⬤', '●'];

// 3×3 arc chars for md/lg sizes
const MD_TOP = ['▄▄▄', '▄██▄'];
const MD_MID_EMPTY = '█   █';
const MD_MID_FILL = '█████';
const MD_BOT = ['▀▀▀', '▀██▀'];

function getSmChar(value: number): string {
  const clamped = Math.max(0, Math.min(100, value));
  const step = Math.floor((clamped / 100) * 7);
  return BRAILLE_CHARS[step]!;
}

/** ASCII sm: `[##  ]` — 4-char fill indicator */
function getAsciiBar(value: number, width = 4): string {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * width);
  return '[' + '#'.repeat(filled) + ' '.repeat(width - filled) + ']';
}

export function ProgressCircle({
  value,
  size = 'sm',
  color,
  label,
  showPercent = false,
}: ProgressCircleProps) {
  const theme = useTheme();
  const unicode = useUnicode();
  const clamped = Math.max(0, Math.min(100, value));
  const resolvedColor = color ?? theme.colors.primary;

  if (size === 'sm') {
    const display = unicode ? getSmChar(clamped) : getAsciiBar(clamped);
    return (
      <Box flexDirection="column" alignItems="flex-start">
        <Box flexDirection="row" gap={1}>
          <Text color={resolvedColor}>{display}</Text>
          {showPercent && <Text color={theme.colors.muted}>{Math.round(clamped)}%</Text>}
        </Box>
        {label && <Text color={theme.colors.muted}>{label}</Text>}
      </Box>
    );
  }

  // md and lg: render percentage inside compact brackets
  // In ASCII mode, use plain bracket notation instead of Unicode angle brackets
  const percentLabel = `${Math.round(clamped)}%`;

  if (size === 'md') {
    const [open, close] = unicode ? ['⟨', '⟩'] : ['[', ']'];
    return (
      <Box flexDirection="column" alignItems="flex-start">
        <Box flexDirection="row">
          <Text color={resolvedColor}>{open}</Text>
          <Text color={resolvedColor} bold>
            {percentLabel}
          </Text>
          <Text color={resolvedColor}>{close}</Text>
        </Box>
        {label && <Text color={theme.colors.muted}>{label}</Text>}
      </Box>
    );
  }

  // lg: 3-line arc representation (unicode) or `[###   ]` bar (ASCII)
  if (!unicode) {
    return (
      <Box flexDirection="column" alignItems="flex-start">
        <Text color={resolvedColor}>{getAsciiBar(clamped, 8)}</Text>
        {showPercent && <Text color={theme.colors.muted}>{percentLabel}</Text>}
        {label && <Text color={theme.colors.muted}>{label}</Text>}
      </Box>
    );
  }

  const fillLevel = clamped / 100;
  const topArc = ' ▄█▄';
  const midLeft = '█';
  const midRight = '█';
  const midInner = fillLevel >= 0.5 ? '███' : '   ';
  const botArc = ' ▀█▀';

  return (
    <Box flexDirection="column" alignItems="flex-start">
      <Text color={resolvedColor}>{topArc}</Text>
      <Box flexDirection="row">
        <Text color={resolvedColor}>{midLeft}</Text>
        <Text color={fillLevel > 0 ? resolvedColor : theme.colors.muted}>{midInner}</Text>
        <Text color={resolvedColor}>{midRight}</Text>
      </Box>
      <Text color={resolvedColor}>{botArc}</Text>
      {showPercent && <Text color={theme.colors.muted}>{percentLabel}</Text>}
      {label && <Text color={theme.colors.muted}>{label}</Text>}
    </Box>
  );
}
