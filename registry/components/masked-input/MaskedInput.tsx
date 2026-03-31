import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput, useFocus, useTheme } from 'termui';

export interface MaskedInputProps {
  mask: string; // e.g. '(###) ###-####'
  value?: string; // raw digits only
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  id?: string;
  width?: number;
}

/**
 * Returns true if the literal at `pos` "closes" a digit group, meaning there
 * exists a literal at some position j < pos such that every character strictly
 * between j and pos is '#'.  e.g. ')' at position 4 in '(###) ###-####'.
 */
function isClosingLiteral(mask: string, pos: number): boolean {
  for (let j = pos - 1; j >= 0; j--) {
    if (mask[j] === '#') continue;
    const between = mask.slice(j + 1, pos);
    return between.length > 0 && between.split('').every((c) => c === '#');
  }
  return false;
}

/**
 * Apply a mask to raw digits. '#' in the mask is a digit placeholder.
 * Returns the formatted display string.
 */
function applyMask(raw: string, mask: string): string {
  let rawIdx = 0;
  let result = '';

  for (let i = 0; i < mask.length; i++) {
    const maskChar = mask[i]!;

    if (rawIdx >= raw.length) {
      // All digits placed; include at most one closing literal then stop.
      if (maskChar !== '#' && isClosingLiteral(mask, i)) {
        result += maskChar;
      }
      break;
    }

    if (maskChar === '#') {
      result += raw[rawIdx]!;
      rawIdx++;
    } else {
      // Only include a literal when there is still a '#' ahead to fill;
      // this prevents masks with no placeholders from emitting their literals.
      if (mask.indexOf('#', i + 1) !== -1) {
        result += maskChar;
      }
    }
  }

  return result;
}

function maxDigits(mask: string): number {
  return mask.split('').filter((c) => c === '#').length;
}

export function MaskedInput({
  mask,
  value: controlledValue,
  onChange,
  onSubmit,
  label,
  placeholder,
  autoFocus = false,
  id,
  width = 40,
}: MaskedInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const theme = useTheme();
  const { isFocused } = useFocus({ autoFocus, id });

  const raw = controlledValue ?? internalValue;
  const max = maxDigits(mask);

  useInput((input, key) => {
    if (!isFocused) return;

    if (key.return) {
      onSubmit?.(raw);
      return;
    }

    if (key.backspace || key.delete) {
      const newVal = raw.slice(0, -1);
      onChange ? onChange(newVal) : setInternalValue(newVal);
      return;
    }

    if (key.escape || key.upArrow || key.downArrow || key.tab) return;

    // Only accept digits
    if (/^\d$/.test(input) && raw.length < max) {
      const newVal = raw + input;
      onChange ? onChange(newVal) : setInternalValue(newVal);
    }
  });

  const display = raw.length > 0 ? applyMask(raw, mask) : '';
  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;

  // Build a "ghost" mask showing remaining slots
  const remainingMask = mask.slice(display.length);

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box borderStyle="round" borderColor={borderColor} width={width} paddingX={1}>
        {display.length > 0 ? (
          <Text color={theme.colors.foreground}>{display}</Text>
        ) : placeholder ? (
          <Text color={theme.colors.mutedForeground}>{placeholder}</Text>
        ) : null}
        {isFocused && display.length < mask.length && <Text color={theme.colors.focusRing}>█</Text>}
        {display.length > 0 && display.length < mask.length && (
          <Text color={theme.colors.mutedForeground} dimColor>
            {remainingMask}
          </Text>
        )}
      </Box>
    </Box>
  );
}
