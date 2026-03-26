import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput, useFocus, useTheme, getAccessibleName } from '@termui/core';
import type { AriaProps } from '@termui/core';

export interface CheckboxProps extends AriaProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  indeterminate?: boolean;
  disabled?: boolean;
  id?: string;
  /** Character shown when checked. Default: '■' */
  checkedIcon?: string;
  /** Character shown when unchecked. Default: '□' */
  uncheckedIcon?: string;
  /** Character shown when indeterminate. Default: '▪' */
  indeterminateIcon?: string;
}

export function Checkbox({
  checked: controlledChecked,
  onChange,
  label,
  indeterminate = false,
  disabled = false,
  id,
  checkedIcon = '■',
  uncheckedIcon = '□',
  indeterminateIcon = '▪',
  'aria-label': ariaLabel,
  'aria-description': ariaDescription,
  'aria-live': ariaLive,
}: CheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(false);
  const theme = useTheme();
  const { isFocused } = useFocus({ id });

  const checked = controlledChecked ?? internalChecked;
  const accessibleLabel = getAccessibleName(ariaLabel, label ?? 'Checkbox');

  useInput((input) => {
    if (!isFocused || disabled) return;
    if (input === ' ') {
      const next = !checked;
      onChange ? onChange(next) : setInternalChecked(next);
    }
  });

  const icon = indeterminate ? indeterminateIcon : checked ? checkedIcon : uncheckedIcon;
  const iconColor = disabled
    ? theme.colors.mutedForeground
    : checked || indeterminate
      ? theme.colors.primary
      : theme.colors.border;

  return (
    <Box flexDirection="column">
      <Box gap={1}>
        <Text color={isFocused ? theme.colors.focusRing : iconColor} bold={isFocused}>
          {icon}
        </Text>
        {label && (
          <Text
            color={disabled ? theme.colors.mutedForeground : theme.colors.foreground}
            dimColor={disabled}
          >
            {label}
          </Text>
        )}
      </Box>
      {ariaDescription && (
        <Text color={theme.colors.mutedForeground} dimColor>
          {' '}
          {ariaDescription}
        </Text>
      )}
    </Box>
  );
}
