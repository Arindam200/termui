import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput, useFocus, useTheme, getAccessibleName, usePushToTalk } from '@termui/core';
import type { AriaProps, VoiceCapture } from '@termui/core';

/** Opt-in voice dictation configuration for TextInput. Adapter-agnostic: supply your own captureFactory and transcribe function. */
export interface TextInputVoiceProps {
  enabled?: boolean;
  captureFactory: () => VoiceCapture;
  transcribe: (audio: Buffer) => Promise<string>;
  onError?: (error: Error) => void;
  warmupRepeatThreshold?: number;
  releaseDebounceMs?: number;
  /** Hint shown while idle and the field is empty. Default: 'Hold Space to speak' */
  hint?: string;
}

export interface TextInputProps extends AriaProps {
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
  /** Show a border around the input. Default: true */
  bordered?: boolean;
  /** Border style. Default: 'round' */
  borderStyle?:
    | 'single'
    | 'double'
    | 'round'
    | 'bold'
    | 'singleDouble'
    | 'doubleSingle'
    | 'classic';
  /** Horizontal padding. Default: 1 */
  paddingX?: number;
  /** Cursor character shown when focused. Default: '█' */
  cursor?: string;
  /** Optional push-to-talk voice dictation. Does not import any adapter at runtime. */
  voice?: TextInputVoiceProps;
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
  bordered = true,
  borderStyle = 'round',
  paddingX = 1,
  cursor = '█',
  voice,
  'aria-label': ariaLabel,
  'aria-description': ariaDescription,
  'aria-live': ariaLive,
}: TextInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { isFocused } = useFocus({ autoFocus, id });

  const value = controlledValue ?? internalValue;
  const accessibleLabel = getAccessibleName(ariaLabel, label ?? placeholder ?? 'Text input');

  const ptt = usePushToTalk({
    captureFactory: voice?.captureFactory ?? (() => { throw new Error('no captureFactory'); }),
    transcribe: voice?.transcribe ?? (() => Promise.resolve('')),
    enabled: !!(voice?.enabled !== false && voice),
    warmupRepeatThreshold: voice?.warmupRepeatThreshold,
    releaseDebounceMs: voice?.releaseDebounceMs,
    onTranscript: (text) => {
      const next = value + text;
      onChange ? onChange(next) : setInternalValue(next);
    },
    onError: voice?.onError,
  });

  function applyValue(next: string) {
    onChange ? onChange(next) : setInternalValue(next);
  }

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
      applyValue(value.slice(0, -1));
      return;
    }

    if (key.escape) return;
    if (key.upArrow || key.downArrow || key.tab) return;

    if (voice) {
      const result = ptt.handleInput(input, key);
      if (result.removeTrailingChars) {
        // Activation: retract provisional warmup spaces; current space is consumed.
        applyValue(value.slice(0, -result.removeTrailingChars));
        return;
      }
      if (result.consume) return;
    }

    applyValue(value + input);
  });

  const displayValue = mask ? mask.repeat(value.length) : value;
  const borderColor = error
    ? theme.colors.error
    : isFocused
      ? theme.colors.focusRing
      : theme.colors.border;

  const inputContent = (
    <>
      <Text color={value ? theme.colors.foreground : theme.colors.mutedForeground}>
        {displayValue || placeholder}
      </Text>
      {isFocused && <Text color={theme.colors.focusRing}>{cursor}</Text>}
    </>
  );

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      {ariaDescription && (
        <Text color={theme.colors.mutedForeground} dimColor>
          {' '}
          {ariaDescription}
        </Text>
      )}
      {bordered ? (
        <Box borderStyle={borderStyle} borderColor={borderColor} width={width} paddingX={paddingX}>
          {inputContent}
        </Box>
      ) : (
        <Box width={width} paddingX={paddingX}>
          {inputContent}
        </Box>
      )}
      {error && <Text color={theme.colors.error}>{error}</Text>}
      {!error && voice && isFocused && (() => {
        if (ptt.status === 'idle' && !value) {
          return <Text dimColor>{voice.hint ?? 'Hold Space to speak'}</Text>;
        }
        if (ptt.hint) {
          return <Text color={ptt.isListening ? theme.colors.accent : theme.colors.mutedForeground}>{ptt.hint}</Text>;
        }
        return null;
      })()}
    </Box>
  );
}
