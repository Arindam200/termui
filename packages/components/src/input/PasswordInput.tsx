import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput, useFocus, useTheme } from '@termui/core';

export interface PasswordInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  mask?: string;
  showToggle?: boolean;
  label?: string;
  id?: string;
}

export function PasswordInput({
  value: controlledValue,
  onChange,
  onSubmit,
  placeholder = '',
  mask = '●',
  showToggle = false,
  label,
  id,
}: PasswordInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const { isFocused } = useFocus({ id });

  const value = controlledValue ?? internalValue;

  function setValue(newVal: string) {
    onChange ? onChange(newVal) : setInternalValue(newVal);
  }

  useInput((input, key) => {
    if (!isFocused) return;

    // Ctrl+H toggles visibility when showToggle is enabled
    if (showToggle && input === '\x08') {
      setIsVisible((v) => !v);
      return;
    }

    if (key.return) {
      onSubmit?.(value);
      return;
    }

    if (key.backspace || key.delete) {
      setValue(value.slice(0, -1));
      return;
    }

    if (key.escape || key.upArrow || key.downArrow || key.tab) return;

    if (input && input.length > 0) {
      setValue(value + input);
    }
  });

  const displayValue = isVisible ? value : mask.repeat(value.length);
  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box flexDirection="row" alignItems="center" gap={1}>
        <Box borderStyle="round" borderColor={borderColor} paddingX={1}>
          <Text color={value ? theme.colors.foreground : theme.colors.mutedForeground}>
            {displayValue || placeholder}
          </Text>
          {isFocused && <Text color={theme.colors.focusRing}>█</Text>}
        </Box>
        {showToggle && isFocused && (
          <Text color={theme.colors.mutedForeground}>
            {isVisible ? 'Ctrl+H hide' : 'Ctrl+H show'}
          </Text>
        )}
      </Box>
    </Box>
  );
}
