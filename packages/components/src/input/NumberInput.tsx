import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput, useFocus, useTheme } from '@termui/core';

export interface NumberInputProps {
  value?: number;
  onChange?: (value: number) => void;
  onSubmit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  label?: string;
  id?: string;
  format?: (n: number) => string;
}

export function NumberInput({
  value: controlledValue,
  onChange,
  onSubmit,
  min,
  max,
  step = 1,
  placeholder = '',
  label,
  id,
  format,
}: NumberInputProps) {
  const [internalValue, setInternalValue] = useState<number | undefined>(undefined);
  // Buffer holds raw digit string while user is typing
  const [buffer, setBuffer] = useState<string>('');
  const theme = useTheme();
  const { isFocused } = useFocus({ id });

  const value = controlledValue ?? internalValue;

  function clamp(n: number): number {
    let result = n;
    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);
    return result;
  }

  function commitValue(n: number) {
    const clamped = clamp(n);
    onChange ? onChange(clamped) : setInternalValue(clamped);
    setBuffer(String(clamped));
  }

  useInput((input, key) => {
    if (!isFocused) return;

    if (key.upArrow) {
      const current = value ?? 0;
      commitValue(current + step);
      return;
    }

    if (key.downArrow) {
      const current = value ?? 0;
      commitValue(current - step);
      return;
    }

    if (key.return) {
      const parsed = buffer !== '' ? parseFloat(buffer) : value;
      if (parsed !== undefined && !isNaN(parsed)) {
        const clamped = clamp(parsed);
        onSubmit?.(clamped);
      }
      return;
    }

    if (key.backspace || key.delete) {
      const newBuffer = buffer.slice(0, -1);
      setBuffer(newBuffer);
      if (newBuffer === '' || newBuffer === '-') {
        // Leave value as-is until valid
        return;
      }
      const parsed = parseFloat(newBuffer);
      if (!isNaN(parsed)) {
        onChange ? onChange(clamp(parsed)) : setInternalValue(clamp(parsed));
      }
      return;
    }

    if (key.escape || key.tab) return;

    // Allow digits, one leading minus, and one decimal point
    if (input && /^[\d.\-]$/.test(input)) {
      // Prevent multiple dots or minus not at start
      if (input === '-' && buffer.length > 0) return;
      if (input === '.' && buffer.includes('.')) return;

      const newBuffer = buffer + input;
      setBuffer(newBuffer);
      const parsed = parseFloat(newBuffer);
      if (!isNaN(parsed)) {
        onChange ? onChange(clamp(parsed)) : setInternalValue(clamp(parsed));
      }
    }
  });

  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  // Display: prefer buffer while focused (so partial input like "-" shows), else formatted value
  let displayValue = '';
  if (isFocused && buffer !== '') {
    displayValue = buffer;
  } else if (value !== undefined) {
    displayValue = format ? format(value) : String(value);
  }

  const stepHint = `↑ +${step}  ↓ -${step}`;

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box flexDirection="row" alignItems="center" gap={1}>
        <Box borderStyle="round" borderColor={borderColor} paddingX={1}>
          <Text color={displayValue ? theme.colors.foreground : theme.colors.mutedForeground}>
            {displayValue || placeholder}
          </Text>
          {isFocused && <Text color={theme.colors.focusRing}>█</Text>}
        </Box>
        {isFocused && <Text color={theme.colors.mutedForeground}>{stepHint}</Text>}
      </Box>
    </Box>
  );
}
