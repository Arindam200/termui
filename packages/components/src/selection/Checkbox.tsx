import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput, useFocus, useTheme } from '@termui/core';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  indeterminate?: boolean;
  disabled?: boolean;
  id?: string;
}

export function Checkbox({
  checked: controlledChecked,
  onChange,
  label,
  indeterminate = false,
  disabled = false,
  id,
}: CheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(false);
  const theme = useTheme();
  const { isFocused } = useFocus({ id });

  const checked = controlledChecked ?? internalChecked;

  useInput((input) => {
    if (!isFocused || disabled) return;
    if (input === ' ') {
      const next = !checked;
      onChange ? onChange(next) : setInternalChecked(next);
    }
  });

  const icon = indeterminate ? '▪' : checked ? '■' : '□';
  const iconColor = disabled
    ? theme.colors.mutedForeground
    : checked || indeterminate
      ? theme.colors.primary
      : theme.colors.border;

  return (
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
  );
}
