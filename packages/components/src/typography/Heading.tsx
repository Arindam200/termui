import React from 'react';
import type { ReactNode } from 'react';
import { Box, Text } from 'ink';
import { useTheme } from '@termui/core';

export type HeadingLevel = 1 | 2 | 3 | 4;

export interface HeadingProps {
  level?: HeadingLevel;
  children: ReactNode;
  color?: string;
}

export function Heading({ level = 1, children, color }: HeadingProps) {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.primary;

  switch (level) {
    case 1:
      return (
        <Box>
          <Text color={resolvedColor} bold>
            {'██ '}
          </Text>
          <Text color={resolvedColor} bold>
            {typeof children === 'string' ? children.toUpperCase() : children}
          </Text>
        </Box>
      );

    case 2:
      return (
        <Box>
          <Text color={resolvedColor} bold>
            {'▌ '}
          </Text>
          <Text color={resolvedColor} bold>
            {children}
          </Text>
        </Box>
      );

    case 3:
      return (
        <Box>
          <Text bold>{'› '}</Text>
          <Text bold>{children}</Text>
        </Box>
      );

    case 4:
      return (
        <Box>
          <Text underline dimColor>
            {children}
          </Text>
        </Box>
      );

    default:
      return (
        <Box>
          <Text>{children}</Text>
        </Box>
      );
  }
}
