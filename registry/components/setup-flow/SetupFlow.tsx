import React, { useState, type ReactNode } from 'react';
import { Box, Text } from 'ink';
import { useInput, useAnimation, useTheme } from 'termui';
import { BigText, type BigTextFont } from 'termui/components';

export interface SetupFlowProps {
  title?: string;
  titleFont?: BigTextFont;
  titleColor?: string;
  titleColorAlt?: string;
  connectorChar?: string;
  connectorColor?: string;
  children: ReactNode;
}

export interface SetupFlowBadgeProps {
  label: string;
  bg?: string;
  color?: string;
}

export type SetupFlowStepStatus = 'done' | 'active' | 'pending' | 'success' | 'error';

export interface SetupFlowStepProps {
  icon?: string;
  iconColor?: string;
  status?: SetupFlowStepStatus;
  children: ReactNode;
}

export interface SetupFlowSpinnerProps {
  label: string;
  onComplete?: () => void;
}

export interface SetupFlowMultiSelectProps {
  label: string;
  hint?: string;
  options: Array<{ value: string; label: string; description?: string }>;
  values?: string[];
  onChange?: (values: string[]) => void;
  onSubmit?: (values: string[]) => void;
  checkedChar?: string;
  uncheckedChar?: string;
  checkedColor?: string;
}

const STATUS_ICONS: Record<SetupFlowStepStatus, { icon: string; color: string; dim: boolean }> = {
  done: { icon: '◇', color: 'white', dim: false },
  active: { icon: '◆', color: 'cyan', dim: false },
  pending: { icon: '◇', color: 'white', dim: true },
  success: { icon: '✓', color: 'green', dim: false },
  error: { icon: '✗', color: 'red', dim: false },
};

function SetupFlowRoot({
  title,
  titleFont = 'block',
  titleColor = '#888888',
  connectorChar = '│',
  connectorColor,
  children,
}: SetupFlowProps) {
  const theme = useTheme();

  return (
    <Box flexDirection="column" paddingLeft={2}>
      {title && (
        <Box marginBottom={1}>
          <BigText font={titleFont} color={titleColor}>
            {title}
          </BigText>
        </Box>
      )}
      {React.Children.map(children, (child, i) => (
        <React.Fragment key={i}>
          {child}
          {/* Connector between steps */}
          {i < React.Children.count(children) - 1 && (
            <Box paddingLeft={0}>
              <Text
                color={connectorColor ?? theme.colors.mutedForeground}
                dimColor={!connectorColor}
              >
                {connectorChar}
              </Text>
            </Box>
          )}
        </React.Fragment>
      ))}
    </Box>
  );
}

function SetupFlowBadge({ label, bg = 'cyan', color = 'black' }: SetupFlowBadgeProps) {
  return (
    <Box marginBottom={1}>
      <Text backgroundColor={bg} color={color}>
        {' ┌ ' + label + ' ┐ '}
      </Text>
    </Box>
  );
}

function SetupFlowStep({ icon, iconColor, status = 'done', children }: SetupFlowStepProps) {
  const { icon: defaultIcon, color, dim } = STATUS_ICONS[status];
  const resolvedIcon = icon ?? defaultIcon;
  const resolvedColor = iconColor ?? color;

  return (
    <Box flexDirection="row" gap={1}>
      <Text color={resolvedColor} dimColor={dim}>
        {resolvedIcon}
      </Text>
      <Text dimColor={dim}>{children}</Text>
    </Box>
  );
}

function SetupFlowSpinner({ label }: SetupFlowSpinnerProps) {
  const theme = useTheme();
  const frame = useAnimation(12);
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const icon = frames[frame % frames.length];

  return (
    <Box flexDirection="row" gap={1}>
      <Text color={theme.colors.primary}>{'◆'}</Text>
      <Text color={theme.colors.primary}>{icon}</Text>
      <Text>{label}</Text>
    </Box>
  );
}

function SetupFlowMultiSelect({
  label,
  hint,
  options,
  values: controlledValues,
  onChange,
  onSubmit,
  checkedChar = '■',
  uncheckedChar = '□',
  checkedColor = 'green',
}: SetupFlowMultiSelectProps) {
  const theme = useTheme();
  const [internalValues, setInternalValues] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);

  const selectedValues = controlledValues ?? internalValues;

  useInput((input, key) => {
    if (key.upArrow) {
      setCursor((c) => Math.max(0, c - 1));
    } else if (key.downArrow) {
      setCursor((c) => Math.min(options.length - 1, c + 1));
    } else if (input === ' ') {
      const val = options[cursor].value;
      const next = selectedValues.includes(val)
        ? selectedValues.filter((v) => v !== val)
        : [...selectedValues, val];
      onChange ? onChange(next) : setInternalValues(next);
    } else if (key.return) {
      onSubmit?.(selectedValues);
    }
  });

  return (
    <Box flexDirection="column">
      <Box flexDirection="row" gap={1}>
        <Text color="cyan">{'◆'}</Text>
        <Text bold>{label}</Text>
        {hint && <Text dimColor>{'(' + hint + ')'}</Text>}
      </Box>
      {options.map((opt, i) => {
        const isChecked = selectedValues.includes(opt.value);
        const isCursor = i === cursor;
        return (
          <Box key={opt.value} flexDirection="row" paddingLeft={2} gap={1}>
            <Text color={theme.colors.mutedForeground}>{'│'}</Text>
            <Text color={isChecked ? checkedColor : theme.colors.mutedForeground}>
              {isChecked ? checkedChar : uncheckedChar}
            </Text>
            <Text color={isCursor ? 'white' : undefined} bold={isCursor}>
              {opt.label}
            </Text>
            {opt.description && <Text dimColor>{'  ' + opt.description}</Text>}
          </Box>
        );
      })}
    </Box>
  );
}

export const SetupFlow = Object.assign(SetupFlowRoot, {
  Badge: SetupFlowBadge,
  Step: SetupFlowStep,
  Spinner: SetupFlowSpinner,
  MultiSelect: SetupFlowMultiSelect,
});
