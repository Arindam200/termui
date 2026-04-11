import React from 'react';
import { Box, Text } from 'ink';
import { useInput, useTheme, getAccessibleName, useFocusTrap } from '@termui/core';
import type { AriaProps } from '@termui/core';
import type { ReactNode } from 'react';

export interface ModalProps extends AriaProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  children?: ReactNode;
  /** Border style. Default: 'round' */
  borderStyle?:
    | 'single'
    | 'double'
    | 'round'
    | 'bold'
    | 'singleDouble'
    | 'doubleSingle'
    | 'classic';
  /** Border color. Default: theme.colors.primary */
  borderColor?: string;
  /** Horizontal padding. Default: 1 */
  paddingX?: number;
  /** Vertical padding. Default: 0 */
  paddingY?: number;
  /** Title bar border style. Default: 'single' */
  titleBorderStyle?:
    | 'single'
    | 'double'
    | 'round'
    | 'bold'
    | 'singleDouble'
    | 'doubleSingle'
    | 'classic';
  /** Close hint text. Set to false to hide, or a string to customize. Default: 'Press Esc to close' */
  closeHint?: string | false;
  /**
   * Ordered Ink focus IDs to trap within the modal.
   * When provided, Tab/Shift+Tab cycles through them and focus is
   * moved to the first ID when the modal opens.
   * Each ID must match `useFocus({ id: '...' })` on a child element.
   */
  focusableIds?: string[];
}

export function Modal({
  open,
  onClose,
  title,
  width = 60,
  children,
  borderStyle = 'round',
  borderColor,
  paddingX = 1,
  paddingY = 0,
  titleBorderStyle = 'single',
  closeHint = 'Press Esc to close',
  focusableIds = [],
  'aria-label': ariaLabel,
  'aria-description': ariaDescription,
  'aria-live': ariaLive,
}: ModalProps) {
  const theme = useTheme();
  const resolvedBorderColor = borderColor ?? theme.colors.primary;
  const accessibleLabel = getAccessibleName(ariaLabel, title ?? 'Modal');

  useInput(
    (input, key) => {
      if (!open) return;
      if (key.escape) onClose();
    },
    { isActive: open }
  );
  useFocusTrap({ focusableIds, isActive: open && focusableIds.length > 0 });

  if (!open) return null;

  return (
    <Box
      flexDirection="column"
      borderStyle={borderStyle}
      borderColor={resolvedBorderColor}
      width={width}
      paddingX={paddingX}
      paddingY={paddingY}
    >
      {title && (
        <Box
          marginBottom={1}
          borderStyle={titleBorderStyle}
          borderColor={theme.colors.border}
          paddingX={1}
        >
          <Text bold color={resolvedBorderColor}>
            {title}
          </Text>
        </Box>
      )}
      <Box flexDirection="column">{children}</Box>
      {ariaDescription && (
        <Text color={theme.colors.mutedForeground} dimColor>
          {' '}
          {ariaDescription}
        </Text>
      )}
      {closeHint !== false && (
        <Box marginTop={1}>
          <Text color={theme.colors.mutedForeground} dimColor>
            {closeHint}
          </Text>
        </Box>
      )}
    </Box>
  );
}
