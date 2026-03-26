import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput, useTheme } from '@termui/core';

export interface RadioOption<T = string> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T = string> {
  options: RadioOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  name?: string;
  cursor?: string;
}

export function RadioGroup<T = string>({
  options,
  value: controlledValue,
  onChange,
  name: _name,
  cursor = '›',
}: RadioGroupProps<T>) {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(() => {
    if (controlledValue !== undefined) {
      const idx = options.findIndex((o) => o.value === controlledValue);
      return idx >= 0 ? idx : 0;
    }
    const first = options.findIndex((o) => !o.disabled);
    return first >= 0 ? first : 0;
  });
  const [internalValue, setInternalValue] = useState<T | undefined>(controlledValue);

  const selected = controlledValue ?? internalValue;

  const select = (idx: number) => {
    const opt = options[idx];
    if (!opt || opt.disabled) return;
    if (controlledValue === undefined) {
      setInternalValue(opt.value);
    }
    onChange?.(opt.value);
  };

  useInput((input, key) => {
    if (key.upArrow) {
      setActiveIndex((i) => {
        let next = i - 1;
        while (next >= 0 && options[next]?.disabled) next--;
        return next < 0 ? i : next;
      });
    } else if (key.downArrow) {
      setActiveIndex((i) => {
        let next = i + 1;
        while (next < options.length && options[next]?.disabled) next++;
        return next >= options.length ? i : next;
      });
    } else if (input === ' ' || key.return) {
      select(activeIndex);
    }
  });

  return (
    <Box flexDirection="column">
      {options.map((opt, idx) => {
        const isActive = idx === activeIndex;
        const isSelected = selected !== undefined && opt.value === selected;
        const icon = isSelected ? '◉' : '○';

        return (
          <Box key={idx} gap={1}>
            <Text color={isActive ? theme.colors.primary : undefined}>
              {isActive ? cursor : ' '}
            </Text>
            <Text
              color={
                opt.disabled
                  ? theme.colors.mutedForeground
                  : isSelected
                    ? theme.colors.primary
                    : theme.colors.foreground
              }
              dimColor={opt.disabled}
            >
              {icon}
            </Text>
            <Text
              color={
                opt.disabled
                  ? theme.colors.mutedForeground
                  : isActive
                    ? theme.colors.primary
                    : theme.colors.foreground
              }
              bold={isActive || isSelected}
              dimColor={opt.disabled}
            >
              {opt.label}
            </Text>
            {opt.hint && (
              <Text color={theme.colors.mutedForeground} dimColor>
                {opt.hint}
              </Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
