import React from 'react';
import { Box, Text } from 'ink';
import { useInput, useTheme } from '@termui/core';
import type { ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  children?: ReactNode;
}

export function Modal({ open, onClose, title, width = 60, children }: ModalProps) {
  const theme = useTheme();

  useInput(
    (input, key) => {
      if (!open) return;
      if (key.escape) onClose();
    },
    { isActive: open }
  );

  if (!open) return null;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.colors.primary}
      width={width}
      paddingX={1}
      paddingY={0}
    >
      {title && (
        <Box marginBottom={1} borderStyle="single" borderColor={theme.colors.border} paddingX={1}>
          <Text bold color={theme.colors.primary}>
            {title}
          </Text>
        </Box>
      )}
      <Box flexDirection="column">{children}</Box>
      <Box marginTop={1}>
        <Text color={theme.colors.mutedForeground} dimColor>
          Press Esc to close
        </Text>
      </Box>
    </Box>
  );
}
