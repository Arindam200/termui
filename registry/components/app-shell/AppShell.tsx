import React, { type ReactNode, useState } from 'react';
import { Box, Text } from 'ink';
import { useInput, useTheme } from 'termui';

export interface AppShellProps {
  children: ReactNode;
  fullscreen?: boolean;
}

export interface AppShellHeaderProps {
  children: ReactNode;
}

export interface AppShellTipProps {
  children: ReactNode;
}

export interface AppShellInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  borderStyle?: 'single' | 'double' | 'round' | 'bold';
  borderColor?: string;
  prefix?: string;
}

export interface AppShellContentProps {
  children: ReactNode;
  autoscroll?: boolean;
  height?: number;
}

export interface AppShellHintsProps {
  items?: string[];
  children?: ReactNode;
}

function AppShellRoot({ children }: AppShellProps) {
  return (
    <Box flexDirection="column" flexGrow={1}>
      {children}
    </Box>
  );
}

function AppShellHeader({ children }: AppShellHeaderProps) {
  return <Box flexDirection="column">{children}</Box>;
}

function AppShellTip({ children }: AppShellTipProps) {
  return (
    <Box paddingLeft={2} paddingY={0}>
      <Text dimColor>{'  Tip: '}</Text>
      <Text dimColor>{children}</Text>
    </Box>
  );
}

function AppShellInput({
  value: controlledValue,
  onChange,
  onSubmit,
  placeholder = 'Type something...',
  borderStyle = 'single',
  borderColor,
  prefix = '>',
}: AppShellInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const theme = useTheme();
  const value = controlledValue ?? internalValue;

  useInput((input, key) => {
    if (key.return) {
      onSubmit?.(value);
      if (!controlledValue) setInternalValue('');
      return;
    }
    if (key.backspace || key.delete) {
      const next = value.slice(0, -1);
      onChange ? onChange(next) : setInternalValue(next);
      return;
    }
    if (key.escape || key.upArrow || key.downArrow || key.tab) return;
    const next = value + input;
    onChange ? onChange(next) : setInternalValue(next);
  });

  return (
    <Box
      borderStyle={borderStyle}
      borderColor={borderColor ?? theme.colors.border}
      flexDirection="row"
      paddingX={1}
    >
      {prefix && (
        <Text color={theme.colors.primary} bold>
          {prefix + ' '}
        </Text>
      )}
      <Text>{value || <Text dimColor>{placeholder}</Text>}</Text>
      <Text color={theme.colors.focusRing}>{'█'}</Text>
    </Box>
  );
}

function AppShellContent({ children, height = 20 }: AppShellContentProps) {
  const [scrollTop, setScrollTop] = useState(0);

  useInput((_input, key) => {
    if (key.upArrow) setScrollTop((s) => Math.max(0, s - 1));
    else if (key.downArrow) setScrollTop((s) => s + 1);
  });

  return (
    <Box flexDirection="row" height={height} overflow="hidden">
      <Box flexGrow={1} flexDirection="column" marginTop={-scrollTop as number}>
        {children}
      </Box>
    </Box>
  );
}

function AppShellHints({ items, children }: AppShellHintsProps) {
  const theme = useTheme();
  const content = items ? items.join(' | ') : children;
  return (
    <Box paddingX={1}>
      <Text dimColor color={theme.colors.mutedForeground}>
        {content as string}
      </Text>
    </Box>
  );
}

export const AppShell = Object.assign(AppShellRoot, {
  Header: AppShellHeader,
  Tip: AppShellTip,
  Input: AppShellInput,
  Content: AppShellContent,
  Hints: AppShellHints,
});
