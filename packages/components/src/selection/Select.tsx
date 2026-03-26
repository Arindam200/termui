import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput, useTheme, getAccessibleName } from '@termui/core';
import type { AriaProps } from '@termui/core';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface SelectProps<T = string> extends AriaProps {
  options: SelectOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  onSubmit?: (value: T) => void;
  label?: string;
  cursor?: string;
  cursorColor?: string;
}

export function Select<T = string>({
  options,
  value: controlledValue,
  onChange,
  onSubmit,
  label,
  cursor = '›',
  cursorColor,
  'aria-label': ariaLabel,
  'aria-description': ariaDescription,
  'aria-live': ariaLive,
}: SelectProps<T>) {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(() => {
    if (controlledValue === undefined) return 0;
    const idx = options.findIndex((o) => o.value === controlledValue);
    return idx >= 0 ? idx : 0;
  });

  const accessibleLabel = getAccessibleName(ariaLabel, label ?? 'Select');

  const resolvedCursorColor = cursorColor ?? theme.colors.primary;

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
    } else if (key.return) {
      const opt = options[activeIndex];
      if (opt && !opt.disabled) {
        onChange?.(opt.value);
        onSubmit?.(opt.value);
      }
    }
  });

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      {ariaDescription && (
        <Text color={theme.colors.mutedForeground} dimColor>
          {' '}
          {ariaDescription}
        </Text>
      )}
      {options.map((opt, idx) => {
        const isActive = idx === activeIndex;
        const isSelected = controlledValue !== undefined && opt.value === controlledValue;
        return (
          <Box key={idx} gap={1}>
            <Text color={isActive ? resolvedCursorColor : undefined}>
              {isActive ? cursor : ' '}
            </Text>
            <Text
              color={
                opt.disabled
                  ? theme.colors.mutedForeground
                  : isActive
                    ? resolvedCursorColor
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
