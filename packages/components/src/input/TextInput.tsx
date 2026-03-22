import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput, useFocus, useTheme } from '@termui/core';

export interface TextInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  mask?: string;
  validate?: (value: string) => string | null;
  width?: number;
  label?: string;
  autoFocus?: boolean;
  id?: string;
}

export function TextInput({
  value: controlledValue,
  onChange,
  onSubmit,
  placeholder = '',
  mask,
  validate,
  width = 40,
  label,
  autoFocus = false,
  id,
}: TextInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { isFocused } = useFocus({ autoFocus, id });

  const value = controlledValue ?? internalValue;

  useInput((input, key) => {
    if (!isFocused) return;

    if (key.return) {
      const err = validate ? validate(value) : null;
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      onSubmit?.(value);
      return;
    }

    if (key.backspace || key.delete) {
      const newVal = value.slice(0, -1);
      onChange ? onChange(newVal) : setInternalValue(newVal);
      return;
    }

    if (key.escape) return;
    if (key.upArrow || key.downArrow || key.tab) return;

    const newVal = value + input;
    onChange ? onChange(newVal) : setInternalValue(newVal);
  });

  const displayValue = mask ? mask.repeat(value.length) : value;
  const borderColor = error
    ? theme.colors.error
    : isFocused
      ? theme.colors.focusRing
      : theme.colors.border;

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box borderStyle="round" borderColor={borderColor} width={width} paddingX={1}>
        <Text color={value ? theme.colors.foreground : theme.colors.mutedForeground}>
          {displayValue || placeholder}
        </Text>
        {isFocused && <Text color={theme.colors.focusRing}>█</Text>}
      </Box>
      {error && <Text color={theme.colors.error}>{error}</Text>}
    </Box>
  );
}
