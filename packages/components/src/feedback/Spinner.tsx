import React from 'react';
import { Text } from 'ink';
import { useAnimation, useTheme, useMotion, useUnicode } from '@termui/core';

export type SpinnerStyle =
  | 'dots'
  | 'line'
  | 'star'
  | 'clock'
  | 'bounce'
  | 'bar'
  | 'arc'
  | 'arrow'
  | 'toggle'
  | 'box'
  | 'pipe'
  | 'earth';

const FRAMES: Record<SpinnerStyle, string[]> = {
  dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  line: ['—', '\\', '|', '/'],
  star: ['✶', '✸', '✹', '✺', '✹', '✸'],
  clock: ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛'],
  bounce: ['⠁', '⠂', '⠄', '⡀', '⡈', '⠠', '⠐', '⠈'],
  bar: ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█', '▉', '▊', '▋', '▌', '▍', '▎'],
  arc: ['◜', '◠', '◝', '◞', '◡', '◟'],
  arrow: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
  toggle: ['⊶', '⊷'],
  box: ['▖', '▘', '▝', '▗'],
  pipe: ['┤', '┘', '┴', '└', '├', '┌', '┬', '┐'],
  earth: ['🌍', '🌎', '🌏'],
};

/** Pure ASCII fallback frames used when NO_UNICODE=1 or supportsUnicode is false. */
const ASCII_FRAMES: string[] = ['|', '/', '-', '\\'];

export interface SpinnerProps {
  style?: SpinnerStyle;
  label?: string;
  color?: string;
  fps?: number;
  /** Custom animation frames (overrides style). Default: undefined */
  frames?: string[];
  reducedMotion?: boolean;
}

export function Spinner({
  style: spinnerStyle = 'dots',
  label,
  color,
  fps = 12,
  frames: customFrames,
  reducedMotion,
}: SpinnerProps) {
  const theme = useTheme();
  const { reduced } = useMotion();
  const unicode = useUnicode();
  const isReduced = reducedMotion ?? reduced;
  const frame = useAnimation(fps);

  // When unicode is unavailable, always use the pure ASCII rotation regardless
  // of the requested style. Custom frames are passed through unchanged so
  // callers can supply their own ASCII sequences.
  const frames = customFrames ?? (unicode ? FRAMES[spinnerStyle] : ASCII_FRAMES);
  const icon = frames[frame % frames.length];
  const resolvedColor = color ?? theme.colors.primary;

  if (isReduced) {
    return (
      <Text>
        <Text color={resolvedColor}>{unicode ? '[…]' : '[.]'}</Text>
        {label && <Text> {label}</Text>}
      </Text>
    );
  }

  return (
    <Text>
      <Text color={resolvedColor}>{icon}</Text>
      {label && <Text> {label}</Text>}
    </Text>
  );
}
