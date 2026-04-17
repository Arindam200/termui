import React from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';
import { StreamingText } from '../typography/StreamingText.js';

export interface StreamOutputProps {
  /** Pre-buffered string to animate character-by-character */
  text?: string;
  /** Real AsyncIterable<string> from an LLM SDK */
  stream?: AsyncIterable<string>;
  /** ms/char for text animation. Default: 18 */
  speed?: number;
  /** Show blinking cursor. Default: true */
  cursor?: boolean;
  /** Label shown above the output (e.g. "Response"). Optional. */
  label?: string;
  /** Called when animation/streaming completes */
  onComplete?: (fullText: string) => void;
  /** Color for the label. Default: theme.colors.primary */
  labelColor?: string;
}

export function StreamOutput({
  text,
  stream,
  speed = 18,
  cursor = true,
  label,
  onComplete,
  labelColor,
}: StreamOutputProps) {
  const theme = useTheme();
  const resolvedLabelColor = labelColor ?? theme.colors.primary;

  return (
    <Box flexDirection="column">
      {label && (
        <Text dimColor color={theme.colors.mutedForeground}>
          <Text color={resolvedLabelColor}>▶</Text>
          {` ${label}`}
        </Text>
      )}
      {stream ? (
        <StreamingText stream={stream} cursor={cursor} speed={speed} onComplete={onComplete} />
      ) : (
        <StreamingText
          text={text}
          animate={true}
          cursor={cursor}
          speed={speed}
          onComplete={onComplete}
        />
      )}
    </Box>
  );
}
