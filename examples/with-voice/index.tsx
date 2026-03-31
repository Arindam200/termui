/**
 * Voice dictation demo for TermUI — no ffmpeg or STT API required.
 *
 * Run:
 *   npx tsx examples/with-voice/index.tsx
 *   npx tsx examples/with-voice/index.tsx --real   # use ffmpeg + real STT URL
 *
 * Controls:
 *   Hold Space  →  record (warmup → recording → transcribing)
 *   Single tap  →  normal space
 *   Esc         →  quit
 */

import React, { useState } from 'react';
import { render, Box, Text, useApp } from 'ink';

// Import directly from source so the example works without a build step.
import { ThemeProvider, useTheme } from '../../packages/core/src/index.js';
import { TextInput } from '../../packages/components/src/input/TextInput.js';

// ── Mock capture ──────────────────────────────────────────────────────────────
// Simulates recording with a 1.5 s delay. No mic or ffmpeg needed.
function makeMockCapture(onLog: (msg: string) => void) {
  return () => ({
    start: () =>
      new Promise<void>((res) => {
        onLog('🎙  mic opened  (mock — 1.5 s recording)');
        setTimeout(res, 0);
      }),
    stop: () =>
      new Promise<Buffer>((res) => {
        onLog('⏹  recording stopped, flushing…');
        setTimeout(() => res(Buffer.from('mock-audio-bytes')), 1500);
      }),
    cancel: () => {
      onLog('✖  recording cancelled');
    },
  });
}

// ── Mock STT ──────────────────────────────────────────────────────────────────
// Simulates an 800 ms network round-trip, returns a canned transcript.
const CANNED = [
  'hello from voice',
  'the quick brown fox',
  'voice dictation works',
  'hold space to speak',
];
let cannedIdx = 0;
function mockTranscribe(onLog: (msg: string) => void) {
  return (_audio: Buffer) =>
    new Promise<string>((res) => {
      onLog('📡  calling STT  (mock 800 ms)');
      setTimeout(() => {
        const text = CANNED[cannedIdx++ % CANNED.length]!;
        onLog(`✅  transcript: "${text}"`);
        res(text);
      }, 800);
    });
}

// ── Demo component ────────────────────────────────────────────────────────────
function VoiceDemo() {
  const { exit } = useApp();
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [log, setLog] = useState<string[]>([]);

  function addLog(msg: string) {
    setLog((prev) => [...prev.slice(-7), msg]);
  }

  return (
    <Box flexDirection="column" gap={1} paddingX={2} paddingY={1}>
      <Box flexDirection="column" gap={0}>
        <Text bold color={theme.colors.primary}>
          TermUI — Voice dictation demo
        </Text>
        <Text dimColor>Hold Space to speak · single tap inserts a space · Esc to quit</Text>
      </Box>

      <TextInput
        value={value}
        onChange={setValue}
        onSubmit={() => {
          addLog(`↵  submitted: "${value}"`);
          setValue('');
        }}
        placeholder="Type or hold Space to speak…"
        label="Input"
        autoFocus
        width={52}
        voice={{
          captureFactory: makeMockCapture(addLog),
          transcribe: mockTranscribe(addLog),
          onError: (err) => addLog(`✖  error: ${err.message}`),
        }}
      />

      {log.length > 0 && (
        <Box flexDirection="column" gap={0}>
          <Text color={theme.colors.muted}>── activity log ─────────────────────────</Text>
          {log.map((line, i) => (
            <Text key={i} color={theme.colors.mutedForeground}>
              {line}
            </Text>
          ))}
          <Text color={theme.colors.muted}>──────────────────────────────────────────</Text>
        </Box>
      )}

      <Box flexDirection="column">
        <Text dimColor>Current value: {JSON.stringify(value)}</Text>
        <Text dimColor>Press Esc to quit.</Text>
      </Box>
    </Box>
  );
}

render(
  <ThemeProvider>
    <VoiceDemo />
  </ThemeProvider>
);
