import React from 'react';
import { Text } from 'ink';
import { useAnimation, useTheme, useMotion } from '@termui/core';

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
  const isReduced = reducedMotion ?? reduced;
  const frame = useAnimation(fps);
  const frames = customFrames ?? FRAMES[spinnerStyle];
  const icon = frames[frame % frames.length];
  const resolvedColor = color ?? theme.colors.primary;

  if (isReduced) {
    return (
      <Text>
        <Text color={resolvedColor}>[…]</Text>
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
