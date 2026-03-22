import React from 'react';
import { Box, Text } from 'ink';

export interface GradientProps {
  children: string;
  colors: string[];
  bold?: boolean;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function parseHex(hex: string): RGB {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: RGB): string {
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.round(Math.max(0, Math.min(255, v)))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

function lerpColor(a: RGB, b: RGB, t: number): RGB {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

export interface GradientChar {
  char: string;
  color: string;
}

export function gradientText(text: string, colors: string[]): GradientChar[] {
  if (colors.length === 0) return text.split('').map((char) => ({ char, color: '' }));
  if (colors.length === 1) return text.split('').map((char) => ({ char, color: colors[0] }));

  const parsedColors = colors.map(parseHex);
  const segments = colors.length - 1;
  const len = text.length;

  return text.split('').map((char, i) => {
    if (len <= 1) {
      return { char, color: colors[0] };
    }
    // Position in [0, segments]
    const pos = (i / (len - 1)) * segments;
    const segIndex = Math.min(Math.floor(pos), segments - 1);
    const t = pos - segIndex;
    const color = toHex(lerpColor(parsedColors[segIndex], parsedColors[segIndex + 1], t));
    return { char, color };
  });
}

export function Gradient({ children, colors, bold = false }: GradientProps) {
  const chars = gradientText(children, colors);

  return (
    <Box flexDirection="row">
      {chars.map((item, idx) => (
        <Text key={idx} color={item.color} bold={bold}>
          {item.char}
        </Text>
      ))}
    </Box>
  );
}
