import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput, useFocus, useTheme } from '@termui/core';

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  onLabel?: string;
  offLabel?: string;
  id?: string;
  disabled?: boolean;
}

export function Toggle({
  checked: controlledChecked,
  onChange,
  label,
  onLabel = 'ON',
  offLabel = 'OFF',
  id,
  disabled = false,
}: ToggleProps) {
  const theme = useTheme();
  const { isFocused } = useFocus({ id });
  const [internalChecked, setInternalChecked] = useState(false);
  const checked = controlledChecked ?? internalChecked;

  useInput((input) => {
    if (!isFocused || disabled) return;
    if (input === ' ') {
      const next = !checked;
      onChange ? onChange(next) : setInternalChecked(next);
    }
  });

  const trackColor = checked ? theme.colors.success : theme.colors.mutedForeground;
  const focusColor = isFocused ? theme.colors.focusRing : trackColor;
  const stateLabel = checked ? onLabel : offLabel;

  return (
    <Box gap={1} alignItems="center">
      <Box borderStyle="round" borderColor={focusColor} paddingX={1}>
        <Text color={focusColor} bold={checked}>
          {checked ? '●' : '○'} {stateLabel}
        </Text>
      </Box>
      {label && <Text color={disabled ? theme.colors.mutedForeground : theme.colors.foreground}>{label}</Text>}
    </Box>
  );
}
